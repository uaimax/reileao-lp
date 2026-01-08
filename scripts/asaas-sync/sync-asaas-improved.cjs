#!/usr/bin/env node

// Script de Sincronização ASAAS -> Base Local
// Versão corrigida com melhorias identificadas

const https = require('https');
const postgres = require('postgres');

const ASAAS_URL = 'https://api.asaas.com/v3';
const API_KEY = '$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjJlMDA3YWEwLWNiNDEtNDMxYy1hMmQ0LTAzOTBmNDRkY2Q3NTo6JGFhY2hfNGU5YzliMzMtY2M3MC00MWRmLTgyZDQtNzViZGQ3ZTY2OWZh';

// Configuração do banco (mesma do projeto)
const connectionString = 'postgresql://uaizouklp_owner:npg_BgyoHlKF1Tu3@ep-mute-base-a8dewk2d-pooler.eastus2.azure.neon.tech:5432/uaizouklp?sslmode=require';
const client = postgres(connectionString);

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
    products: [],
    rawDescription: description
  };

  // Verificar se é parcela
  const installmentMatch = description.match(/Parcela (\d+) de (\d+)/);
  if (installmentMatch) {
    result.isInstallment = true;
    result.installmentNumber = parseInt(installmentMatch[1]);
    result.totalInstallments = parseInt(installmentMatch[2]);
  }

  // Verificar evento UAIZOUK
  if (/UAIZOUK|Uaizouk/i.test(description)) {
    result.eventName = 'UAIZOUK';
  }

  // Verificar ano
  const yearMatch = description.match(/202[4-6]/);
  if (yearMatch) {
    result.year = yearMatch[0];
  }

  // Extrair produtos da descrição
  if (/(?:aulas|bailes|oficiais|edição)/i.test(description)) {
    result.hasProducts = true;
    result.products.push('Aulas e Bailes Oficiais');
  }

  // Verificar se é ingresso individual
  if (/ingresso|individual/i.test(description)) {
    result.products.push('Ingresso Individual');
  }

  return result;
}

function normalizePhone(phone) {
  if (!phone) return null;

  // Remover caracteres especiais e espaços
  const cleaned = phone.replace(/[^\d]/g, '');

  // Se tem 11 dígitos e começa com 11, manter como está
  if (cleaned.length === 11 && cleaned.startsWith('11')) {
    return cleaned;
  }

  // Se tem 10 dígitos, adicionar 11 no início
  if (cleaned.length === 10) {
    return '11' + cleaned;
  }

  // Se tem 13 dígitos e começa com 55, remover o 55
  if (cleaned.length === 13 && cleaned.startsWith('55')) {
    return cleaned.substring(2);
  }

  // Se tem 12 dígitos e começa com 55, remover o 55
  if (cleaned.length === 12 && cleaned.startsWith('55')) {
    return cleaned.substring(2);
  }

  return cleaned;
}

async function getCustomerPaymentDetails(customerId) {
  try {
    const paymentsResponse = await makeRequest(`${ASAAS_URL}/payments?customer=${customerId}&limit=50`);

    if (paymentsResponse.status !== 200) {
      return null;
    }

    const payments = paymentsResponse.data.data || [];
    const uaizoukPayments = payments.filter(payment => {
      const parsed = parseDescription(payment.description);
      return parsed && parsed.eventName === 'UAIZOUK';
    });

    if (uaizoukPayments.length === 0) {
      return null;
    }

    // Ordenar por data de criação para pegar a primeira cobrança
    uaizoukPayments.sort((a, b) => new Date(a.dateCreated) - new Date(b.dateCreated));

    const firstPayment = uaizoukPayments[0];
    const totalValue = uaizoukPayments.reduce((sum, p) => sum + p.value, 0);
    const paidValue = uaizoukPayments
      .filter(p => p.status === 'RECEIVED')
      .reduce((sum, p) => sum + p.value, 0);

    // Determinar status geral
    let overallStatus = 'pending';
    if (paidValue === totalValue) {
      overallStatus = 'received';
    } else if (paidValue > 0) {
      overallStatus = 'partial';
    }

    return {
      firstPayment,
      totalValue,
      paidValue,
      overallStatus,
      installments: uaizoukPayments.length,
      allPayments: uaizoukPayments
    };
  } catch (error) {
    console.log(`❌ Erro ao buscar cobranças do cliente ${customerId}: ${error.message}`);
    return null;
  }
}

