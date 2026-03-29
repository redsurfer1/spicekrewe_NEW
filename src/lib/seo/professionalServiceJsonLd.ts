import type { TalentRecord } from '../../types/talentRecord';

const DEFAULT_SITE = 'https://spicekrewe.com';

/**
 * Schema.org ProfessionalService JSON-LD for talent profile pages.
 */
export function buildProfessionalServiceStructuredData(
  row: TalentRecord,
  siteUrl: string = DEFAULT_SITE,
): Record<string, unknown> {
  const base = siteUrl.replace(/\/$/, '');
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
