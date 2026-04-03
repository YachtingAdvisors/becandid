-- ============================================================
-- 041: Mentorship — sponsor/mentor matching system
-- ============================================================

CREATE TABLE IF NOT EXISTS mentors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  display_name TEXT NOT NULL,
  bio TEXT,
  specialties TEXT[] DEFAULT '{}',
  max_mentees SMALLINT DEFAULT 3,
  active BOOLEAN DEFAULT true,
  streak_at_signup INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mentorship_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  mentee_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'ended')),
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  UNIQUE (mentor_id, mentee_user_id)
);

CREATE INDEX idx_mentors_active ON mentors(active) WHERE active = true;
CREATE INDEX idx_mentorship_mentee ON mentorship_connections(mentee_user_id);

ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read mentors" ON mentors FOR SELECT USING (active = true);
CREATE POLICY "Users manage own mentor profile" ON mentors FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own connections" ON mentorship_connections FOR SELECT USING (
  mentee_user_id = auth.uid() OR mentor_id IN (SELECT id FROM mentors WHERE user_id = auth.uid())
);
CREATE POLICY "Users manage own connections" ON mentorship_connections FOR ALL USING (
  mentee_user_id = auth.uid() OR mentor_id IN (SELECT id FROM mentors WHERE user_id = auth.uid())
);
