-- Gold Standard remediation (G4, G6, G7, G8, G14, G15) — additive to prior migrations.
--
-- data_retention_policy (ISO 27001 A.18.1.3 / SOC2 CC6.5 guidance — operational enforcement via app/cron):
--   audit_log: target 400 days operational retention; archive to cold storage then purge (configure in SIEM).
--   matchmaker_logs: align with brief lifecycle; purge 24 months after brief closure unless legal hold.
--   leads: purge marketing/contact leads after 36 months of inactivity or on verified erasure request.
--   briefs / bookings PII: retention per DPA; minimize client_email exposure in logs.

-- -----------------------------------------------------------------------------
-- Bookings: signed feedback capability (G14)
-- -----------------------------------------------------------------------------
alter table public.bookings
  add column if not exists secure_token uuid unique default gen_random_uuid();

update public.bookings
set secure_token = gen_random_uuid()
where secure_token is null;

-- -----------------------------------------------------------------------------
-- Audit log — Edge Functions + server incidents (G8)
-- -----------------------------------------------------------------------------
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  correlation_id uuid not null,
  source text not null,
  level text not null check (level in ('error', 'warn', 'info')),
  message text not null,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_log_created_at_idx on public.audit_log (created_at desc);
create index if not exists audit_log_correlation_idx on public.audit_log (correlation_id);

comment on table public.audit_log is 'SOC2/ISO 27001: security and availability incident trail; service_role writes only.';

alter table public.audit_log enable row level security;

create policy "audit_log_deny_all_jwt"
  on public.audit_log for all
  using (false)
  with check (false);

-- -----------------------------------------------------------------------------
-- SLA / Edge scheduler heartbeat (G3)
-- -----------------------------------------------------------------------------
create table if not exists public.sla_monitor_runs (
  function_name text primary key,
  last_run_at timestamptz,
  last_status text check (last_status is null or last_status in ('ok', 'error')),
  failure_count integer not null default 0,
  last_correlation_id uuid,
  last_error text,
  updated_at timestamptz not null default now()
);

comment on table public.sla_monitor_runs is 'Last-run telemetry for scheduled Edge Functions; updated by each run.';

alter table public.sla_monitor_runs enable row level security;

create policy "sla_monitor_runs_deny_all_jwt"
  on public.sla_monitor_runs for all
  using (false)
  with check (false);

-- -----------------------------------------------------------------------------
-- Intelligence: admin-only SELECT (G6) — remove broad authenticated read
-- -----------------------------------------------------------------------------
drop policy if exists "intelligence_select_authenticated" on public.intelligence_entries;

create policy "intelligence_select_admin_only"
  on public.intelligence_entries for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- -----------------------------------------------------------------------------
-- matchmaker_logs: ensure service-role-friendly writes (RLS bypass for service_role; document insert path)
-- No INSERT policy for JWT users — anon/authenticated cannot append. Service role bypasses RLS.
-- -----------------------------------------------------------------------------
create index if not exists matchmaker_logs_created_at_desc_idx on public.matchmaker_logs (created_at desc);
