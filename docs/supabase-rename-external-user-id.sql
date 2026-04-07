-- SpiceKrewe — Rename legacy column
-- Run in Supabase SQL editor
-- ONLY run this if the pemabu_user_id
-- column exists in your profiles table.
-- Check first:
--   SELECT column_name
--   FROM information_schema.columns
--   WHERE table_name = 'profiles'
--   AND column_name = 'pemabu_user_id';
--
-- If the query returns a row, run:

ALTER TABLE public.profiles
  RENAME COLUMN pemabu_user_id
  TO external_user_id;

-- If the column does not exist,
-- you may need to add it:
-- ALTER TABLE public.profiles
--   ADD COLUMN IF NOT EXISTS
--   external_user_id text;

-- After running, verify:
--   SELECT column_name
--   FROM information_schema.columns
--   WHERE table_name = 'profiles'
--   AND column_name = 'external_user_id';
