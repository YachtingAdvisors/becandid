-- ============================================================
-- 044_values.sql — User values clarification (Miller & Rollnick MI)
--
-- Periodic exercise: users identify and rank core values,
-- then articulate how their rival conflicts with each value.
-- Creates cognitive dissonance — a core Motivational
-- Interviewing technique for change talk.
-- ============================================================

CREATE TABLE IF NOT EXISTS user_values (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  value_name TEXT NOT NULL,
  rank SMALLINT NOT NULL,  -- 1 = most important
  rival_conflict TEXT,     -- encrypted: how this value conflicts with their rival
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, value_name)
);

CREATE INDEX idx_user_values ON user_values(user_id, rank);

ALTER TABLE user_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own values"
  ON user_values FOR ALL
  USING (auth.uid() = user_id);
