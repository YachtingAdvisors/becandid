-- ============================================================
-- 065 — Screenshot / Event Retention Cleanup
--
-- Adds a scheduled function to delete old screen_capture events
-- and stale event data based on the user's plan retention period.
--
-- Screenshots are processed in-memory and never stored as files,
-- but the events table accumulates metadata rows from screen
-- capture analysis. This policy ensures old rows are pruned.
--
-- Run via pg_cron (if available) or an external cron job calling:
--   SELECT cleanup_old_events();
-- ============================================================

-- Function to clean up old events based on plan retention days
CREATE OR REPLACE FUNCTION public.cleanup_old_events()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER := 0;
  free_cutoff TIMESTAMPTZ;
  paid_cutoff TIMESTAMPTZ;
BEGIN
  -- Free plan: 90-day retention
  free_cutoff := now() - INTERVAL '90 days';
  -- Paid plan: 365-day retention
  paid_cutoff := now() - INTERVAL '365 days';

  -- Delete old events for free-plan users
  WITH free_users AS (
    SELECT id FROM public.users
    WHERE COALESCE(subscription_plan, 'free') = 'free'
  )
  DELETE FROM public.events
  WHERE user_id IN (SELECT id FROM free_users)
    AND timestamp < free_cutoff;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  -- Delete old events for paid-plan users
  WITH paid_users AS (
    SELECT id FROM public.users
    WHERE subscription_plan IN ('pro', 'therapy')
  )
  DELETE FROM public.events
  WHERE user_id IN (SELECT id FROM paid_users)
    AND timestamp < paid_cutoff;
  GET DIAGNOSTICS deleted_count = deleted_count + ROW_COUNT;

  -- Also clean up orphaned alerts whose events were deleted
  DELETE FROM public.alerts
  WHERE event_id NOT IN (SELECT id FROM public.events);

  RAISE LOG '[retention] Cleaned up % old event rows', deleted_count;
  RETURN deleted_count;
END;
$$;

-- Lock down permissions: only service_role (used by pg_cron / backend) can call this
REVOKE ALL ON FUNCTION public.cleanup_old_events() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_old_events() TO service_role;

-- Schedule via pg_cron if available (runs daily at 3:00 AM UTC)
-- If pg_cron is not enabled, call cleanup_old_events() from an
-- external cron job (e.g., Supabase Edge Function or server cron).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'cleanup-old-events',
      '0 3 * * *',
      'SELECT public.cleanup_old_events()'
    );
  ELSE
    RAISE NOTICE 'pg_cron not available — schedule cleanup_old_events() externally';
  END IF;
END;
$$;
