/**
 * Configuração centralizada do site
 *
 * Este arquivo centraliza todas as configurações relacionadas ao site,
 * permitindo fácil administração através de variáveis de ambiente.
 *
 * IMPORTANTE: Todas as referências ao nome do evento/site devem usar estas
 * configurações. NÃO hardcode "uaizouk" ou similar em nenhum lugar do código.
 */

// ============================================================================
// CONFIGURAÇÕES BÁSICAS DO SITE
// ============================================================================

/**
 * Nome do site - obtido da variável de ambiente VITE_SITE_NAME
 * Usado em títulos, textos e mensagens
 */
export const SITE_NAME = import.meta.env.VITE_SITE_NAME || 'Meu Evento';

/**
 * URL base do site (sem trailing slash)
 * Usado para links de inscrição, compartilhamento, etc.
 */
export const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://meuevento.com.br';

/**
 * Slug do site para uso em storage keys, etc.
 */
export const SITE_SLUG = import.meta.env.VITE_SITE_SLUG || SITE_NAME.toLowerCase().replace(/\s+/g, '-');

// ============================================================================
// CONFIGURAÇÕES DE CONTATO
// ============================================================================

/**
 * Email de contato geral
 */
export const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || `contato@${new URL(SITE_URL).hostname}`;

/**
 * Email para PIX (pode ser diferente do email de contato)
 */
export const PIX_EMAIL = import.meta.env.VITE_PIX_EMAIL || CONTACT_EMAIL;

// ============================================================================
// REDES SOCIAIS
// ============================================================================

/**
 * URL do Instagram (perfil completo)
 */
export const INSTAGRAM_URL = import.meta.env.VITE_INSTAGRAM_URL || '';

/**
 * Handle do Twitter/X (sem @)
 */
export const TWITTER_HANDLE = import.meta.env.VITE_TWITTER_HANDLE || '';

/**
 * URL do grupo do WhatsApp
 */
export const WHATSAPP_GROUP_URL = import.meta.env.VITE_WHATSAPP_GROUP_URL || '';

// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================

/**
 * Nome do site com ano (formato padrão: "NOME 2025")
 */
export const getSiteNameWithYear = (year: string | number = '2025'): string => {
  return `${SITE_NAME} ${year}`;
};

/**
 * Texto padrão de copyright
 */
export const getCopyrightText = (year: string | number = '2025'): string => {
  return `© ${year} ${SITE_NAME}. Todos os direitos reservados.`;
};

/**
 * Mensagem padrão do WhatsApp
 */
export const getWhatsAppMessage = (): string => {
  return `Oi! Quero mais informações sobre o ${SITE_NAME}`;
};

/**
 * Título padrão para seções
 */
export const getSectionTitle = (prefix: string = 'Entenda o'): string => {
  return `${prefix} ${SITE_NAME}`;
};

/**
 * URL de inscrição padrão
 */
export const getRegistrationUrl = (): string => {
  return `${SITE_URL}/inscricoes`;
};

/**
 * Storage key para localStorage/sessionStorage
 */
export const getStorageKey = (key: string): string => {
  return `${SITE_SLUG}-${key}`;
};

/**
 * Gera URL para download de arquivo com nome do site
 */
export const getDownloadFilename = (prefix: string, extension: string = 'json'): string => {
  const date = new Date().toISOString().split('T')[0];
  return `${SITE_SLUG}-${prefix}-${date}.${extension}`;
};
