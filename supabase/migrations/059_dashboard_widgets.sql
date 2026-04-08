-- 057: Add dashboard_widgets column for customizable widget layout
-- NULL = use computed defaults based on goals/motivator (backward compatible)
-- When set, contains an ordered JSON array of widget IDs
ALTER TABLE users ADD COLUMN IF NOT EXISTS dashboard_widgets JSONB DEFAULT NULL;
