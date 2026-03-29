-- ============================================================
-- Migration 021: Teen Mode & Guardian System
-- ============================================================

-- Account mode
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_mode TEXT DEFAULT 'adult'
  CHECK (account_mode IN ('adult', 'teen'));

-- Guardians table
CREATE TABLE IF NOT EXISTS guardians (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guardian_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  teen_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL CHECK (relationship IN ('parent', 'guardian', 'counselor', 'mentor')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'revoked')),
  permissions JSONB NOT NULL DEFAULT '{"view_events": true, "view_journal": false, "manage_content_filter": true, "manage_screen_time": true, "receive_alerts": true, "manage_settings": false}',
  invite_token TEXT UNIQUE,
  invited_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (guardian_user_id, teen_user_id)
);

CREATE INDEX IF NOT EXISTS idx_guardians_teen ON guardians(teen_user_id, status);
CREATE INDEX IF NOT EXISTS idx_guardians_guardian ON guardians(guardian_user_id, status);
ALTER TABLE guardians ENABLE ROW LEVEL SECURITY;

-- Both guardian and teen can see the relationship
CREATE POLICY "Users view own guardian relationships" ON guardians
  FOR SELECT USING (auth.uid() = guardian_user_id OR auth.uid() = teen_user_id);
CREATE POLICY "Service manages guardians" ON guardians
  FOR ALL USING (true) WITH CHECK (true);

-- Screen time rules
CREATE TABLE IF NOT EXISTS screen_time_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'all',
  daily_limit_minutes INTEGER,
  downtime_start TIME,
  downtime_end TIME,
  days_of_week INTEGER[] DEFAULT '{0,1,2,3,4,5,6}',
  enforced BOOLEAN DEFAULT false, -- Guardian-locked
  created_by UUID REFERENCES users(id), -- Who set this rule
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_screen_rules_user ON screen_time_rules(user_id);
ALTER TABLE screen_time_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own screen time rules" ON screen_time_rules
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service manages screen time rules" ON screen_time_rules
  FOR ALL USING (true) WITH CHECK (true);

-- Screen time usage tracking
CREATE TABLE IF NOT EXISTS screen_time_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL DEFAULT 'all',
  minutes_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, date, category)
);

CREATE INDEX IF NOT EXISTS idx_screen_usage_user_date ON screen_time_usage(user_id, date DESC);
ALTER TABLE screen_time_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own usage" ON screen_time_usage
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service manages usage" ON screen_time_usage
  FOR ALL USING (true) WITH CHECK (true);
