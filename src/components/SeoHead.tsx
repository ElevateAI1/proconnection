
import { Helmet } from 'react-helmet-async';
import { SeoConfig, generateStructuredData } from '@/utils/seoConfig';

interface SeoHeadProps {
  config: SeoConfig;
  canonical?: string;
}

export const SeoHead = ({ config, canonical }: SeoHeadProps) => {
  const currentUrl = canonical || window.location.href;
  const structuredData = generateStructuredData();

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{config.title}</title>
      <meta name="description" content={config.description} />
      <meta name="keywords" content={config.keywords} />
      <link rel="canonical" href={currentUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={config.type || 'website'} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={config.title} />
      <meta property="og:description" content={config.description} />
      <meta property="og:image" content={config.image || `${window.location.origin}/lovable-uploads/befe2e15-db81-4d89-805b-b994227673d5.png`} />
      <meta property="og:locale" content="es_ES" />
      <meta property="og:site_name" content="ProConnection" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={currentUrl} />
      <meta property="twitter:title" content={config.title} />
      <meta property="twitter:description" content={config.description} />
      <meta property="twitter:image" content={config.image || `${window.location.origin}/lovable-uploads/befe2e15-db81-4d89-805b-b994227673d5.png`} />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="Spanish" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="ProConnection" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};
