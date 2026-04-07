-- Add coach_schedule JSONB column to users table
-- Stores: { hour: 20, minute: 0, frequency: 'weekly', day: 'sunday' }
ALTER TABLE users ADD COLUMN IF NOT EXISTS coach_schedule JSONB;
