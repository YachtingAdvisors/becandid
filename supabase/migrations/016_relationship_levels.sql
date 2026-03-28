-- ============================================================
-- Migration 016: Relationship Level System
--
-- A shared relationship level between user and partner that
-- grows through natural interactions. Nothing is required —
-- the level reflects how actively both people are investing.
--
-- XP flows in from both sides:
--   USER earns XP for: focused days, journal entries, check-in
--     responses, conversation participation, sending encouragement
--   PARTNER earns XP for: viewing alerts, completing conversation
--     guides, confirming check-ins, sending encouragement
--   BOTH earn XP for: completing a conversation (both sides rated)
--
-- Bonus multipliers reward streaks and consistency, not perfection.
-- ============================================================

-- ── Relationship XP ledger ──────────────────────────────────
-- Every XP-earning action creates a row. The sum is the total XP.
-- We track who earned it (user or partner) for display balance.

CREATE TABLE IF NOT EXISTS relationship_xp (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id    UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  earned_by     TEXT NOT NULL CHECK (earned_by IN ('user', 'partner')),
  amount        INTEGER NOT NULL,
  reason        TEXT NOT NULL,
  bonus         BOOLEAN DEFAULT false,  -- true = optional action (journal, encouragement)
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_rxp_partner ON relationship_xp(partner_id, created_at DESC);
CREATE INDEX idx_rxp_partner_sum ON relationship_xp(partner_id);

ALTER TABLE relationship_xp ENABLE ROW LEVEL SECURITY;

-- Both user and partner can see relationship XP
CREATE POLICY "Users see own relationship xp" ON relationship_xp
  FOR SELECT USING (
    partner_id IN (
      SELECT id FROM partners WHERE user_id = auth.uid() OR partner_user_id = auth.uid()
    )
  );

-- ── Relationship level cache ────────────────────────────────
-- Cached for fast reads. Updated by the XP award function.

ALTER TABLE partners ADD COLUMN IF NOT EXISTS
  relationship_xp     INTEGER DEFAULT 0;

ALTER TABLE partners ADD COLUMN IF NOT EXISTS
  relationship_level   SMALLINT DEFAULT 1;

ALTER TABLE partners ADD COLUMN IF NOT EXISTS
  level_title          TEXT DEFAULT 'New Connection';

ALTER TABLE partners ADD COLUMN IF NOT EXISTS
  xp_streak_days       SMALLINT DEFAULT 0;  -- Consecutive days both earned XP

ALTER TABLE partners ADD COLUMN IF NOT EXISTS
  longest_xp_streak    SMALLINT DEFAULT 0;

-- ── XP award function ───────────────────────────────────────

CREATE OR REPLACE FUNCTION award_relationship_xp(
  p_partner_id UUID,
  p_earned_by TEXT,
  p_amount INTEGER,
  p_reason TEXT,
  p_bonus BOOLEAN DEFAULT false,
  p_metadata JSONB DEFAULT '{}'
) RETURNS TABLE(new_xp INTEGER, new_level SMALLINT, new_title TEXT, leveled_up BOOLEAN) AS $$
DECLARE
  v_old_level SMALLINT;
  v_new_level SMALLINT;
  v_new_xp INTEGER;
  v_title TEXT;
BEGIN
  -- Get current level
  SELECT relationship_level INTO v_old_level FROM partners WHERE id = p_partner_id;

  -- Insert XP record
  INSERT INTO relationship_xp (partner_id, earned_by, amount, reason, bonus, metadata)
  VALUES (p_partner_id, p_earned_by, p_amount, p_reason, p_bonus, p_metadata);

  -- Calculate new total
  SELECT COALESCE(SUM(amount), 0) INTO v_new_xp
  FROM relationship_xp WHERE partner_id = p_partner_id;

  -- Calculate level from XP thresholds
  v_new_level := CASE
    WHEN v_new_xp >= 10000 THEN 10
    WHEN v_new_xp >= 7000 THEN 9
    WHEN v_new_xp >= 5000 THEN 8
    WHEN v_new_xp >= 3500 THEN 7
    WHEN v_new_xp >= 2500 THEN 6
    WHEN v_new_xp >= 1500 THEN 5
    WHEN v_new_xp >= 900 THEN 4
    WHEN v_new_xp >= 500 THEN 3
    WHEN v_new_xp >= 200 THEN 2
    ELSE 1
  END;

  v_title := CASE v_new_level
    WHEN 1 THEN 'New Connection'
    WHEN 2 THEN 'Getting Started'
    WHEN 3 THEN 'Building Trust'
    WHEN 4 THEN 'Growing Together'
    WHEN 5 THEN 'Steady Ground'
    WHEN 6 THEN 'Deep Roots'
    WHEN 7 THEN 'Proven Bond'
    WHEN 8 THEN 'Iron Sharpens Iron'
    WHEN 9 THEN 'Unshakeable'
    WHEN 10 THEN 'Covenant'
    ELSE 'New Connection'
  END;

  -- Update cache
  UPDATE partners SET
    relationship_xp = v_new_xp,
    relationship_level = v_new_level,
    level_title = v_title
  WHERE id = p_partner_id;

  RETURN QUERY SELECT v_new_xp, v_new_level, v_title, (v_new_level > v_old_level);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
