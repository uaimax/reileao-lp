#!/usr/bin/env node

// Script de Sincronização ASAAS -> Base Local
// Sincroniza clientes e cobranças do UAIZOUK do ASAAS com nossa base

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

  // Verificar evento UAIZOUK
  if (/UAIZOUK|Uaizouk/i.test(description)) {
    result.eventName = 'UAIZOUK';
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
  console.log('🚀 Iniciando sincronização ASAAS -> Base Local');
  console.log('📅 Período: Setembro 2024 em diante');
  console.log('🎯 Foco: Clientes e cobranças do UAIZOUK');

  try {
    await client.connect();
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

                // Verificar se cliente já existe na nossa base
                const existingCustomer = await client`
                  SELECT id FROM event_registrations
                  WHERE cpf = ${customer.cpfCnpj}
                  LIMIT 1
                `;

                if (existingCustomer.length === 0) {
                  // Cliente não existe, criar novo registro
                  console.log(`\n👤 Novo cliente UAIZOUK: ${customer.name}`);
                  console.log(`   - CPF: ${customer.cpfCnpj}`);
                  console.log(`   - Email: ${customer.email}`);

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
                        'Individual', null, '{}', ${payment.value}, true,
                        'pix', ${parsed.totalInstallments || 1},
                        ${customer.dateCreated}, ${payment.status.toLowerCase()}, ${payment.id}
                      )
                    `;

                    syncedCustomers++;
                    console.log(`   ✅ Cliente sincronizado com sucesso`);
                  } catch (error) {
                    console.log(`   ❌ Erro ao sincronizar cliente: ${error.message}`);
                  }
                } else {
                  // Cliente existe, atualizar status de pagamento
                  try {
                    const updateResult = await client`
                      UPDATE event_registrations
                      SET payment_status = ${payment.status.toLowerCase()},
                          updated_at = CURRENT_TIMESTAMP
                      WHERE cpf = ${customer.cpfCnpj}
                    `;

                    if (updateResult.count > 0) {
                      updatedPayments++;
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
    console.log('\n📊 RESUMO DA SINCRONIZAÇÃO:');
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

    console.log(`   - Total de registros na base: ${ourRegistrations[0].total}`);
    console.log(`   - Registros desde setembro 2024: ${ourUaizoukRegistrations[0].total}`);

  } catch (error) {
    console.error('❌ Erro durante sincronização:', error.message);
  } finally {
    await client.end();
    console.log('✅ Conexão com banco encerrada');
  }
}

// Executar sincronização
syncAsaasData();
