/**
 * G10: Single source for compliance-facing copy (Privacy / Terms summaries).
 * Full pages should import from here so marketing and legal stay aligned.
 */

export const PRIVACY_LAST_UPDATED = 'March 2026';

export type LegalSection = { id: string; title: string; paragraphs: string[] };

export const PRIVACY_SECTIONS: readonly LegalSection[] = [
  {
    id: 'overview',
    title: 'Overview',
    paragraphs: [
      'Spice Krewe (“we”, “us”) respects your privacy. This policy describes how we collect, use, and safeguard information when you use our website and services, including project briefs and talent matching for food brands and restaurant groups.',
    ],
  },
  {
    id: 'information',
    title: 'Information we process',
    paragraphs: [
      'We may process contact details, project descriptions, and related business information that you submit through forms. Payment data is handled by our payment processor (Stripe); we do not store full card numbers on our servers.',
    ],
  },
  {
    id: 'legal-bases',
    title: 'Legal bases & consent',
    paragraphs: [
      'Where required by law (including GDPR), we rely on your consent or legitimate interests to respond to inquiries and operate our marketplace. You may withdraw consent for optional communications at any time by contacting us.',
    ],
  },
  {
    id: 'retention',
    title: 'Retention & security',
    paragraphs: [
      'We retain information only as long as needed for the purposes described here and apply administrative, technical, and organizational measures appropriate to the sensitivity of the data.',
    ],
  },
  {
    id: 'contact',
    title: 'Contact',
    paragraphs: ['hello@spicekrewe.com'],
  },
] as const;

export const TERMS_LAST_UPDATED = 'March 2026';

export const TERMS_SECTIONS: readonly LegalSection[] = [
  {
    id: 'acceptance',
    title: 'Agreement',
    paragraphs: [
      'By using Spice Krewe’s website and services, you agree to these Terms of Service and our Privacy Policy. If you do not agree, do not use the services.',
    ],
  },
  {
    id: 'marketplace',
    title: 'Marketplace nature',
    paragraphs: [
      'Spice Krewe facilitates introductions between clients and independent culinary professionals. Engagements are between you and the professional unless otherwise stated in a separate agreement.',
    ],
  },
  {
    id: 'payments',
    title: 'Payments',
    paragraphs: [
      'Featured listings and related fees are processed by Stripe. You authorize us and our payment partners to charge amounts disclosed at checkout.',
    ],
  },
  {
    id: 'limitation',
    title: 'Disclaimer',
    paragraphs: [
      'Services are provided “as available.” To the fullest extent permitted by law, Spice Krewe disclaims warranties not expressly stated herein.',
    ],
  },
  {
    id: 'terms-contact',
    title: 'Contact',
    paragraphs: ['hello@spicekrewe.com'],
  },
] as const;
