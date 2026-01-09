#!/usr/bin/env node

// Script para Corrigir Status de Pagamento baseado em parcelas reais do ASAAS
// Calcula status correto baseado em todas as cobranças do cliente

const https = require('https');
const { getConfig, createDbClient, isEventPayment } = require('../config.cjs');

// Carregar configuração
const config = getConfig();
const ASAAS_URL = config.asaasUrl;
const API_KEY = config.asaasApiKey;
const SITE_NAME = config.siteName;

// Configuração do banco
const client = createDbClient();

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Timeout da requisição'));
    }, 15000);

    const req = https.request(url, {
      method: options.method || 'GET',
      headers: {
        'access_token': API_KEY,
        'Content-Type': 'application/json',
        ...options.headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        clearTimeout(timeout);
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          reject(new Error(`Erro ao fazer parse do JSON: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    req.setTimeout(15000, () => {
      clearTimeout(timeout);
      req.destroy();
      reject(new Error('Timeout da requisição'));
    });

    req.end();
  });
}

function parseDescription(description) {
  if (!description) return null;

  const result = {
    isInstallment: false,
    installmentNumber: null,
    totalInstallments: null,
    eventName: null,
    year: null,
    hasProducts: false,
    rawDescription: description
  };

  // Verificar se é parcela
  const installmentMatch = description.match(/Parcela (\d+) de (\d+)/);
  if (installmentMatch) {
    result.isInstallment = true;
    result.installmentNumber = parseInt(installmentMatch[1]);
    result.totalInstallments = parseInt(installmentMatch[2]);
  }

  // Verificar evento usando configuração dinâmica
  if (isEventPayment(description)) {
    result.eventName = SITE_NAME;
  }

  // Verificar ano
  const yearMatch = description.match(/202[4-6]/);
  if (yearMatch) {
    result.year = yearMatch[0];
  }

  // Verificar produtos
  if (/(?:aulas|bailes|oficiais|edição)/i.test(description)) {
    result.hasProducts = true;
  }

  return result;
}

function calculatePaymentStatus(payments) {
  if (!payments || payments.length === 0) {
    return { status: 'pending', paidValue: 0, totalValue: 0, paidInstallments: 0, totalInstallments: 0 };
  }

  let totalValue = 0;
  let paidValue = 0;
  let totalInstallments = 0;
  let paidInstallments = 0;

  // Calcular valores e parcelas
  for (const payment of payments) {
    totalValue += payment.value;

    if (payment.status === 'RECEIVED' || payment.status === 'CONFIRMED') {
      paidValue += payment.value;
    }

    const parsed = parseDescription(payment.description);
    if (parsed && parsed.isInstallment) {
      totalInstallments = Math.max(totalInstallments, parsed.totalInstallments);

      if (payment.status === 'RECEIVED' || payment.status === 'CONFIRMED') {
        paidInstallments++;
      }
    }
  }

  // Se não há parcelas, tratar como pagamento único
  if (totalInstallments === 0) {
    totalInstallments = 1;
    if (paidValue > 0) {
      paidInstallments = 1;
    }
  }

  // Determinar status
  let status = 'pending';

  if (paidValue >= totalValue) {
    status = 'received';
  } else if (paidValue > 0) {
    status = 'partial';
  }

  return {
    status,
    paidValue,
    totalValue,
    paidInstallments,
    totalInstallments,
    paymentPercentage: totalValue > 0 ? (paidValue / totalValue * 100).toFixed(1) : 0
  };
}

async function fixPaymentStatus() {
  console.log('💳 CORRIGINDO STATUS DE PAGAMENTO BASEADO EM PARCELAS REAIS');
  console.log('============================================================');

  try {
    // 1. Buscar registros com status "partial" ou que precisam verificação
    console.log('\n🔍 Buscando registros para verificação de status...');

    const registrationsToCheck = await client`
      SELECT id, cpf, full_name, email, payment_status, total, installments, created_at
      FROM event_registrations
      WHERE created_at >= '2024-09-01'
      ORDER BY created_at DESC
    `;

    console.log(`   - Encontrados ${registrationsToCheck.length} registros para verificação`);

    let updatedCount = 0;
    let errorCount = 0;
    let noChangesCount = 0;

    // 2. Para cada registro, buscar cobranças reais no ASAAS
    for (let i = 0; i < registrationsToCheck.length; i++) {
      const registration = registrationsToCheck[i];

      try {
        console.log(`\n💳 [${i + 1}/${registrationsToCheck.length}] Verificando: ${registration.full_name}`);
        console.log(`   - CPF: ${registration.cpf}`);
        console.log(`   - Status atual: ${registration.payment_status}`);
        console.log(`   - Total atual: R$ ${registration.total}`);
        console.log(`   - Parcelas atuais: ${registration.installments}`);

        // Buscar cliente no ASAAS por CPF
        const customerResponse = await makeRequest(`${ASAAS_URL}/customers?cpfCnpj=${registration.cpf}`);

        if (customerResponse.status === 200 && customerResponse.data.data.length > 0) {
          const asaasCustomer = customerResponse.data.data[0];
          console.log(`   - Cliente ASAAS: ${asaasCustomer.id}`);

          // Buscar todas as cobranças deste cliente
          const paymentsResponse = await makeRequest(`${ASAAS_URL}/payments?customer=${asaasCustomer.id}&limit=20`);

          if (paymentsResponse.status === 200) {
            const allPayments = paymentsResponse.data.data || [];

            // Filtrar apenas cobranças do evento
            const eventPayments = allPayments.filter(payment => {
              const parsed = parseDescription(payment.description);
              return parsed && parsed.eventName === SITE_NAME;
            });

            console.log(`   - Cobranças ${SITE_NAME} encontradas: ${eventPayments.length}`);

            if (eventPayments.length > 0) {
              // Calcular status real baseado nas cobranças
              const realStatus = calculatePaymentStatus(eventPayments);

              console.log(`   - Status calculado: ${realStatus.status}`);
              console.log(`   - Valor pago: R$ ${realStatus.paidValue.toFixed(2)}`);
              console.log(`   - Valor total: R$ ${realStatus.totalValue.toFixed(2)}`);
              console.log(`   - Parcelas pagas: ${realStatus.paidInstallments}/${realStatus.totalInstallments}`);
              console.log(`   - Percentual pago: ${realStatus.paymentPercentage}%`);

              // Verificar se precisa atualizar
              const needsUpdate =
                realStatus.status !== registration.payment_status ||
                realStatus.totalValue !== parseFloat(registration.total) ||
                realStatus.totalInstallments !== registration.installments;

              if (needsUpdate) {
                try {
                  await client`
                    UPDATE event_registrations
                    SET payment_status = ${realStatus.status},
                        total = ${realStatus.totalValue},
                        installments = ${realStatus.totalInstallments},
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ${registration.id}
                  `;

                  console.log(`   ✅ Status atualizado com sucesso!`);
                  console.log(`   - Status: ${registration.payment_status} → ${realStatus.status}`);
                  console.log(`   - Total: R$ ${registration.total} → R$ ${realStatus.totalValue.toFixed(2)}`);
                  console.log(`   - Parcelas: ${registration.installments} → ${realStatus.totalInstallments}`);

                  updatedCount++;

                } catch (updateError) {
                  console.log(`   ❌ Erro ao atualizar status: ${updateError.message}`);
                  errorCount++;
                }
              } else {
                console.log(`   ✅ Status já está correto, nenhuma alteração necessária`);
                noChangesCount++;
              }
            } else {
              console.log(`   ⚠️ Nenhuma cobrança ${SITE_NAME} encontrada para este cliente`);
              noChangesCount++;
            }
          } else {
            console.log(`   ❌ Erro ao buscar cobranças: ${paymentsResponse.status}`);
            errorCount++;
          }
        } else {
          console.log(`   ❌ Cliente não encontrado no ASAAS`);
          errorCount++;
        }

        // Evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));

      } catch (error) {
        console.log(`   ❌ Erro ao processar ${registration.full_name}: ${error.message}`);
        errorCount++;
      }
    }

    // 3. Resumo da correção
    console.log('\n📊 RESUMO DA CORREÇÃO DE STATUS:');
    console.log('==================================');
    console.log(`   - Registros processados: ${registrationsToCheck.length}`);
    console.log(`   - Status atualizados: ${updatedCount}`);
    console.log(`   - Sem alterações necessárias: ${noChangesCount}`);
    console.log(`   - Erros: ${errorCount}`);

    // 4. Verificar resultado final
    console.log('\n🔍 Verificando resultado final...');

    const finalStats = await client`
      SELECT
        payment_status,
        COUNT(*) as count,
        AVG(total) as avg_total,
        SUM(total) as total_value
      FROM event_registrations
      WHERE created_at >= '2024-09-01'
      GROUP BY payment_status
      ORDER BY count DESC
    `;

    console.log('   - Distribuição de status:');
    finalStats.forEach(stat => {
      console.log(`     ${stat.payment_status}: ${stat.count} registros (R$ ${parseFloat(stat.total_value).toFixed(2)})`);
    });

    // 5. Calcular receita total
    const revenueStats = await client`
      SELECT
        SUM(total) as total_revenue,
        SUM(CASE WHEN payment_status = 'received' THEN total ELSE 0 END) as paid_revenue,
        SUM(CASE WHEN payment_status = 'partial' THEN total ELSE 0 END) as partial_revenue,
        SUM(CASE WHEN payment_status = 'pending' THEN total ELSE 0 END) as pending_revenue
      FROM event_registrations
      WHERE created_at >= '2024-09-01'
    `;

    const revenue = revenueStats[0];
    console.log('\n💰 RECEITA ATUALIZADA:');
    console.log(`   - Receita total: R$ ${parseFloat(revenue.total_revenue).toFixed(2)}`);
    console.log(`   - Receita paga: R$ ${parseFloat(revenue.paid_revenue).toFixed(2)}`);
    console.log(`   - Receita parcial: R$ ${parseFloat(revenue.partial_revenue).toFixed(2)}`);
    console.log(`   - Receita pendente: R$ ${parseFloat(revenue.pending_revenue).toFixed(2)}`);

    const paidPercentage = revenue.total_revenue > 0 ? (revenue.paid_revenue / revenue.total_revenue * 100).toFixed(1) : 0;
    console.log(`   - Taxa de recebimento: ${paidPercentage}%`);

  } catch (error) {
    console.error('❌ Erro durante correção de status:', error.message);
  } finally {
    console.log('\n✅ Correção de status de pagamento finalizada');
    process.exit(0);
  }
}

// Executar correção com timeout de segurança
const timeout = setTimeout(() => {
  console.log('\n⏰ Timeout de segurança atingido. Finalizando...');
  process.exit(1);
}, 120000); // 2 minutos máximo

fixPaymentStatus().finally(() => {
  clearTimeout(timeout);
});