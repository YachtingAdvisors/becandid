export const dynamic = 'force-dynamic';

// ============================================================
// GET  /api/connection-events — Fetch 7-day connection data
// POST /api/connection-events — Log a new connection event
//
// Used by the IsolationCheck dashboard card to track daily
// connection activity for users fighting isolation.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { safeError } from '@/lib/security';

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = createServiceClient();
  const now = new Date();

  // Build last 7 days array (newest first)
  const days: { date: string; hasConnection: boolean }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push({ date: d.toISOString().split('T')[0], hasConnection: false });
  }

  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: events } = await db
    .from('connection_events')
    .select('created_at, connection_type')
    .eq('user_id', user.id)
    .gte('created_at', sevenDaysAgo);

  // Mark days that have connections
  const connectedDates = new Set(
    (events ?? []).map((e: { created_at: string }) => e.created_at.split('T')[0]),
  );
  for (const day of days) {
    day.hasConnection = connectedDates.has(day.date);
  }

  // Today's logged types
  const todayStr = now.toISOString().split('T')[0];
  const todayTypes = (events ?? [])
    .filter((e: { created_at: string }) => e.created_at.split('T')[0] === todayStr)
    .map((e: { connection_type: string }) => e.connection_type);

  return NextResponse.json({ week: days, todayTypes });
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  const body = await req.json();
  const type = body?.type;

  const validTypes = ['text', 'call', 'in_person'];
  if (!type || !validTypes.includes(type)) {
    return NextResponse.json({ error: 'Invalid connection type' }, { status: 400 });
  }

  const db = createServiceClient();

  const { error } = await db.from('connection_events').insert({
    user_id: user.id,
    connection_type: type,
    created_at: new Date().toISOString(),
  });

  if (error) {
    return safeError('POST /api/connection-events', error);
  }

  return NextResponse.json({ ok: true });
}
