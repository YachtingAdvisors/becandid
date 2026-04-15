-- ============================================================
-- 069_neural_priming.sql
--
-- Adds a dedicated column for the Neural Priming journal prompt
-- (self-directed neural priming: writing about the future self
-- in past tense to activate memory-recall neural networks).
-- ============================================================

ALTER TABLE stringer_journal
  ADD COLUMN IF NOT EXISTS neural_priming TEXT;

-- Update the has_content constraint to include the new column
ALTER TABLE stringer_journal
  DROP CONSTRAINT IF EXISTS has_content;

ALTER TABLE stringer_journal
  ADD CONSTRAINT has_content CHECK (
    freewrite      IS NOT NULL OR
    tributaries    IS NOT NULL OR
    longing        IS NOT NULL OR
    roadmap        IS NOT NULL OR
    neural_priming IS NOT NULL
  );

COMMENT ON COLUMN stringer_journal.neural_priming IS
  'Self-directed neural priming entry: user writes about their future '
  'free-from-struggle self in past tense, activating memory-recall '
  'neural networks to strengthen belief and reduce resistance to change.';
