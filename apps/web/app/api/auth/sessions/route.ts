export const dynamic = 'force-dynamic';
// GET  /api/auth/sessions — list recent login sessions
// POST /api/auth/sessions — record a new session (called from middleware)
// DELETE /api/auth/sessions — revoke a specific session

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { safeError } from '@/lib/security';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return safeError('GET /api/auth/sessions', 'Unauthorized', 401);

    const blocked = checkUserRate(actionLimiter, user.id);
    if (blocked) return blocked;

    const db = createServiceClient();
    const { data: sessions } = await db
      .from('user_sessions')
      .select('id, ip_address, user_agent, city, country, created_at, last_seen')
      .eq('user_id', user.id)
      .order('last_seen', { ascending: false })
      .limit(20);

    return NextResponse.json({ sessions: sessions ?? [] });
  } catch (err) {
    return safeError('GET /api/auth/sessions', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return safeError('POST /api/auth/sessions', 'Unauthorized', 401);

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? req.headers.get('x-real-ip') ?? 'unknown';
    const userAgent = req.headers.get('user-agent') ?? 'unknown';

    const db = createServiceClient();

    // Upsert: update last_seen if same IP+UA within 24h, otherwise create new
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: existing } = await db
      .from('user_sessions')
      .select('id')
      .eq('user_id', user.id)
      .eq('ip_address', ip)
      .gte('last_seen', oneDayAgo)
      .maybeSingle();

    if (existing) {
      await db.from('user_sessions')
        .update({ last_seen: new Date().toISOString(), user_agent: userAgent })
        .eq('id', existing.id);
    } else {
      await db.from('user_sessions').insert({
        user_id: user.id,
        ip_address: ip,
        user_agent: userAgent,
      });
    }

    // Update user's last_active_at and reset churn stage (user is active)
    await db.from('users')
      .update({ last_active_at: new Date().toISOString(), churn_stage: 0 })
      .eq('id', user.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    return safeError('POST /api/auth/sessions', err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return safeError('DELETE /api/auth/sessions', 'Unauthorized', 401);

    const { id } = await req.json().catch(() => ({}));
    if (!id) return safeError('DELETE /api/auth/sessions', 'ID required', 400);

    const db = createServiceClient();
    await db.from('user_sessions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    return safeError('DELETE /api/auth/sessions', err);
  }
}
