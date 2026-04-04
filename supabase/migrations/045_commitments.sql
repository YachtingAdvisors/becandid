-- ============================================================
-- 045_commitments.sql — Daily commitment ritual (Gollwitzer)
--
-- Implementation intentions: morning commitment + evening
-- reflection. Based on Gollwitzer's research showing that
-- specific if-then plans dramatically increase goal attainment.
-- ============================================================

CREATE TABLE IF NOT EXISTS daily_commitments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  morning_intention TEXT,     -- encrypted: "Today I commit to..."
  evening_reflection TEXT,    -- encrypted: "Did I live my intention?"
  intention_met BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, date)
);

CREATE INDEX idx_commitments_user ON daily_commitments(user_id, date DESC);

ALTER TABLE daily_commitments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own commitments"
  ON daily_commitments FOR ALL
  USING (auth.uid() = user_id);
