-- 026_fasting.sql — Fasting feature: time-limited restrictions on activities

CREATE TABLE IF NOT EXISTS fasts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,  -- can be a goal category or custom text like "news", "reddit", "twitter"
  label TEXT NOT NULL,     -- user-facing name like "Reading the News"
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,  -- set when fast completes successfully
  broken_at TIMESTAMPTZ,     -- set if user breaks the fast
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fasts_user ON fasts(user_id);
CREATE INDEX idx_fasts_active ON fasts(user_id, ends_at) WHERE completed_at IS NULL AND broken_at IS NULL;

ALTER TABLE fasts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own fasts" ON fasts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service manages fasts" ON fasts FOR ALL USING (true) WITH CHECK (true);
