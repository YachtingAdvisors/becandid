-- ============================================================
-- 043_daily_inventory.sql — Daily Inventory (AA Step 10)
--
-- A quick 2-minute daily self-audit — faster than a full journal.
-- "Continued to take personal inventory and when we were wrong
--  promptly admitted it."
-- ============================================================

CREATE TABLE IF NOT EXISTS daily_inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  went_well TEXT,              -- encrypted
  was_dishonest TEXT,          -- encrypted
  owe_apology TEXT,            -- encrypted
  grateful_for TEXT,           -- encrypted
  overall_rating SMALLINT CHECK (overall_rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, date)
);

CREATE INDEX idx_inventory_user ON daily_inventory(user_id, date DESC);

ALTER TABLE daily_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own inventory" ON daily_inventory
  FOR ALL USING (auth.uid() = user_id);
