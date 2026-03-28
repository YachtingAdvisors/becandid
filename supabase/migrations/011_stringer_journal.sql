-- ============================================================
-- Migration 011: Stringer Journal + Reminder Preferences
--
-- The journal is the reflective core of Be Candid.
-- Entries can be:
--   1. Triggered by a relapse (alert_id links to the event)
--   2. Written on a user-set reminder schedule
--   3. Created manually anytime
--
-- Reminder preferences let users choose how often they're
-- nudged to journal and what time of day they prefer.
-- ============================================================

-- ── Journal entries ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stringer_journal (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Content (all optional, but at least one required)
  freewrite     TEXT,
  tributaries   TEXT,   -- "What preceded this moment?"
  longing       TEXT,   -- "What did you actually need?"
  roadmap       TEXT,   -- "What is this revealing?"

  -- Context
  alert_id      UUID REFERENCES alerts(id) ON DELETE SET NULL,
  trigger_type  TEXT DEFAULT 'manual' CHECK (trigger_type IN ('relapse', 'reminder', 'manual')),
  mood          SMALLINT CHECK (mood BETWEEN 1 AND 5),
  tags          TEXT[] DEFAULT '{}',

  -- The specific prompt shown in the notification (if reminder-triggered)
  prompt_shown  TEXT,

  CONSTRAINT has_content CHECK (
    freewrite IS NOT NULL OR tributaries IS NOT NULL OR
    longing IS NOT NULL OR roadmap IS NOT NULL
  )
);

CREATE INDEX idx_sj_user_date ON stringer_journal(user_id, created_at DESC);
CREATE INDEX idx_sj_alert ON stringer_journal(alert_id) WHERE alert_id IS NOT NULL;
CREATE INDEX idx_sj_tags ON stringer_journal USING GIN (tags);
CREATE INDEX idx_sj_trigger ON stringer_journal(user_id, trigger_type);

-- ── Journal reminder preferences ────────────────────────────
CREATE TABLE IF NOT EXISTS journal_preferences (
  user_id             UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  reminder_enabled    BOOLEAN DEFAULT true,
  frequency           TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'every_2_days', 'every_3_days', 'weekly')),
  preferred_hour      SMALLINT DEFAULT 20 CHECK (preferred_hour BETWEEN 0 AND 23),  -- 8 PM default
  timezone            TEXT DEFAULT 'America/New_York',
  after_relapse       BOOLEAN DEFAULT true,    -- Auto-prompt journal after relapse
  relapse_delay_min   SMALLINT DEFAULT 30,     -- Wait N minutes before prompting (let dust settle)
  last_reminder_at    TIMESTAMPTZ,
  last_relapse_prompt TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- ── RLS ─────────────────────────────────────────────────────
ALTER TABLE stringer_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own journal" ON stringer_journal
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own journal" ON stringer_journal
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own journal" ON stringer_journal
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own journal" ON stringer_journal
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users read own prefs" ON journal_preferences
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users upsert own prefs" ON journal_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own prefs" ON journal_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- ── Trust points RPC (if not already present) ───────────────
CREATE OR REPLACE FUNCTION award_trust_points(
  p_user_id UUID, p_points INT, p_reason TEXT, p_reference_id UUID DEFAULT NULL
) RETURNS void AS $$
BEGIN
  INSERT INTO trust_points (user_id, points, reason, reference_id)
  VALUES (p_user_id, p_points, p_reason, p_reference_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
