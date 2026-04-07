# External API scrub sprint — complete

**Date completed:** April 2, 2026

## Summary

SpiceKrewe no longer depends on a separate external product API for core flows. The app is self-contained for concierge and related features. City selection is implemented in `CityContext` (`src/context/CityContext.tsx`) with `sk_*` localStorage keys.

## What was removed

- HTTP calls to third-party product API endpoints used for concierge
- Legacy `VITE_*` base URL for that external API
- Legacy buyer id field (replaced by `externalUserId` in app types)
- Legacy SQL column name in application types (replaced by `external_user_id`; database rename steps live in `docs/supabase-rename-external-user-id.sql`)

## Native concierge routes

| Legacy external path (removed) | Native SpiceKrewe route |
|-------------------------------|-------------------------|
| POST /api/v1/concierge/submit | POST /api/concierge-submit |
| POST /api/v1/concierge/accept | POST /api/concierge-accept |
| POST /api/v1/concierge/provider-response | POST /api/concierge-provider-response |

## Verification

- TypeScript (`tsconfig.app.json`): clean
- TypeScript (`tsconfig.server.json`): clean
- `grep -riE "pem.*abu"` on `*.ts` / `*.tsx` / `*.js` / `*.jsx` under the repo (excluding `node_modules`): expect **zero** matches.
- **Exception:** `docs/supabase-rename-external-user-id.sql` must name the real legacy database column for `ALTER TABLE ... RENAME COLUMN` to work. That file may contain the old column identifier; treat it as operational SQL only, not application code.

## LocalStorage keys (authoritative list)

| Key | Purpose | File | Read/Write |
|-----|---------|------|------------|
| `spicekrewe_auth_user` | Auth identity mirror for concierge / APIs | `src/lib/auth/storage.ts` | R/W (via `SPICEKREWE_AUTH_STORAGE_KEY`) |
| `spicekrewe_showMap` | Map display preference | `src/contexts/AppContext.tsx` | R/W |
| `sk_city_slug` | Selected city slug | `src/context/CityContext.tsx` | R/W |
| `sk_city_name` | City display name | `src/context/CityContext.tsx` | R/W |
| `sk_city_state` | City state code | `src/context/CityContext.tsx` | R/W |

## Open items

### SQL column rename — run when ready

**File:** `docs/supabase-rename-external-user-id.sql`

**Steps:**

1. Check whether the legacy external-id column exists on `public.profiles` (query in that file).
2. If it exists: run the `RENAME COLUMN` statement.
3. If it does not: add `external_user_id` per the commented `ADD COLUMN` path in the file.
4. Verify with the `SELECT` at the end of the file.

Run during a low-traffic window.

### Optional product follow-ups

- Mount `CitySelector` in the main nav when multiple live cities should be visible globally (`src/components/CitySelector.tsx`).
- Add `src/services/cityApi.ts` as a thin client for `GET /api/cities` if you want a shared fetch helper (optional; `CityContext` already calls the API).

## Architecture note

SpiceKrewe follows the Flomisma engine pattern. Core logic patterns are provided by the Flomisma engine and customized for SpiceKrewe's culinary vertical. See: `docs/deployment-dependencies.md`
