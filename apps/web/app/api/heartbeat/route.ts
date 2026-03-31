export const dynamic = 'force-dynamic';

/**
 * POST /api/heartbeat — Desktop app pings this every 2 minutes
 * GET  /api/heartbeat — Dashboard checks if app is alive (last heartbeat < 5 min)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/authFromRequest';
import { createServiceClient } from '@/lib/supabase';

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
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = createServiceClient();
  const { data, error: selectError } = await db
    .from('users')
    .select('last_heartbeat, monitoring_enabled')
    .eq('id', user.id)
    .single();

  if (selectError) {
    // Column might not exist — try without last_heartbeat
    const { data: fallback } = await db
      .from('users')
      .select('monitoring_enabled')
      .eq('id', user.id)
      .single();

    return NextResponse.json({
      app_running: false,
      monitoring_enabled: fallback?.monitoring_enabled ?? false,
      last_heartbeat: null,
      error: selectError.message,
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
