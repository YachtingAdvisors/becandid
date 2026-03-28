export const dynamic = 'force-dynamic';
// POST /api/cron/reengagement
// Daily cron: checks for users inactive for 7+ days and sends
// a re-engagement email. Only sends once per 14-day period.

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '')
    ?? req.headers.get('x-cron-secret');
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = createServiceClient();
  const results = { sent: 0, skipped: 0, errors: 0 };

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

  // Find users who haven't been active in 7+ days
  const { data: dormantUsers } = await db
    .from('users')
    .select('id, name, email, last_active_at, notification_prefs, goals')
    .eq('monitoring_enabled', true)
    .or(`last_active_at.lt.${sevenDaysAgo},last_active_at.is.null`);

  if (!dormantUsers) return NextResponse.json({ ok: true, ...results });

  for (const user of dormantUsers) {
    try {
      // Check notification preferences
      const prefs = user.notification_prefs ?? {};
      if (prefs.digest_email === false) { results.skipped++; continue; }

      // Don't send if we already sent a re-engagement email in the last 14 days
      const { data: recentNudge } = await db
        .from('nudges')
        .select('id')
        .eq('user_id', user.id)
        .eq('trigger_type', 'reengagement' as any)
        .gte('sent_at', fourteenDaysAgo)
        .maybeSingle();

      if (recentNudge) { results.skipped++; continue; }

      // Get their streak and stats for context
      const { data: recentSegments } = await db
        .from('focus_segments')
        .select('status')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(14);

      const focused = (recentSegments ?? []).filter(s => s.status === 'focused').length;
      const total = (recentSegments ?? []).length;

      const daysInactive = user.last_active_at
        ? Math.floor((Date.now() - new Date(user.last_active_at).getTime()) / (1000 * 60 * 60 * 24))
        : 30;

      // Send email
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY!);
        const FROM = process.env.RESEND_FROM_EMAIL ?? 'alerts@becandid.io';
        const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://becandid.io';

        await resend.emails.send({
          from: FROM,
          to: user.email,
          subject: `${user.name}, your accountability partner is waiting`,
          html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:40px 20px;">
  <div style="background:#fff;border-radius:16px;padding:32px;border:1px solid #e5e7eb;text-align:center;">
    <div style="font-size:48px;margin-bottom:16px;">💙</div>
    <h2 style="margin:0 0 12px;color:#0f0e1a;font-size:22px;font-family:Georgia,serif;">We miss you, ${user.name}</h2>
    <p style="margin:0 0 20px;color:#6b7280;font-size:14px;line-height:1.6;">
      It's been ${daysInactive} days since your last visit.
      ${total > 0 ? `Your last focus rate was ${Math.round((focused / total) * 100)}%.` : ''}
      Your accountability journey works best when you show up consistently — even on the hard days.
    </p>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
      A quick check-in takes 30 seconds. Your partner is still here.
    </p>
    <a href="${APP_URL}/dashboard" style="display:inline-block;background:#7c3aed;color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:600;font-size:15px;">
      Come Back →
    </a>
    <p style="margin:20px 0 0;color:#9ca3af;font-size:11px;">
      <a href="${APP_URL}/dashboard/notifications" style="color:#7c3aed;">Manage email preferences</a>
    </p>
  </div>
</div>
</body></html>`,
        });
      } catch (emailErr) {
        console.error(`Re-engagement email failed for ${user.id}:`, emailErr);
        results.errors++;
        continue;
      }

      // Log as a nudge to prevent re-sending
      await db.from('nudges').insert({
        user_id: user.id,
        trigger_type: 'reengagement' as any,
        severity: 'info',
        message: `Re-engagement email sent after ${daysInactive} days of inactivity`,
      });

      results.sent++;
    } catch (err) {
      console.error(`[cron/reengagement] Error for ${user.id}:`, err);
      results.errors++;
    }
  }

  return NextResponse.json({ ok: true, ...results });
}
