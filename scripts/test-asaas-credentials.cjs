#!/usr/bin/env node

/**
 * Script de Teste de Credenciais ASAAS
 *
 * Testa as credenciais do ASAAS configuradas no .env
 * Faz uma requisição simples para verificar se a autenticação está funcionando
 */

const https = require('https');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
// Fallback para _save_env se .env não existir
if (!process.env.DATABASE_URL) {
  require('dotenv').config({ path: require('path').resolve(__dirname, '../_save_env') });
}

// Função para fazer requisição HTTPS
function makeRequest(url, apiKey) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Timeout da requisição (10s)'));
    }, 10000);

    const urlObj = new URL(url);

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'access_token': apiKey,
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        clearTimeout(timeout);
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data || null,
            parseError: error.message
          });
        }
      });
    });

    req.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Função para testar credenciais
async function testCredentials(environment, apiKey, baseUrl) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 TESTANDO: ${environment.toUpperCase()}`);
  console.log(`${'='.repeat(60)}`);

  if (!apiKey) {
    console.log(`❌ API Key não configurada para ${environment}`);
    console.log(`   Variável esperada: ${environment === 'PRODUÇÃO' ? 'ASAAS_API_KEY_PRODUCTION' : 'ASAAS_API_KEY_SANDBOX'}`);
    return false;
  }

  // Mostrar informações (sem expor a chave completa)
  const keyPreview = apiKey.length > 20
    ? `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}`
    : apiKey;
  console.log(`🔑 API Key: ${keyPreview}`);
  console.log(`🌐 Base URL: ${baseUrl}`);

  // Teste 1: Listar clientes (endpoint simples)
  console.log(`\n📋 Teste 1: Listar clientes (GET /customers?limit=1)`);
  try {
    const testUrl = `${baseUrl}/customers?limit=1`;
    console.log(`   URL: ${testUrl}`);

    const response = await makeRequest(testUrl, apiKey);

    console.log(`   Status: ${response.statusCode}`);

    if (response.statusCode === 200) {
      console.log(`   ✅ SUCESSO! Credenciais válidas`);
      if (response.data && response.data.data) {
        console.log(`   📊 Total de clientes: ${response.data.totalCount || response.data.data.length || 'N/A'}`);
      }
      return true;
    } else if (response.statusCode === 401) {
      console.log(`   ❌ ERRO 401: Não autorizado`);
      console.log(`   💡 Possíveis causas:`);
      console.log(`      - API Key incorreta ou expirada`);
      console.log(`      - API Key não tem permissões necessárias`);
      console.log(`      - Ambiente incorreto (sandbox vs produção)`);
      if (response.data) {
        console.log(`   📄 Resposta: ${JSON.stringify(response.data, null, 2)}`);
      }
      return false;
    } else {
      console.log(`   ⚠️  Status inesperado: ${response.statusCode}`);
      if (response.data) {
        console.log(`   📄 Resposta: ${JSON.stringify(response.data, null, 2)}`);
      }
      return false;
    }
  } catch (error) {
    console.log(`   ❌ ERRO na requisição: ${error.message}`);
    if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.log(`   💡 Problema de DNS/conectividade`);
    }
    return false;
  }
}

// Função principal
async function main() {
  console.log('🚀 TESTE DE CREDENCIAIS ASAAS');
  console.log('='.repeat(60));

  // Verificar variáveis de ambiente
  const isSandbox = process.env.ASAAS_SANDBOX === 'true';
  const productionKey = process.env.ASAAS_API_KEY_PRODUCTION;
  const sandboxKey = process.env.ASAAS_API_KEY_SANDBOX;

  console.log(`\n📝 Configuração do Ambiente:`);
  console.log(`   ASAAS_SANDBOX: ${isSandbox ? 'true (SANDBOX)' : 'false (PRODUÇÃO)'}`);
  console.log(`   ASAAS_API_KEY_PRODUCTION: ${productionKey ? '✅ Configurada' : '❌ Não configurada'}`);
  console.log(`   ASAAS_API_KEY_SANDBOX: ${sandboxKey ? '✅ Configurada' : '❌ Não configurada'}`);

  // URLs
  const productionUrl = 'https://api.asaas.com/v3';
  const sandboxUrl = 'https://sandbox.asaas.com/api/v3';

  const results = {
    production: false,
    sandbox: false
  };

  // Testar produção
  if (productionKey) {
    results.production = await testCredentials('PRODUÇÃO', productionKey, productionUrl);
  }

  // Testar sandbox
  if (sandboxKey) {
    results.sandbox = await testCredentials('SANDBOX', sandboxKey, sandboxUrl);
  }

  // Resumo final
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 RESUMO DOS TESTES`);
  console.log(`${'='.repeat(60)}`);

  if (productionKey) {
    console.log(`   PRODUÇÃO: ${results.production ? '✅ OK' : '❌ FALHOU'}`);
  } else {
    console.log(`   PRODUÇÃO: ⏭️  Não testado (chave não configurada)`);
  }

  if (sandboxKey) {
    console.log(`   SANDBOX: ${results.sandbox ? '✅ OK' : '❌ FALHOU'}`);
  } else {
    console.log(`   SANDBOX: ⏭️  Não testado (chave não configurada)`);
  }

  // Ambiente ativo
  console.log(`\n🎯 Ambiente Ativo: ${isSandbox ? 'SANDBOX' : 'PRODUÇÃO'}`);
  const activeResult = isSandbox ? results.sandbox : results.production;
  console.log(`   Status: ${activeResult ? '✅ OK' : '❌ FALHOU'}`);

  if (!activeResult) {
    console.log(`\n⚠️  ATENÇÃO: O ambiente ativo está com credenciais inválidas!`);
    console.log(`   Isso pode causar erros 401 em produção.`);
  }

  console.log(`\n${'='.repeat(60)}\n`);
}

// Executar
main().catch(error => {
  console.error('\n❌ Erro fatal:', error);
  process.exit(1);
});


