#!/usr/bin/env node

// Script de Sincronização ASAAS -> Base Local
// Versão real que faz a sincronização completa

const https = require('https');
const { getConfig, createDbClient, isEventPayment, parsePaymentDescription } = require('../config.cjs');

// Carregar configuração
const config = getConfig();
const ASAAS_URL = config.asaasUrl;
const API_KEY = config.asaasApiKey;
const SITE_NAME = config.siteName;

// Configuração do banco
const client = createDbClient();

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
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
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          reject(new Error(`Erro ao fazer parse do JSON: ${error.message}`));
        }
      });
    });

    req.on('error', reject);
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

async function syncAsaasData() {
  console.log('🚀 INICIANDO SINCRONIZAÇÃO ASAAS -> BASE LOCAL');
  console.log('📅 Período: Setembro 2024 em diante');
  console.log(`🎯 Foco: Clientes e cobranças do ${SITE_NAME}`);
  console.log('⚠️  MODO REAL - Alterações serão feitas no banco!');

  try {
    console.log('✅ Conectado ao banco de dados');

    let totalPayments = 0;
    let eventPayments = 0;
    let syncedCustomers = 0;
    let updatedPayments = 0;
    let skippedCustomers = 0;
    let offset = 0;
    const limit = 100;
    const processedCustomers = new Set();

    // 1. Buscar cobranças recentes do evento
    console.log(`\n📅 Buscando cobranças do ${SITE_NAME}...`);

    while (true) {
      const paymentsResponse = await makeRequest(`${ASAAS_URL}/payments?dateCreated[ge]=2024-09-01&limit=${limit}&offset=${offset}`);

      if (paymentsResponse.status !== 200) {
        throw new Error(`Erro ao buscar cobranças: ${paymentsResponse.status}`);
      }

      const paymentsData = paymentsResponse.data;
      const payments = paymentsData.data || [];

      if (payments.length === 0) break;

      totalPayments += payments.length;

      // Processar cada cobrança
      for (const payment of payments) {
        const parsed = parseDescription(payment.description);

        if (parsed && parsed.eventName === SITE_NAME) {
          eventPayments++;

          // Buscar dados do cliente se ainda não processado
          if (!processedCustomers.has(payment.customer)) {
            try {
              const customerResponse = await makeRequest(`${ASAAS_URL}/customers/${payment.customer}`);

              if (customerResponse.status === 200) {
                const customer = customerResponse.data;
                processedCustomers.add(payment.customer);

                // Verificar se cliente já existe na nossa base
                const existingCustomer = await client`
                  SELECT id, cpf, email FROM event_registrations
                  WHERE cpf = ${customer.cpfCnpj}
                  LIMIT 1
                `;

                if (existingCustomer.length === 0) {
                  // Cliente não existe, criar novo registro
                  console.log(`\n👤 Novo cliente ${SITE_NAME}: ${customer.name}`);
                  console.log(`   - CPF: ${customer.cpfCnpj}`);
                  console.log(`   - Email: ${customer.email}`);

                  try {
                    // Buscar todas as cobranças deste cliente para calcular total
                    const customerPaymentsResponse = await makeRequest(`${ASAAS_URL}/payments?customer=${payment.customer}&limit=20`);
                    let totalValue = payment.value;
                    let installments = parsed.totalInstallments || 1;

                    if (customerPaymentsResponse.status === 200) {
                      const customerPayments = customerPaymentsResponse.data.data || [];
                      const eventCustomerPayments = customerPayments.filter(p => {
                        return isEventPayment(p.description);
                      });

                      if (eventCustomerPayments.length > 1) {
                        totalValue = eventCustomerPayments.reduce((sum, p) => sum + p.value, 0);
                        installments = Math.max(...eventCustomerPayments.map(p => {
                          const pParsed = parseDescription(p.description);
                          return pParsed?.totalInstallments || 1;
                        }));
                      }
                    }

                    await client`
                      INSERT INTO event_registrations (
                        event_id, cpf, is_foreigner, full_name, email, whatsapp,
                        birth_date, state, city, ticket_type, partner_name,
                        selected_products, total, terms_accepted, payment_method,
                        installments, created_at, payment_status, asaas_payment_id
                      ) VALUES (
                        1, ${customer.cpfCnpj}, false, ${customer.name}, ${customer.email},
                        ${customer.phone || '11999999999'}, '1990-01-01', 'SP', 'São Paulo',
                        'Individual', null, '{}', ${totalValue}, true,
                        'pix', ${installments},
                        ${customer.dateCreated}, ${payment.status.toLowerCase()}, ${payment.id}
                      )
                    `;

                    syncedCustomers++;
                    console.log(`   ✅ Cliente sincronizado com sucesso`);
                    console.log(`   - Valor total: R$ ${totalValue}`);
                    console.log(`   - Parcelas: ${installments}`);
                  } catch (error) {
                    console.log(`   ❌ Erro ao sincronizar cliente: ${error.message}`);
                  }
                } else {
                  // Cliente existe, atualizar status de pagamento
                  const existingReg = existingCustomer[0];

                  try {
                    const updateResult = await client`
                      UPDATE event_registrations
                      SET payment_status = ${payment.status.toLowerCase()},
                          updated_at = CURRENT_TIMESTAMP,
                          asaas_payment_id = ${payment.id}
                      WHERE cpf = ${customer.cpfCnpj}
                    `;

                    if (updateResult.count > 0) {
                      updatedPayments++;
                      console.log(`\n🔄 Cliente atualizado: ${customer.name}`);
                      console.log(`   - Status: ${payment.status.toLowerCase()}`);
                    }
                  } catch (error) {
                    console.log(`❌ Erro ao atualizar cliente ${customer.name}: ${error.message}`);
                  }
                }
              }
            } catch (error) {
              console.log(`❌ Erro ao buscar cliente ${payment.customer}: ${error.message}`);
            }
          } else {
            skippedCustomers++;
          }
        }
      }

      offset += limit;

      // Evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));

      // Limitar para não sobrecarregar
      if (offset >= 1000) break;
    }

    // 2. Resumo da sincronização
    console.log('\n📊 RESUMO DA SINCRONIZAÇÃO:');
    console.log(`   - Total de cobranças analisadas: ${totalPayments}`);
    console.log(`   - Cobranças do ${SITE_NAME}: ${eventPayments}`);
    console.log(`   - Clientes únicos processados: ${processedCustomers.size}`);
    console.log(`   - Novos clientes sincronizados: ${syncedCustomers}`);
    console.log(`   - Pagamentos atualizados: ${updatedPayments}`);
    console.log(`   - Clientes já existentes: ${skippedCustomers}`);

    // 3. Verificar dados na nossa base
    console.log('\n🔍 Verificando dados na nossa base...');
    const ourRegistrations = await client`
      SELECT COUNT(*) as total FROM event_registrations
    `;

    const ourEventRegistrations = await client`
      SELECT COUNT(*) as total FROM event_registrations
      WHERE created_at >= '2024-09-01'
    `;

    const paidRegistrations = await client`
      SELECT COUNT(*) as total FROM event_registrations
      WHERE payment_status = 'received' AND created_at >= '2024-09-01'
    `;

    const pendingRegistrations = await client`
      SELECT COUNT(*) as total FROM event_registrations
      WHERE payment_status = 'pending' AND created_at >= '2024-09-01'
    `;

    console.log(`   - Total de registros na base: ${ourRegistrations[0].total}`);
    console.log(`   - Registros desde setembro 2024: ${ourEventRegistrations[0].total}`);
    console.log(`   - Registros pagos: ${paidRegistrations[0].total}`);
    console.log(`   - Registros pendentes: ${pendingRegistrations[0].total}`);

    // 4. Calcular receita
    const revenueData = await client`
      SELECT
        SUM(total) as total_revenue,
        SUM(CASE WHEN payment_status = 'received' THEN total ELSE 0 END) as paid_revenue,
        SUM(CASE WHEN payment_status = 'pending' THEN total ELSE 0 END) as pending_revenue
      FROM event_registrations
      WHERE created_at >= '2024-09-01'
    `;

    if (revenueData[0].total_revenue) {
      console.log('\n💰 RECEITA CALCULADA:');
      console.log(`   - Receita total: R$ ${parseFloat(revenueData[0].total_revenue).toFixed(2)}`);
      console.log(`   - Receita paga: R$ ${parseFloat(revenueData[0].paid_revenue).toFixed(2)}`);
      console.log(`   - Receita pendente: R$ ${parseFloat(revenueData[0].pending_revenue).toFixed(2)}`);
    }

    console.log('\n✅ SINCRONIZAÇÃO CONCLUÍDA COM SUCESSO!');

  } catch (error) {
    console.error('❌ Erro durante sincronização:', error.message);
  } finally {
    console.log('✅ Sincronização finalizada');
  }
}

// Executar sincronização
syncAsaasData();
