-- ============================================================
-- Migration 034: Family Systems Analysis & Therapist Notes
--
-- Adds tables for:
--   1. family_systems_notes — therapist clinical notes on
--      family-of-origin dynamics, parenting style observations,
--      and counseling notes that feed back into AI analysis
--   2. can_see_family_systems consent toggle on therapist_connections
-- ============================================================

-- ── Therapist family systems notes ─────────────────────────
-- Therapists can record observations about each dynamic,
-- confirm/deny predicted dynamics, and add clinical notes.

CREATE TABLE IF NOT EXISTS family_systems_notes (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  therapist_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  connection_id   UUID NOT NULL REFERENCES therapist_connections(id) ON DELETE CASCADE,

  -- Which dynamic this note relates to (nullable for general notes)
  dynamic         TEXT CHECK (dynamic IS NULL OR dynamic IN (
    'rigidity', 'enmeshment', 'triangulation',
    'dismissiveness', 'abdication', 'incongruence'
  )),

  -- Therapist's clinical assessment
  confirmed       BOOLEAN,           -- true = therapist confirms this dynamic is present
  confidence_override SMALLINT CHECK (confidence_override IS NULL OR confidence_override BETWEEN 0 AND 100),
  parenting_style  TEXT CHECK (parenting_style IS NULL OR parenting_style IN (
    'authoritarian', 'enmeshed', 'uninvolved', 'permissive',
    'conflict_driven', 'performative'
  )),

  -- Freeform clinical notes (encrypted at application layer)
  note            TEXT NOT NULL,

  -- Categorization
  note_type       TEXT DEFAULT 'observation' CHECK (note_type IN (
    'observation',        -- general clinical observation
    'family_history',     -- family-of-origin history
    'attachment_pattern', -- attachment style observation
    'treatment_note',     -- treatment planning / progress
    'dynamic_assessment'  -- assessment of a specific dynamic
  )),

  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_family_notes_user ON family_systems_notes(user_id, created_at DESC);
CREATE INDEX idx_family_notes_therapist ON family_systems_notes(therapist_id);
CREATE INDEX idx_family_notes_dynamic ON family_systems_notes(user_id, dynamic) WHERE dynamic IS NOT NULL;

ALTER TABLE family_systems_notes ENABLE ROW LEVEL SECURITY;

-- Therapists can manage their own notes for connected clients
CREATE POLICY "Therapists manage own notes" ON family_systems_notes
  FOR ALL USING (auth.uid() = therapist_id);

-- Users can see notes about themselves (read-only)
CREATE POLICY "Users read own family notes" ON family_systems_notes
  FOR SELECT USING (auth.uid() = user_id);

-- ── Add consent toggle to therapist_connections ────────────
ALTER TABLE therapist_connections ADD COLUMN IF NOT EXISTS
  can_see_family_systems BOOLEAN DEFAULT false;
  -- Off by default — family systems data is sensitive
