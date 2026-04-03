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

-- Extend trust_points action CHECK to include daily_challenge
ALTER TABLE public.trust_points DROP CONSTRAINT IF EXISTS trust_points_action_check;
ALTER TABLE public.trust_points ADD CONSTRAINT trust_points_action_check CHECK (
  action IN (
    'focused_morning',
    'focused_evening',
    'focused_full_day',
    'check_in_completed',
    'conversation_done',
    'conversation_positive',
    'milestone_reached',
    'partner_encouraged',
    'streak_bonus_7',
    'streak_bonus_30',
    'streak_bonus_90',
    'manual_adjustment',
    'daily_challenge'
  )
);
