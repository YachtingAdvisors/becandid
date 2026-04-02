export const dynamic = 'force-dynamic';
// ============================================================
// app/api/therapist/family-systems/route.ts
//
// POST   → create a family systems note for a client
// PATCH  → update an existing note
// DELETE → remove a note
//
// Therapists can record clinical observations about family
// dynamics, confirm/deny predicted patterns, and add notes
// that feed back into the AI analysis engine.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { safeError, sanitizeText } from '@/lib/security';
import { encrypt } from '@/lib/encryption';

const VALID_DYNAMICS = [
  'rigidity', 'enmeshment', 'triangulation',
  'dismissiveness', 'abdication', 'incongruence',
];

const VALID_NOTE_TYPES = [
  'observation', 'family_history', 'attachment_pattern',
  'treatment_note', 'dynamic_assessment',
];

const VALID_PARENTING_STYLES = [
  'authoritarian', 'enmeshed', 'uninvolved',
  'permissive', 'conflict_driven', 'performative',
];

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  const db = createServiceClient();
  const body = await req.json();
  const { client_id, dynamic: dynamicType, confirmed, confidence_override, parenting_style, note, note_type } = body;

  if (!client_id || !note) {
    return NextResponse.json({ error: 'client_id and note are required' }, { status: 400 });
  }

  // Verify therapist has an accepted connection with family systems access
  const { data: connection } = await db.from('therapist_connections')
    .select('id, can_see_family_systems')
    .eq('therapist_user_id', user.id)
    .eq('user_id', client_id)
    .eq('status', 'accepted')
    .single();

  if (!connection) {
    return NextResponse.json({ error: 'No active connection to this client' }, { status: 403 });
  }

  if (!connection.can_see_family_systems) {
    return NextResponse.json({ error: 'Client has not granted family systems access' }, { status: 403 });
  }

  // Validate optional fields
  if (dynamicType && !VALID_DYNAMICS.includes(dynamicType)) {
    return NextResponse.json({ error: `Invalid dynamic. Must be one of: ${VALID_DYNAMICS.join(', ')}` }, { status: 400 });
  }

  if (note_type && !VALID_NOTE_TYPES.includes(note_type)) {
    return NextResponse.json({ error: `Invalid note_type. Must be one of: ${VALID_NOTE_TYPES.join(', ')}` }, { status: 400 });
  }

  if (parenting_style && !VALID_PARENTING_STYLES.includes(parenting_style)) {
    return NextResponse.json({ error: `Invalid parenting_style` }, { status: 400 });
  }

  if (confidence_override != null && (confidence_override < 0 || confidence_override > 100)) {
    return NextResponse.json({ error: 'confidence_override must be 0-100' }, { status: 400 });
  }

  // Encrypt the note content
  const encryptedNote = encrypt(sanitizeText(note, 5000), client_id);

  const { data: created, error } = await db.from('family_systems_notes').insert({
    user_id: client_id,
    therapist_id: user.id,
    connection_id: connection.id,
    dynamic: dynamicType || null,
    confirmed: confirmed ?? null,
    confidence_override: confidence_override ?? null,
    parenting_style: parenting_style || null,
    note: encryptedNote,
    note_type: note_type || 'observation',
  }).select('id, created_at').single();

  if (error) return NextResponse.json({ error: safeError(error) }, { status: 500 });

  return NextResponse.json({ id: created.id, created_at: created.created_at });
}

export async function PATCH(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  const db = createServiceClient();
  const body = await req.json();
  const { note_id, ...updates } = body;

  if (!note_id) {
    return NextResponse.json({ error: 'note_id is required' }, { status: 400 });
  }

  // Verify ownership
  const { data: existing } = await db.from('family_systems_notes')
    .select('id, user_id, therapist_id')
    .eq('id', note_id)
    .eq('therapist_id', user.id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: 'Note not found or not yours' }, { status: 404 });
  }

  const patch: Record<string, any> = { updated_at: new Date().toISOString() };

  if (updates.note) patch.note = encrypt(sanitizeText(updates.note), existing.user_id);
  if (updates.dynamic !== undefined) {
    if (updates.dynamic && !VALID_DYNAMICS.includes(updates.dynamic)) {
      return NextResponse.json({ error: 'Invalid dynamic' }, { status: 400 });
    }
    patch.dynamic = updates.dynamic || null;
  }
  if (updates.confirmed !== undefined) patch.confirmed = updates.confirmed;
  if (updates.confidence_override !== undefined) patch.confidence_override = updates.confidence_override;
  if (updates.parenting_style !== undefined) patch.parenting_style = updates.parenting_style || null;
  if (updates.note_type !== undefined) {
    if (!VALID_NOTE_TYPES.includes(updates.note_type)) {
      return NextResponse.json({ error: 'Invalid note_type' }, { status: 400 });
    }
    patch.note_type = updates.note_type;
  }

  const { error } = await db.from('family_systems_notes')
    .update(patch)
    .eq('id', note_id);

  if (error) return NextResponse.json({ error: safeError(error) }, { status: 500 });

  return NextResponse.json({ updated: true });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = createServiceClient();
  const url = new URL(req.url);
  const noteId = url.searchParams.get('note_id');

  if (!noteId) {
    return NextResponse.json({ error: 'note_id is required' }, { status: 400 });
  }

  const { error } = await db.from('family_systems_notes')
    .delete()
    .eq('id', noteId)
    .eq('therapist_id', user.id);

  if (error) return NextResponse.json({ error: safeError(error) }, { status: 500 });

  return NextResponse.json({ deleted: true });
}
