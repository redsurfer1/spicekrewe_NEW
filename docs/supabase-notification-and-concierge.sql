-- Run in Supabase SQL editor (Spice Krewe) when enabling production email dedup + concierge outcomes.

create table if not exists public.notification_log (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id text not null,
  type text not null,
  recipient text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists notification_log_dedup_idx
  on public.notification_log (entity_type, entity_id, type, recipient);

create table if not exists public.concierge_outcomes (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text,
  brief_id text,
  package_id text,
  buyer_id text,
  city_slug text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists concierge_outcomes_city_idx on public.concierge_outcomes (city_slug);
create index if not exists concierge_outcomes_brief_idx on public.concierge_outcomes (brief_id);

-- Optional: link SpiceKrewe Supabase auth users to an external UUID when they differ
-- alter table public.profiles add column if not exists external_user_id text;
-- TODO: Rename legacy column to external_user_id when ready (if an old column name exists):
-- ALTER TABLE public.profiles RENAME COLUMN <legacy_external_id_column> TO external_user_id;

-- Subscriber personalization (populate when a subscription booking completes)
create table if not exists public.subscriber_history (
  id uuid primary key default gen_random_uuid(),
  buyer_id text not null,
  city_slug text not null,
  provider_type text not null check (provider_type in ('private_chef','food_truck')),
  provider_id text,
  completed_at timestamptz not null default now(),
  metadata jsonb not null default '{}'
);

create index if not exists subscriber_history_buyer_city_idx on public.subscriber_history (buyer_id, city_slug);
