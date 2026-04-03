export const dynamic = 'force-dynamic';

/**
 * GET/PATCH /api/screen-capture/settings
 *
 * Manage per-user screen capture configuration.
 * Interval changes restricted to admin emails.
 * Partner notified when monitoring is paused.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/authFromRequest';
import { createServiceClient } from '@/lib/supabase';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';

const ADMIN_EMAILS = ['slaser90@gmail.com', 'shawn@yachtingadvisors.com'];

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const blocked = checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

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

  const blocked = checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  const body = await req.json();
  const update: Record<string, unknown> = {};
  const isAdmin = ADMIN_EMAILS.includes(user.email ?? '');

  if (typeof body.enabled === 'boolean') {
    update.screen_capture_enabled = body.enabled;
  }

  // Only admin can change interval and threshold
  if (typeof body.interval_minutes === 'number' && isAdmin) {
    const interval = Math.max(2, Math.min(30, Math.round(body.interval_minutes)));
    update.screen_capture_interval = interval;
  }
  if (typeof body.change_threshold === 'number' && isAdmin) {
    const threshold = Math.max(0.01, Math.min(0.50, body.change_threshold));
    update.screen_capture_change_threshold = threshold;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const db = createServiceClient();
  await db.from('users').update(update).eq('id', user.id);

  // Notify partner when monitoring is paused
  if (body.enabled === false || body.notify_partner === true) {
    const reason = typeof body.reason === 'string' ? body.reason.slice(0, 200) : undefined;
    notifyPartnerMonitoringPaused(db, user.id, reason).catch(console.error);
  }

  return NextResponse.json({ success: true, ...update });
}

/**
 * Send notification to accountability partner when monitoring is paused.
 */
async function notifyPartnerMonitoringPaused(db: ReturnType<typeof createServiceClient>, userId: string, reason?: string) {
  // Get active partner
  const { data: partnership } = await db
    .from('partners')
    .select('partner_user_id, partner_name, partner_email')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();

  if (!partnership) return;

  // Get user name
  const { data: user } = await db
    .from('users')
    .select('name')
    .eq('id', userId)
    .single();

  const userName = user?.name || 'Your partner';

  // Create a high-severity event for the pause
  await db.from('events').insert({
    user_id: userId,
    category: 'custom',
    severity: 'high',
    platform: 'desktop',
    app_name: 'Monitoring Paused',
    metadata: { type: 'monitoring_paused' },
  });

  // Send push notification to partner if they have tokens
  if (partnership.partner_user_id) {
    const { data: tokens } = await db
      .from('push_tokens')
      .select('token, platform')
      .eq('user_id', partnership.partner_user_id);

    if (tokens && tokens.length > 0) {
      // Push notification handled by existing alert pipeline
      // Partner notification handled by alert pipeline
    }
  }

  // Create alert record
  const reasonText = reason ? `\n\nTheir note: "${reason}"` : '';
  await db.from('alerts').insert({
    user_id: userId,
    event_id: null,
    partner_guide: `${userName} has paused their screen monitoring.${reasonText}\n\nThis may be a good time to check in with them.`,
  });

  // Send email to partner
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    if (partnership.partner_email && process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'Be Candid <alerts@becandid.io>',
        to: partnership.partner_email,
        subject: `${userName} paused their monitoring`,
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #226779;">Monitoring Paused</h2>
            <p>${userName} has paused their screen monitoring on Be Candid.</p>
            ${reason ? `<p style="background: #fef3cd; padding: 12px 16px; border-radius: 8px; margin: 16px 0;"><strong>Their note:</strong> ${reason}</p>` : ''}
            <p>This could be a good time to reach out and check in with them.</p>
            <a href="https://becandid.io/partner" style="display: inline-block; padding: 12px 24px; background: #226779; color: white; border-radius: 8px; text-decoration: none; font-weight: 600;">Open Be Candid</a>
            <p style="color: #999; font-size: 12px; margin-top: 24px;">You're receiving this because you're ${userName}'s accountability partner on Be Candid.</p>
          </div>
        `,
      });
    }
  } catch (err) {
    console.error('[monitoring] Failed to send partner email:', err);
  }
}
