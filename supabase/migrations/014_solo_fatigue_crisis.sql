-- ============================================================
-- Migration 014: Solo Mode + Partner Fatigue
--
-- 1. Solo mode — users can use the app without a partner.
--    AI conversation guides become self-reflection guides.
--    Alerts go to the user only. Check-ins become self-check-ins.
--
-- 2. Partner fatigue tracking — monitors partner response time
--    and engagement drop-off to prevent burnout.
--
-- 3. Crisis keywords table — flagged phrases in journal entries
--    that should trigger resource display (not alert the partner).
-- ============================================================

-- ── Solo mode flag ──────────────────────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS
  solo_mode BOOLEAN DEFAULT false;

-- When solo_mode = true:
--   - Alert pipeline skips partner notification
--   - AI guide is "self-reflection" variant (no partner guide)
--   - Check-ins become self-only (no dual confirmation)
--   - Dashboard hides partner-related UI
--   - User can still invite a partner later (flips solo_mode off)

-- ── Partner fatigue tracking ────────────────────────────────
ALTER TABLE partners ADD COLUMN IF NOT EXISTS
  avg_response_hours REAL;  -- Rolling average response time

ALTER TABLE partners ADD COLUMN IF NOT EXISTS
  alerts_this_week INTEGER DEFAULT 0;

ALTER TABLE partners ADD COLUMN IF NOT EXISTS
  last_engagement_at TIMESTAMPTZ;

ALTER TABLE partners ADD COLUMN IF NOT EXISTS
  fatigue_warning_sent BOOLEAN DEFAULT false;

-- Track individual alert response times
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS
  partner_viewed_at TIMESTAMPTZ;

ALTER TABLE alerts ADD COLUMN IF NOT EXISTS
  partner_responded_at TIMESTAMPTZ;

-- ── Offline event queue (for mobile sync) ───────────────────
CREATE TABLE IF NOT EXISTS event_queue (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payload       JSONB NOT NULL,         -- Full event data
  queued_at     TIMESTAMPTZ NOT NULL,   -- When the event was captured offline
  synced_at     TIMESTAMPTZ,            -- When it was successfully synced
  sync_attempts INTEGER DEFAULT 0,
  last_error    TEXT,
  status        TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'synced', 'failed'))
);

CREATE INDEX idx_event_queue_user ON event_queue(user_id, status);

ALTER TABLE event_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own queue" ON event_queue
  FOR ALL USING (auth.uid() = user_id);

-- ── Crisis resource keywords ────────────────────────────────
-- These are checked against journal freewrite text.
-- If matched, the app shows crisis resources — NOT partner alerts.
-- This is about user safety, not surveillance.

CREATE TABLE IF NOT EXISTS crisis_keywords (
  id        SERIAL PRIMARY KEY,
  phrase    TEXT NOT NULL UNIQUE,
  severity  TEXT DEFAULT 'show_resources' CHECK (severity IN ('show_resources', 'urgent')),
  resource  TEXT  -- Which resource to display
);

INSERT INTO crisis_keywords (phrase, severity, resource) VALUES
  ('want to die', 'urgent', '988_suicide_lifeline'),
  ('kill myself', 'urgent', '988_suicide_lifeline'),
  ('end my life', 'urgent', '988_suicide_lifeline'),
  ('suicidal', 'urgent', '988_suicide_lifeline'),
  ('self harm', 'show_resources', 'crisis_text_line'),
  ('self-harm', 'show_resources', 'crisis_text_line'),
  ('cutting myself', 'show_resources', 'crisis_text_line'),
  ('hurting myself', 'show_resources', 'crisis_text_line'),
  ('no reason to live', 'urgent', '988_suicide_lifeline'),
  ('better off dead', 'urgent', '988_suicide_lifeline'),
  ('worthless', 'show_resources', 'general_crisis'),
  ('hopeless', 'show_resources', 'general_crisis')
ON CONFLICT (phrase) DO NOTHING;
