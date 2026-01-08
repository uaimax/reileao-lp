import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
}

export const SEOHead = ({
  title,
  description,
  image,
  url,
  type = 'website',
  siteName = 'UAIZOUK'
}: SEOHeadProps) => {
  // Fallbacks dinâmicos baseados no evento
  const defaultTitle = title || 'UAIZOUK - Congresso de Zouk Brasileiro';
  const defaultDescription = description || 'Uma imersão completa nas possibilidades do Zouk Brasileiro em Uberlândia, MG.';
  const defaultImage = image || '/og-image-default.jpg';
  const currentUrl = url || window.location.href;

  useEffect(() => {
    // Atualizar título da página
    document.title = defaultTitle;
  }, [defaultTitle]);

  return (
    <Helmet>
      {/* Meta tags básicas */}
      <title>{defaultTitle}</title>
      <meta name="description" content={defaultDescription} />
      <meta name="author" content="UAIZOUK" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={defaultTitle} />
      <meta property="og:description" content={defaultDescription} />
      <meta property="og:image" content={defaultImage} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@uaizouk" />
      <meta name="twitter:title" content={defaultTitle} />
      <meta name="twitter:description" content={defaultDescription} />
      <meta name="twitter:image" content={defaultImage} />

      {/* Meta tags adicionais */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="pt-BR" />
      <meta name="revisit-after" content="7 days" />

      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />
    </Helmet>
  );
};

export default SEOHead;


