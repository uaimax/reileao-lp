#!/usr/bin/env node

// Script para investigar a lógica de cálculo de pagamentos
// Verifica se estamos considerando parcelamentos corretamente

const https = require('https');
const { getConfig, createDbClient, isEventPayment } = require('../config.cjs');

// Carregar configuração
const config = getConfig();
const ASAAS_URL = config.asaasUrl;
const ASAAS_TOKEN = config.asaasApiKey;
const SITE_NAME = config.siteName;

// Configuração do banco
const client = createDbClient();

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

function calculatePaymentStatusDetailed(payments) {
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

    const isPaid = payment.status === 'RECEIVED' || payment.status === 'CONFIRMED';
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

async function investigateClient(email) {
  log(`🔍 INVESTIGANDO CLIENTE: ${email}`);
  log('='.repeat(50));

  try {
    // Buscar cliente no banco local
    const localClient = await client`
      SELECT cpf, full_name, email, payment_status, total, installments, created_at
      FROM event_registrations
      WHERE email = ${email}
    `;

    if (localClient.length === 0) {
      log(`❌ Cliente não encontrado no banco local`);
      return;
    }

    const clientData = localClient[0];
    log(`📊 DADOS LOCAIS:`);
    log(`   Nome: ${clientData.full_name}`);
    log(`   CPF: ${clientData.cpf}`);
    log(`   Status: ${clientData.payment_status}`);
    log(`   Total: R$ ${clientData.total}`);
    log(`   Parcelas: ${clientData.installments}`);
    log(`   Criado em: ${clientData.created_at}`);

    // Buscar cliente no ASAAS
    const customerResponse = await makeRequest(`${ASAAS_URL}/customers?cpfCnpj=${clientData.cpf}`);

    if (customerResponse.status !== 200 || !customerResponse.data.data || customerResponse.data.data.length === 0) {
      log(`❌ Cliente não encontrado no ASAAS`);
      return;
    }

    const asaasCustomer = customerResponse.data.data[0];
    log(`📊 DADOS ASAAS:`);
    log(`   ID: ${asaasCustomer.id}`);
    log(`   Nome: ${asaasCustomer.name}`);
    log(`   Email: ${asaasCustomer.email}`);

    // Buscar pagamentos
    const paymentsResponse = await makeRequest(`${ASAAS_URL}/payments?customer=${asaasCustomer.id}&limit=100`);

    if (paymentsResponse.status !== 200) {
      log(`❌ Erro ao buscar pagamentos: ${paymentsResponse.status}`);
      return;
    }

    const allPayments = paymentsResponse.data.data || [];
    const eventPayments = allPayments.filter(payment =>
      payment.description &&
      isEventPayment(payment.description)
    );

    log(`📊 PAGAMENTOS ${SITE_NAME}:`);
    log(`   Total encontrados: ${eventPayments.length}`);

    if (eventPayments.length > 0) {
      eventPayments.forEach((payment, i) => {
        log(`   ${i+1}. ${payment.description}`);
        log(`      Status: ${payment.status}`);
        log(`      Valor: R$ ${payment.value}`);
        log(`      Data vencimento: ${payment.dueDate}`);
        log(`      Data pagamento: ${payment.paymentDate || 'N/A'}`);
        log('');
      });

      // Calcular status detalhado
      const paymentInfo = calculatePaymentStatusDetailed(eventPayments);

      log(`📊 CÁLCULO DETALHADO:`);
      log(`   Status calculado: ${paymentInfo.status}`);
      log(`   Valor total: R$ ${paymentInfo.totalValue}`);
      log(`   Valor pago: R$ ${paymentInfo.paidValue}`);
      log(`   Parcelas totais: ${paymentInfo.totalInstallments}`);
      log(`   Parcelas pagas: ${paymentInfo.paidInstallments}`);
      log(`   Percentual pago: ${paymentInfo.paymentPercentage}%`);

      log(`📊 DETALHES DOS PAGAMENTOS:`);
      paymentInfo.details.forEach((detail, i) => {
        log(`   ${i+1}. ${detail.description}`);
        log(`      Status: ${detail.status} (Pago: ${detail.isPaid ? 'SIM' : 'NÃO'})`);
        log(`      Valor: R$ ${detail.value}`);
        if (detail.parsed.isInstallment) {
          log(`      Parcela: ${detail.parsed.currentInstallment}/${detail.parsed.totalInstallments}`);
        }
        log('');
      });

      // Verificar se há discrepância
      if (paymentInfo.status !== clientData.payment_status) {
        log(`⚠️ DISCREPÂNCIA DETECTADA:`);
        log(`   Status local: ${clientData.payment_status}`);
        log(`   Status calculado: ${paymentInfo.status}`);
      } else {
        log(`✅ Status consistente: ${paymentInfo.status}`);
      }

    } else {
      log(`❌ Nenhum pagamento ${SITE_NAME} encontrado`);
    }

  } catch (error) {
    log(`❌ Erro ao investigar cliente: ${error.message}`);
  }
}

async function main() {
  log('🔍 INVESTIGAÇÃO DE LÓGICA DE PAGAMENTOS');
  log('=====================================');

  try {
    // Investigar alguns clientes específicos
    const clientsToInvestigate = [
      'mirianerbsti@gmail.com',
      'priscillarayanefranca@hotmail.com',
      'webertongoiania@gmail.com'
    ];

    for (const email of clientsToInvestigate) {
      await investigateClient(email);
      log('\n' + '='.repeat(80) + '\n');
    }

  } catch (error) {
    log(`❌ ERRO CRÍTICO: ${error.message}`);
  } finally {
    await client.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { investigateClient, calculatePaymentStatusDetailed };