#!/usr/bin/env node

// Script para corrigir telefones e status de pagamento

const https = require('https');
const postgres = require('postgres');

const ASAAS_URL = 'https://api.asaas.com/v3';
const API_KEY = '$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjJlMDA3YWEwLWNiNDEtNDMxYy1hMmQ0LTAzOTBmNDRkY2Q3NTo6JGFhY2hfNGU5YzliMzMtY2M3MC00MWRmLTgyZDQtNzViZGQ3ZTY2OWZh';

// Configuração do banco
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
      return payment.description && /UAIZOUK|Uaizouk/i.test(payment.description);
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

    // Determinar status usando apenas os status existentes
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

async function fixPhoneNumbersAndStatus() {
  console.log('🔧 CORRIGINDO TELEFONES E STATUS DE PAGAMENTO');
  console.log('📅 Período: Setembro 2024 em diante');
  console.log('⚠️  MODO REAL - Alterações serão feitas no banco!');

  try {
    console.log('✅ Conectado ao banco de dados');

    // Buscar todos os registros da nossa base
    const ourRegistrations = await client`
      SELECT id, cpf, full_name, email, whatsapp, payment_status, total, created_at
      FROM event_registrations
      WHERE created_at >= '2024-09-01'
      ORDER BY created_at DESC
    `;

    console.log(`\n📋 Encontrados ${ourRegistrations.length} registros na nossa base`);

    let fixedPhones = 0;
    let fixedStatus = 0;
    let processedCount = 0;

    for (const registration of ourRegistrations) {
      try {
        // Buscar cliente no ASAAS por CPF
        const customersResponse = await makeRequest(`${ASAAS_URL}/customers?cpfCnpj=${registration.cpf}`);

        if (customersResponse.status === 200 && customersResponse.data.data.length > 0) {
          const asaasCustomer = customersResponse.data.data[0];
          processedCount++;

          console.log(`\n👤 Processando: ${registration.full_name}`);
          console.log(`   - CPF: ${registration.cpf}`);

          let needsUpdate = false;
          let updateData = {};

          // Verificar telefone
          const asaasPhone = asaasCustomer.phone;
          const normalizedAsaasPhone = normalizePhone(asaasPhone);

          if (asaasPhone && asaasPhone !== 'Não informado' && normalizedAsaasPhone) {
            if (registration.whatsapp === '11999999999' || registration.whatsapp !== normalizedAsaasPhone) {
              console.log(`   📱 Corrigindo telefone: ${registration.whatsapp} → ${normalizedAsaasPhone}`);
              updateData.whatsapp = normalizedAsaasPhone;
              needsUpdate = true;
              fixedPhones++;
            } else {
              console.log(`   ✅ Telefone correto: ${registration.whatsapp}`);
            }
          } else {
            console.log(`   ⚠️ Sem telefone no ASAAS`);
          }

          // Verificar status de pagamento
          const paymentDetails = await getCustomerPaymentDetails(asaasCustomer.id);

          if (paymentDetails) {
            console.log(`   💰 Status atual: ${registration.payment_status}`);
            console.log(`   💰 Status correto: ${paymentDetails.overallStatus}`);
            console.log(`   💰 Valor total: R$ ${paymentDetails.totalValue}`);
            console.log(`   💰 Valor pago: R$ ${paymentDetails.paidValue}`);

            if (registration.payment_status !== paymentDetails.overallStatus) {
              console.log(`   🔄 Corrigindo status: ${registration.payment_status} → ${paymentDetails.overallStatus}`);
              updateData.payment_status = paymentDetails.overallStatus;
              updateData.total = paymentDetails.totalValue;
              needsUpdate = true;
              fixedStatus++;
            } else {
              console.log(`   ✅ Status correto`);
            }
          }

          // Aplicar atualizações se necessário
          if (needsUpdate) {
            try {
              const updateResult = await client`
                UPDATE event_registrations
                SET ${client(updateData)}, updated_at = CURRENT_TIMESTAMP
                WHERE id = ${registration.id}
              `;

              if (updateResult.count > 0) {
                console.log(`   ✅ Registro atualizado com sucesso`);
              }
            } catch (error) {
              console.log(`   ❌ Erro ao atualizar: ${error.message}`);
            }
          }
        }

        // Evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.log(`❌ Erro ao processar ${registration.full_name}: ${error.message}`);
      }
    }

    console.log(`\n📊 RESUMO DAS CORREÇÕES:`);
    console.log(`   - Registros processados: ${processedCount}`);
    console.log(`   - Telefones corrigidos: ${fixedPhones}`);
    console.log(`   - Status corrigidos: ${fixedStatus}`);

    // Verificar dados finais
    console.log('\n🔍 Verificando dados finais na base...');
    const finalStats = await client`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN payment_status = 'received' THEN 1 END) as received,
        COUNT(CASE WHEN payment_status = 'partial' THEN 1 END) as partial,
        COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN whatsapp != '11999999999' THEN 1 END) as with_phone
      FROM event_registrations
      WHERE created_at >= '2024-09-01'
    `;

    console.log(`   - Total de registros: ${finalStats[0].total}`);
    console.log(`   - Status 'received': ${finalStats[0].received}`);
    console.log(`   - Status 'partial': ${finalStats[0].partial}`);
    console.log(`   - Status 'pending': ${finalStats[0].pending}`);
    console.log(`   - Com telefone correto: ${finalStats[0].with_phone}`);

    console.log('\n✅ CORREÇÕES CONCLUÍDAS COM SUCESSO!');

  } catch (error) {
    console.error('❌ Erro durante correções:', error.message);
  } finally {
    console.log('✅ Processo finalizado');
  }
}

// Executar correções
fixPhoneNumbersAndStatus();
