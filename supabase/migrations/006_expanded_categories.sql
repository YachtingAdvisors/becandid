-- ============================================================
-- Be Candid — Migration 006: Expanded Goal Categories
-- Adds new rival categories for eating disorders, substances,
-- body image, dating, financial, and rage content.
-- ============================================================

-- Drop the old CHECK constraint on events.category
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_category_check;

-- Add expanded CHECK constraint
ALTER TABLE public.events ADD CONSTRAINT events_category_check CHECK (
  category IN (
    -- Sexual content
    'pornography', 'sexting',
    -- Compulsive consumption
    'social_media', 'binge_watching', 'impulse_shopping',
    -- Substances & recovery
    'alcohol_drugs', 'vaping_tobacco',
    -- Body image & eating disorders
    'eating_disorder', 'body_checking',
    -- Gambling & financial
    'gambling', 'sports_betting', 'day_trading',
    -- Dating
    'dating_apps',
    -- Gaming
    'gaming',
    -- Rage & outrage
    'rage_content',
    -- Other
    'custom'
  )
);

-- Note: The users.goals column is TEXT[] (no CHECK constraint),
-- so it automatically supports the new values. Validation
-- happens at the application layer via the shared types.
