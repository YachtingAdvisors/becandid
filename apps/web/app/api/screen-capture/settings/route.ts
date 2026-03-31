export const dynamic = 'force-dynamic';

/**
 * GET/PATCH /api/screen-capture/settings
 *
 * Manage per-user screen capture configuration.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/authFromRequest';
import { createServiceClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = createServiceClient();
  const { data: profile } = await db
    .from('users')
    .select('screen_capture_enabled, screen_capture_interval, screen_capture_change_threshold')
    .eq('id', user.id)
    .single();

  return NextResponse.json({
    enabled: profile?.screen_capture_enabled ?? false,
    interval_minutes: profile?.screen_capture_interval ?? 5,
    change_threshold: profile?.screen_capture_change_threshold ?? 0.10,
  });
}

export async function PATCH(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const update: Record<string, unknown> = {};

  if (typeof body.enabled === 'boolean') {
    update.screen_capture_enabled = body.enabled;
  }
  if (typeof body.interval_minutes === 'number') {
    const interval = Math.max(2, Math.min(30, Math.round(body.interval_minutes)));
    update.screen_capture_interval = interval;
  }
  if (typeof body.change_threshold === 'number') {
    const threshold = Math.max(0.01, Math.min(0.50, body.change_threshold));
    update.screen_capture_change_threshold = threshold;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const db = createServiceClient();
  await db.from('users').update(update).eq('id', user.id);

  return NextResponse.json({ success: true, ...update });
}
