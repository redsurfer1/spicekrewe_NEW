-- Food truck bookings table
-- Run in Supabase SQL editor after
-- supabase-notification-and-concierge.sql

CREATE TABLE IF NOT EXISTS
  public.food_truck_bookings (
    id uuid PRIMARY KEY
      DEFAULT gen_random_uuid(),
    provider_id text NOT NULL,
    buyer_id text NOT NULL,
    city_slug text NOT NULL
      DEFAULT 'memphis',
    event_date date NOT NULL,
    duration_hours integer NOT NULL,
    headcount integer,
    event_description text,
    location_address text,
    status text NOT NULL DEFAULT 'pending'
      CHECK (status IN (
        'pending','confirmed',
        'cancelled','completed'
      )),
    stripe_payment_intent_id text,
    platform_fee_cents integer,
    total_amount_cents integer,
    created_at timestamptz
      DEFAULT NOW(),
    updated_at timestamptz
      DEFAULT NOW()
  );

CREATE INDEX IF NOT EXISTS
  idx_food_truck_bookings_provider_date
  ON public.food_truck_bookings
  (provider_id, event_date);

CREATE INDEX IF NOT EXISTS
  idx_food_truck_bookings_buyer
  ON public.food_truck_bookings (buyer_id);

CREATE INDEX IF NOT EXISTS
  idx_food_truck_bookings_city_status
  ON public.food_truck_bookings
  (city_slug, status);
