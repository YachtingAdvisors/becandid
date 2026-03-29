-- ============================================================
-- Migration 020: Content Filtering
-- Adds content_rules table for per-user block/allow rules,
-- content_filter_log for audit trail, and content_filter_level
-- column on users.
-- ============================================================

-- ── Content rules (per-user block/allow) ─────────────────────

CREATE TABLE IF NOT EXISTS content_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('block', 'allow')),
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, domain, rule_type)
);

CREATE INDEX idx_content_rules_user ON content_rules(user_id);
ALTER TABLE content_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own rules" ON content_rules
  FOR ALL USING (auth.uid() = user_id);

-- ── Content filter log (audit trail) ─────────────────────────

CREATE TABLE IF NOT EXISTS content_filter_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  domain TEXT,
  app_name TEXT,
  category TEXT,
  action TEXT NOT NULL CHECK (action IN ('blocked', 'flagged', 'allowed')),
  confidence REAL,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_filter_log_user ON content_filter_log(user_id, created_at DESC);
ALTER TABLE content_filter_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own filter log" ON content_filter_log
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service inserts filter log" ON content_filter_log
  FOR INSERT WITH CHECK (true);

-- ── Add filter level to users ────────────────────────────────

ALTER TABLE users ADD COLUMN IF NOT EXISTS content_filter_level TEXT DEFAULT 'standard'
  CHECK (content_filter_level IN ('off', 'standard', 'strict', 'custom'));
