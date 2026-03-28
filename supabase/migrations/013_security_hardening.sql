-- ============================================================
-- Migration 013: Security Hardening
--
-- 1. user_sessions — track active devices, enforce limits
-- 2. data_retention — automatic purge of old events (privacy)
-- 3. encryption_version — track which rows are encrypted
-- 4. Indexes for session security queries
-- ============================================================

-- ── Active sessions ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_sessions (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_hash     TEXT NOT NULL,           -- HMAC of user_agent + IP
  ip_address      TEXT,                    -- Masked in API responses
  user_agent      TEXT,                    -- Truncated to 256 chars
  platform        TEXT DEFAULT 'web' CHECK (platform IN ('web', 'ios', 'android')),
  last_active_at  TIMESTAMPTZ DEFAULT now(),
  created_at      TIMESTAMPTZ DEFAULT now(),

  UNIQUE (user_id, device_hash)
);

CREATE INDEX idx_sessions_user ON user_sessions(user_id, last_active_at DESC);

-- Auto-expire sessions after 30 days of inactivity
-- (run via pg_cron or a scheduled function)
CREATE OR REPLACE FUNCTION cleanup_stale_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM user_sessions
  WHERE last_active_at < now() - interval '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── RLS for sessions ────────────────────────────────────────
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own sessions" ON user_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users delete own sessions" ON user_sessions
  FOR DELETE USING (auth.uid() = user_id);
-- Insert/update handled by service client only (no direct user writes)

-- ── Data retention ──────────────────────────────────────────
-- Add retention_days to user preferences.
-- Users can choose how long raw events are kept.
-- Journal entries are never auto-deleted (they're reflective work).

ALTER TABLE users ADD COLUMN IF NOT EXISTS
  event_retention_days SMALLINT DEFAULT 90 CHECK (event_retention_days BETWEEN 30 AND 365);

-- Purge function — call from a weekly cron
CREATE OR REPLACE FUNCTION purge_expired_events()
RETURNS integer AS $$
DECLARE
  deleted_count integer;
BEGIN
  WITH expired AS (
    DELETE FROM events e
    USING users u
    WHERE e.user_id = u.id
      AND e.created_at < now() - (u.event_retention_days || ' days')::interval
    RETURNING e.id
  )
  SELECT count(*) INTO deleted_count FROM expired;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Encryption version tracking ─────────────────────────────
-- Allows us to know which rows need migration if we rotate keys.

ALTER TABLE stringer_journal ADD COLUMN IF NOT EXISTS
  encryption_version SMALLINT DEFAULT 0;
  -- 0 = plaintext (pre-encryption or dev)
  -- 1 = AES-256-GCM with ENCRYPTION_MASTER_KEY v1

ALTER TABLE alerts ADD COLUMN IF NOT EXISTS
  guide_encryption_version SMALLINT DEFAULT 0;

-- ── Login attempt tracking ──────────────────────────────────
-- For brute-force detection beyond rate limiting.

CREATE TABLE IF NOT EXISTS login_attempts (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email       TEXT NOT NULL,
  ip_address  TEXT NOT NULL,
  success     BOOLEAN NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_login_attempts_email ON login_attempts(email, created_at DESC);
CREATE INDEX idx_login_attempts_ip ON login_attempts(ip_address, created_at DESC);

-- Auto-purge login attempts older than 7 days
CREATE OR REPLACE FUNCTION cleanup_login_attempts()
RETURNS void AS $$
BEGIN
  DELETE FROM login_attempts WHERE created_at < now() - interval '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- No RLS on login_attempts — service client only
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
-- No SELECT policies = no user access (correct — this is internal)
