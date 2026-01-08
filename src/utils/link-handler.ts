/**
 * Utilitário para lidar com links de forma compatível com iOS e navegadores embutidos
 */

// Detectar se está em um navegador embutido (Instagram, Facebook, etc.)
export const isEmbeddedBrowser = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isEmbedded =
    userAgent.includes('instagram') ||
    userAgent.includes('fbav') ||
    userAgent.includes('fban') ||
    userAgent.includes('fbsv') ||
    userAgent.includes('line') ||
    userAgent.includes('twitter') ||
    userAgent.includes('whatsapp') ||
    userAgent.includes('telegram') ||
    window.navigator.standalone === true; // iOS PWA mode

  return isEmbedded;
};

// Detectar se é iOS
export const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
};

// Detectar se é Safari no iOS
export const isIOSSafari = (): boolean => {
  return isIOS() && /Safari/.test(navigator.userAgent) && !/CriOS|FxiOS|OPiOS|mercury/.test(navigator.userAgent);
};

// Função robusta para abrir links
export const openLink = (url: string, linkTitle?: string): boolean => {
  try {
    // Primeiro, tenta window.open com timeout
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');

    // Verifica se a janela foi bloqueada
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      // Fallback: usar location.href
      console.warn('window.open foi bloqueado, usando fallback');
      window.location.href = url;
      return true;
    }

    // Verifica se a janela ainda existe após um pequeno delay
    setTimeout(() => {
      if (newWindow.closed) {
        console.warn('Janela foi fechada imediatamente, usando fallback');
        window.location.href = url;
      }
    }, 100);

    return true;
  } catch (error) {
    console.error('Erro ao abrir link:', error);
    // Fallback final
    window.location.href = url;
    return true;
  }
};

// Função para mostrar aviso sobre navegadores embutidos (versão simplificada)
export const showEmbeddedBrowserWarning = (url: string, linkTitle?: string): void => {
  const message = `Para uma melhor experiência, recomendamos abrir este link no seu navegador padrão.\n\nClique em "OK" para continuar ou "Cancelar" para copiar o link.`;

  if (confirm(message)) {
    openLink(url, linkTitle);
  } else {
    // Copiar link para área de transferência
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        alert('Link copiado para a área de transferência!');
      }).catch(() => {
        // Fallback para navegadores mais antigos
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Link copiado para a área de transferência!');
      });
    } else {
      alert(`Link: ${url}`);
    }
  }
};

// Função principal para lidar com cliques em links
export const handleLinkClick = async (
  url: string,
  linkTitle?: string,
  trackClick?: () => Promise<void>
): Promise<void> => {
  try {
    // Executar tracking se fornecido
    if (trackClick) {
      await trackClick();
    }

    // Verificar se está em navegador embutido
    if (isEmbeddedBrowser()) {
      showEmbeddedBrowserWarning(url, linkTitle);
      return;
    }

    // Para iOS Safari, usar abordagem mais direta
    if (isIOSSafari()) {
      // Tentar window.open primeiro
      const success = openLink(url, linkTitle);
      if (!success) {
        // Fallback para iOS
        window.location.href = url;
      }
      return;
    }

    // Para outros navegadores, usar método padrão
    openLink(url, linkTitle);

  } catch (error) {
    console.error('Erro ao processar clique no link:', error);
    // Fallback final
    window.location.href = url;
  }
};

// Função para criar um link temporário e clicá-lo (útil para iOS)
export const createAndClickLink = (url: string): void => {
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Função para detectar problemas específicos do iOS
export const detectIOSIssues = (): string[] => {
  const issues: string[] = [];

  if (isIOS()) {
    issues.push('iOS detectado');

    if (isIOSSafari()) {
      issues.push('Safari iOS - pode ter bloqueios de popup');
    }

    if (isEmbeddedBrowser()) {
      issues.push('Navegador embutido - limitações de segurança');
    }

    // Verificar se é uma versão antiga do iOS
    const iosVersion = navigator.userAgent.match(/OS (\d+)_/);
    if (iosVersion && parseInt(iosVersion[1]) < 14) {
      issues.push('iOS versão antiga - compatibilidade limitada');
    }
  }

  return issues;
};
