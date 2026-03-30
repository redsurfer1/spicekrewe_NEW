import type { TalentRecord } from '../../types/talentRecord';
import { buildServicePageStructuredData } from './servicePageJsonLd';

const DEFAULT_SITE = 'https://spicekrewe.com';

/** Hire landing routes: ServicePage JSON-LD (see `buildServicePageStructuredData`). */
export type HireLandingStructuredDataInput = {
  pageName: string;
  pageDescription: string;
  path: string;
  serviceName: string;
  serviceDescription: string;
  areaServed?: string;
};

function isHireLandingInput(arg: TalentRecord | HireLandingStructuredDataInput): arg is HireLandingStructuredDataInput {
  return 'pageName' in arg && 'serviceName' in arg && 'serviceDescription' in arg;
}

/**
 * Talent profiles: `ProfessionalService` node for `/talent/:id`.
 * Hire landings: pass a landing input object for ServicePage-style JSON-LD (`buildServicePageStructuredData`).
 */
export function buildProfessionalServiceStructuredData(
  rowOrLanding: TalentRecord | HireLandingStructuredDataInput,
  siteUrl?: string,
): Record<string, unknown> {
  if (isHireLandingInput(rowOrLanding)) {
    return buildServicePageStructuredData(rowOrLanding);
  }

  const row = rowOrLanding;
  const base = (siteUrl ?? DEFAULT_SITE).replace(/\/$/, '');
  const profileUrl = `${base}/talent/${row.id}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: `${row.name} — Spice Krewe verified culinary professional`,
    description: `${row.specialty}. ${row.bio}`,
    url: profileUrl,
    provider: {
      '@type': 'Person',
      name: row.name,
      jobTitle: row.role,
      description: row.bio,
    },
    serviceType: row.tags,
    offers: {
      '@type': 'Offer',
      price: row.rate,
      priceCurrency: 'USD',
      availability: row.available ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: row.rating,
      reviewCount: row.reviews,
      bestRating: 5,
      worstRating: 1,
    },
    ...(row.verified
      ? {
          brand: {
            '@type': 'Brand',
            name: 'Spice Krewe',
          },
        }
      : {}),
  };
}
