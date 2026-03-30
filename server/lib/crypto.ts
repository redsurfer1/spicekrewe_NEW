/**
 * Spice Krewe — cryptographic and data-protection posture (G16 / ISO 27001 A.10).
 *
 * **In transit (G16):** Production traffic is terminated at the edge with **TLS 1.2 minimum**; **TLS 1.3** is
 * used where the CDN/platform negotiates it. Clients MUST use `https://` origins only in production.
 *
 * **At rest:** Application-layer field encryption is not applied to briefs/leads; **PII and secrets rely on
 * the data platform: Supabase (PostgreSQL) **AES-256 storage encryption at rest** per Supabase’s
 * infrastructure commitments, plus Stripe/Resend PCI-aligned handling for payment and mail payloads.
 * Service-role keys and signing secrets live only in Vercel/server env — never in the browser bundle.
 *
 * **Signing:** Admin session tokens use HMAC-SHA256 (`server/lib/admin-token.ts`).
 *
 * Do not implement ad-hoc ciphers here without a reviewed key-management design (KMS, rotation, DEK/KEK).
 */

export const DATA_PROTECTION_POSTURE_VERSION = '2026-03-30';
