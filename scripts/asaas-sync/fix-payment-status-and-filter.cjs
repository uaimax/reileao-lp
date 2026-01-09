#!/usr/bin/env node

// Script para corrigir status de pagamento e filtrar clientes por data
// Remove clientes com parcelamentos antes de setembro de 2025
// Corrige status de pagamento baseado nos dados reais do ASAAS

const https = require('https');
const { getConfig, createDbClient, isEventPayment } = require('../config.cjs');

// Carregar configuração
const config = getConfig();
const ASAAS_URL = config.asaasUrl;
const ASAAS_TOKEN = config.asaasApiKey;
const SITE_NAME = config.siteName;

// Configuração do banco
const client = createDbClient();

// Data limite: setembro de 2025
const CUTOFF_DATE = new Date('2025-09-01');

function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Timeout da requisição'));
    }, 10000);

    const req = https.request(url, {
      method: options.method || 'GET',
      headers: {
        'access_token': ASAAS_TOKEN,
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
          reject(new Error('Erro ao fazer parse da resposta JSON'));
        }
      });
    });

    req.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    req.setTimeout(10000, () => {
      clearTimeout(timeout);
      req.destroy();
      reject(new Error('Timeout da requisição'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

function parseDescription(description) {
  if (!description) return null;

  // Padrões para identificar parcelamentos
  const installmentPatterns = [
    /(\d+)\/(\d+)/,  // 1/3, 2/3, etc.
    /parcela\s*(\d+)\s*de\s*(\d+)/i,
    /(\d+)\s*de\s*(\d+)/i
  ];

  for (const pattern of installmentPatterns) {
    const match = description.match(pattern);
    if (match) {
      return {
        isInstallment: true,
        currentInstallment: parseInt(match[1]),
        totalInstallments: parseInt(match[2])
      };
    }
  }

  return { isInstallment: false, currentInstallment: 1, totalInstallments: 1 };
}

function calculatePaymentStatus(payments) {
  if (!payments || payments.length === 0) {
    return { status: 'pending', paidValue: 0, totalValue: 0, paidInstallments: 0, totalInstallments: 0 };
  }

  let totalValue = 0;
  let paidValue = 0;
  let totalInstallments = 0;
  let paidInstallments = 0;

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

  // Se não há parcelamentos identificados, trata como pagamento único
  if (totalInstallments === 0) {
    totalInstallments = 1;
    if (paidValue > 0) {
      paidInstallments = 1;
    }
  }

  let status = 'pending';
  if (paidValue >= totalValue) {
    status = 'paid';  // Corrigido: usar 'paid' em vez de 'received'
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

async function removeOldClients() {
  log('🗑️ REMOVENDO CLIENTES COM PARCELAMENTOS ANTES DE SETEMBRO 2025');
  log('================================================================');

  try {
    // Buscar clientes com created_at antes de setembro 2025
    const oldClients = await client`
      SELECT id, cpf, full_name, email, created_at, payment_status
      FROM event_registrations
      WHERE created_at < ${CUTOFF_DATE.toISOString()}
      ORDER BY created_at
    `;

    log(`📊 Encontrados ${oldClients.length} clientes com parcelamentos antes de setembro 2025`);

    if (oldClients.length > 0) {
      log('📋 Clientes que serão removidos:');
      oldClients.forEach((client, index) => {
        log(`${index + 1}. ${client.full_name} (${client.email}) - ${client.created_at} - Status: ${client.payment_status}`);
      });

      // Remover clientes antigos
      const result = await client`
        DELETE FROM event_registrations
        WHERE created_at < ${CUTOFF_DATE.toISOString()}
      `;

      log(`✅ Removidos ${result.count} clientes com parcelamentos antes de setembro 2025`);
    } else {
      log('✅ Nenhum cliente encontrado com parcelamentos antes de setembro 2025');
    }

    return oldClients.length;
  } catch (error) {
    log(`❌ Erro ao remover clientes antigos: ${error.message}`);
    throw error;
  }
}

async function fixPaymentStatus() {
  log('🔧 CORRIGINDO STATUS DE PAGAMENTO');
  log('=================================');

  try {
    // Buscar todos os clientes restantes
    const clients = await client`
      SELECT id, cpf, full_name, email, payment_status, total, installments, asaas_payment_id
      FROM event_registrations
      ORDER BY created_at DESC
    `;

    log(`📊 Processando ${clients.length} clientes para correção de status`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const clientData of clients) {
      try {
        log(`🔍 Processando: ${clientData.full_name} (${clientData.email})`);

        // Primeiro buscar o customer ID pelo CPF
        const customerResponse = await makeRequest(`${ASAAS_URL}/customers?cpfCnpj=${clientData.cpf}`);

        if (customerResponse.status !== 200 || !customerResponse.data.data || customerResponse.data.data.length === 0) {
          log(`⚠️ Cliente não encontrado no ASAAS para ${clientData.email}`);
          continue;
        }

        const asaasCustomer = customerResponse.data.data[0];
        const customerId = asaasCustomer.id;

        // Buscar todos os pagamentos do evento para este cliente usando Customer ID
        const paymentsResponse = await makeRequest(`${ASAAS_URL}/payments?customer=${customerId}&limit=100`);

        if (paymentsResponse.status !== 200) {
          log(`⚠️ Erro ao buscar pagamentos para ${clientData.email}: ${paymentsResponse.status}`);
          errorCount++;
          continue;
        }

        const allPayments = paymentsResponse.data.data || [];
        const eventPayments = allPayments.filter(payment =>
          payment.description &&
          isEventPayment(payment.description)
        );

        if (eventPayments.length === 0) {
          log(`⚠️ Nenhum pagamento ${SITE_NAME} encontrado para ${clientData.email}`);
          continue;
        }

        // Calcular status correto
        const paymentInfo = calculatePaymentStatus(eventPayments);

        log(`📊 Status calculado: ${paymentInfo.status} (${paymentInfo.paidValue}/${paymentInfo.totalValue}) - ${paymentInfo.paidInstallments}/${paymentInfo.totalInstallments} parcelas`);

        // Atualizar se necessário
        if (paymentInfo.status !== clientData.payment_status ||
            paymentInfo.totalValue !== parseFloat(clientData.total) ||
            paymentInfo.totalInstallments !== clientData.installments) {

          await client`
            UPDATE event_registrations
            SET
              payment_status = ${paymentInfo.status},
              total = ${paymentInfo.totalValue},
              installments = ${paymentInfo.totalInstallments},
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ${clientData.id}
          `;

          log(`✅ Atualizado: ${clientData.full_name} - Status: ${paymentInfo.status}, Total: ${paymentInfo.totalValue}, Parcelas: ${paymentInfo.totalInstallments}`);
          updatedCount++;
        } else {
          log(`✅ Já correto: ${clientData.full_name}`);
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        log(`❌ Erro ao processar ${clientData.email}: ${error.message}`);
        errorCount++;
      }
    }

    log(`📊 RESUMO DA CORREÇÃO:`);
    log(`✅ Clientes atualizados: ${updatedCount}`);
    log(`❌ Erros: ${errorCount}`);
    log(`📊 Total processados: ${clients.length}`);

    return { updatedCount, errorCount, totalProcessed: clients.length };

  } catch (error) {
    log(`❌ Erro geral na correção de status: ${error.message}`);
    throw error;
  }
}

async function generateReport() {
  log('📊 GERANDO RELATÓRIO FINAL');
  log('==========================');

  try {
    const stats = await client`
      SELECT
        COUNT(*) as total_clients,
        COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_clients,
        COUNT(CASE WHEN payment_status = 'partial' THEN 1 END) as partial_clients,
        COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_clients,
        COUNT(CASE WHEN created_at >= '2025-09-01' THEN 1 END) as recent_clients,
        SUM(CASE WHEN payment_status = 'paid' THEN total ELSE 0 END) as paid_revenue,
        SUM(total) as total_revenue
      FROM event_registrations
    `;

    const report = {
      timestamp: new Date().toISOString(),
      cutoffDate: CUTOFF_DATE.toISOString(),
      statistics: stats[0],
      recommendations: []
    };

    // Adicionar recomendações
    if (stats[0].pending_clients > 0) {
      report.recommendations.push(`Execute sync-asaas-robust.cjs para sincronizar ${stats[0].pending_clients} clientes pendentes`);
    }

    if (stats[0].partial_clients > 0) {
      report.recommendations.push(`Monitore ${stats[0].partial_clients} clientes com pagamentos parciais`);
    }

    log('📊 ESTATÍSTICAS FINAIS:');
    log(`📈 Total de clientes: ${stats[0].total_clients}`);
    log(`✅ Pagos: ${stats[0].paid_clients}`);
    log(`⏳ Parciais: ${stats[0].partial_clients}`);
    log(`⏱️ Pendentes: ${stats[0].pending_clients}`);
    log(`📅 Clientes recentes (após set/2025): ${stats[0].recent_clients}`);
    log(`💰 Receita paga: R$ ${parseFloat(stats[0].paid_revenue || 0).toFixed(2)}`);
    log(`💰 Receita total: R$ ${parseFloat(stats[0].total_revenue || 0).toFixed(2)}`);

    if (stats[0].total_revenue > 0) {
      const collectionRate = (parseFloat(stats[0].paid_revenue || 0) / parseFloat(stats[0].total_revenue) * 100).toFixed(1);
      log(`📊 Taxa de cobrança: ${collectionRate}%`);
    }

    return report;

  } catch (error) {
    log(`❌ Erro ao gerar relatório: ${error.message}`);
    throw error;
  }
}

async function main() {
  log('🚀 INICIANDO CORREÇÃO DE STATUS E FILTRO POR DATA');
  log('=================================================');
  log(`📅 Data limite: ${CUTOFF_DATE.toLocaleDateString('pt-BR')}`);
  log('');

  try {
    // 1. Remover clientes antigos
    const removedCount = await removeOldClients();
    log('');

    // 2. Corrigir status de pagamento
    const correctionResults = await fixPaymentStatus();
    log('');

    // 3. Gerar relatório final
    const report = await generateReport();
    log('');

    log('🎉 CORREÇÃO CONCLUÍDA COM SUCESSO!');
    log('==================================');
    log(`🗑️ Clientes removidos: ${removedCount}`);
    log(`✅ Clientes atualizados: ${correctionResults.updatedCount}`);
    log(`❌ Erros: ${correctionResults.errorCount}`);

  } catch (error) {
    log(`❌ ERRO CRÍTICO: ${error.message}`);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, removeOldClients, fixPaymentStatus, calculatePaymentStatus };