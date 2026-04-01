-- Quote favorites — lets users bookmark motivational quotes
CREATE TABLE IF NOT EXISTS quote_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quote_text TEXT NOT NULL,
  quote_author TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, quote_text)
);

CREATE INDEX idx_quote_favs_user ON quote_favorites(user_id);

ALTER TABLE quote_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own favorites" ON quote_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service manages favorites" ON quote_favorites FOR ALL USING (true) WITH CHECK (true);
