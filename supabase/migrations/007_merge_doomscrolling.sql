-- ============================================================
-- Be Candid — Migration 007: Merge doomscrolling → social_media
-- For any users who had 'doomscrolling' in their goals array,
-- replace it with 'social_media' (deduplicating if both exist).
-- ============================================================

-- Replace doomscrolling with social_media in goals arrays
UPDATE public.users
SET goals = array_remove(goals, 'doomscrolling')
WHERE 'doomscrolling' = ANY(goals)
  AND 'social_media' = ANY(goals);

-- For users who had doomscrolling but NOT social_media
UPDATE public.users
SET goals = array_replace(goals, 'doomscrolling', 'social_media')
WHERE 'doomscrolling' = ANY(goals);

-- Migrate any existing events with category 'doomscrolling'
UPDATE public.events
SET category = 'social_media'
WHERE category = 'doomscrolling';

-- Migrate focus segments that tracked doomscrolling
UPDATE public.focus_segments
SET categories = array_remove(categories, 'doomscrolling')
WHERE 'doomscrolling' = ANY(categories)
  AND 'social_media' = ANY(categories);

UPDATE public.focus_segments
SET categories = array_replace(categories, 'doomscrolling', 'social_media')
WHERE 'doomscrolling' = ANY(categories);
