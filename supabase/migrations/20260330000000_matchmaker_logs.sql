-- G4 (Flomisma Gold): Durable predictive matchmaker audit trail.
-- Base table + RLS: 20260328000000_cos_schema.sql. Additional index: 20260330000000_gold_remediation.sql.
-- Writes: service role via server/lib/matchmakerLogDb.ts (replaces reliance on serverless in-memory buffers).

comment on table public.matchmaker_logs is
  'Predictive matchmaker events; INSERT via service_role only. data_retention_policy: purge 24 months after parent brief closure unless legal hold.';
