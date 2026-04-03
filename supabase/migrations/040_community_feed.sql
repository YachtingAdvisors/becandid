-- ============================================================
-- 040: Community Feed — anonymous wins & encouragement board
-- ============================================================

CREATE TABLE IF NOT EXISTS community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  anonymous_name TEXT NOT NULL,
  content TEXT NOT NULL,
  post_type TEXT DEFAULT 'win' CHECK (post_type IN ('win', 'milestone', 'encouragement', 'gratitude')),
  hearts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS community_hearts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (post_id, user_id)
);

CREATE INDEX idx_community_posts ON community_posts(created_at DESC);
CREATE INDEX idx_community_hearts_post ON community_hearts(post_id);

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_hearts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read posts" ON community_posts FOR SELECT USING (true);
CREATE POLICY "Users manage own posts" ON community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own posts delete" ON community_posts FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can read hearts" ON community_hearts FOR SELECT USING (true);
CREATE POLICY "Users manage own hearts" ON community_hearts FOR ALL USING (auth.uid() = user_id);
