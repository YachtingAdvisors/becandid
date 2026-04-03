-- Future Letters: "Letter to My Future Self"
-- Users write letters during moments of clarity/strength.
-- Letters are sealed (encrypted) and surfaced during relapse-triggered journal entries.

CREATE TABLE IF NOT EXISTS future_letters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  letter TEXT NOT NULL,          -- encrypted
  written_mood SMALLINT CHECK (written_mood BETWEEN 1 AND 5),
  sealed_at TIMESTAMPTZ DEFAULT now(),
  delivered_at TIMESTAMPTZ,     -- NULL until surfaced during relapse
  delivery_trigger TEXT,         -- 'relapse_journal' | 'manual_open'
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_future_letters_user ON future_letters(user_id, delivered_at);
ALTER TABLE future_letters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own letters" ON future_letters FOR ALL USING (auth.uid() = user_id);
