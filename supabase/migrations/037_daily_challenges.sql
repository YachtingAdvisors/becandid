-- Daily Challenge System
-- Users receive one challenge per day to build healthy habits

CREATE TABLE IF NOT EXISTS daily_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  challenge_text TEXT NOT NULL,
  challenge_type TEXT CHECK (challenge_type IN ('journal', 'connection', 'mindfulness', 'physical', 'gratitude')),
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  points_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, date)
);

CREATE INDEX idx_daily_challenges_user ON daily_challenges(user_id, date DESC);

ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own challenges"
  ON daily_challenges FOR ALL USING (auth.uid() = user_id);
