import { SITE_URL } from '../../components/SEO';

/**
 * WebPage + Service mainEntity (ServicePage-style discovery for hire landings).
 */
export function buildServicePageStructuredData(opts: {
  pageName: string;
  pageDescription: string;
  path: string;
  serviceName: string;
  serviceDescription: string;
  areaServed?: string;
}): Record<string, unknown> {
  const base = SITE_URL.replace(/\/$/, '');
  const url = `${base}${opts.path.startsWith('/') ? opts.path : `/${opts.path}`}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'ServicePage',
    name: opts.pageName,
    description: opts.pageDescription,
    url,
    mainEntity: {
      '@type': 'Service',
      name: opts.serviceName,
      description: opts.serviceDescription,
      provider: {
        '@type': 'Organization',
        name: 'Spice Krewe',
        url: base,
      },
      areaServed: opts.areaServed ?? 'US',
    },
  };
}
