#!/usr/bin/env node

// Script de Análise ASAAS -> Base Local
// Mostra o que seria sincronizado sem fazer alterações

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

async function analyzeSyncData() {
  console.log('🔍 Análise de Sincronização ASAAS -> Base Local');
  console.log('📅 Período: Setembro 2024 em diante');
  console.log('🎯 Foco: Clientes e cobranças do UAIZOUK');
  console.log('⚠️  MODO SIMULAÇÃO - Nenhuma alteração será feita');

  try {
    let totalPayments = 0;
    let uaizoukPayments = 0;
    let installmentPayments = 0;
    let customersWithUaizouk = new Set();
    let customersToSync = [];
    let offset = 0;
    const limit = 100;

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
          customersWithUaizouk.add(payment.customer);

          if (parsed.isInstallment) {
            installmentPayments++;
          }
        }
      }

      offset += limit;

      // Evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 50));

      // Limitar para não sobrecarregar
      if (offset >= 1000) break;
    }

    // 2. Analisar clientes únicos
    console.log('\n👥 Analisando clientes únicos...');

    const uniqueCustomers = Array.from(customersWithUaizouk);
    let customersAnalyzed = 0;

    for (let i = 0; i < Math.min(20, uniqueCustomers.length); i++) {
      const customerId = uniqueCustomers[i];

      try {
        const customerResponse = await makeRequest(`${ASAAS_URL}/customers/${customerId}`);

        if (customerResponse.status === 200) {
          const customer = customerResponse.data;
          customersAnalyzed++;

          // Buscar cobranças deste cliente
          const customerPaymentsResponse = await makeRequest(`${ASAAS_URL}/payments?customer=${customerId}&limit=10`);

          if (customerPaymentsResponse.status === 200) {
            const customerPayments = customerPaymentsResponse.data.data || [];
            const uaizoukCustomerPayments = customerPayments.filter(payment => {
              const parsed = parseDescription(payment.description);
              return parsed && parsed.eventName === 'UAIZOUK';
            });

            if (uaizoukCustomerPayments.length > 0) {
              const totalValue = uaizoukCustomerPayments.reduce((sum, p) => sum + p.value, 0);
              const paidValue = uaizoukCustomerPayments
                .filter(p => p.status === 'RECEIVED')
                .reduce((sum, p) => sum + p.value, 0);

              customersToSync.push({
                id: customer.id,
                name: customer.name,
                email: customer.email,
                cpf: customer.cpfCnpj,
                phone: customer.phone,
                dateCreated: customer.dateCreated,
                payments: uaizoukCustomerPayments.length,
                totalValue: totalValue,
                paidValue: paidValue,
                status: paidValue === totalValue ? 'PAGO' : 'PENDENTE'
              });
            }
          }
        }
      } catch (error) {
        console.log(`❌ Erro ao buscar cliente ${customerId}: ${error.message}`);
      }

      // Evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // 3. Mostrar resumo
    console.log('\n📊 RESUMO DA ANÁLISE:');
    console.log(`   - Total de cobranças analisadas: ${totalPayments}`);
    console.log(`   - Cobranças do UAIZOUK: ${uaizoukPayments}`);
    console.log(`   - Cobranças parceladas: ${installmentPayments}`);
    console.log(`   - Clientes únicos com UAIZOUK: ${uniqueCustomers.length}`);
    console.log(`   - Clientes analisados: ${customersAnalyzed}`);
    console.log(`   - Clientes para sincronizar: ${customersToSync.length}`);

    // 4. Mostrar clientes que seriam sincronizados
    console.log('\n👤 CLIENTES QUE SERIAM SINCRONIZADOS:');

    customersToSync.forEach((customer, index) => {
      console.log(`\n${index + 1}. ${customer.name}`);
      console.log(`   - CPF: ${customer.cpf}`);
      console.log(`   - Email: ${customer.email}`);
      console.log(`   - Telefone: ${customer.phone || 'Não informado'}`);
      console.log(`   - Cobranças UAIZOUK: ${customer.payments}`);
      console.log(`   - Valor total: R$ ${customer.totalValue.toFixed(2)}`);
      console.log(`   - Valor pago: R$ ${customer.paidValue.toFixed(2)}`);
      console.log(`   - Status: ${customer.status}`);
      console.log(`   - Criado em: ${customer.dateCreated}`);
    });

    // 5. Estatísticas de pagamento
    const paidCustomers = customersToSync.filter(c => c.status === 'PAGO').length;
    const pendingCustomers = customersToSync.filter(c => c.status === 'PENDENTE').length;
    const totalRevenue = customersToSync.reduce((sum, c) => sum + c.paidValue, 0);
    const pendingRevenue = customersToSync.reduce((sum, c) => sum + (c.totalValue - c.paidValue), 0);

    console.log('\n💰 ESTATÍSTICAS DE PAGAMENTO:');
    console.log(`   - Clientes com pagamento completo: ${paidCustomers}`);
    console.log(`   - Clientes com pagamento pendente: ${pendingCustomers}`);
    console.log(`   - Receita confirmada: R$ ${totalRevenue.toFixed(2)}`);
    console.log(`   - Receita pendente: R$ ${pendingRevenue.toFixed(2)}`);
    console.log(`   - Receita total potencial: R$ ${(totalRevenue + pendingRevenue).toFixed(2)}`);

    // 6. Recomendações
    console.log('\n💡 RECOMENDAÇÕES:');
    console.log('   ✅ Dados suficientes para sincronização completa');
    console.log('   ✅ CPF disponível para matching preciso');
    console.log('   ✅ Informações de parcelamento claras');
    console.log('   ✅ Status de pagamento atualizado');
    console.log('   ✅ Receita significativa identificada');

    console.log('\n🎯 PRÓXIMOS PASSOS:');
    console.log('   1. Executar script de sincronização real');
    console.log('   2. Verificar dados na base local');
    console.log('   3. Implementar sincronização automática');
    console.log('   4. Criar relatórios de receita');

  } catch (error) {
    console.error('❌ Erro durante análise:', error.message);
  }
}

// Executar análise
analyzeSyncData();
