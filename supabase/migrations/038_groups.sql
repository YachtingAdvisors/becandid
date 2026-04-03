-- ============================================================
-- 038: Accountability Groups
-- Small groups (3-5) with anonymized focus boards and check-ins
-- ============================================================

-- Accountability groups
CREATE TABLE IF NOT EXISTS accountability_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invite_code TEXT NOT NULL UNIQUE,
  max_members SMALLINT DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES accountability_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,  -- anonymized name (e.g., "Member A")
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (group_id, user_id)
);

CREATE TABLE IF NOT EXISTS group_checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES accountability_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mood SMALLINT CHECK (mood BETWEEN 1 AND 5),
  message TEXT,  -- encrypted
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_group_members ON group_members(group_id);
CREATE INDEX idx_group_members_user ON group_members(user_id);
CREATE INDEX idx_group_checkins ON group_checkins(group_id, created_at DESC);

ALTER TABLE accountability_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members access own groups" ON accountability_groups
  FOR ALL USING (id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));
CREATE POLICY "Members access group data" ON group_members
  FOR ALL USING (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));
CREATE POLICY "Members access group checkins" ON group_checkins
  FOR ALL USING (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));
