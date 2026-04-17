export const dynamic = 'force-dynamic';
// POST /api/events/contest — contest a flag, sends email to admin for review

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { safeError, auditLog, escapeHtml } from '@/lib/security';
import { GOAL_LABELS, type GoalCategory } from '@be-candid/shared';
import { Resend } from 'resend';
import { z } from 'zod';

const ContestSchema = z.object({
  event_id: z.string().uuid(),
  reason: z.string().min(1).max(500),
});

const ADMIN_EMAIL = 'shawn@becandid.io';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return safeError('POST /api/events/contest', 'Unauthorized', 401);

    const blocked = await checkUserRate(actionLimiter, user.id);
    if (blocked) return blocked;

    const body = await req.json().catch(() => null);
    const parsed = ContestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const db = createServiceClient();

    // Verify event belongs to user
    const { data: event } = await db
      .from('events')
      .select('id, category, severity, platform, app_name, timestamp, contested')
      .eq('id', parsed.data.event_id)
      .eq('user_id', user.id)
      .single();

    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    if (event.contested) return NextResponse.json({ error: 'Already contested' }, { status: 400 });

    // Mark as contested
    await db
      .from('events')
      .update({
        contested: true,
        contest_reason: parsed.data.reason,
      })
      .eq('id', event.id);

    // Get user info
    const { data: userProfile } = await db
      .from('users')
      .select('name, email')
      .eq('id', user.id)
      .single();

    // Check for associated screenshots
    const { data: screenshots } = await db
      .from('screen_captures')
      .select('id, captured_at')
      .eq('user_id', user.id)
      .gte('captured_at', new Date(new Date(event.timestamp).getTime() - 5 * 60 * 1000).toISOString())
      .lte('captured_at', new Date(new Date(event.timestamp).getTime() + 5 * 60 * 1000).toISOString())
      .limit(5);

    const categoryLabel = GOAL_LABELS[event.category as GoalCategory] ?? event.category;
    const screenshotInfo = screenshots?.length
      ? `<p><strong>Screenshots captured around this time:</strong> ${screenshots.length} screenshot(s) within ±5 minutes</p>`
      : '<p><em>No screenshots found near this event time.</em></p>';

    // Send review email to admin
    const resend = new Resend(process.env.RESEND_API_KEY!);
    const FROM = process.env.EMAIL_FROM || 'Be Candid <noreply@updates.becandid.io>';

    await resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: `Flag Contest: ${escapeHtml(userProfile?.name ?? 'User')} — ${escapeHtml(categoryLabel)}`,
      html: `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:20px;">
<h2 style="color:#226779;">Flag Contest Review</h2>
<table style="border-collapse:collapse;width:100%;">
<tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">User</td>
<td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(userProfile?.name ?? 'Unknown')} (${escapeHtml(userProfile?.email ?? user.id)})</td></tr>
<tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Category</td>
<td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(categoryLabel)}</td></tr>
<tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Severity</td>
<td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(event.severity)}</td></tr>
<tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Platform</td>
<td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(event.platform)}</td></tr>
<tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Domain/App</td>
<td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(event.app_name ?? 'N/A')}</td></tr>
<tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Time</td>
<td style="padding:8px;border-bottom:1px solid #eee;">${new Date(event.timestamp).toLocaleString()}</td></tr>
<tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">User's Reason</td>
<td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(parsed.data.reason)}</td></tr>
</table>
${screenshotInfo}
<p style="margin-top:20px;"><a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://becandid.io'}/dashboard/activity" style="background:#226779;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;">Review in Dashboard</a></p>
</body></html>`,
    }).catch((e) => console.error('Contest email failed:', e));

    auditLog({
      action: 'event.created' as any,
      userId: user.id,
      metadata: { event_id: event.id, contest_reason: parsed.data.reason },
    });

    return NextResponse.json({ success: true, message: 'Flag contested. We\'ll review and get back to you.' });
  } catch (err) {
    return safeError('POST /api/events/contest', err);
  }
}
