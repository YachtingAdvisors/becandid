-- ============================================================
-- 042_amends.sql — Amends Tracker (AA Steps 8-9)
--
-- A guided process for identifying people affected by past
-- behavior and planning/tracking amends.
-- ============================================================

CREATE TABLE IF NOT EXISTS amends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  person_name TEXT NOT NULL,        -- encrypted
  relationship TEXT,                -- encrypted (e.g., "wife", "friend", "coworker")
  what_happened TEXT,               -- encrypted
  what_to_say TEXT,                 -- encrypted
  amend_type TEXT DEFAULT 'direct' CHECK (amend_type IN ('direct', 'indirect', 'living', 'not_appropriate')),
  status TEXT DEFAULT 'identified' CHECK (status IN ('identified', 'planned', 'made', 'in_progress')),
  therapist_reviewed BOOLEAN DEFAULT false,
  notes TEXT,                       -- encrypted
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_amends_user ON amends(user_id, status);

ALTER TABLE amends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own amends" ON amends
  FOR ALL USING (auth.uid() = user_id);
