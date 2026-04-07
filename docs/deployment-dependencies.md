# SpiceKrewe Deployment Dependencies

## SpiceKrewe is fully self-contained

As of this sprint, SpiceKrewe has no external API dependencies for core product flows. Concierge and bookings are implemented natively in `server/api/`.

There is no dependency on any separate product API beyond the infrastructure listed below.

## Infrastructure dependencies

| Service          | Purpose              | Required |
|------------------|----------------------|----------|
| Supabase         | Database + Auth      | Yes      |
| Stripe           | Payments             | Yes      |
| Anthropic Claude | Concierge AI         | Yes      |
| Resend           | Transactional email | Yes      |
| Vercel           | Hosting + Functions  | Yes      |

## Flomisma engine

SpiceKrewe's server architecture follows the Flomisma engine pattern:

- Thin API handlers in `api/` (re-exports)
- Business logic in `server/api/`
- Shared utilities in `server/lib/`
- Supabase as the data layer
- WebhookFlowRegistry for Stripe events
- emailDedup for notification deduplication

Core logic patterns were provided by the Flomisma engine and customized for SpiceKrewe's culinary vertical.

## Deployment order

SpiceKrewe deploys independently. No coordinated deployment with other platforms is required.

Single Vercel deployment serves:

- React SPA (client)
- Serverless functions (`server/api/` via `api/`)

## Environment variables required

See `.env.example` for the full list. Critical for production:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `ANTHROPIC_API_KEY`
- `RESEND_API_KEY`
- `ADMIN_PASSWORD` / `ADMIN_SESSION_SECRET` (admin routes)
