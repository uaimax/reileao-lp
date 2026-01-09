#!/usr/bin/env node

/**
 * Configuração centralizada para scripts
 *
 * Todos os scripts devem usar este arquivo para obter:
 * - Connection string do banco de dados
 * - Chaves de API
 * - Nome do evento/site
 *
 * IMPORTANTE: NÃO hardcode credenciais nos scripts!
 * Use sempre: const { getConfig } = require('./config.cjs');
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
// Fallback para _save_env se .env não existir
if (!process.env.DATABASE_URL) {
  require('dotenv').config({ path: require('path').resolve(__dirname, '../_save_env') });
}

/**
 * Obtém a configuração do ambiente
 */
function getConfig() {
  const config = {
    // Database
    databaseUrl: process.env.DATABASE_URL,

    // Site/Event name
    siteName: process.env.SITE_NAME || process.env.VITE_SITE_NAME || 'Meu Evento',

    // ASAAS
    asaasApiKey: process.env.ASAAS_API_KEY_PRODUCTION || process.env.ASAAS_API_KEY_SANDBOX,
    asaasSandbox: process.env.ASAAS_SANDBOX === 'true',
    asaasUrl: process.env.ASAAS_SANDBOX === 'true'
      ? 'https://sandbox.asaas.com/api/v3'
      : 'https://api.asaas.com/v3',
  };

  // Validação
  if (!config.databaseUrl) {
    console.error('❌ DATABASE_URL não configurada!');
    console.error('   Configure no arquivo .env ou _save_env');
    process.exit(1);
  }

  return config;
}

/**
 * Cria cliente postgres usando a configuração
 */
function createDbClient() {
  const config = getConfig();
  const postgres = require('postgres');
  return postgres(config.databaseUrl);
}

/**
 * Verifica se um pagamento é do evento atual
 * @param {string} description - Descrição do pagamento
 * @returns {boolean}
 */
function isEventPayment(description) {
  if (!description) return false;
  const siteName = getConfig().siteName;
  // Busca pelo nome do site na descrição (case insensitive)
  const regex = new RegExp(siteName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  return regex.test(description);
}

/**
 * Parse de descrição de pagamento
 * @param {string} description - Descrição do pagamento
 * @returns {object}
 */
function parsePaymentDescription(description) {
  const siteName = getConfig().siteName;
  const result = {
    description,
    eventName: null,
    ticketType: null,
    installment: null,
    totalInstallments: null
  };

  if (!description) return result;

  // Verificar se é pagamento do evento
  if (isEventPayment(description)) {
    result.eventName = siteName;
  }

  // Detectar tipo de ingresso
  if (/PASS COMPLETO|FULL PASS/i.test(description)) {
    result.ticketType = 'PASS COMPLETO';
  } else if (/PARTY PASS/i.test(description)) {
    result.ticketType = 'PARTY PASS';
  }

  // Detectar parcela
  const installmentMatch = description.match(/(?:parcela|parc\.?)\s*(\d+)\s*(?:de|\/)\s*(\d+)/i);
  if (installmentMatch) {
    result.installment = parseInt(installmentMatch[1]);
    result.totalInstallments = parseInt(installmentMatch[2]);
  }

  return result;
}

module.exports = {
  getConfig,
  createDbClient,
  isEventPayment,
  parsePaymentDescription
};


