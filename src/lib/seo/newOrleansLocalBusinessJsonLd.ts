import { SITE_URL } from '../../components/SEO';
import { combineLocalBusinessWithFaq } from './cityHirePageStructuredData';

function buildNewOrleansLocalBusinessNode(): Record<string, unknown> {
  const base = SITE_URL.replace(/\/$/, '');
  return {
    '@type': 'LocalBusiness',
    name: 'Spice Krewe New Orleans',
    description:
      'Spice Krewe is a vetted culinary talent marketplace serving New Orleans, Louisiana and the Gulf South. SK Verified Cajun and Creole chefs, food stylists, and NOLA food product development talent — bookable online, no retainer. Home of the New Orleans Flavor Index roadmap.',
    url: `${base}/hire/new-orleans`,
    slogan: 'Community · Culture · Culinary talent',
    serviceType: 'Culinary talent marketplace',
    hasMap: 'https://www.google.com/maps/place/New+Orleans,+LA',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'New Orleans',
      addressRegion: 'LA',
      addressCountry: 'US',
    },
    areaServed: [
      { '@type': 'City', name: 'New Orleans' },
      { '@type': 'State', name: 'Louisiana' },
      { '@type': 'City', name: 'Baton Rouge' },
      { '@type': 'AdministrativeArea', name: 'Gulf South United States' },
    ],
    knowsAbout: [
      'Private chef hire',
      'Food styling',
      'Recipe development',
      'Culinary consulting',
      'Creole cuisine',
      'Cajun cuisine',
      'New Orleans Flavor Index',
    ],
    parentOrganization: {
      '@type': 'Organization',
      name: 'Spice Krewe',
      url: base,
    },
  };
}

export function buildNewOrleansHirePageStructuredData(
  faqItems: { question: string; answer: string }[],
): Record<string, unknown> {
  return combineLocalBusinessWithFaq(buildNewOrleansLocalBusinessNode(), faqItems);
}
