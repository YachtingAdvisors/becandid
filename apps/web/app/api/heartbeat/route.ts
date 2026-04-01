export const dynamic = 'force-dynamic';

/**
 * POST /api/heartbeat — Desktop app pings this every 2 minutes
 * GET  /api/heartbeat — Dashboard checks if app is alive (last heartbeat < 5 min)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/authFromRequest';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = createServiceClient();
  const { error } = await db.from('users').update({ last_heartbeat: new Date().toISOString() }).eq('id', user.id);

  if (error) {
    console.error('[heartbeat] Update failed:', error.message);
    return NextResponse.json({ ok: false, error: error.message });
  }

  return NextResponse.json({ ok: true });
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
    .select('last_heartbeat, monitoring_enabled')
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

  return NextResponse.json({
    app_running: appRunning,
    monitoring_enabled: data?.monitoring_enabled ?? false,
    last_heartbeat: data?.last_heartbeat ?? null,
  });
}
