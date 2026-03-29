import { Helmet } from 'react-helmet-async';

const DEFAULT_TITLE = 'Spice Krewe – Hire Vetted Culinary Professionals';
const DEFAULT_DESCRIPTION =
  'Access on-demand culinary R&D and vetted professionals for food brands and restaurant groups.';
const DEFAULT_IMAGE = 'https://spicekrewe.com/og-image.png';
export const SITE_URL = 'https://spicekrewe.com';

interface SEOProps {
  title?: string;
  description?: string;
  /** Open Graph / Twitter card title (defaults to page title). */
  ogTitle?: string;
  /** Open Graph / Twitter card description. */
  ogDescription?: string;
  image?: string;
  /** Path (e.g. /events). Resolved against SITE_URL for og:url */
  path?: string;
  /** Injected as <script type="application/ld+json"> (e.g. ProfessionalService). */
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
}

export default function SEO({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  ogTitle = DEFAULT_TITLE,
  ogDescription = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  path = '',
  structuredData,
}: SEOProps) {
  const url = path ? `${SITE_URL.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}` : SITE_URL;

  const jsonLd =
    structuredData === undefined
      ? null
      : Array.isArray(structuredData)
        ? { '@context': 'https://schema.org', '@graph': structuredData }
        : structuredData;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle} />
      <meta name="twitter:description" content={ogDescription} />
      <meta name="twitter:image" content={image} />
      {jsonLd ? (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      ) : null}
    </Helmet>
  );
}
