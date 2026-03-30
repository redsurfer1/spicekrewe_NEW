import { SITE_URL } from '../../components/SEO';
import { combineLocalBusinessWithFaq } from './cityHirePageStructuredData';

function buildNashvilleLocalBusinessNode(): Record<string, unknown> {
  const base = SITE_URL.replace(/\/$/, '');
  return {
    '@type': 'LocalBusiness',
    name: 'Spice Krewe Nashville',
    description:
      'Spice Krewe is a vetted culinary talent marketplace serving Nashville, Tennessee and Middle Tennessee. SK Verified private chefs, food stylists, and recipe developers — bookable online, no retainer. Home of the Nashville Flavor Index roadmap.',
    url: `${base}/hire/nashville`,
    slogan: 'Community · Culture · Culinary talent',
    serviceType: 'Culinary talent marketplace',
    hasMap: 'https://www.google.com/maps/place/Nashville,+TN',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Nashville',
      addressRegion: 'TN',
      addressCountry: 'US',
    },
    areaServed: [
      { '@type': 'City', name: 'Nashville' },
      { '@type': 'State', name: 'Tennessee' },
      { '@type': 'City', name: 'Memphis' },
      { '@type': 'City', name: 'New Orleans' },
      { '@type': 'AdministrativeArea', name: 'Middle Tennessee' },
    ],
    knowsAbout: [
      'Private chef hire',
      'Food styling',
      'Recipe development',
      'Culinary consulting',
      'Southern cuisine',
      'Nashville Flavor Index',
    ],
    parentOrganization: {
      '@type': 'Organization',
      name: 'Spice Krewe',
      url: base,
    },
  };
}

export function buildNashvilleHirePageStructuredData(
  faqItems: { question: string; answer: string }[],
): Record<string, unknown> {
  return combineLocalBusinessWithFaq(buildNashvilleLocalBusinessNode(), faqItems);
}
