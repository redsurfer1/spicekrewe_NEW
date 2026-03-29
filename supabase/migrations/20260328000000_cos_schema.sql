-- Spice Krewe COS — PostgreSQL schema for Supabase (profiles, briefs, professionals, intelligence, matchmaker_logs)
-- Apply via Supabase SQL editor or `supabase db push`.

-- -----------------------------------------------------------------------------
-- Profiles (1:1 with auth.users; role for admin RLS)
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);

-- -----------------------------------------------------------------------------
-- Briefs (COS core; FK to profiles for authenticated ownership)
-- -----------------------------------------------------------------------------
create table if not exists public.briefs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  client_name text not null,
  project_title text not null,
  budget_range text not null default '',
  timeline text not null default '',
  description text not null default '',
  required_skills text not null default '',
  primary_interest_talent_ids text,
  source_talent_id text,
  posting_tier text check (posting_tier is null or posting_tier in ('Standard', 'Featured')),
  payment_status text not null default 'unpaid',
  is_active boolean not null default false,
  stripe_last_webhook_event_id text,
  stripe_checkout_session_id text,
  technical_requirements jsonb,
  predictive_match_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists briefs_user_id_idx on public.briefs (user_id);
create index if not exists briefs_created_at_idx on public.briefs (created_at desc);
create index if not exists briefs_stripe_session_idx on public.briefs (stripe_checkout_session_id);

-- -----------------------------------------------------------------------------
-- Professionals (public talent directory; RLS read)
-- -----------------------------------------------------------------------------
create table if not exists public.professionals (
  id text primary key,
  name text not null,
  initials text not null default '',
  role text not null default '',
  specialty text not null default '',
  rate text not null default '',
  rating double precision not null default 0,
  reviews integer not null default 0,
  verified boolean not null default false,
  available boolean not null default true,
  avatar_color text,
  avatar_text text,
  tags text[] not null default '{}',
  bio text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists professionals_available_idx on public.professionals (available);

-- -----------------------------------------------------------------------------
-- Intelligence catalog (machine-readable DaaS / COS payloads)
-- -----------------------------------------------------------------------------
create table if not exists public.intelligence_entries (
  id uuid primary key default gen_random_uuid(),
  domain text not null,
  insight text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists intelligence_entries_domain_idx on public.intelligence_entries (domain);

-- -----------------------------------------------------------------------------
-- Matchmaker logs (audit trail; service role writes)
-- -----------------------------------------------------------------------------
create table if not exists public.matchmaker_logs (
  id uuid primary key default gen_random_uuid(),
  brief_id uuid references public.briefs (id) on delete cascade,
  message text not null,
  top_matches jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists matchmaker_logs_brief_id_idx on public.matchmaker_logs (brief_id);
create index if not exists matchmaker_logs_created_at_idx on public.matchmaker_logs (created_at desc);

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.briefs enable row level security;
alter table public.professionals enable row level security;
alter table public.intelligence_entries enable row level security;
alter table public.matchmaker_logs enable row level security;

-- Profiles: users manage own row; admins read all (optional)
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (
    auth.uid() = id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own_or_admin"
  on public.profiles for update
  using (
    auth.uid() = id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Briefs: own rows + admin full access
create policy "briefs_select_own_or_admin"
  on public.briefs for select
  using (
    (user_id is not null and auth.uid() = user_id)
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "briefs_insert_own_or_admin"
  on public.briefs for insert
  with check (
    (user_id is not null and auth.uid() = user_id)
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Guest / server-side inserts with user_id null use the Supabase service role (bypasses RLS).
create policy "briefs_update_own_or_admin"
  on public.briefs for update
  using (
    (user_id is not null and auth.uid() = user_id)
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "briefs_delete_own_or_admin"
  on public.briefs for delete
  using (
    (user_id is not null and auth.uid() = user_id)
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Professionals: public read for directory
create policy "professionals_select_all"
  on public.professionals for select
  using (true);

-- Intelligence: read for authenticated users (tighten to admin if needed)
create policy "intelligence_select_authenticated"
  on public.intelligence_entries for select
  using (auth.role() = 'authenticated');

-- Matchmaker logs: end users should not read; admin via service role or admin policy
create policy "matchmaker_logs_select_admin"
  on public.matchmaker_logs for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- -----------------------------------------------------------------------------
-- Trigger: new auth user -> profile
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Seed: professionals (directory; safe to re-run)
-- -----------------------------------------------------------------------------
insert into public.professionals (id, name, initials, role, specialty, rate, rating, reviews, verified, available, avatar_color, avatar_text, tags, bio)
values
  (
    'marcus-johnson',
    'Marcus Johnson',
    'MJ',
    'Executive Chef & Operations Consultant',
    'Menu engineering, kitchen systems, and team leadership',
    '$175/hr',
    4.9,
    42,
    true,
    true,
    'var(--sk-purple)',
    'MJ',
    array['Menu Design','Private Chef','Recipe Development']::text[],
    'Former hotel executive chef turned independent consultant. Marcus helps brands launch concepts, tighten food cost, and train brigades without losing soul in the plate.'
  ),
  (
    'aisha-laurent',
    'Aisha Laurent',
    'AL',
    'Recipe Developer & R&D Lead',
    'Scalable formulations, allergen-aware menus, and co-packer handoffs',
    '$165/hr',
    4.95,
    38,
    true,
    true,
    'var(--sk-blue)',
    'AL',
    array['Recipe Development','Flavor Consulting','Culinary Content']::text[],
    'Aisha bridges CPG and restaurant R&D: she writes specs, runs bench tests, and documents processes so your product tastes the same at line 1 and line 100.'
  ),
  (
    'rafael-cruz',
    'Rafael Cruz',
    'RC',
    'Food Stylist & Photo/Video Partner',
    'Editorial, e‑commerce, and campaign shoots with motion',
    '$150/hr',
    4.85,
    56,
    true,
    false,
    'var(--sk-navy)',
    'RC',
    array['Food Styling','Culinary Content']::text[],
    'Rafael crafts hero shots and short-form content for national brands. His sets stay efficient, on-brief, and edible-safe from first frame to wrap.'
  ),
  (
    'dana-nguyen',
    'Dana Nguyen',
    'DN',
    'Flavor Consultant & Sensory Strategist',
    'Tasting panels, flavor maps, and cross-cultural menu balance',
    '$190/hr',
    5.0,
    29,
    true,
    true,
    'var(--sk-gold)',
    'DN',
    array['Flavor Consulting','Menu Design','Recipe Development']::text[],
    'Dana blends sensory science with street-level intuition—helping teams articulate why this works and ship flavors that resonate in multiple markets.'
  )
on conflict (id) do update set
  name = excluded.name,
  role = excluded.role,
  specialty = excluded.specialty,
  updated_at = now();
