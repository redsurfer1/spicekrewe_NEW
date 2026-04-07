# SpiceKrewe Compliance Overview

## Framework alignment

SpiceKrewe is designed to align with:

- SOC2 Type I (Security, Availability, Confidentiality trust service criteria)
- ISO27001 Annex A controls (relevant subset)

## Data classification

| Data type | Classification | Retention |
|-----------|----------------|-----------|
| Auth tokens | Confidential | Session only |
| Payment data | Confidential (Stripe-held) | Not stored |
| Booking records | Internal | 3 years |
| Audit logs | Internal (anonymized after 1yr) | 7 years |
| Provider profiles | Internal | Active + 2yr |
| Email addresses | Personal | Active + 90days |
| IP addresses | Personal | 1 year |

## Payment data

SpiceKrewe does not store card numbers, CVVs, or bank account details. All payment data is held by Stripe. See: `docs/dual-entity-operating-boundary.md` (if present in repo).

## Audit logging

Significant platform actions can be written to the `audit_log` table (see `docs/supabase-compliance.sql`). Service-role automation and webhooks should prefer `server/lib/auditLogger.ts`. Payloads must avoid PII and card data.

## Access control

Admin routes use server-side secrets. Public API routes can be rate-limited via `server/lib/rateLimiter.ts` (backed by `rate_limit_events` in `docs/supabase-automation-columns.sql`).

## Incident response

Security incidents can be recorded in `security_incidents` via `server/lib/securityIncidents.ts`. Invalid Stripe webhook signatures are logged as high severity.

## Data retention

`enforceDataRetention()` in `server/lib/automationJobs.ts` (monthly cron) attempts to anonymize older `audit_log` rows and delete old resolved `operator_alerts`, logging counts to `data_retention_log`.

## Webhook security

`server/api/webhooks.ts` validates every event with `stripe.webhooks.constructEvent()` using `STRIPE_WEBHOOK_SECRET` before handling. `server/api/stripe-transfer-notification.ts` validates Connect events with `STRIPE_CONNECT_WEBHOOK_SECRET`.

## Rate limiting

| Endpoint | Limit |
|----------|-------|
| `/api/concierge-submit` | 5/hour per IP |
| `/api/food-trucks-book` | 10/hour per buyer id (fallback IP) |
| `/api/provider-register` | 3/hour per IP |

## Consent tracking

Use `consent_log` (see `docs/supabase-compliance.sql`) to record terms / privacy / marketing acceptance with version strings.

## Pending for full SOC2 readiness

- [ ] Third-party penetration test
- [ ] Formal risk assessment document
- [ ] Business continuity plan
- [ ] Vendor security review (Stripe, Supabase, Anthropic, Resend)
- [ ] Employee security training records (N/A for solo operation — document operator security practices instead)
- [ ] Formal incident response runbook
