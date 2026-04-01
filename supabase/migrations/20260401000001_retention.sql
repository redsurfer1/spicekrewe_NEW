-- Soft delete support: add deleted_at to briefs table
ALTER TABLE public.briefs
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Data retention policy: auto-soft-delete cancelled/closed
-- briefs after 2 years and audit_logs after 7 years
-- These run as Supabase scheduled functions (pg_cron)

-- Brief retention: soft-delete cancelled/closed briefs older
-- than 2 years (keeps legal record, removes from active views)
CREATE OR REPLACE FUNCTION public.apply_brief_retention()
RETURNS void AS $$
BEGIN
  UPDATE public.briefs
  SET deleted_at = NOW()
  WHERE status IN ('cancelled', 'closed')
    AND created_at < NOW() - INTERVAL '2 years'
    AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Audit log retention: hard delete logs older than 7 years
-- (SOC2 requires 1 year minimum; 7 years is ISO best practice)
CREATE OR REPLACE FUNCTION public.apply_audit_log_retention()
RETURNS void AS $$
BEGIN
  DELETE FROM public.audit_logs
  WHERE created_at < NOW() - INTERVAL '7 years';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Schedule via pg_cron (runs monthly)
-- Note: pg_cron must be enabled in Supabase Extensions
SELECT cron.schedule('brief-retention',
  '0 2 1 * *', 'SELECT public.apply_brief_retention()');
SELECT cron.schedule('audit-log-retention',
  '0 3 1 * *', 'SELECT public.apply_audit_log_retention()');

-- Update RLS on briefs to exclude soft-deleted rows
-- from all standard queries
DROP POLICY IF EXISTS "briefs_active_only" ON public.briefs;
CREATE POLICY "briefs_active_only" ON public.briefs
  FOR SELECT USING (deleted_at IS NULL OR auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  ));

