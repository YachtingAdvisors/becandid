export const dynamic = 'force-dynamic';
// ============================================================
// app/api/screen-time/usage/route.ts
//
// GET  → Get usage data (date range, category filter)
// POST → Record usage (from mobile app)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { getUsage, recordUsage, getTodayUsage } from '@/lib/screenTime';

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const startDate = url.searchParams.get('start');
  const endDate = url.searchParams.get('end');

  // If no date range, return today's summary
  if (!startDate || !endDate) {
    const today = await getTodayUsage(user.id);
    return NextResponse.json({ usage: today });
  }

  const usage = await getUsage(user.id, startDate, endDate);
  return NextResponse.json({ usage });
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  const body = await req.json().catch(() => null);
  if (!body?.category || typeof body.minutes !== 'number' || body.minutes < 0) {
    return NextResponse.json(
      { error: 'Missing or invalid category/minutes' },
      { status: 400 }
    );
  }

  try {
    await recordUsage(user.id, body.category, body.minutes, body.date);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to record usage' }, { status: 500 });
  }
}
