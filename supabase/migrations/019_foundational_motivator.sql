-- Migration 019: Foundational Motivator
-- Allows users to choose what grounds their accountability journey
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS foundational_motivator TEXT DEFAULT 'general'
  CHECK (foundational_motivator IN ('spiritual', 'psychological', 'relational', 'general'));
