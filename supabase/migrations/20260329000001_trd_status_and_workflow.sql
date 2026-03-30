-- Extends `public.briefs` from 20260328000000_cos_schema.sql (additive only — no destructive changes).
-- Production TRD (Auto-Scoper) runs on Stripe `checkout.session.completed` via Vercel
-- `server/lib/webhook-checkout-completed.ts` + Gemini in `server/lib/ai/autoScoper.ts`.
-- A Postgres `AFTER INSERT` + `net.http_post` trigger was not added here to avoid duplicate TRD
-- generation and because `pg_net` may not be enabled on all projects.

alter table public.briefs
  add column if not exists trd_status text
    check (trd_status is null or trd_status in ('pending', 'generating', 'complete', 'failed'));

alter table public.briefs
  add column if not exists workflow_status text not null default 'unpaid'
    check (
      workflow_status in (
        'unpaid',
        'active',
        'matching',
        'matched',
        'cancelled',
        'closed',
        'sla_breached'
      )
    );

alter table public.briefs
  add column if not exists paid_at timestamptz;

alter table public.briefs
  add column if not exists onboarding_email_1_sent_at timestamptz;

alter table public.briefs
  add column if not exists onboarding_email_2_sent_at timestamptz;

update public.briefs
set
  workflow_status = case
    when payment_status = 'paid' and is_active = true then 'active'::text
    else workflow_status
  end,
  trd_status = case
    when technical_requirements is not null and technical_requirements <> '{}'::jsonb
      then coalesce(trd_status, 'complete'::text)
    else coalesce(trd_status, 'pending'::text)
  end
where true;

create index if not exists briefs_trd_status_idx on public.briefs (trd_status);
create index if not exists briefs_workflow_status_idx on public.briefs (workflow_status);
