#!/usr/bin/env node

// Script para verificar dados do ASAAS de produção
const https = require('https');

const ASAAS_URL = 'https://api.asaas.com/v3';
const API_KEY = '$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjJlMDA3YWEwLWNiNDEtNDMxYy1hMmQ0LTAzOTBmNDRkY2Q3NTo6JGFhY2hfNGU5YzliMzMtY2M3MC00MWRmLTgyZDQtNzViZGQ3ZTY2OWZh';

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

async function checkAsaasData() {
  console.log('🔍 Verificando dados do ASAAS de produção...');

  try {
    // 1. Listar alguns clientes
    console.log('\n📋 Buscando clientes...');
    const customersResponse = await makeRequest(`${ASAAS_URL}/customers?limit=5`);

    if (customersResponse.status !== 200) {
      throw new Error(`Erro ao buscar clientes: ${customersResponse.status}`);
    }

    const customersData = customersResponse.data;
    console.log(`✅ Encontrados ${customersData.totalCount || customersData.data?.length || 0} clientes no total`);

    if (customersData.data && customersData.data.length > 0) {
      console.log('\n👤 Exemplo de cliente:');
      const customer = customersData.data[0];
      console.log(`- ID: ${customer.id}`);
      console.log(`- Nome: ${customer.name}`);
      console.log(`- Email: ${customer.email}`);
      console.log(`- CPF: ${customer.cpfCnpj}`);
      console.log(`- Criado em: ${customer.dateCreated}`);

      // 2. Buscar cobranças deste cliente
      console.log('\n💰 Buscando cobranças deste cliente...');
      const paymentsResponse = await makeRequest(`${ASAAS_URL}/payments?customer=${customer.id}&limit=3`);

      if (paymentsResponse.status === 200) {
        const paymentsData = paymentsResponse.data;
        console.log(`✅ Encontradas ${paymentsData.totalCount || paymentsData.data?.length || 0} cobranças`);

        if (paymentsData.data && paymentsData.data.length > 0) {
          console.log('\n💳 Exemplo de cobrança:');
          const payment = paymentsData.data[0];
          console.log(`- ID: ${payment.id}`);
          console.log(`- Valor: R$ ${payment.value}`);
          console.log(`- Vencimento: ${payment.dueDate}`);
          console.log(`- Status: ${payment.status}`);
          console.log(`- Descrição: ${payment.description}`);
          console.log(`- Parcelas: ${payment.installmentCount || 'N/A'}`);
          console.log(`- Criado em: ${payment.dateCreated}`);
        }
      }
    }

    // 3. Buscar cobranças recentes (setembro 2024+)
    console.log('\n📅 Buscando cobranças de setembro 2024 em diante...');
    const recentPaymentsResponse = await makeRequest(`${ASAAS_URL}/payments?dateCreated[ge]=2024-09-01&limit=5`);

    if (recentPaymentsResponse.status === 200) {
      const recentPaymentsData = recentPaymentsResponse.data;
      console.log(`✅ Encontradas ${recentPaymentsData.totalCount || recentPaymentsData.data?.length || 0} cobranças recentes`);

      if (recentPaymentsData.data && recentPaymentsData.data.length > 0) {
        console.log('\n🆕 Exemplos de cobranças recentes:');
        recentPaymentsData.data.forEach((payment, index) => {
          console.log(`${index + 1}. ${payment.description} - R$ ${payment.value} - ${payment.status}`);
        });
      }
    }

    // 4. Buscar cobranças com parcelas
    console.log('\n🔄 Buscando cobranças parceladas...');
    const installmentPaymentsResponse = await makeRequest(`${ASAAS_URL}/payments?installmentCount[gt]=1&limit=5`);

    if (installmentPaymentsResponse.status === 200) {
      const installmentPaymentsData = installmentPaymentsResponse.data;
      console.log(`✅ Encontradas ${installmentPaymentsData.totalCount || installmentPaymentsData.data?.length || 0} cobranças parceladas`);

      if (installmentPaymentsData.data && installmentPaymentsData.data.length > 0) {
        console.log('\n📊 Exemplos de cobranças parceladas:');
        installmentPaymentsData.data.forEach((payment, index) => {
          console.log(`${index + 1}. ${payment.description}`);
          console.log(`   - Valor: R$ ${payment.value} (${payment.installmentCount}x de R$ ${payment.installmentValue})`);
          console.log(`   - Status: ${payment.status}`);
          console.log(`   - Cliente: ${payment.customer}`);
          console.log('');
        });
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

checkAsaasData();
