#!/usr/bin/env node

/**
 * Script de Migração Automatizada
 *
 * Este script atualiza todos os scripts para usar a configuração centralizada.
 * Ele substitui:
 * - Connection strings hardcoded por createDbClient()
 * - API keys hardcoded por getConfig().asaasApiKey
 * - Textos 'UAIZOUK' por SITE_NAME dinâmico
 */

const fs = require('fs');
const path = require('path');

const scriptsDir = __dirname;

// Padrões a substituir
const replacements = [
  // Connection strings - Neon
  {
    pattern: /const connectionString = 'postgresql:\/\/uaizouklp_owner:[^']+';/g,
    replacement: "// Usando configuração centralizada - ver config.cjs"
  },
  {
    pattern: /const client = postgres\(connectionString\);/g,
    replacement: "const client = createDbClient();"
  },
  // API Keys ASAAS
  {
    pattern: /const API_KEY = '\$aact_[^']+';/g,
    replacement: "// Usando configuração centralizada - ver config.cjs"
  },
  {
    pattern: /const ASAAS_URL = 'https:\/\/(api|sandbox)\.asaas\.com\/v3';/g,
    replacement: "// Usando configuração centralizada - ver config.cjs"
  },
  // UAIZOUK -> dinâmico
  {
    pattern: /'UAIZOUK'/g,
    replacement: "SITE_NAME"
  },
  {
    pattern: /eventName === 'UAIZOUK'/g,
    replacement: "eventName === SITE_NAME"
  },
  {
    pattern: /eventName: 'UAIZOUK'/g,
    replacement: "eventName: SITE_NAME"
  },
  {
    pattern: /\/UAIZOUK\|Uaizouk\/i\.test/g,
    replacement: "isEventPayment"
  },
  // Console logs com UAIZOUK
  {
    pattern: /console\.log\('([^']*?)UAIZOUK([^']*?)'\)/g,
    replacement: (match, before, after) => `console.log(\`${before}\${SITE_NAME}${after}\`)`
  },
  {
    pattern: /console\.log\(`([^`]*?)UAIZOUK([^`]*?)`\)/g,
    replacement: (match, before, after) => `console.log(\`${before}\${SITE_NAME}${after}\`)`
  },
  // Variáveis com uaizouk no nome
  {
    pattern: /uaizoukPayments/g,
    replacement: "eventPayments"
  },
  {
    pattern: /uaizoukCustomerPayments/g,
    replacement: "eventCustomerPayments"
  },
  {
    pattern: /customersWithUaizouk/g,
    replacement: "customersWithEvent"
  },
  {
    pattern: /ourUaizoukRegistrations/g,
    replacement: "ourEventRegistrations"
  },
];

// Arquivos a atualizar
const filesToUpdate = [
  'asaas-sync/monitor-asaas-sync.cjs',
  'asaas-sync/fix-payment-status-and-filter.cjs',
  'asaas-sync/sync-asaas-final.cjs',
  'asaas-sync/investigate-asaas-data.cjs',
  'asaas-sync/analyze-sync-data.cjs',
  'asaas-sync/analyze-asaas-data.cjs',
  'asaas-sync/fix-phone-status.cjs',
  'asaas-sync/fix-payment-logic-real.cjs',
  'asaas-sync/investigate-payment-logic.cjs',
  'asaas-sync/sync-asaas-data.cjs',
  'asaas-sync/fix-phone-numbers.cjs',
  'asaas-sync/fix-phone-numbers-correct.cjs',
  'asaas-sync/check-phone-numbers.cjs',
  'asaas-sync/sync-asaas-robust.cjs',
  'asaas-sync/analyze-current-state.cjs',
  'asaas-sync/sync-asaas-improved.cjs',
  'asaas-sync/fix-payment-status.cjs',
];

// Import header para adicionar
const importHeader = `const { getConfig, createDbClient, isEventPayment, parsePaymentDescription } = require('../config.cjs');

// Carregar configuração
const config = getConfig();
const ASAAS_URL = config.asaasUrl;
const API_KEY = config.asaasApiKey;
const SITE_NAME = config.siteName;

`;

function updateFile(filePath) {
  const fullPath = path.join(scriptsDir, filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️ Arquivo não encontrado: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;

  // Verificar se já foi migrado
  if (content.includes("require('../config.cjs')")) {
    console.log(`✅ Já migrado: ${filePath}`);
    return;
  }

  // Adicionar imports após shebang
  if (content.startsWith('#!/usr/bin/node') || content.startsWith('#!/usr/bin/env node')) {
    const lines = content.split('\n');
    const shebangIndex = 0;

    // Encontrar posição após imports existentes
    let insertIndex = 1;
    while (insertIndex < lines.length && (
      lines[insertIndex].startsWith('//') ||
      lines[insertIndex].trim() === '' ||
      lines[insertIndex].startsWith('const ') ||
      lines[insertIndex].startsWith('require(')
    )) {
      insertIndex++;
    }

    // Remover requires de postgres antigos
    content = content.replace(/const postgres = require\('postgres'\);\n?/g, '');
    content = content.replace(/const https = require\('https'\);\n?/g, 'const https = require(\'https\');\n');

    // Adicionar novos imports
    content = content.replace(
      /(#!\/usr\/bin\/(?:env )?node\n)(?:\/\/[^\n]*\n)*/,
      (match) => match + '\n' + importHeader
    );

    modified = true;
  }

  // Aplicar substituições
  for (const { pattern, replacement } of replacements) {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Atualizado: ${filePath}`);
  } else {
    console.log(`⏭️ Sem alterações: ${filePath}`);
  }
}

console.log('🚀 Iniciando migração de scripts...\n');

for (const file of filesToUpdate) {
  updateFile(file);
}

console.log('\n✅ Migração concluída!');
console.log('\n📝 Próximos passos:');
console.log('1. Verifique os arquivos atualizados');
console.log('2. Execute os scripts para testar');
console.log('3. Configure as variáveis de ambiente necessárias');


