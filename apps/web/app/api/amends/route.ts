export const dynamic = 'force-dynamic';
// ============================================================
// app/api/amends/route.ts
//
// GET    → list user's amends (decrypt all fields)
// POST   → create amend entry (encrypt sensitive fields)
// PATCH  → update status, notes, or mark as completed
// DELETE → remove an amend entry
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { encrypt, decrypt } from '@/lib/encryption';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { sanitizeText, safeError } from '@/lib/security';

// ── Encrypted fields ───────────────────────────────────────
const ENCRYPTED_FIELDS = ['person_name', 'relationship', 'what_happened', 'what_to_say', 'notes'] as const;

function encryptAmend(row: Record<string, any>, userId: string) {
  const out = { ...row };
  for (const field of ENCRYPTED_FIELDS) {
    if (out[field]) out[field] = encrypt(out[field], userId);
  }
  return out;
}

function decryptAmend(row: Record<string, any>, userId: string) {
  const out = { ...row };
  for (const field of ENCRYPTED_FIELDS) {
    if (out[field]) {
      try { out[field] = decrypt(out[field], userId); }
      catch { out[field] = '[encrypted]'; }
    }
  }
  return out;
}

// ── GET ─────────────────────────────────────────────────────

export async function GET(_req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = createServiceClient();
  const { data, error } = await db
    .from('amends')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return safeError('GET /api/amends', error);

  const amends = (data || []).map((row) => decryptAmend(row, user.id));
  return NextResponse.json({ amends });
}

// ── POST ────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

  const { person_name, relationship, what_happened, what_to_say, amend_type, notes } = body;
  if (!person_name?.trim()) {
    return NextResponse.json({ error: 'Person name is required' }, { status: 400 });
  }

  const VALID_TYPES = ['direct', 'indirect', 'living', 'not_appropriate'];
  if (amend_type && !VALID_TYPES.includes(amend_type)) {
    return NextResponse.json({ error: 'Invalid amend type' }, { status: 400 });
  }

  const raw = {
    user_id: user.id,
    person_name: sanitizeText(person_name.trim(), 200),
    relationship: relationship ? sanitizeText(relationship.trim(), 100) : null,
    what_happened: what_happened ? sanitizeText(what_happened.trim(), 2000) : null,
    what_to_say: what_to_say ? sanitizeText(what_to_say.trim(), 2000) : null,
    amend_type: amend_type || 'direct',
    notes: notes ? sanitizeText(notes.trim(), 2000) : null,
  };

  const encrypted = encryptAmend(raw, user.id);
  const db = createServiceClient();
  const { data, error } = await db.from('amends').insert(encrypted).select().single();
  if (error) return safeError('POST /api/amends', error);

  return NextResponse.json({ amend: decryptAmend(data, user.id) }, { status: 201 });
}

// ── PATCH ───────────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  const body = await req.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { id, person_name, relationship, what_happened, what_to_say, amend_type, status, therapist_reviewed, notes } = body;

  const VALID_STATUSES = ['identified', 'planned', 'made', 'in_progress'];
  const VALID_TYPES = ['direct', 'indirect', 'living', 'not_appropriate'];
  if (status && !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }
  if (amend_type && !VALID_TYPES.includes(amend_type)) {
    return NextResponse.json({ error: 'Invalid amend type' }, { status: 400 });
  }

  const update: Record<string, any> = { updated_at: new Date().toISOString() };

  if (person_name !== undefined) update.person_name = sanitizeText(person_name.trim(), 200);
  if (relationship !== undefined) update.relationship = relationship ? sanitizeText(relationship.trim(), 100) : null;
  if (what_happened !== undefined) update.what_happened = what_happened ? sanitizeText(what_happened.trim(), 2000) : null;
  if (what_to_say !== undefined) update.what_to_say = what_to_say ? sanitizeText(what_to_say.trim(), 2000) : null;
  if (amend_type !== undefined) update.amend_type = amend_type;
  if (status !== undefined) {
    update.status = status;
    if (status === 'made') update.completed_at = new Date().toISOString();
  }
  if (therapist_reviewed !== undefined) update.therapist_reviewed = !!therapist_reviewed;
  if (notes !== undefined) update.notes = notes ? sanitizeText(notes.trim(), 2000) : null;

  const encrypted = encryptAmend(update, user.id);
  const db = createServiceClient();
  const { data, error } = await db
    .from('amends')
    .update(encrypted)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return safeError('PATCH /api/amends', error);
  return NextResponse.json({ amend: decryptAmend(data, user.id) });
}

// ── DELETE ──────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const db = createServiceClient();
  const { error } = await db.from('amends').delete().eq('id', id).eq('user_id', user.id);
  if (error) return safeError('DELETE /api/amends', error);

  return NextResponse.json({ deleted: true });
}
