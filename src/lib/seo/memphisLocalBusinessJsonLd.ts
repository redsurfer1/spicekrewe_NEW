import { SITE_URL } from '../../components/SEO';
import { combineLocalBusinessWithFaq } from './cityHirePageStructuredData';

/** LocalBusiness node (for @graph composition). */
function buildMemphisLocalBusinessNode(): Record<string, unknown> {
  const base = SITE_URL.replace(/\/$/, '');
  return {
    '@type': 'LocalBusiness',
    name: 'Spice Krewe Memphis',
    description:
      'Spice Krewe is a vetted culinary talent marketplace serving Memphis, Tennessee and the Mid-South. Home of the Memphis Flavor Index. SK Verified chefs, food stylists, and recipe developers — bookable online, no retainer.',
    url: `${base}/hire/memphis`,
    slogan: 'Community · Culture · Culinary talent',
    serviceType: 'Culinary talent marketplace',
    hasMap: 'https://www.google.com/maps/place/Memphis,+TN',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Memphis',
      addressRegion: 'TN',
      addressCountry: 'US',
    },
    areaServed: [
      { '@type': 'City', name: 'Memphis' },
      { '@type': 'State', name: 'Tennessee' },
      { '@type': 'City', name: 'Nashville' },
      { '@type': 'City', name: 'New Orleans' },
      { '@type': 'AdministrativeArea', name: 'Mid-South United States' },
    ],
    knowsAbout: [
      'Private chef hire',
      'Food styling',
      'Recipe development',
      'Culinary consulting',
      'Creole cuisine',
      'Memphis Flavor Index',
    ],
    parentOrganization: {
      '@type': 'Organization',
      name: 'Spice Krewe',
      url: base,
    },
  };
}

/** @deprecated Prefer buildMemphisHirePageStructuredData for the hire page. */
export function buildSpiceKreweMemphisLocalBusiness(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    ...buildMemphisLocalBusinessNode(),
  };
}

/** LocalBusiness + FAQPage in one @graph for /hire/memphis. */
export function buildMemphisHirePageStructuredData(
  faqItems: { question: string; answer: string }[],
): Record<string, unknown> {
  return combineLocalBusinessWithFaq(buildMemphisLocalBusinessNode(), faqItems);
}
