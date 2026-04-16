export const dynamic = 'force-dynamic';
// ============================================================
// app/api/commitments/route.ts
//
// GET   — today's commitment + last 7 days (decrypted)
// POST  — set morning intention (upsert on user_id + date)
// PATCH — add evening reflection + intention_met boolean
//
// Implementation intentions (Gollwitzer, 1999): specific plans
// dramatically increase follow-through. The morning ritual
// creates the plan; the evening review builds self-awareness.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { encrypt, decrypt } from '@/lib/encryption';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { safeError } from '@/lib/security';

function todayDateStr(tz: string): string {
  try {
    return new Date().toLocaleDateString('en-CA', { timeZone: tz });
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

function sevenDaysAgoStr(tz: string): string {
  const d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  try {
    return d.toLocaleDateString('en-CA', { timeZone: tz });
  } catch {
    return d.toISOString().split('T')[0];
  }
}

// ── GET ────────────────────────────────────────────────────

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Get user timezone
    const { data: profile } = await supabase
      .from('users')
      .select('timezone')
      .eq('id', user.id)
      .single();

    const tz = profile?.timezone || 'America/New_York';
    const today = todayDateStr(tz);
    const weekAgo = sevenDaysAgoStr(tz);

    const { data: commitments, error } = await supabase
      .from('daily_commitments')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', weekAgo)
      .lte('date', today)
      .order('date', { ascending: false });

    if (error) return safeError('GET /api/commitments', error);

    // Decrypt all fields
    const decrypted = (commitments || []).map((c) => ({
      ...c,
      morning_intention: c.morning_intention ? decrypt(c.morning_intention, user.id) : null,
      evening_reflection: c.evening_reflection ? decrypt(c.evening_reflection, user.id) : null,
    }));

    // Calculate streak
    let streak = 0;
    const sorted = [...decrypted].sort((a, b) => b.date.localeCompare(a.date));
    for (const c of sorted) {
      if (c.intention_met === true) streak++;
      else break;
    }

    return NextResponse.json({
      today: decrypted.find((c) => c.date === today) || null,
      history: decrypted,
      streak,
      todayDate: today,
    });
  } catch (err) {
    return safeError('GET /api/commitments', err);
  }
}

// ── POST — set morning intention ───────────────────────────

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = await checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

  const { intention } = body as { intention: string };
  if (!intention?.trim() || intention.trim().length > 500) {
    return NextResponse.json({ error: 'Intention is required (max 500 chars)' }, { status: 400 });
  }

  try {
    const { data: profile } = await supabase
      .from('users')
      .select('timezone')
      .eq('id', user.id)
      .single();

    const tz = profile?.timezone || 'America/New_York';
    const today = todayDateStr(tz);

    const { error } = await supabase
      .from('daily_commitments')
      .upsert({
        user_id: user.id,
        date: today,
        morning_intention: encrypt(intention.trim(), user.id),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,date' });

    if (error) return safeError('POST /api/commitments', error);

    return NextResponse.json({ ok: true, date: today });
  } catch (err) {
    return safeError('POST /api/commitments', err);
  }
}

// ── PATCH — add evening reflection ─────────────────────────

export async function PATCH(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = await checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

  const { reflection, intention_met } = body as {
    reflection?: string;
    intention_met: boolean;
  };

  if (typeof intention_met !== 'boolean') {
    return NextResponse.json({ error: 'intention_met (boolean) is required' }, { status: 400 });
  }
  if (reflection && reflection.length > 2000) {
    return NextResponse.json({ error: 'Reflection must be under 2000 characters' }, { status: 400 });
  }

  try {
    const { data: profile } = await supabase
      .from('users')
      .select('timezone')
      .eq('id', user.id)
      .single();

    const tz = profile?.timezone || 'America/New_York';
    const today = todayDateStr(tz);

    // Must have a morning intention first
    const { data: existing } = await supabase
      .from('daily_commitments')
      .select('id')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json(
        { error: 'Set a morning intention first' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('daily_commitments')
      .update({
        evening_reflection: reflection ? encrypt(reflection.trim(), user.id) : null,
        intention_met,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('date', today);

    if (error) return safeError('PATCH /api/commitments', error);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return safeError('PATCH /api/commitments', err);
  }
}
