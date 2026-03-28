-- ============================================================
-- Migration 015: Conversation Outcomes, Therapist Portal,
--                Multi-Partner, Subscriptions
-- ============================================================

-- ── Conversation outcomes ───────────────────────────────────
-- Both user and partner rate how the conversation went.
-- This closes the loop on alerts and builds a growth narrative.

CREATE TABLE IF NOT EXISTS conversation_outcomes (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id          UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- User's self-assessment
  user_rating       SMALLINT CHECK (user_rating BETWEEN 1 AND 5),
  user_felt         TEXT CHECK (user_felt IN ('heard', 'defensive', 'relieved', 'ashamed', 'hopeful', 'angry', 'grateful', 'numb')),
  user_notes        TEXT,
  user_completed_at TIMESTAMPTZ,

  -- Partner's assessment
  partner_rating       SMALLINT CHECK (partner_rating BETWEEN 1 AND 5),
  partner_felt         TEXT CHECK (partner_felt IN ('helpful', 'frustrated', 'connected', 'worried', 'hopeful', 'overwhelmed', 'grateful', 'unsure')),
  partner_notes        TEXT,
  partner_completed_at TIMESTAMPTZ,

  -- AI-generated reflection after both complete
  ai_reflection     TEXT,

  created_at        TIMESTAMPTZ DEFAULT now(),

  UNIQUE (alert_id)
);

CREATE INDEX idx_outcomes_user ON conversation_outcomes(user_id, created_at DESC);

ALTER TABLE conversation_outcomes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own outcomes" ON conversation_outcomes
  FOR ALL USING (auth.uid() = user_id);

-- ── Therapist connections ───────────────────────────────────
-- Users can grant a therapist read-only access to their:
--   - Journal entries (decrypted)
--   - Mood timeline
--   - Focus streaks
--   - Conversation outcome history
-- Therapists NEVER see: raw events, URLs, partner info, push content

CREATE TABLE IF NOT EXISTS therapist_connections (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  therapist_email TEXT NOT NULL,
  therapist_name  TEXT,
  invite_token    TEXT NOT NULL UNIQUE,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked')),

  -- Granular consent — user picks what the therapist can see
  can_see_journal    BOOLEAN DEFAULT true,
  can_see_moods      BOOLEAN DEFAULT true,
  can_see_streaks    BOOLEAN DEFAULT true,
  can_see_outcomes   BOOLEAN DEFAULT true,
  can_see_patterns   BOOLEAN DEFAULT false,  -- Off by default (more sensitive)

  therapist_user_id  UUID REFERENCES users(id) ON DELETE SET NULL,
  accepted_at        TIMESTAMPTZ,
  revoked_at         TIMESTAMPTZ,
  created_at         TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_therapist_user ON therapist_connections(user_id, status);
CREATE INDEX idx_therapist_token ON therapist_connections(invite_token) WHERE status = 'pending';

ALTER TABLE therapist_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own connections" ON therapist_connections
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Therapists read accepted connections" ON therapist_connections
  FOR SELECT USING (auth.uid() = therapist_user_id AND status = 'accepted');

-- ── Multi-partner support ───────────────────────────────────
-- Remove the implicit single-partner assumption.
-- Users can now have up to 3 active partners.
-- Each partner can be assigned specific categories.

ALTER TABLE partners ADD COLUMN IF NOT EXISTS
  assigned_categories TEXT[] DEFAULT '{}';
  -- Empty = all categories (default, backward compatible)
  -- Populated = only alert for these categories

ALTER TABLE partners ADD COLUMN IF NOT EXISTS
  priority SMALLINT DEFAULT 1 CHECK (priority BETWEEN 1 AND 3);
  -- 1 = primary (gets all alerts)
  -- 2 = secondary (gets alerts only when primary is fatigued)
  -- 3 = backup (gets weekly digest only)

-- ── Subscription / billing ──────────────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS
  stripe_customer_id TEXT;

ALTER TABLE users ADD COLUMN IF NOT EXISTS
  subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro', 'therapy'));

ALTER TABLE users ADD COLUMN IF NOT EXISTS
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'past_due', 'canceled', 'trialing'));

ALTER TABLE users ADD COLUMN IF NOT EXISTS
  trial_ends_at TIMESTAMPTZ;

-- ── Weekly AI reflection cache ──────────────────────────────
CREATE TABLE IF NOT EXISTS weekly_reflections (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start  DATE NOT NULL,
  reflection  TEXT NOT NULL,  -- Encrypted AI-generated narrative
  mood_avg    REAL,
  entry_count INTEGER,
  created_at  TIMESTAMPTZ DEFAULT now(),

  UNIQUE (user_id, week_start)
);

ALTER TABLE weekly_reflections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own reflections" ON weekly_reflections
  FOR SELECT USING (auth.uid() = user_id);
