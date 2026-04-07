-- SpiceKrewe native concierge tables
-- Run in Supabase SQL editor
-- Run after supabase-notification-and-concierge.sql

CREATE TABLE IF NOT EXISTS
  public.concierge_briefs (
    id uuid PRIMARY KEY
      DEFAULT gen_random_uuid(),
    buyer_id text NOT NULL,
    city_slug text NOT NULL
      DEFAULT 'memphis',
    event_type text NOT NULL,
    guest_count integer NOT NULL,
    theme text,
    budget_cents integer NOT NULL,
    event_date date,
    location_notes text,
    event_scale text CHECK (event_scale IN (
      'intimate','gathering','large'
    )),
    status text NOT NULL DEFAULT 'pending'
      CHECK (status IN (
        'pending','processing','ready',
        'pending_review','accepted',
        'expired','rejected'
      )),
    requires_human_review boolean
      DEFAULT FALSE,
    human_reviewed_at timestamptz,
    ai_package_json jsonb,
    concierge_fee_cents integer
      DEFAULT 0,
    created_at timestamptz DEFAULT NOW(),
    updated_at timestamptz DEFAULT NOW()
  );

CREATE TABLE IF NOT EXISTS
  public.concierge_packages (
    id uuid PRIMARY KEY
      DEFAULT gen_random_uuid(),
    brief_id uuid NOT NULL
      REFERENCES public.concierge_briefs(id),
    package_json jsonb NOT NULL,
    status text NOT NULL DEFAULT 'draft'
      CHECK (status IN (
        'draft','sent','accepted',
        'declined','expired'
      )),
    accepted_at timestamptz,
    created_at timestamptz DEFAULT NOW()
  );

CREATE INDEX IF NOT EXISTS
  idx_concierge_briefs_buyer
  ON public.concierge_briefs (buyer_id);
CREATE INDEX IF NOT EXISTS
  idx_concierge_briefs_city_status
  ON public.concierge_briefs
  (city_slug, status);
CREATE INDEX IF NOT EXISTS
  idx_concierge_packages_brief
  ON public.concierge_packages (brief_id);
