-- Automation support columns
-- Run in Supabase SQL editor after primary table migrations
-- Run after docs/supabase-food-truck-bookings.sql and docs/supabase-concierge.sql

-- Allow concierge briefs to track provider response windows (optional state machine)
ALTER TABLE public.concierge_briefs
  DROP CONSTRAINT IF EXISTS concierge_briefs_status_check;

ALTER TABLE public.concierge_briefs
  ADD CONSTRAINT concierge_briefs_status_check
  CHECK (status IN (
    'pending',
    'processing',
    'ready',
    'pending_review',
    'pending_provider_response',
    'accepted',
    'expired',
    'rejected'
  ));

-- Profiles: automation tracking fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_booking_at timestamptz,
  ADD COLUMN IF NOT EXISTS booking_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS profile_completeness integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS permit_expiry_date date,
  ADD COLUMN IF NOT EXISTS operating_lat decimal(9,6),
  ADD COLUMN IF NOT EXISTS operating_lng decimal(9,6),
  ADD COLUMN IF NOT EXISTS inactivity_email_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS verification_reminder_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_founding_provider boolean DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT TRUE;

-- food_truck_bookings: completion tracking
ALTER TABLE public.food_truck_bookings
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS no_show_flagged boolean DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS review_requested_at timestamptz,
  ADD COLUMN IF NOT EXISTS review_received_at timestamptz,
  ADD COLUMN IF NOT EXISTS buyer_email text,
  ADD COLUMN IF NOT EXISTS provider_email text,
  ADD COLUMN IF NOT EXISTS event_address text;

-- concierge_briefs: recovery tracking
ALTER TABLE public.concierge_briefs
  ADD COLUMN IF NOT EXISTS recovery_email_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS buyer_email text;

-- Reviews table
CREATE TABLE IF NOT EXISTS public.booking_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id text NOT NULL,
  booking_type text NOT NULL CHECK (booking_type IN ('chef', 'food_truck', 'concierge')),
  buyer_id text NOT NULL,
  provider_id text NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text text,
  created_at timestamptz DEFAULT NOW(),
  UNIQUE (booking_id, buyer_id)
);

CREATE INDEX IF NOT EXISTS idx_booking_reviews_provider ON public.booking_reviews (provider_id);

-- Operator alerts log
CREATE TABLE IF NOT EXISTS public.operator_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL,
  entity_type text,
  entity_id text,
  message text NOT NULL,
  resolved boolean DEFAULT FALSE,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_operator_alerts_unresolved ON public.operator_alerts (alert_type) WHERE resolved = FALSE;

-- Seasonal campaign schedule
CREATE TABLE IF NOT EXISTS public.seasonal_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city_slug text NOT NULL DEFAULT 'memphis',
  send_date date NOT NULL,
  subject text NOT NULL,
  body_markdown text NOT NULL,
  sent_at timestamptz,
  recipient_count integer DEFAULT 0,
  created_at timestamptz DEFAULT NOW()
);

-- Rate limit events (server-side counters; service role writes)
CREATE TABLE IF NOT EXISTS public.rate_limit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_events_key_created ON public.rate_limit_events (key, created_at);
