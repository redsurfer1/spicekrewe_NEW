-- Food truck profile columns
-- Run in Supabase SQL editor
-- Adds food-truck-specific fields to
-- existing profiles table

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS
    provider_type text DEFAULT 'private_chef'
    CHECK (provider_type IN (
      'private_chef', 'food_truck'
    )),
  ADD COLUMN IF NOT EXISTS
    max_capacity integer,
  ADD COLUMN IF NOT EXISTS
    requires_power_hookup boolean
      DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS
    service_radius_miles integer
      DEFAULT 25,
  ADD COLUMN IF NOT EXISTS
    minimum_booking_hours integer
      DEFAULT 2,
  ADD COLUMN IF NOT EXISTS
    cuisine_categories text[]
      DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS
    truck_name text,
  ADD COLUMN IF NOT EXISTS
    health_permit_verified boolean
      DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS
    vehicle_license_verified boolean
      DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS
    rate_per_hour integer;
    -- stored in cents

CREATE INDEX IF NOT EXISTS
  idx_profiles_provider_type
  ON public.profiles (provider_type);

CREATE INDEX IF NOT EXISTS
  idx_profiles_provider_city
  ON public.profiles
  (provider_type, city_slug)
  WHERE city_slug IS NOT NULL;
