#!/usr/bin/env node

// Script de Análise Segura do Estado Atual
// Versão otimizada que não trava o terminal

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
    }, 10000); // 10 segundos de timeout

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

    req.setTimeout(10000, () => {
      clearTimeout(timeout);
      req.destroy();
      reject(new Error('Timeout da requisição'));
    });

    req.end();
  });
}

async function analyzeCurrentStateSafe() {
  console.log('🔍 ANÁLISE SEGURA DO ESTADO ATUAL');
  console.log('==================================');
  
  try {
    // 1. Análise da base local (sem API)
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
    console.log(`   ✅ Total de registros: ${stats.total}`);
    console.log(`   ✅ Registros recentes (set/2024+): ${stats.recent}`);
    console.log(`   ✅ Pagos: ${stats.paid}`);
    console.log(`   ✅ Pendentes: ${stats.pending}`);
    console.log(`   ✅ Parciais: ${stats.partial}`);
    console.log(`   ⚠️  Telefones padrão (11999999999): ${stats.default_phone}`);
    console.log(`   ⚠️  Com ID ASAAS: ${stats.has_asaas_id}`);
    console.log(`   ✅ Receita média: R$ ${parseFloat(stats.avg_total).toFixed(2)}`);
    console.log(`   ✅ Receita total: R$ ${parseFloat(stats.total_revenue).toFixed(2)}`);
    
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
      const isDefault = phone.whatsapp === '11999999999';
      const icon = isDefault ? '❌' : '✅';
      console.log(`     ${icon} ${phone.whatsapp}: ${phone.count} registros`);
    });
    
    // 3. Análise de status de pagamento
    console.log('\n💳 ANÁLISE DE STATUS DE PAGAMENTO:');
    
    const statusAnalysis = await client`
      SELECT 
        payment_status,
        COUNT(*) as count,
        AVG(total) as avg_total,
        SUM(total) as total_value
      FROM event_registrations 
      WHERE created_at >= '2024-09-01'
      GROUP BY payment_status
      ORDER BY count DESC
    `;
    
    statusAnalysis.forEach(status => {
      console.log(`   - ${status.payment_status}: ${status.count} registros (R$ ${parseFloat(status.total_value).toFixed(2)})`);
    });
    
    // 4. Análise de parcelas
    console.log('\n📅 ANÁLISE DE PARCELAS:');
    
    const installmentAnalysis = await client`
      SELECT 
        installments,
        COUNT(*) as count,
        AVG(total) as avg_total
      FROM event_registrations 
      WHERE created_at >= '2024-09-01'
      GROUP BY installments
      ORDER BY installments
    `;
    
    installmentAnalysis.forEach(installment => {
      console.log(`   - ${installment.installments} parcelas: ${installment.count} registros (R$ ${parseFloat(installment.avg_total).toFixed(2)} médio)`);
    });
    
    // 5. Teste de conexão com ASAAS (apenas uma requisição)
    console.log('\n🌐 TESTE DE CONEXÃO COM ASAAS:');
    
    try {
      console.log('   - Testando conexão...');
      const testResponse = await makeRequest(`${ASAAS_URL}/customers?limit=1`);
      
      if (testResponse.status === 200) {
        console.log('   ✅ Conexão com ASAAS OK');
        console.log(`   - Total de clientes: ${testResponse.data.totalCount || 'N/A'}`);
      } else {
        console.log(`   ❌ Erro na conexão: ${testResponse.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Erro ao conectar com ASAAS: ${error.message}`);
    }
    
    // 6. Resumo de problemas identificados
    console.log('\n📋 RESUMO DE PROBLEMAS IDENTIFICADOS:');
    console.log('=====================================');
    
    const problems = [];
    const recommendations = [];
    
    if (stats.default_phone > 0) {
      problems.push(`❌ ${stats.default_phone} registros com telefone padrão (11999999999)`);
      recommendations.push('🔧 Implementar normalização de telefones do ASAAS');
    }
    
    if (stats.has_asaas_id < stats.recent) {
      problems.push(`❌ ${stats.recent - stats.has_asaas_id} registros sem ID ASAAS`);
      recommendations.push('🔧 Sincronizar IDs ASAAS para todos os registros');
    }
    
    const partialCount = stats.partial || 0;
    if (partialCount > 0) {
      problems.push(`⚠️  ${partialCount} registros com status "partial" (precisa verificação)`);
      recommendations.push('🔧 Implementar cálculo correto de status baseado em parcelas');
    }
    
    if (problems.length === 0) {
      console.log('   ✅ Nenhum problema crítico identificado!');
    } else {
      problems.forEach(problem => console.log(`   ${problem}`));
    }
    
    // 7. Recomendações
    console.log('\n🔧 RECOMENDAÇÕES:');
    console.log('=================');
    
    if (recommendations.length > 0) {
      recommendations.forEach(rec => console.log(`   ${rec}`));
    }
    
    console.log('\n📝 PRÓXIMOS PASSOS:');
    console.log('1. Criar sistema de normalização de telefones');
    console.log('2. Implementar sincronização de IDs ASAAS');
    console.log('3. Desenvolver cálculo inteligente de status de pagamento');
    console.log('4. Criar sistema de monitoramento contínuo');
    console.log('5. Implementar logs detalhados de sincronização');
    
    // 8. Estatísticas finais
    console.log('\n📊 ESTATÍSTICAS FINAIS:');
    console.log('========================');
    console.log(`   - Total de registros: ${stats.total}`);
    console.log(`   - Registros UAIZOUK: ${stats.recent}`);
    console.log(`   - Taxa de telefones corretos: ${((stats.recent - stats.default_phone) / stats.recent * 100).toFixed(1)}%`);
    console.log(`   - Taxa de IDs ASAAS: ${(stats.has_asaas_id / stats.recent * 100).toFixed(1)}%`);
    console.log(`   - Receita total: R$ ${parseFloat(stats.total_revenue).toFixed(2)}`);
    
  } catch (error) {
    console.error('❌ Erro durante análise:', error.message);
    console.log('\n🔧 Soluções possíveis:');
    console.log('1. Verificar conexão com banco de dados');
    console.log('2. Verificar credenciais do ASAAS');
    console.log('3. Verificar conectividade de rede');
  } finally {
    console.log('\n✅ Análise finalizada com sucesso!');
    process.exit(0); // Garantir que o processo termine
  }
}

// Executar análise com timeout de segurança
const timeout = setTimeout(() => {
  console.log('\n⏰ Timeout de segurança atingido. Finalizando...');
  process.exit(1);
}, 30000); // 30 segundos máximo

analyzeCurrentStateSafe().finally(() => {
  clearTimeout(timeout);
});