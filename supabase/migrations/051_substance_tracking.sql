-- Stores the specific substances each user is tracking
-- Users with alcohol_drugs or vaping_tobacco in their goals
-- can specify exactly which substances to monitor for
ALTER TABLE users ADD COLUMN IF NOT EXISTS tracked_substances TEXT[] DEFAULT '{}';
-- e.g., ['alcohol', 'marijuana', 'cocaine', 'opioids', 'vaping', 'cigarettes']
