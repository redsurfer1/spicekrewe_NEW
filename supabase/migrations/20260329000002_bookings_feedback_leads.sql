-- Bookings (1:1 with a paid brief for onboarding + feedback). Additive to 20260328000000_cos_schema.sql.

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  brief_id uuid not null references public.briefs (id) on delete cascade,
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (brief_id)
);

create index if not exists bookings_brief_id_idx on public.bookings (brief_id);
create index if not exists bookings_status_idx on public.bookings (status);

alter table public.bookings enable row level security;

-- Service role / server writes only for prototype bookings.
create policy "bookings_no_anon"
  on public.bookings for all
  using (false)
  with check (false);

create table if not exists public.match_feedback (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  talent_id text references public.professionals (id),
  brief_id uuid references public.briefs (id) on delete set null,
  rating boolean not null,
  created_at timestamptz not null default now(),
  unique (booking_id)
);

create index if not exists match_feedback_created_at_idx on public.match_feedback (created_at desc);

alter table public.match_feedback enable row level security;

create policy "match_feedback_no_anon"
  on public.match_feedback for all
  using (false)
  with check (false);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  message text,
  lead_type text not null default 'general',
  created_at timestamptz not null default now()
);

create index if not exists leads_lead_type_idx on public.leads (lead_type);
create index if not exists leads_created_at_idx on public.leads (created_at desc);

alter table public.leads enable row level security;

create policy "leads_no_anon"
  on public.leads for all
  using (false)
  with check (false);
