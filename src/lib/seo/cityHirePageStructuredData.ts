import { buildFaqPageJsonLd } from './faqPageJsonLd';

/** Merges a LocalBusiness node with FAQPage JSON-LD for city hire hubs. */
export function combineLocalBusinessWithFaq(
  localBusinessNode: Record<string, unknown>,
  faqItems: { question: string; answer: string }[],
): Record<string, unknown> {
  const faqBlock = buildFaqPageJsonLd(faqItems);
  const faqNode = { '@type': 'FAQPage', mainEntity: (faqBlock as { mainEntity: unknown }).mainEntity };
  return {
    '@context': 'https://schema.org',
    '@graph': [localBusinessNode, faqNode],
  };
}
