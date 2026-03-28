-- ============================================================
-- Migration 017: Spouse Experience
--
-- When the accountability partner is a spouse, the dynamic is
-- fundamentally different. The spouse isn't a neutral observer —
-- they're a co-sufferer. Every flag represents a breach of trust
-- in their most intimate relationship.
--
-- This migration adds:
--   1. Spouse journal — their own reflection space
--   2. Impact check-ins — how the spouse is feeling
--   3. Committed Contender milestones — honoring the spouse's choice to stay
--   4. Relational health tracking — shared view of the relationship's trajectory
-- ============================================================

-- ── Spouse journal ──────────────────────────────────────────
-- The spouse gets their own journal. Different prompts, different
-- purpose. Their entries are NEVER visible to the monitored user
-- unless the spouse explicitly shares a specific entry.

CREATE TABLE IF NOT EXISTS spouse_journal (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  spouse_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  partner_id    UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Content
  freewrite     TEXT,
  impact        TEXT,      -- "How is this affecting me right now?"
  needs         TEXT,      -- "What do I need — from myself, from them, from God?"
  boundaries    TEXT,      -- "What boundaries do I need to hold or set?"

  -- Context
  triggered_by_alert UUID REFERENCES alerts(id) ON DELETE SET NULL,
  mood          SMALLINT CHECK (mood BETWEEN 1 AND 5),
  tags          TEXT[] DEFAULT '{}',

  -- Sharing
  shared_with_partner BOOLEAN DEFAULT false,  -- Spouse chooses to share
  shared_at           TIMESTAMPTZ,

  CONSTRAINT spouse_has_content CHECK (
    freewrite IS NOT NULL OR impact IS NOT NULL OR
    needs IS NOT NULL OR boundaries IS NOT NULL
  )
);

CREATE INDEX idx_sj_spouse ON spouse_journal(spouse_user_id, created_at DESC);
CREATE INDEX idx_sj_partner ON spouse_journal(partner_id);

ALTER TABLE spouse_journal ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Spouse reads own journal" ON spouse_journal
  FOR SELECT USING (auth.uid() = spouse_user_id);
CREATE POLICY "Spouse writes own journal" ON spouse_journal
  FOR INSERT WITH CHECK (auth.uid() = spouse_user_id);
CREATE POLICY "Spouse updates own journal" ON spouse_journal
  FOR UPDATE USING (auth.uid() = spouse_user_id);
CREATE POLICY "Spouse deletes own journal" ON spouse_journal
  FOR DELETE USING (auth.uid() = spouse_user_id);

-- Partner can ONLY see entries explicitly shared
CREATE POLICY "User sees shared spouse entries" ON spouse_journal
  FOR SELECT USING (
    shared_with_partner = true AND
    partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid())
  );

-- ── Spouse impact check-ins ─────────────────────────────────
-- Periodic emotional snapshots from the spouse. Tracks how
-- they're feeling over time. Used in the weekly digest and
-- shown to the user (with spouse's consent) to build empathy.

CREATE TABLE IF NOT EXISTS spouse_impact (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  spouse_user_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  partner_id      UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT now(),

  -- Emotional state (multiple select)
  feelings        TEXT[] DEFAULT '{}',
  -- Options: hurt, angry, numb, anxious, hopeful, exhausted,
  --          betrayed, lonely, determined, loved, confused, healing

  -- Trust meter (1-10)
  trust_level     SMALLINT CHECK (trust_level BETWEEN 1 AND 10),

  -- Safety (does the spouse feel safe in the relationship?)
  feels_safe      BOOLEAN,

  -- Optional reflection
  reflection      TEXT,

  -- Consent: show to partner?
  visible_to_partner BOOLEAN DEFAULT false
);

CREATE INDEX idx_si_spouse ON spouse_impact(spouse_user_id, created_at DESC);

ALTER TABLE spouse_impact ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Spouse manages own impact" ON spouse_impact
  FOR ALL USING (auth.uid() = spouse_user_id);
CREATE POLICY "User sees consented impact" ON spouse_impact
  FOR SELECT USING (
    visible_to_partner = true AND
    partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid())
  );

-- ── Committed Contender milestones ──────────────────────────
-- Honors the spouse's choice to stay and fight for the relationship.
-- These are EARNED — not given. They represent real engagement.

CREATE TABLE IF NOT EXISTS contender_milestones (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  spouse_user_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  milestone_key   TEXT NOT NULL,
  achieved_at     TIMESTAMPTZ DEFAULT now(),

  UNIQUE (spouse_user_id, milestone_key)
);

ALTER TABLE contender_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Spouse sees own milestones" ON contender_milestones
  FOR SELECT USING (auth.uid() = spouse_user_id);

-- ── Add spouse-specific fields to partners table ────────────

ALTER TABLE partners ADD COLUMN IF NOT EXISTS
  spouse_journal_enabled BOOLEAN DEFAULT false;

ALTER TABLE partners ADD COLUMN IF NOT EXISTS
  spouse_impact_frequency TEXT DEFAULT 'weekly'
    CHECK (spouse_impact_frequency IN ('daily', 'every_3_days', 'weekly', 'after_alerts'));

ALTER TABLE partners ADD COLUMN IF NOT EXISTS
  spouse_contender_level SMALLINT DEFAULT 0;

ALTER TABLE partners ADD COLUMN IF NOT EXISTS
  spouse_trust_trend TEXT DEFAULT 'unknown'
    CHECK (spouse_trust_trend IN ('unknown', 'declining', 'stable', 'rebuilding'));
