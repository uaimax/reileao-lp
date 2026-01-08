#!/usr/bin/env node

// Script para Investigar Dados do ASAAS
// Verifica telefones em cobranças e outros dados

const https = require('https');
const postgres = require('postgres');

const ASAAS_URL = 'https://api.asaas.com/v3';
const API_KEY = '$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjJlMDA3YWEwLWNiNDEtNDMxYy1hMmQ0LTAzOTBmNDRkY2Q3NTo6JGFhY2hfNGU5YzliMzMtY2M3MC00MWRmLTgyZDQtNzViZGQ3ZTY2OWZh';

// Configuração do banco
const connectionString = 'postgresql://uaizouklp_owner:npg_BgyoHlKF1Tu3@ep-mute-base-a8dewk2d-pooler.eastus2.azure.neon.tech:5432/uaizouklp?sslmode=require';
const client = postgres(connectionString);

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

async function investigateAsaasData() {
  console.log('🔍 INVESTIGANDO DADOS DO ASAAS');
  console.log('===============================');
  
  try {
    // 1. Buscar cobranças do UAIZOUK
    console.log('\n📅 Buscando cobranças do UAIZOUK...');
    
    const paymentsResponse = await makeRequest(`${ASAAS_URL}/payments?dateCreated[ge]=2024-09-01&limit=50`);
    
    if (paymentsResponse.status !== 200) {
      throw new Error(`Erro ao buscar cobranças: ${paymentsResponse.status}`);
    }
    
    const payments = paymentsResponse.data.data || [];
    console.log(`   - Total de cobranças encontradas: ${payments.length}`);
    
    // 2. Filtrar cobranças do UAIZOUK
    const uaizoukPayments = [];
    for (const payment of payments) {
      const parsed = parseDescription(payment.description);
      if (parsed && parsed.eventName === 'UAIZOUK') {
        uaizoukPayments.push(payment);
      }
    }
    
    console.log(`   - Cobranças do UAIZOUK: ${uaizoukPayments.length}`);
    
    // 3. Analisar cobranças do UAIZOUK
    console.log('\n📊 ANÁLISE DAS COBRANÇAS UAIZOUK:');
    
    let totalValue = 0;
    let receivedValue = 0;
    let pendingValue = 0;
    let customers = new Set();
    let installmentPayments = 0;
    
    for (const payment of uaizoukPayments) {
      totalValue += payment.value;
      customers.add(payment.customer);
      
      if (payment.status === 'RECEIVED') {
        receivedValue += payment.value;
      } else if (payment.status === 'PENDING') {
        pendingValue += payment.value;
      }
      
      const parsed = parseDescription(payment.description);
      if (parsed && parsed.isInstallment) {
        installmentPayments++;
      }
    }
    
    console.log(`   - Total de clientes únicos: ${customers.size}`);
    console.log(`   - Valor total: R$ ${totalValue.toFixed(2)}`);
    console.log(`   - Valor recebido: R$ ${receivedValue.toFixed(2)}`);
    console.log(`   - Valor pendente: R$ ${pendingValue.toFixed(2)}`);
    console.log(`   - Cobranças parceladas: ${installmentPayments}`);
    
    // 4. Verificar alguns clientes específicos
    console.log('\n👤 VERIFICANDO CLIENTES ESPECÍFICOS:');
    
    const customerIds = Array.from(customers).slice(0, 5); // Primeiros 5 clientes
    
    for (let i = 0; i < customerIds.length; i++) {
      const customerId = customerIds[i];
      
      try {
        console.log(`\n   [${i + 1}/5] Cliente ID: ${customerId}`);
        
        // Buscar dados do cliente
        const customerResponse = await makeRequest(`${ASAAS_URL}/customers/${customerId}`);
        
        if (customerResponse.status === 200) {
          const customer = customerResponse.data;
          console.log(`   - Nome: ${customer.name}`);
          console.log(`   - CPF: ${customer.cpfCnpj}`);
          console.log(`   - Email: ${customer.email}`);
          console.log(`   - Telefone: ${customer.phone || 'Não informado'}`);
          console.log(`   - Data criação: ${customer.dateCreated}`);
          
          // Buscar cobranças deste cliente
          const customerPaymentsResponse = await makeRequest(`${ASAAS_URL}/payments?customer=${customerId}&limit=10`);
          
          if (customerPaymentsResponse.status === 200) {
            const customerPayments = customerPaymentsResponse.data.data || [];
            const uaizoukCustomerPayments = customerPayments.filter(p => {
              const parsed = parseDescription(p.description);
              return parsed && parsed.eventName === 'UAIZOUK';
            });
            
            console.log(`   - Cobranças UAIZOUK: ${uaizoukCustomerPayments.length}`);
            
            uaizoukCustomerPayments.forEach((payment, index) => {
              const parsed = parseDescription(payment.description);
              console.log(`     ${index + 1}. ${payment.description}`);
              console.log(`        - Valor: R$ ${payment.value}`);
              console.log(`        - Status: ${payment.status}`);
              console.log(`        - Data: ${payment.dueDate}`);
              if (parsed && parsed.isInstallment) {
                console.log(`        - Parcela: ${parsed.installmentNumber}/${parsed.totalInstallments}`);
              }
            });
          }
        }
        
        // Evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
        
      } catch (error) {
        console.log(`   ❌ Erro ao verificar cliente ${customerId}: ${error.message}`);
      }
    }
    
    // 5. Verificar se há telefones em outros campos
    console.log('\n📱 VERIFICANDO CAMPOS DE TELEFONE:');
    
    const sampleCustomer = await makeRequest(`${ASAAS_URL}/customers/${customerIds[0]}`);
    if (sampleCustomer.status === 200) {
      const customer = sampleCustomer.data;
      console.log('   - Estrutura completa do cliente:');
      console.log(JSON.stringify(customer, null, 2));
    }
    
    // 6. Resumo da investigação
    console.log('\n📋 RESUMO DA INVESTIGAÇÃO:');
    console.log('===========================');
    console.log(`   - Cobranças UAIZOUK encontradas: ${uaizoukPayments.length}`);
    console.log(`   - Clientes únicos: ${customers.size}`);
    console.log(`   - Receita total: R$ ${totalValue.toFixed(2)}`);
    console.log(`   - Taxa de recebimento: ${((receivedValue / totalValue) * 100).toFixed(1)}%`);
    
    console.log('\n🔍 PRÓXIMOS PASSOS:');
    console.log('1. Verificar se telefones estão em outros campos');
    console.log('2. Implementar busca por email para matching');
    console.log('3. Criar sistema de cálculo de status baseado em parcelas');
    console.log('4. Desenvolver sincronização inteligente');
    
  } catch (error) {
    console.error('❌ Erro durante investigação:', error.message);
  } finally {
    console.log('\n✅ Investigação finalizada');
    process.exit(0);
  }
}

// Executar investigação com timeout de segurança
const timeout = setTimeout(() => {
  console.log('\n⏰ Timeout de segurança atingido. Finalizando...');
  process.exit(1);
}, 60000);

investigateAsaasData().finally(() => {
  clearTimeout(timeout);
});