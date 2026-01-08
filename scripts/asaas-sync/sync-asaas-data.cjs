#!/usr/bin/env node

// Script de Sincronização ASAAS -> Base Local
// Sincroniza clientes e cobranças do ASAAS com nossa base de dados

const https = require('https');
const { Client } = require('postgres');

const ASAAS_URL = 'https://api.asaas.com/v3';
const API_KEY = '$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjJlMDA3YWEwLWNiNDEtNDMxYy1hMmQ0LTAzOTBmNDRkY2Q3NTo6JGFhY2hfNGU5YzliMzMtY2M3MC00MWRmLTgyZDQtNzViZGQ3ZTY2OWZh';

// Configuração do banco
const client = new Client({
  host: 'ep-mute-base-a8dewk2d-pooler.eastus2.azure.neon.tech',
  port: 5432,
  database: 'uaizouklp',
  user: 'uaizouklp_owner',
  password: 'npg_BgyoHlKF1Tu3',
  ssl: true
});

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

  // Padrões encontrados nas descrições:
  // "Parcela 1 de 3. UAIZOUK 2026"
  // "Uaizouk 2026"
  // "Parcela 6 de 6. Valor contempla todas as aulas e bailes oficiais da edição de 2026 do UAIZOUK."

  const patterns = {
    installment: /Parcela (\d+) de (\d+)/,
    event: /UAIZOUK|Uaizouk/i,
    year: /202[4-6]/,
    products: /(?:aulas|bailes|oficiais|edição)/i
  };

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
  const installmentMatch = description.match(patterns.installment);
  if (installmentMatch) {
    result.isInstallment = true;
    result.installmentNumber = parseInt(installmentMatch[1]);
    result.totalInstallments = parseInt(installmentMatch[2]);
  }

  // Verificar evento
  if (patterns.event.test(description)) {
    result.eventName = 'UAIZOUK';
  }

  // Verificar ano
  const yearMatch = description.match(patterns.year);
  if (yearMatch) {
    result.year = yearMatch[0];
  }

  // Verificar produtos
  if (patterns.products.test(description)) {
    result.hasProducts = true;
  }

  return result;
}

async function syncAsaasData() {
  console.log('🚀 Iniciando sincronização ASAAS -> Base Local');
  console.log('📅 Período: Setembro 2024 em diante');

  try {
    await client.connect();
    console.log('✅ Conectado ao banco de dados');

    let totalCustomers = 0;
    let totalPayments = 0;
    let syncedCustomers = 0;
    let syncedPayments = 0;
    let offset = 0;
    const limit = 100;

    // 1. Buscar todos os clientes (paginação)
    console.log('\n📋 Buscando clientes do ASAAS...');

    while (true) {
      const customersResponse = await makeRequest(`${ASAAS_URL}/customers?limit=${limit}&offset=${offset}`);

      if (customersResponse.status !== 200) {
        throw new Error(`Erro ao buscar clientes: ${customersResponse.status}`);
      }

      const customersData = customersResponse.data;
      const customers = customersData.data || [];

      if (customers.length === 0) break;

      totalCustomers += customers.length;

      // Processar cada cliente
      for (const customer of customers) {
        // Verificar se cliente já existe na nossa base
        const existingCustomer = await client`
          SELECT id FROM event_registrations
          WHERE cpf = ${customer.cpfCnpj} OR email = ${customer.email}
          LIMIT 1
        `;

        if (existingCustomer.length === 0) {
          // Cliente não existe, vamos verificar se tem cobranças do UAIZOUK
          const paymentsResponse = await makeRequest(`${ASAAS_URL}/payments?customer=${customer.id}&limit=10`);

          if (paymentsResponse.status === 200) {
            const paymentsData = paymentsResponse.data;
            const payments = paymentsData.data || [];

            // Filtrar apenas cobranças do UAIZOUK
            const uaizoukPayments = payments.filter(payment => {
              const parsed = parseDescription(payment.description);
              return parsed && parsed.eventName === 'UAIZOUK';
            });

            if (uaizoukPayments.length > 0) {
              console.log(`\n👤 Novo cliente UAIZOUK encontrado: ${customer.name}`);
              console.log(`   - CPF: ${customer.cpfCnpj}`);
              console.log(`   - Email: ${customer.email}`);
              console.log(`   - Cobranças UAIZOUK: ${uaizoukPayments.length}`);

              // Criar registro na nossa base
              try {
                await client`
                  INSERT INTO event_registrations (
                    event_id, cpf, is_foreigner, full_name, email, whatsapp,
                    birth_date, state, city, ticket_type, partner_name,
                    selected_products, total, terms_accepted, payment_method,
                    installments, created_at, payment_status, asaas_payment_id
                  ) VALUES (
                    1, ${customer.cpfCnpj}, false, ${customer.name}, ${customer.email},
                    ${customer.phone || '11999999999'}, '1990-01-01', 'SP', 'São Paulo',
                    'Individual', null, '{}', ${uaizoukPayments[0].value}, true,
                    'pix', ${uaizoukPayments[0].installmentCount || 1},
                    ${customer.dateCreated}, 'pending', ${uaizoukPayments[0].id}
                  )
                `;

                syncedCustomers++;
                console.log(`   ✅ Cliente sincronizado com sucesso`);
              } catch (error) {
                console.log(`   ❌ Erro ao sincronizar cliente: ${error.message}`);
              }
            }
          }
        }
      }

      offset += limit;

      // Evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // 2. Buscar cobranças recentes e atualizar status
    console.log('\n💰 Sincronizando status das cobranças...');

    offset = 0;
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
          // Atualizar status na nossa base
          try {
            const updateResult = await client`
              UPDATE event_registrations
              SET payment_status = ${payment.status.toLowerCase()},
                  updated_at = CURRENT_TIMESTAMP
              WHERE asaas_payment_id = ${payment.id}
            `;

            if (updateResult.count > 0) {
              syncedPayments++;
            }
          } catch (error) {
            console.log(`❌ Erro ao atualizar cobrança ${payment.id}: ${error.message}`);
          }
        }
      }

      offset += limit;

      // Evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n📊 Resumo da Sincronização:');
    console.log(`   - Total de clientes ASAAS: ${totalCustomers}`);
    console.log(`   - Clientes sincronizados: ${syncedCustomers}`);
    console.log(`   - Total de cobranças processadas: ${totalPayments}`);
    console.log(`   - Cobranças atualizadas: ${syncedPayments}`);

  } catch (error) {
    console.error('❌ Erro durante sincronização:', error.message);
  } finally {
    await client.end();
    console.log('✅ Conexão com banco encerrada');
  }
}

// Executar sincronização
syncAsaasData();
