export const dynamic = 'force-dynamic';

/**
 * POST /api/heartbeat — Desktop app pings this every 2 minutes
 * GET  /api/heartbeat — Dashboard checks if app is alive (last heartbeat < 5 min)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getUserFromRequest } from '@/lib/authFromRequest';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { isNonScanUser } from '@/lib/isolationMode';
import { safeError } from '@/lib/security';

function emailHash(email: string): string {
  return createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
}

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
  const isolationOnly = isNonScanUser(goals);

  // Store a hash of the authenticated email alongside the timestamp.
  // The GET endpoint uses this to detect desktop/web account mismatch.
  const hash = user.email ? emailHash(user.email) : null;

  const { data, error, count } = await db
    .from('users')
    .update({ last_heartbeat: now, last_heartbeat_email_hash: hash })
    .eq('id', user.id)
    .select('id');

  if (error) {
    console.error('[heartbeat POST] Update failed for user', user.id, ':', error.message);
    return safeError('heartbeat POST', error);
  }

  const rowsUpdated = data?.length ?? 0;
  if (rowsUpdated === 0) {
    console.error('[heartbeat POST] No rows updated. User ID:', user.id, 'Email:', user.email);
    return NextResponse.json(
      { ok: false, error: 'Heartbeat update failed — no rows matched', retry: true },
      { status: 200, headers: { 'X-Heartbeat-Status': 'update-missed' } }
    );
  }

  return NextResponse.json({ ok: true, rows_updated: rowsUpdated, isolation_only: isolationOnly });
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
    .select('email, last_heartbeat, last_heartbeat_email_hash, monitoring_enabled, goals')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('[heartbeat GET] Query error:', error.message);
    return NextResponse.json({
      app_running: false,
      monitoring_enabled: true,
      last_heartbeat: null,
    });
  }

  const lastHeartbeat = data?.last_heartbeat ? new Date(data.last_heartbeat).getTime() : 0;
  const fiveMinAgo = Date.now() - 5 * 60 * 1000;
  const appRunning = lastHeartbeat > fiveMinAgo;

  // Real mismatch detection: the desktop app stores a hash of the email it's
  // signed in as on every heartbeat POST. We compare that to the hash of the
  // web session's email. A mismatch is certain only when the desktop is actively
  // running (fresh heartbeat within 5 min) AND the hashes differ — meaning a
  // different account sent that heartbeat. No emails are ever compared directly.
  const webHash = data?.email ? emailHash(data.email) : null;
  const desktopHash = data?.last_heartbeat_email_hash ?? null;
  const mismatch =
    appRunning &&
    webHash !== null &&
    desktopHash !== null &&
    webHash !== desktopHash;

  // Isolation-only users don't need the desktop app at all
  const userGoals: string[] = data?.goals ?? [];
  const isolationOnly = isNonScanUser(userGoals);

  return NextResponse.json({
    app_running: appRunning,
    monitoring_enabled: data?.monitoring_enabled ?? false,
    last_heartbeat: data?.last_heartbeat ?? null,
    mismatch,
    isolation_only: isolationOnly,
  });
}
