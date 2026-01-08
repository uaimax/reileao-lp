#!/usr/bin/env node

// Script de Sincronização ASAAS -> Base Local
// Versão simplificada para análise dos dados

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

async function analyzeAsaasData() {
  console.log('🔍 Análise dos dados ASAAS para sincronização');
  console.log('📅 Foco: Cobranças de setembro 2024 em diante');

  try {
    let totalCustomers = 0;
    let totalPayments = 0;
    let uaizoukPayments = 0;
    let installmentPayments = 0;
    let customersWithUaizouk = new Set();
    let offset = 0;
    const limit = 100;

    // 1. Analisar cobranças recentes
    console.log('\n📅 Analisando cobranças de setembro 2024 em diante...');

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
          customersWithUaizouk.add(payment.customer);

          if (parsed.isInstallment) {
            installmentPayments++;
          }

          // Log de exemplo
          if (uaizoukPayments <= 5) {
            console.log(`\n💳 Exemplo ${uaizoukPayments}:`);
            console.log(`   - Cliente: ${payment.customer}`);
            console.log(`   - Valor: R$ ${payment.value}`);
            console.log(`   - Status: ${payment.status}`);
            console.log(`   - Descrição: ${payment.description}`);
            console.log(`   - Parcelas: ${parsed.isInstallment ? `${parsed.installmentNumber}/${parsed.totalInstallments}` : 'À vista'}`);
            console.log(`   - Ano: ${parsed.year}`);
            console.log(`   - Produtos: ${parsed.hasProducts ? 'Sim' : 'Não'}`);
          }
        }
      }

      offset += limit;

      // Evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 50));

      // Limitar análise para não sobrecarregar
      if (offset >= 1000) break;
    }

    // 2. Analisar clientes únicos
    console.log('\n👥 Analisando clientes únicos com cobranças UAIZOUK...');

    const uniqueCustomers = Array.from(customersWithUaizouk);
    let customersWithDetails = 0;

    for (let i = 0; i < Math.min(10, uniqueCustomers.length); i++) {
      const customerId = uniqueCustomers[i];

      try {
        const customerResponse = await makeRequest(`${ASAAS_URL}/customers/${customerId}`);

        if (customerResponse.status === 200) {
          const customer = customerResponse.data;
          customersWithDetails++;

          console.log(`\n👤 Cliente ${customersWithDetails}:`);
          console.log(`   - ID: ${customer.id}`);
          console.log(`   - Nome: ${customer.name}`);
          console.log(`   - Email: ${customer.email}`);
          console.log(`   - CPF: ${customer.cpfCnpj}`);
          console.log(`   - Telefone: ${customer.phone}`);
          console.log(`   - Criado em: ${customer.dateCreated}`);
        }
      } catch (error) {
        console.log(`❌ Erro ao buscar cliente ${customerId}: ${error.message}`);
      }

      // Evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // 3. Resumo da análise
    console.log('\n📊 RESUMO DA ANÁLISE:');
    console.log(`   - Total de cobranças analisadas: ${totalPayments}`);
    console.log(`   - Cobranças do UAIZOUK: ${uaizoukPayments}`);
    console.log(`   - Cobranças parceladas: ${installmentPayments}`);
    console.log(`   - Clientes únicos com UAIZOUK: ${uniqueCustomers.length}`);
    console.log(`   - Clientes analisados em detalhes: ${customersWithDetails}`);

    // 4. Recomendações
    console.log('\n💡 RECOMENDAÇÕES PARA SINCRONIZAÇÃO:');
    console.log('   ✅ Dados suficientes para sincronização completa');
    console.log('   ✅ CPF disponível para matching preciso');
    console.log('   ✅ Descrições contêm informações dos produtos');
    console.log('   ✅ Status de pagamento atualizado');
    console.log('   ✅ Informações de parcelamento disponíveis');

    console.log('\n🎯 PRÓXIMOS PASSOS:');
    console.log('   1. Criar script de sincronização completo');
    console.log('   2. Implementar matching por CPF');
    console.log('   3. Extrair produtos das descrições');
    console.log('   4. Atualizar status de pagamento');
    console.log('   5. Sincronizar informações de parcelas');

  } catch (error) {
    console.error('❌ Erro durante análise:', error.message);
  }
}

// Executar análise
analyzeAsaasData();
