-- Unified bookings view for automation jobs
-- Run in Supabase SQL editor
-- Requires food_truck_bookings (and optionally chef_bookings)

-- If public.chef_bookings exists, use the UNION version below.
-- If only food_truck_bookings exists, use the food-truck-only view.

CREATE OR REPLACE VIEW public.bookings_unified AS
SELECT
  id::text AS id,
  provider_id,
  buyer_id,
  city_slug,
  event_date,
  status,
  total_amount_cents,
  platform_fee_cents,
  stripe_payment_intent_id,
  created_at,
  'food_truck'::text AS booking_type
FROM public.food_truck_bookings;

-- Optional: when chef_bookings exists, replace the view with:
--
-- CREATE OR REPLACE VIEW public.bookings_unified AS
-- SELECT
--   id::text,
--   provider_id,
--   buyer_id,
--   city_slug,
--   event_date,
--   status,
--   total_amount_cents,
--   platform_fee_cents,
--   stripe_payment_intent_id,
--   created_at,
--   'chef'::text AS booking_type
-- FROM public.chef_bookings
-- UNION ALL
-- SELECT
--   id::text,
--   provider_id,
--   buyer_id,
--   city_slug,
--   event_date,
--   status,
--   total_amount_cents,
--   platform_fee_cents,
--   stripe_payment_intent_id,
--   created_at,
--   'food_truck'::text AS booking_type
-- FROM public.food_truck_bookings;
