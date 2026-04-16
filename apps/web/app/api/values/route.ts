export const dynamic = 'force-dynamic';
// ============================================================
// app/api/values/route.ts
//
// GET  — list user's values sorted by rank (decrypt rival_conflict)
// POST — save/replace values (array of { value_name, rank, rival_conflict })
//
// Values clarification exercise grounded in Motivational
// Interviewing (Miller & Rollnick): surfacing the discrepancy
// between what the user values and what the rival costs them.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { encrypt, decrypt } from '@/lib/encryption';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { safeError } from '@/lib/security';

// ── GET ────────────────────────────────────────────────────

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { data: values, error } = await supabase
      .from('user_values')
      .select('*')
      .eq('user_id', user.id)
      .order('rank', { ascending: true });

    if (error) return safeError('GET /api/values', error);

    // Decrypt rival_conflict for each value
    const decrypted = (values || []).map((v) => ({
      ...v,
      rival_conflict: v.rival_conflict ? decrypt(v.rival_conflict, user.id) : null,
    }));

    return NextResponse.json({ values: decrypted });
  } catch (err) {
    return safeError('GET /api/values', err);
  }
}

// ── POST ───────────────────────────────────────────────────

interface ValueInput {
  value_name: string;
  rank: number;
  rival_conflict?: string;
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = await checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

  const { values } = body as { values: ValueInput[] };
  if (!Array.isArray(values) || values.length === 0 || values.length > 10) {
    return NextResponse.json({ error: 'Provide 1-10 values' }, { status: 400 });
  }

  // Validate each value
  for (const v of values) {
    if (!v.value_name?.trim() || typeof v.rank !== 'number' || v.rank < 1 || v.rank > 10) {
      return NextResponse.json({ error: 'Each value needs a name and rank (1-10)' }, { status: 400 });
    }
    if (v.rival_conflict && v.rival_conflict.length > 2000) {
      return NextResponse.json({ error: 'Conflict description must be under 2000 characters' }, { status: 400 });
    }
  }

  try {
    // Delete existing values and replace with new set
    await supabase.from('user_values').delete().eq('user_id', user.id);

    const rows = values.map((v) => ({
      user_id: user.id,
      value_name: v.value_name.trim(),
      rank: v.rank,
      rival_conflict: v.rival_conflict ? encrypt(v.rival_conflict.trim(), user.id) : null,
    }));

    const { error } = await supabase.from('user_values').insert(rows);
    if (error) return safeError('POST /api/values', error);

    return NextResponse.json({ ok: true, count: rows.length });
  } catch (err) {
    return safeError('POST /api/values', err);
  }
}