async function syncAsaasDataImproved() {
  console.log('🚀 SINCRONIZAÇÃO ASAAS MELHORADA');
  console.log('📅 Período: Setembro 2024 em diante');
  console.log('🎯 Foco: Clientes e cobranças do UAIZOUK');
  console.log('⚠️  MODO REAL - Alterações serão feitas no banco!');

  try {
    console.log('✅ Conectado ao banco de dados');

    let totalPayments = 0;
    let uaizoukPayments = 0;
    let syncedCustomers = 0;
    let updatedPayments = 0;
    let offset = 0;
    const limit = 100;
    const processedCustomers = new Set();

    // 1. Buscar cobranças recentes do UAIZOUK
    console.log('\n📅 Buscando cobranças do UAIZOUK...');

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

        if (parsed && parsed.eventName === 'UAIZOUK') {
          uaizoukPayments++;

          // Buscar dados do cliente se ainda não processado
          if (!processedCustomers.has(payment.customer)) {
            try {
              const customerResponse = await makeRequest(`${ASAAS_URL}/customers/${payment.customer}`);

              if (customerResponse.status === 200) {
                const customer = customerResponse.data;
                processedCustomers.add(payment.customer);

                // Buscar detalhes das cobranças deste cliente
                const paymentDetails = await getCustomerPaymentDetails(payment.customer);

                if (!paymentDetails) {
                  console.log(`⚠️ Cliente ${customer.name} sem cobranças UAIZOUK válidas`);
                  continue;
                }

                // Verificar se cliente já existe na nossa base
                const existingCustomer = await client`
                  SELECT id, cpf, email FROM event_registrations
                  WHERE cpf = ${customer.cpfCnpj}
                  LIMIT 1
                `;

                if (existingCustomer.length === 0) {
                  // Cliente não existe, criar novo registro
                  console.log(`\n👤 Novo cliente UAIZOUK: ${customer.name}`);
                  console.log(`   - CPF: ${customer.cpfCnpj}`);
                  console.log(`   - Email: ${customer.email}`);
                  console.log(`   - Telefone: ${customer.phone || 'Não informado'}`);
                  console.log(`   - Primeira cobrança: ${paymentDetails.firstPayment.dateCreated}`);
                  console.log(`   - Valor total: R$ ${paymentDetails.totalValue}`);
                  console.log(`   - Valor pago: R$ ${paymentDetails.paidValue}`);
                  console.log(`   - Status: ${paymentDetails.overallStatus}`);
                  console.log(`   - Parcelas: ${paymentDetails.installments}`);

                  try {
                    const normalizedPhone = normalizePhone(customer.phone);
                    const products = paymentDetails.firstPayment.description ?
                      JSON.stringify(parseDescription(paymentDetails.firstPayment.description).products) :
                      '[]';

                    await client`
                      INSERT INTO event_registrations (
                        event_id, cpf, is_foreigner, full_name, email, whatsapp,
                        birth_date, state, city, ticket_type, partner_name,
                        selected_products, total, terms_accepted, payment_method,
                        installments, created_at, payment_status, asaas_payment_id
                      ) VALUES (
                        1, ${customer.cpfCnpj}, false, ${customer.name}, ${customer.email},
                        ${normalizedPhone || '11999999999'}, '1990-01-01', 'SP', 'São Paulo',
                        'Individual', null, ${products}, ${paymentDetails.totalValue}, true,
                        'credit_card', ${paymentDetails.installments},
                        ${paymentDetails.firstPayment.dateCreated}, ${paymentDetails.overallStatus}, ${paymentDetails.firstPayment.id}
                      )
                    `;

                    syncedCustomers++;
                    console.log(`   ✅ Cliente sincronizado com sucesso`);
                  } catch (error) {
                    console.log(`   ❌ Erro ao sincronizar cliente: ${error.message}`);
                  }
                } else {
                  // Cliente existe, atualizar status de pagamento
                  const existingReg = existingCustomer[0];

                  try {
                    const updateResult = await client`
                      UPDATE event_registrations
                      SET payment_status = ${paymentDetails.overallStatus},
                          updated_at = CURRENT_TIMESTAMP,
                          asaas_payment_id = ${paymentDetails.firstPayment.id},
                          total = ${paymentDetails.totalValue}
                      WHERE cpf = ${customer.cpfCnpj}
                    `;

                    if (updateResult.count > 0) {
                      updatedPayments++;
                      console.log(`\n🔄 Cliente atualizado: ${customer.name}`);
                      console.log(`   - Status: ${paymentDetails.overallStatus}`);
                      console.log(`   - Valor total: R$ ${paymentDetails.totalValue}`);
                      console.log(`   - Valor pago: R$ ${paymentDetails.paidValue}`);
                    }
                  } catch (error) {
                    console.log(`❌ Erro ao atualizar cliente ${customer.name}: ${error.message}`);
                  }
                }
              }
            } catch (error) {
              console.log(`❌ Erro ao buscar cliente ${payment.customer}: ${error.message}`);
            }
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
    console.log('\n📊 RESUMO DA SINCRONIZAÇÃO MELHORADA:');
    console.log(`   - Total de cobranças analisadas: ${totalPayments}`);
    console.log(`   - Cobranças do UAIZOUK: ${uaizoukPayments}`);
    console.log(`   - Clientes únicos processados: ${processedCustomers.size}`);
    console.log(`   - Novos clientes sincronizados: ${syncedCustomers}`);
    console.log(`   - Pagamentos atualizados: ${updatedPayments}`);

    // 3. Verificar dados na nossa base
    console.log('\n🔍 Verificando dados na nossa base...');
    const ourRegistrations = await client`
      SELECT COUNT(*) as total FROM event_registrations
    `;

    const ourUaizoukRegistrations = await client`
      SELECT COUNT(*) as total FROM event_registrations
      WHERE created_at >= '2024-09-01'
    `;

    const paidRegistrations = await client`
      SELECT COUNT(*) as total FROM event_registrations
      WHERE payment_status = 'received' AND created_at >= '2024-09-01'
    `;

    const partialRegistrations = await client`
      SELECT COUNT(*) as total FROM event_registrations
      WHERE payment_status = 'partial' AND created_at >= '2024-09-01'
    `;

    const pendingRegistrations = await client`
      SELECT COUNT(*) as total FROM event_registrations
      WHERE payment_status = 'pending' AND created_at >= '2024-09-01'
    `;

    console.log(`   - Total de registros na base: ${ourRegistrations[0].total}`);
    console.log(`   - Registros desde setembro 2024: ${ourUaizoukRegistrations[0].total}`);
    console.log(`   - Registros pagos: ${paidRegistrations[0].total}`);
    console.log(`   - Registros pagos parcialmente: ${partialRegistrations[0].total}`);
    console.log(`   - Registros pendentes: ${pendingRegistrations[0].total}`);

    // 4. Calcular receita
    const revenueData = await client`
      SELECT
        SUM(total) as total_revenue,
        SUM(CASE WHEN payment_status = 'received' THEN total ELSE 0 END) as paid_revenue,
        SUM(CASE WHEN payment_status = 'partial' THEN total ELSE 0 END) as partial_revenue,
        SUM(CASE WHEN payment_status = 'pending' THEN total ELSE 0 END) as pending_revenue
      FROM event_registrations
      WHERE created_at >= '2024-09-01'
    `;

    if (revenueData[0].total_revenue) {
      console.log('\n💰 RECEITA CALCULADA:');
      console.log(`   - Receita total: R$ ${parseFloat(revenueData[0].total_revenue).toFixed(2)}`);
      console.log(`   - Receita paga: R$ ${parseFloat(revenueData[0].paid_revenue).toFixed(2)}`);
      console.log(`   - Receita parcial: R$ ${parseFloat(revenueData[0].partial_revenue).toFixed(2)}`);
      console.log(`   - Receita pendente: R$ ${parseFloat(revenueData[0].pending_revenue).toFixed(2)}`);
    }

    console.log('\n✅ SINCRONIZAÇÃO MELHORADA CONCLUÍDA COM SUCESSO!');

  } catch (error) {
    console.error('❌ Erro durante sincronização:', error.message);
  } finally {
    console.log('✅ Sincronização finalizada');
  }
}

// Executar sincronização melhorada
syncAsaasDataImproved();
