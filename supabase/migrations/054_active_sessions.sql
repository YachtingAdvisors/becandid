-- ============================================================
-- Migration 054: Active Sessions — browser/OS/device columns
--
-- Adds parsed device metadata to user_sessions so the settings
-- page can show human-readable session info without parsing
-- user_agent strings on every read.
-- ============================================================

ALTER TABLE public.user_sessions
  ADD COLUMN IF NOT EXISTS device_name TEXT,
  ADD COLUMN IF NOT EXISTS browser TEXT,
  ADD COLUMN IF NOT EXISTS os TEXT;

-- Backfill from existing user_agent where possible
UPDATE public.user_sessions
SET
  browser = CASE
    WHEN user_agent ILIKE '%Firefox%' THEN 'Firefox'
    WHEN user_agent ILIKE '%Edg/%' THEN 'Edge'
    WHEN user_agent ILIKE '%OPR/%' OR user_agent ILIKE '%Opera%' THEN 'Opera'
    WHEN user_agent ILIKE '%Chrome%' AND user_agent NOT ILIKE '%Edg/%' THEN 'Chrome'
    WHEN user_agent ILIKE '%Safari%' AND user_agent NOT ILIKE '%Chrome%' THEN 'Safari'
    ELSE 'Unknown'
  END,
  os = CASE
    WHEN user_agent ILIKE '%iPhone%' THEN 'iOS'
    WHEN user_agent ILIKE '%iPad%' THEN 'iPadOS'
    WHEN user_agent ILIKE '%Android%' THEN 'Android'
    WHEN user_agent ILIKE '%Mac OS%' THEN 'macOS'
    WHEN user_agent ILIKE '%Windows%' THEN 'Windows'
    WHEN user_agent ILIKE '%Linux%' THEN 'Linux'
    WHEN user_agent ILIKE '%CrOS%' THEN 'ChromeOS'
    ELSE 'Unknown'
  END,
  device_name = CASE
    WHEN user_agent ILIKE '%iPhone%' THEN 'iPhone'
    WHEN user_agent ILIKE '%iPad%' THEN 'iPad'
    WHEN user_agent ILIKE '%Android%' AND user_agent ILIKE '%Mobile%' THEN 'Android Phone'
    WHEN user_agent ILIKE '%Android%' THEN 'Android Tablet'
    WHEN user_agent ILIKE '%Mac OS%' THEN 'Mac'
    WHEN user_agent ILIKE '%Windows%' THEN 'Windows PC'
    WHEN user_agent ILIKE '%Linux%' THEN 'Linux'
    WHEN user_agent ILIKE '%CrOS%' THEN 'Chromebook'
    ELSE 'Unknown Device'
  END
WHERE browser IS NULL AND user_agent IS NOT NULL;
