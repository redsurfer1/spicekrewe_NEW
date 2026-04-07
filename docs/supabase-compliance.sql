-- SOC2 / ISO27001 compliance-oriented tables
-- Run in Supabase SQL editor after core app tables exist

-- Audit log: append-only style (service role bypasses RLS for automation)
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  actor_id text,
  actor_type text NOT NULL CHECK (actor_type IN ('buyer', 'provider', 'admin', 'system', 'cron', 'webhook')),
  entity_type text,
  entity_id text,
  ip_address inet,
  user_agent text,
  payload jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT NOW()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log_insert_authenticated"
  ON public.audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "audit_log_select_admin"
  ON public.audit_log
  FOR SELECT
  TO authenticated
  USING (COALESCE((auth.jwt() -> 'app_metadata' ->> 'role'), auth.jwt() ->> 'role') = 'admin');

CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON public.audit_log (actor_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON public.audit_log (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_event ON public.audit_log (event_type, created_at);

-- Data retention policy log
CREATE TABLE IF NOT EXISTS public.data_retention_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  records_deleted integer NOT NULL,
  retention_policy text NOT NULL,
  executed_at timestamptz NOT NULL DEFAULT NOW()
);

-- Security incident log
CREATE TABLE IF NOT EXISTS public.security_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_type text NOT NULL,
  source_ip inet,
  details jsonb NOT NULL DEFAULT '{}',
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  resolved boolean DEFAULT FALSE,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

-- Consent log
CREATE TABLE IF NOT EXISTS public.consent_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  consent_type text NOT NULL,
  version text NOT NULL,
  accepted boolean NOT NULL,
  ip_address inet,
  created_at timestamptz NOT NULL DEFAULT NOW()
);
