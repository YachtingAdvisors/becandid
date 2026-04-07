export const dynamic = 'force-dynamic';
// GET  /api/auth/sessions — list recent login sessions
// POST /api/auth/sessions — record a new session (called from middleware)
// DELETE /api/auth/sessions?session_id=<id> — revoke a specific session
// DELETE /api/auth/sessions?all=true — revoke all except current

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { safeError } from '@/lib/security';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { parseUserAgent, maskIp } from '@/lib/uaParser';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return safeError('GET /api/auth/sessions', 'Unauthorized', 401);

    const blocked = checkUserRate(actionLimiter, user.id);
    if (blocked) return blocked;

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const db = createServiceClient();
    const { data: sessions } = await db
      .from('user_sessions')
      .select('id, ip_address, user_agent, device_name, browser, os, city, country, created_at, last_seen, last_active_at, device_hash')
      .eq('user_id', user.id)
      .gte('last_active_at', thirtyDaysAgo)
      .order('last_active_at', { ascending: false })
      .limit(20);

    // Determine current session's device hash for "this device" detection
    const currentUa = req.headers.get('user-agent') ?? '';
    const currentIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? req.headers.get('x-real-ip') ?? '';

    const enriched = (sessions ?? []).map((s: Record<string, unknown>) => ({
      id: s.id,
      device_name: s.device_name || parseUserAgent(String(s.user_agent || '')).device,
      browser: s.browser || parseUserAgent(String(s.user_agent || '')).browser,
      os: s.os || parseUserAgent(String(s.user_agent || '')).os,
      ip_display: maskIp(String(s.ip_address || '')),
      city: s.city,
      country: s.country,
      last_active_at: s.last_active_at || s.last_seen,
      created_at: s.created_at,
      is_current: String(s.user_agent || '') === currentUa && String(s.ip_address || '') === currentIp,
    }));

    return NextResponse.json({ sessions: enriched });
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
    const parsed = parseUserAgent(userAgent);

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

    const now = new Date().toISOString();

    if (existing) {
      await db.from('user_sessions')
        .update({
          last_seen: now,
          last_active_at: now,
          user_agent: userAgent,
          device_name: parsed.device,
          browser: parsed.browser,
          os: parsed.os,
        })
        .eq('id', existing.id);
    } else {
      await db.from('user_sessions').insert({
        user_id: user.id,
        ip_address: ip,
        user_agent: userAgent,
        device_name: parsed.device,
        browser: parsed.browser,
        os: parsed.os,
        last_active_at: now,
      });
    }

    // Update user's last_active_at and reset churn stage (user is active)
    await db.from('users')
      .update({ last_active_at: now, churn_stage: 0 })
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

    const blocked = checkUserRate(actionLimiter, user.id);
    if (blocked) return blocked;

    const url = new URL(req.url);
    const sessionId = url.searchParams.get('session_id');
    const revokeAll = url.searchParams.get('all') === 'true';

    const db = createServiceClient();

    if (revokeAll) {
      // Identify current session by matching UA + IP
      const currentUa = req.headers.get('user-agent') ?? '';
      const currentIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        ?? req.headers.get('x-real-ip') ?? '';

      // Find current session to keep it
      const { data: currentSession } = await db
        .from('user_sessions')
        .select('id')
        .eq('user_id', user.id)
        .eq('ip_address', currentIp)
        .eq('user_agent', currentUa)
        .order('last_active_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (currentSession) {
        // Delete all sessions except the current one
        await db.from('user_sessions')
          .delete()
          .eq('user_id', user.id)
          .neq('id', currentSession.id);
      } else {
        // Can't identify current session — delete all
        await db.from('user_sessions')
          .delete()
          .eq('user_id', user.id);
      }

      return NextResponse.json({ success: true, revoked: 'all_other' });
    }

    if (sessionId) {
      await db.from('user_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', user.id);

      return NextResponse.json({ success: true, revoked: sessionId });
    }

    // Legacy: support body-based ID for backwards compat
    const body = await req.json().catch(() => ({}));
    if (body.id) {
      await db.from('user_sessions')
        .delete()
        .eq('id', body.id)
        .eq('user_id', user.id);

      return NextResponse.json({ success: true, revoked: body.id });
    }

    return safeError('DELETE /api/auth/sessions', 'session_id or all=true required', 400);
  } catch (err) {
    return safeError('DELETE /api/auth/sessions', err);
  }
}
