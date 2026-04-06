-- ============================================================
-- 046 — Pre-generated coaching content library
--
-- Stores warm, Stringer-grounded coaching responses for the
-- hybrid static-first Conversation Coach. Content is served
-- from an in-memory TypeScript constant at runtime; this table
-- exists for future admin editing and analytics.
-- ============================================================

CREATE TABLE IF NOT EXISTS coaching_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,          -- GoalCategory (pornography, gambling, etc.) or 'general'
  tag TEXT,                        -- journal tag (loneliness, stress, etc.) or NULL for category-wide
  phase TEXT NOT NULL CHECK (phase IN ('tributaries', 'longing', 'roadmap', 'opening', 'affirmation')),
  family_dynamic TEXT,             -- optional: rigidity, enmeshment, etc.
  mood_range TEXT,                 -- optional: 'low' (1-2), 'mid' (3), 'high' (4-5)
  content TEXT NOT NULL,           -- the coaching response text
  follow_up_question TEXT,         -- a follow-up question to keep the conversation going
  content_type TEXT DEFAULT 'coach' CHECK (content_type IN ('coach', 'starter', 'affirmation', 'crisis')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_coaching_category ON coaching_content(category, phase);
CREATE INDEX idx_coaching_tag ON coaching_content(category, tag, phase);
CREATE INDEX idx_coaching_type ON coaching_content(content_type);
