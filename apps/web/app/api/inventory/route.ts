export const dynamic = 'force-dynamic';
// ============================================================
// app/api/inventory/route.ts
//
// GET  → list inventories (decrypt). ?date=YYYY-MM-DD or ?limit=N
// POST → create/update today's inventory (upsert on user_id + date)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { encrypt, decrypt } from '@/lib/encryption';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { sanitizeText } from '@/lib/security';

// ── Encrypted fields ───────────────────────────────────────
const ENCRYPTED_FIELDS = ['went_well', 'was_dishonest', 'owe_apology', 'grateful_for'] as const;

function encryptInventory(row: Record<string, any>, userId: string) {
  const out = { ...row };
  for (const field of ENCRYPTED_FIELDS) {
    if (out[field]) out[field] = encrypt(out[field], userId);
  }
  return out;
}

function decryptInventory(row: Record<string, any>, userId: string) {
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

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const date = url.searchParams.get('date');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '30'), 100);

  const db = createServiceClient();
  let query = db
    .from('daily_inventory')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false });

  if (date) {
    query = query.eq('date', date);
  } else {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const inventories = (data || []).map((row) => decryptInventory(row, user.id));
  return NextResponse.json({ inventories });
}

// ── POST (upsert) ──────────────────────────────────────────

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

  const { went_well, was_dishonest, owe_apology, grateful_for, overall_rating, date } = body;

  // At least one text field required
  if (!went_well?.trim() && !was_dishonest?.trim() && !owe_apology?.trim() && !grateful_for?.trim()) {
    return NextResponse.json({ error: 'At least one field is required' }, { status: 400 });
  }

  if (overall_rating !== undefined && overall_rating !== null) {
    if (typeof overall_rating !== 'number' || overall_rating < 1 || overall_rating > 5) {
      return NextResponse.json({ error: 'Rating must be 1-5' }, { status: 400 });
    }
  }

  // Use provided date or today
  const inventoryDate = date || new Date().toISOString().split('T')[0];

  const raw = {
    user_id: user.id,
    date: inventoryDate,
    went_well: went_well ? sanitizeText(went_well.trim(), 1000) : null,
    was_dishonest: was_dishonest ? sanitizeText(was_dishonest.trim(), 1000) : null,
    owe_apology: owe_apology ? sanitizeText(owe_apology.trim(), 1000) : null,
    grateful_for: grateful_for ? sanitizeText(grateful_for.trim(), 1000) : null,
    overall_rating: overall_rating || null,
  };

  const encrypted = encryptInventory(raw, user.id);
  const db = createServiceClient();

  // Upsert: if entry for this date exists, update it
  const { data, error } = await db
    .from('daily_inventory')
    .upsert(encrypted, { onConflict: 'user_id,date' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ inventory: decryptInventory(data, user.id) }, { status: 201 });
}
