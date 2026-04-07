import { SITE_URL } from '../../components/SEO';
import { combineLocalBusinessWithFaq } from './cityHirePageStructuredData';

export type CityJsonLdProps = {
  cityName: string;
  regionCode: string;
  country: string;
  hirePath: string;
  description: string;
  /** Offerings for structured data — include private chef + food truck where live */
  providerTypes: Array<'private_chef' | 'food_truck' | 'culinary_consulting' | 'food_styling'>;
  mapUrl?: string;
};

function serviceTypesFromProviders(types: CityJsonLdProps['providerTypes']): string[] {
  const labels: string[] = [];
  if (types.includes('private_chef')) labels.push('Private chef hire');
  if (types.includes('food_truck')) labels.push('Food truck catering');
  if (types.includes('food_styling')) labels.push('Food styling');
  if (types.includes('culinary_consulting')) labels.push('Culinary consulting');
  return labels.length ? labels : ['Culinary talent marketplace'];
}

export function buildCityLocalBusinessNode(props: CityJsonLdProps): Record<string, unknown> {
  const base = SITE_URL.replace(/\/$/, '');
  return {
    '@type': 'LocalBusiness',
    name: `Spice Krewe ${props.cityName}`,
    description: props.description,
    url: `${base}${props.hirePath}`,
    slogan: 'Community · Culture · Culinary talent',
    serviceType: serviceTypesFromProviders(props.providerTypes).join('; '),
    ...(props.mapUrl ? { hasMap: props.mapUrl } : {}),
    address: {
      '@type': 'PostalAddress',
      addressLocality: props.cityName,
      addressRegion: props.regionCode,
      addressCountry: props.country,
    },
    knowsAbout: serviceTypesFromProviders(props.providerTypes),
    parentOrganization: {
      '@type': 'Organization',
      name: 'Spice Krewe',
      url: base,
    },
  };
}

export function buildCityHirePageStructuredData(
  props: CityJsonLdProps,
  faqItems: { question: string; answer: string }[],
): Record<string, unknown> {
  return combineLocalBusinessWithFaq(buildCityLocalBusinessNode(props), faqItems);
}
