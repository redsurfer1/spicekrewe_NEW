-- SpiceKrewe subscriptions table
-- Deferred feature — activate at month 6
-- alongside subscription UI and Stripe
-- Price ID configuration.
-- Run in Supabase SQL editor at month 6.
-- See: docs/stripe-subscription-setup.md
--
-- Migration order: run AFTER
-- supabase-automation-columns.sql
--
-- Add to .env when activating:
--   STRIPE_PRICE_EXPLORER=price_...
--   STRIPE_PRICE_ENTHUSIAST=price_...

CREATE TABLE IF NOT EXISTS
  public.subscriptions (
    id uuid PRIMARY KEY
      DEFAULT gen_random_uuid(),
    buyer_id text NOT NULL,
    plan_slug text NOT NULL
      CHECK (plan_slug IN (
        'explorer', 'enthusiast'
      )),
    city_slug text NOT NULL
      DEFAULT 'memphis',
    stripe_subscription_id text
      UNIQUE NOT NULL,
    stripe_customer_id text NOT NULL,
    status text NOT NULL DEFAULT 'active'
      CHECK (status IN (
        'active', 'paused',
        'cancelled', 'past_due'
      )),
    current_period_start timestamptz,
    current_period_end timestamptz,
    classes_used_this_period
      integer DEFAULT 0,
    churn_risk boolean DEFAULT FALSE,
    cancelled_at timestamptz,
    created_at timestamptz DEFAULT NOW(),
    updated_at timestamptz DEFAULT NOW()
  );

CREATE INDEX IF NOT EXISTS
  idx_subscriptions_buyer
  ON public.subscriptions (buyer_id);

CREATE INDEX IF NOT EXISTS
  idx_subscriptions_stripe
  ON public.subscriptions
  (stripe_subscription_id);

CREATE INDEX IF NOT EXISTS
  idx_subscriptions_city_status
  ON public.subscriptions
  (city_slug, status);
