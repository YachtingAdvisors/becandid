export const dynamic = 'force-dynamic';

/**
 * POST /api/heartbeat — Desktop app pings this every 2 minutes
 * GET  /api/heartbeat — Dashboard checks if app is alive (last heartbeat < 5 min)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/authFromRequest';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { isIsolationOnlyUser } from '@/lib/isolationMode';

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = createServiceClient();
  const now = new Date().toISOString();

  // For isolation-only users, still accept the heartbeat (to know they're alive)
  // but don't require the desktop app — they don't need screen scanning.
  const { data: profileData } = await db
    .from('users')
    .select('goals')
    .eq('id', user.id)
    .single();

  const goals: string[] = profileData?.goals ?? [];
  const isolationOnly = isIsolationOnlyUser(goals);

  const { data, error, count } = await db
    .from('users')
    .update({ last_heartbeat: now })
    .eq('id', user.id)
    .select('id, email');

  if (error) {
    console.error('[heartbeat POST] Update failed for user', user.id, ':', error.message);
    return NextResponse.json({ ok: false, error: error.message, user_id: user.id });
  }

  const rowsUpdated = data?.length ?? 0;
  if (rowsUpdated === 0) {
    console.error('[heartbeat POST] No rows updated. User ID:', user.id, 'Email:', user.email);
    return NextResponse.json({ ok: false, error: 'User not found in public.users', user_id: user.id, email: user.email });
  }

  return NextResponse.json({ ok: true, user_id: user.id, email: user.email, rows_updated: rowsUpdated, isolation_only: isolationOnly });
}

export async function GET(req: NextRequest) {
  // Try cookie auth first (web dashboard), then Bearer token
  let userId: string | null = null;

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) userId = user.id;
  } catch {}

  if (!userId) {
    const user = await getUserFromRequest(req);
    if (user) userId = user.id;
  }

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized', app_running: false }, { status: 401 });
  }

  const db = createServiceClient();

  // Try with last_heartbeat column
  const { data, error } = await db
    .from('users')
    .select('email, last_heartbeat, monitoring_enabled, goals')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('[heartbeat GET] Query error:', error.message);
    return NextResponse.json({
      app_running: false,
      monitoring_enabled: true,
      last_heartbeat: null,
      debug: error.message,
    });
  }

  const lastHeartbeat = data?.last_heartbeat ? new Date(data.last_heartbeat).getTime() : 0;
  const fiveMinAgo = Date.now() - 5 * 60 * 1000;
  const appRunning = lastHeartbeat > fiveMinAgo;

  // Detect possible account mismatch: the user has a heartbeat record but it's
  // stale, which may indicate the desktop app is signed into a different account.
  // We intentionally do NOT query other users to avoid leaking email addresses.
  const mismatch = !appRunning && lastHeartbeat > 0;

  // Isolation-only users don't need the desktop app at all
  const userGoals: string[] = data?.goals ?? [];
  const isolationOnly = isIsolationOnlyUser(userGoals);

  return NextResponse.json({
    app_running: appRunning,
    monitoring_enabled: data?.monitoring_enabled ?? false,
    last_heartbeat: data?.last_heartbeat ?? null,
    mismatch,
    isolation_only: isolationOnly,
  });
}
