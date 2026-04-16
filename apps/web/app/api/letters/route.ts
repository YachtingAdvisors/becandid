export const dynamic = 'force-dynamic';
// ============================================================
// app/api/letters/route.ts
//
// GET    → list letters (?undelivered=true&limit=N)
// POST   → create a new sealed letter
// PATCH  → mark a letter as delivered
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { safeError } from '@/lib/security';
import { encrypt, decrypt } from '@/lib/encryption';

// ── GET ────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const undelivered = url.searchParams.get('undelivered') === 'true';
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);

  const db = supabase;
  let query = db.from('future_letters').select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (undelivered) {
    query = query.is('delivered_at', null);
    // For undelivered, return oldest first (FIFO delivery)
    query = db.from('future_letters').select('*')
      .eq('user_id', user.id)
      .is('delivered_at', null)
      .order('created_at', { ascending: true })
      .limit(limit);
  }

  const { data: letters, error } = await query;
  if (error) return safeError('GET /api/letters', error);

  // Decrypt logic:
  // - Delivered letters: always show content
  // - Undelivered + ?undelivered=true (relapse modal): decrypt for display
  // - Undelivered on general list: hide content (sealed)
  const decrypted = (letters || []).map((l) => ({
    ...l,
    letter: (l.delivered_at || undelivered)
      ? decrypt(l.letter, user.id)
      : undefined,
  }));

  return NextResponse.json({ letters: decrypted });
}

// ── POST ───────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = await checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

  const { letter, written_mood } = body;
  if (!letter?.trim()) {
    return NextResponse.json({ error: 'Letter content is required' }, { status: 400 });
  }
  if (letter.trim().length > 5000) {
    return NextResponse.json({ error: 'Letter must be under 5000 characters' }, { status: 400 });
  }
  if (written_mood != null && (written_mood < 1 || written_mood > 5)) {
    return NextResponse.json({ error: 'Mood must be between 1 and 5' }, { status: 400 });
  }

  const db = supabase;
  const { data: letterRow, error } = await db.from('future_letters').insert({
    user_id: user.id,
    letter: encrypt(letter.trim(), user.id),
    written_mood: written_mood || null,
    sealed_at: new Date().toISOString(),
  }).select().single();

  if (error) return safeError('POST /api/letters', error);

  return NextResponse.json({ letter: { ...letterRow, letter: undefined } }, { status: 201 });
}

// ── PATCH ──────────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = await checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

  const { id, delivery_trigger } = body;
  if (!id) return NextResponse.json({ error: 'Letter id is required' }, { status: 400 });

  const validTriggers = ['relapse_journal', 'manual_open'];
  if (!delivery_trigger || !validTriggers.includes(delivery_trigger)) {
    return NextResponse.json({ error: 'Invalid delivery_trigger' }, { status: 400 });
  }

  const db = supabase;

  // Verify ownership and that it hasn't been delivered yet
  const { data: existing } = await db.from('future_letters').select('id, delivered_at')
    .eq('id', id).eq('user_id', user.id).single();

  if (!existing) return NextResponse.json({ error: 'Letter not found' }, { status: 404 });
  if (existing.delivered_at) return NextResponse.json({ error: 'Letter already delivered' }, { status: 400 });

  const { data: updated, error } = await db.from('future_letters')
    .update({
      delivered_at: new Date().toISOString(),
      delivery_trigger,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return safeError('PATCH /api/letters', error);

  return NextResponse.json({
    letter: { ...updated, letter: decrypt(updated.letter, user.id) },
  });
}
