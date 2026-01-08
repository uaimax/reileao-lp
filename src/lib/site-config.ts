/**
 * Configuração centralizada do site
 *
 * Este arquivo centraliza todas as configurações relacionadas ao nome do site,
 * permitindo fácil administração através de variáveis de ambiente.
 */

/**
 * Nome do site - obtido da variável de ambiente VITE_SITE_NAME
 * Fallback para 'UAIZOUK' se a variável não estiver definida
 */
export const SITE_NAME = import.meta.env.VITE_SITE_NAME || 'UAIZOUK';

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
