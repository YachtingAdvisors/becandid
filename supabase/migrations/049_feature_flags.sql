-- ============================================================
-- 049_feature_flags.sql
-- Feature flags table for admin-controlled feature toggles.
-- ============================================================

CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  enabled BOOLEAN DEFAULT false,
  description TEXT,
  updated_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Service role only
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Seed default flags
INSERT INTO feature_flags (key, enabled, description) VALUES
  ('coach_enabled', true, 'Enable the Conversation Coach feature'),
  ('community_feed', true, 'Enable the anonymous community feed'),
  ('groups_enabled', true, 'Enable group accountability'),
  ('mentorship_enabled', true, 'Enable mentor matching'),
  ('voice_journal', true, 'Enable voice journaling'),
  ('fasting_challenges', true, 'Enable digital fasting'),
  ('family_systems', true, 'Enable family systems analysis'),
  ('push_notifications', false, 'Enable web push notifications'),
  ('desktop_downloads', false, 'Enable desktop app downloads')
ON CONFLICT (key) DO NOTHING;
