import { Helmet } from 'react-helmet-async';

const DEFAULT_TITLE = 'Spice Krewe – Community, Culture & Spice';
const DEFAULT_DESCRIPTION =
  'Spice Krewe is a community organization in Memphis, TN bringing people together through events, culture, and shared experiences. Visit us for spices, events, and community.';
const DEFAULT_IMAGE = 'https://redsurfer1.github.io/spicekrewe/og-image.png';
const SITE_URL = 'https://redsurfer1.github.io/spicekrewe';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  /** Path (e.g. /events). Resolved against SITE_URL for og:url */
  path?: string;
}

export default function SEO({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  path = '',
}: SEOProps) {
  const url = path ? `${SITE_URL.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}` : SITE_URL;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
