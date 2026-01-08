#!/usr/bin/env node

// Script de Análise Completa do Estado Atual
// Identifica todos os problemas e inconsistências na sincronização ASAAS

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

async function analyzeCurrentState() {
  console.log('🔍 ANÁLISE COMPLETA DO ESTADO ATUAL');
  console.log('=====================================');
  
  try {
    // 1. Análise da base local
    console.log('\n📊 ANÁLISE DA BASE LOCAL:');
    
    const localStats = await client`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN created_at >= '2024-09-01' THEN 1 END) as recent,
        COUNT(CASE WHEN payment_status = 'received' THEN 1 END) as paid,
        COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN payment_status = 'partial' THEN 1 END) as partial,
        COUNT(CASE WHEN whatsapp = '11999999999' THEN 1 END) as default_phone,
        COUNT(CASE WHEN asaas_payment_id IS NOT NULL THEN 1 END) as has_asaas_id,
        AVG(total) as avg_total,
        SUM(total) as total_revenue
      FROM event_registrations
    `;
    
    const stats = localStats[0];
    console.log(`   - Total de registros: ${stats.total}`);
    console.log(`   - Registros recentes (set/2024+): ${stats.recent}`);
    console.log(`   - Pagos: ${stats.paid}`);
    console.log(`   - Pendentes: ${stats.pending}`);
    console.log(`   - Parciais: ${stats.partial}`);
    console.log(`   - Telefones padrão (11999999999): ${stats.default_phone}`);
    console.log(`   - Com ID ASAAS: ${stats.has_asaas_id}`);
    console.log(`   - Receita média: R$ ${parseFloat(stats.avg_total).toFixed(2)}`);
    console.log(`   - Receita total: R$ ${parseFloat(stats.total_revenue).toFixed(2)}`);
    
    // 2. Análise de telefones problemáticos
    console.log('\n📱 ANÁLISE DE TELEFONES:');
    
    const phoneIssues = await client`
      SELECT 
        whatsapp,
        COUNT(*) as count
      FROM event_registrations 
      WHERE created_at >= '2024-09-01'
      GROUP BY whatsapp
      ORDER BY count DESC
    `;
    
    console.log('   - Distribuição de telefones:');
    phoneIssues.forEach(phone => {
      console.log(`     ${phone.whatsapp}: ${phone.count} registros`);
    });
    
    // 3. Análise do ASAAS
    console.log('\n🌐 ANÁLISE DO ASAAS:');
    
    let asaasCustomers = 0;
    let asaasPayments = 0;
    let uaizoukPayments = 0;
    let customersWithPhone = 0;
    let customersWithoutPhone = 0;
    let installmentPayments = 0;
    
    // Buscar clientes
    const customersResponse = await makeRequest(`${ASAAS_URL}/customers?limit=100`);
    if (customersResponse.status === 200) {
      asaasCustomers = customersResponse.data.totalCount || customersResponse.data.data.length;
    }
    
    // Buscar cobranças
    const paymentsResponse = await makeRequest(`${ASAAS_URL}/payments?dateCreated[ge]=2024-09-01&limit=100`);
    if (paymentsResponse.status === 200) {
      const payments = paymentsResponse.data.data || [];
      asaasPayments = payments.length;
      
      for (const payment of payments) {
        const parsed = parseDescription(payment.description);
        if (parsed && parsed.eventName === 'UAIZOUK') {
          uaizoukPayments++;
          if (parsed.isInstallment) {
            installmentPayments++;
          }
        }
      }
    }
    
    console.log(`   - Total de clientes ASAAS: ${asaasCustomers}`);
    console.log(`   - Cobranças desde set/2024: ${asaasPayments}`);
    console.log(`   - Cobranças UAIZOUK: ${uaizoukPayments}`);
    console.log(`   - Cobranças parceladas: ${installmentPayments}`);
    
    // 4. Análise de inconsistências
    console.log('\n⚠️ ANÁLISE DE INCONSISTÊNCIAS:');
    
    const inconsistencies = [];
    
    // Buscar registros locais para verificar no ASAAS
    const localRegistrations = await client`
      SELECT id, cpf, full_name, email, whatsapp, payment_status, total, created_at
      FROM event_registrations 
      WHERE created_at >= '2024-09-01'
      ORDER BY created_at DESC
      LIMIT 20
    `;
    
    console.log(`   - Verificando ${localRegistrations.length} registros locais...`);
    
    for (const registration of localRegistrations) {
      try {
        // Buscar cliente no ASAAS por CPF
        const customerResponse = await makeRequest(`${ASAAS_URL}/customers?cpfCnpj=${registration.cpf}`);
        
        if (customerResponse.status === 200 && customerResponse.data.data.length > 0) {
          const asaasCustomer = customerResponse.data.data[0];
          
          // Verificar inconsistências
          const issues = [];
          
          // Telefone
          const normalizedAsaasPhone = normalizePhone(asaasCustomer.phone);
          if (asaasCustomer.phone && registration.whatsapp !== normalizedAsaasPhone) {
            issues.push(`Telefone: local=${registration.whatsapp}, asaas=${asaasCustomer.phone} (normalizado: ${normalizedAsaasPhone})`);
          }
          
          // Nome
          if (asaasCustomer.name !== registration.full_name) {
            issues.push(`Nome: local="${registration.full_name}", asaas="${asaasCustomer.name}"`);
          }
          
          // Email
          if (asaasCustomer.email !== registration.email) {
            issues.push(`Email: local="${registration.email}", asaas="${asaasCustomer.email}"`);
          }
          
          if (issues.length > 0) {
            inconsistencies.push({
              id: registration.id,
              name: registration.full_name,
              cpf: registration.cpf,
              issues: issues
            });
          }
          
          // Buscar cobranças do cliente
          const paymentsResponse = await makeRequest(`${ASAAS_URL}/payments?customer=${asaasCustomer.id}&limit=10`);
          if (paymentsResponse.status === 200) {
            const payments = paymentsResponse.data.data || [];
            const uaizoukPayments = payments.filter(p => {
              const parsed = parseDescription(p.description);
              return parsed && parsed.eventName === 'UAIZOUK';
            });
            
            if (uaizoukPayments.length > 0) {
              const totalPaid = uaizoukPayments
                .filter(p => p.status === 'RECEIVED')
                .reduce((sum, p) => sum + p.value, 0);
              
              const totalValue = uaizoukPayments.reduce((sum, p) => sum + p.value, 0);
              
              let calculatedStatus = 'pending';
              if (totalPaid >= totalValue) {
                calculatedStatus = 'received';
              } else if (totalPaid > 0) {
                calculatedStatus = 'partial';
              }
              
              if (calculatedStatus !== registration.payment_status) {
                issues.push(`Status: local=${registration.payment_status}, calculado=${calculatedStatus} (pago: R$ ${totalPaid.toFixed(2)}/${totalValue.toFixed(2)})`);
              }
            }
          }
          
        } else {
          inconsistencies.push({
            id: registration.id,
            name: registration.full_name,
            cpf: registration.cpf,
            issues: ['Cliente não encontrado no ASAAS']
          });
        }
        
        // Evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.log(`   ❌ Erro ao verificar ${registration.full_name}: ${error.message}`);
      }
    }
    
    console.log(`   - Inconsistências encontradas: ${inconsistencies.length}`);
    
    if (inconsistencies.length > 0) {
      console.log('\n📋 DETALHES DAS INCONSISTÊNCIAS:');
      inconsistencies.forEach((inc, index) => {
        console.log(`\n${index + 1}. ${inc.name} (CPF: ${inc.cpf})`);
        inc.issues.forEach(issue => {
          console.log(`   - ${issue}`);
        });
      });
    }
    
    // 5. Resumo e recomendações
    console.log('\n📋 RESUMO E RECOMENDAÇÕES:');
    console.log('============================');
    
    const problems = [];
    
    if (stats.default_phone > 0) {
      problems.push(`- ${stats.default_phone} registros com telefone padrão (11999999999)`);
    }
    
    if (stats.has_asaas_id < stats.recent) {
      problems.push(`- ${stats.recent - stats.has_asaas_id} registros sem ID ASAAS`);
    }
    
    if (inconsistencies.length > 0) {
      problems.push(`- ${inconsistencies.length} registros com inconsistências de dados`);
    }
    
    if (problems.length > 0) {
      console.log('\n🚨 PROBLEMAS IDENTIFICADOS:');
      problems.forEach(problem => console.log(problem));
    } else {
      console.log('\n✅ Nenhum problema crítico identificado!');
    }
    
    console.log('\n🔧 PRÓXIMOS PASSOS RECOMENDADOS:');
    console.log('1. Implementar sistema de normalização de telefones');
    console.log('2. Criar algoritmo de matching inteligente');
    console.log('3. Implementar cálculo correto de status de pagamento');
    console.log('4. Desenvolver sistema de sincronização robusto');
    console.log('5. Criar sistema de monitoramento contínuo');
    
  } catch (error) {
    console.error('❌ Erro durante análise:', error.message);
  } finally {
    console.log('\n✅ Análise finalizada');
  }
}

// Executar análise
analyzeCurrentState();