#!/usr/bin/env node

// Script para corrigir a lógica de pagamentos
// Considera apenas parcelas com data de pagamento real

const postgres = require('postgres');
const https = require('https');

// Configuração do banco
const connectionString = 'postgresql://uaizouklp_owner:npg_BgyoHlKF1Tu3@ep-mute-base-a8dewk2d-pooler.eastus2.azure.neon.tech:5432/uaizouklp?sslmode=require';
const client = postgres(connectionString);

// Configuração ASAAS
const ASAAS_URL = 'https://www.asaas.com/api/v3';
const ASAAS_TOKEN = '$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjJlMDA3YWEwLWNiNDEtNDMxYy1hMmQ0LTAzOTBmNDRkY2Q3NTo6JGFhY2hfNGU5YzliMzMtY2M3MC00MWRmLTgyZDQtNzViZGQ3ZTY2OWZh';

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
  
  const installmentPatterns = [
    /(\d+)\/(\d+)/,
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

function calculatePaymentStatusReal(payments) {
  if (!payments || payments.length === 0) {
    return { 
      status: 'pending', 
      paidValue: 0, 
      totalValue: 0, 
      paidInstallments: 0, 
      totalInstallments: 0,
      details: []
    };
  }

  let totalValue = 0;
  let paidValue = 0;
  let totalInstallments = 0;
  let paidInstallments = 0;
  const details = [];

  for (const payment of payments) {
    totalValue += payment.value;
    
    // NOVA LÓGICA: Considera pago apenas se tem data de pagamento
    const isPaid = (payment.status === 'RECEIVED' || payment.status === 'CONFIRMED') && 
                   payment.paymentDate && 
                   payment.paymentDate !== 'N/A' &&
                   payment.paymentDate !== null;
    
    if (isPaid) {
      paidValue += payment.value;
    }

    const parsed = parseDescription(payment.description);
    if (parsed && parsed.isInstallment) {
      totalInstallments = Math.max(totalInstallments, parsed.totalInstallments);
      if (isPaid) {
        paidInstallments++;
      }
    }

    details.push({
      description: payment.description,
      status: payment.status,
      value: payment.value,
      isPaid: isPaid,
      paymentDate: payment.paymentDate,
      dueDate: payment.dueDate,
      parsed: parsed
    });
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
    status = 'paid';
  } else if (paidValue > 0) {
    status = 'partial';
  }

  return {
    status,
    paidValue,
    totalValue,
    paidInstallments,
    totalInstallments,
    paymentPercentage: totalValue > 0 ? (paidValue / totalValue * 100).toFixed(1) : 0,
    details
  };
}

async function fixPaymentStatusReal() {
  log('🔧 CORRIGINDO STATUS DE PAGAMENTO (LÓGICA REAL)');
  log('===============================================');

  try {
    // Buscar todos os clientes
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

        // Buscar cliente no ASAAS
        const customerResponse = await makeRequest(`${ASAAS_URL}/customers?cpfCnpj=${clientData.cpf}`);
        
        if (customerResponse.status !== 200 || !customerResponse.data.data || customerResponse.data.data.length === 0) {
          log(`⚠️ Cliente não encontrado no ASAAS para ${clientData.email}`);
          continue;
        }
        
        const asaasCustomer = customerResponse.data.data[0];
        const customerId = asaasCustomer.id;
        
        // Buscar pagamentos UAIZOUK
        const paymentsResponse = await makeRequest(`${ASAAS_URL}/payments?customer=${customerId}&limit=100`);
        
        if (paymentsResponse.status !== 200) {
          log(`⚠️ Erro ao buscar pagamentos para ${clientData.email}: ${paymentsResponse.status}`);
          errorCount++;
          continue;
        }

        const allPayments = paymentsResponse.data.data || [];
        const uaizoukPayments = allPayments.filter(payment => 
          payment.description && 
          payment.description.toLowerCase().includes('uaizouk')
        );

        if (uaizoukPayments.length === 0) {
          log(`⚠️ Nenhum pagamento UAIZOUK encontrado para ${clientData.email}`);
          continue;
        }

        // Calcular status com lógica real
        const paymentInfo = calculatePaymentStatusReal(uaizoukPayments);
        
        log(`📊 Status calculado: ${paymentInfo.status} (${paymentInfo.paidValue}/${paymentInfo.totalValue}) - ${paymentInfo.paidInstallments}/${paymentInfo.totalInstallments} parcelas`);
        
        // Mostrar detalhes dos pagamentos
        paymentInfo.details.forEach((detail, i) => {
          log(`   ${i+1}. ${detail.description} - Status: ${detail.status} - Pago: ${detail.isPaid ? 'SIM' : 'NÃO'} - Data: ${detail.paymentDate || 'N/A'}`);
        });

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
        SUM(CASE WHEN payment_status = 'paid' THEN total ELSE 0 END) as paid_revenue,
        SUM(total) as total_revenue
      FROM event_registrations
    `;

    log('📊 ESTATÍSTICAS FINAIS:');
    log(`📈 Total de clientes: ${stats[0].total_clients}`);
    log(`✅ Pagos: ${stats[0].paid_clients}`);
    log(`⏳ Parciais: ${stats[0].partial_clients}`);
    log(`⏱️ Pendentes: ${stats[0].pending_clients}`);
    log(`💰 Receita paga: R$ ${parseFloat(stats[0].paid_revenue || 0).toFixed(2)}`);
    log(`💰 Receita total: R$ ${parseFloat(stats[0].total_revenue || 0).toFixed(2)}`);

    if (stats[0].total_revenue > 0) {
      const collectionRate = (parseFloat(stats[0].paid_revenue || 0) / parseFloat(stats[0].total_revenue) * 100).toFixed(1);
      log(`📊 Taxa de cobrança: ${collectionRate}%`);
    }

    return stats[0];

  } catch (error) {
    log(`❌ Erro ao gerar relatório: ${error.message}`);
    throw error;
  }
}

async function main() {
  log('🚀 INICIANDO CORREÇÃO DE STATUS (LÓGICA REAL)');
  log('============================================');
  log('🔍 Considerando apenas parcelas com data de pagamento real');
  log('');

  try {
    // Corrigir status de pagamento
    const correctionResults = await fixPaymentStatusReal();
    log('');

    // Gerar relatório final
    await generateReport();
    log('');

    log('🎉 CORREÇÃO CONCLUÍDA COM SUCESSO!');
    log('==================================');
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

module.exports = { main, fixPaymentStatusReal, calculatePaymentStatusReal };