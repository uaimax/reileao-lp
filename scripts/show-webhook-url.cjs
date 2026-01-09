#!/usr/bin/env node

/**
 * Script para mostrar a URL do Webhook ASAAS
 *
 * Mostra a URL completa que deve ser configurada no painel do ASAAS
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
// Fallback para _save_env se .env não existir
if (!process.env.DATABASE_URL) {
  require('dotenv').config({ path: require('path').resolve(__dirname, '../_save_env') });
}

console.log('\n🔗 URL DO WEBHOOK ASAAS');
console.log('='.repeat(60));

// Tentar descobrir o domínio de produção
const siteUrl = process.env.SITE_URL || process.env.VITE_SITE_URL;
const nodeEnv = process.env.NODE_ENV || 'development';

let webhookUrl = null;

if (siteUrl) {
  // Remove trailing slash se houver
  const baseUrl = siteUrl.replace(/\/$/, '');
  webhookUrl = `${baseUrl}/api/webhooks/asaas`;
  console.log(`\n✅ URL encontrada nas variáveis de ambiente:`);
  console.log(`   ${webhookUrl}`);
} else {
  console.log(`\n⚠️  Variável SITE_URL ou VITE_SITE_URL não configurada`);
  console.log(`\n📝 Para configurar, adicione no .env:`);
  console.log(`   SITE_URL=https://seu-dominio.com`);
  console.log(`   ou`);
  console.log(`   VITE_SITE_URL=https://seu-dominio.com`);
}

console.log(`\n📋 Informações:`);
console.log(`   Ambiente: ${nodeEnv}`);
console.log(`   Endpoint: POST /api/webhooks/asaas`);
console.log(`   SITE_URL: ${process.env.SITE_URL || '❌ Não configurado'}`);
console.log(`   VITE_SITE_URL: ${process.env.VITE_SITE_URL || '❌ Não configurado'}`);

if (!webhookUrl) {
  console.log(`\n💡 URL do Webhook (você precisa substituir pelo seu domínio):`);
  console.log(`   https://SEU-DOMINIO.com/api/webhooks/asaas`);
  console.log(`\n   Exemplos:`);
  console.log(`   - https://uaizouk.com/api/webhooks/asaas`);
  console.log(`   - https://reileao.com/api/webhooks/asaas`);
  console.log(`   - https://seu-evento.com.br/api/webhooks/asaas`);
}

console.log(`\n📱 Como configurar no ASAAS:`);
console.log(`   1. Acesse o painel do ASAAS`);
console.log(`   2. Vá em Configurações > Webhooks`);
console.log(`   3. Clique em "Criar Webhook" ou "Adicionar"`);
console.log(`   4. Cole a URL: ${webhookUrl || 'https://SEU-DOMINIO.com/api/webhooks/asaas'}`);
console.log(`   5. Selecione os eventos que deseja receber:`);
console.log(`      - PAYMENT_CREATED`);
console.log(`      - PAYMENT_RECEIVED`);
console.log(`      - PAYMENT_CONFIRMED`);
console.log(`      - PAYMENT_OVERDUE`);
console.log(`      - PAYMENT_REFUNDED`);
console.log(`      - PAYMENT_PARTIALLY_REFUNDED`);
console.log(`      - PAYMENT_CHARGEBACK_REQUESTED`);
console.log(`      - PAYMENT_CHARGEBACK_DISPUTE`);
console.log(`      - PAYMENT_AWAITING_CHARGEBACK_REVERSAL`);

console.log(`\n🧪 Para testar localmente (desenvolvimento):`);
console.log(`   1. Instale o ngrok: npm install -g ngrok`);
console.log(`   2. Execute: ngrok http 3002`);
console.log(`   3. Use a URL do ngrok: https://seu-ngrok.ngrok.io/api/webhooks/asaas`);

console.log(`\n✅ Eventos suportados pelo sistema:`);
const events = [
  'PAYMENT_CREATED',
  'PAYMENT_RECEIVED',
  'PAYMENT_CONFIRMED',
  'PAYMENT_OVERDUE',
  'PAYMENT_REFUNDED',
  'PAYMENT_PARTIALLY_REFUNDED',
  'PAYMENT_CHARGEBACK_REQUESTED',
  'PAYMENT_CHARGEBACK_DISPUTE',
  'PAYMENT_AWAITING_CHARGEBACK_REVERSAL',
  'PAYMENT_ANTICIPATED',
  'PAYMENT_DELETED',
  'PAYMENT_RESTORED',
  'PAYMENT_UPDATED',
  'PAYMENT_AUTHORIZED',
  'PAYMENT_APPROVED_BY_RISK_ANALYSIS',
  'PAYMENT_REPROVED_BY_RISK_ANALYSIS',
  'PAYMENT_AWAITING_RISK_ANALYSIS'
];
events.forEach(event => {
  console.log(`   - ${event}`);
});

console.log(`\n${'='.repeat(60)}\n`);


