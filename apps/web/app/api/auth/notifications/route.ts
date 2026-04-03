export const dynamic = 'force-dynamic';
// GET  /api/auth/notifications — get notification preferences
// PATCH /api/auth/notifications — update notification preferences

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { safeError, auditLog } from '@/lib/security';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { z } from 'zod';

const NotifPrefsSchema = z.object({
  alert_email: z.boolean().optional(),
  alert_sms: z.boolean().optional(),
  alert_push: z.boolean().optional(),
  checkin_email: z.boolean().optional(),
  checkin_sms: z.boolean().optional(),
  digest_email: z.boolean().optional(),
  nudge_email: z.boolean().optional(),
  encouragement_email: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return safeError('GET /api/auth/notifications', 'Unauthorized', 401);

    const blocked = checkUserRate(actionLimiter, user.id);
    if (blocked) return blocked;

    const db = createServiceClient();
    const { data: profile } = await db
      .from('users')
      .select('notification_prefs')
      .eq('id', user.id)
      .single();

    return NextResponse.json({ prefs: profile?.notification_prefs ?? {} });
  } catch (err) {
    return safeError('GET /api/auth/notifications', err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return safeError('PATCH /api/auth/notifications', 'Unauthorized', 401);

    const blocked = checkUserRate(actionLimiter, user.id);
    if (blocked) return blocked;

    const body = await req.json().catch(() => null);
    if (!body) return safeError('PATCH /api/auth/notifications', 'Invalid JSON', 400);

    const parsed = NotifPrefsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid preferences' }, { status: 400 });
    }

    const db = createServiceClient();

    // Merge with existing prefs
    const { data: current } = await db
      .from('users')
      .select('notification_prefs')
      .eq('id', user.id)
      .single();

    const merged = { ...(current?.notification_prefs ?? {}), ...parsed.data };

    await db.from('users')
      .update({ notification_prefs: merged })
      .eq('id', user.id);

    auditLog({
      action: 'settings.changed',
      userId: user.id,
      metadata: { change: 'notification_prefs', updated: Object.keys(parsed.data) },
    });

    return NextResponse.json({ success: true, prefs: merged });
  } catch (err) {
    return safeError('PATCH /api/auth/notifications', err);
  }
}
