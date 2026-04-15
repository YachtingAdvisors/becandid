export const dynamic = 'force-dynamic';
// POST /api/cron/digest
// Weekly cron (Monday 9 AM UTC): sends a summary email to both
// the monitored user and their partner covering the past week's
// focus segments, check-in completion rate, trust points earned,
// and milestones unlocked.

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { GOAL_LABELS, getCategoryEmoji, type GoalCategory } from '@be-candid/shared';
import { verifyCronAuth } from '@/lib/cronAuth';
import { logCronRun } from '@/lib/cronAudit';
import { escapeHtml } from '@/lib/security';
import { decrypt } from '@/lib/encryption';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://becandid.io';

// Vercel Crons send GET requests
export async function GET(req: NextRequest) { return handleCron(req); }
export async function POST(req: NextRequest) { return handleCron(req); }

async function handleCron(req: NextRequest) {
  const authError = verifyCronAuth(req);
  if (authError) return authError;

  const db = createServiceClient();
  const results = { sent: 0, skipped: 0, errors: 0 };

  // Get all users
  const { data: users } = await db
    .from('users')
    .select('id, name, email, goals, timezone, monitoring_enabled')
    .eq('monitoring_enabled', true);

  if (!users) return NextResponse.json({ ok: true, ...results });

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString();

  for (const user of users) {
    try {
      // Fetch week's data in parallel
      const [segmentsRes, pointsRes, checkInsRes, milestonesRes, partnerRes, reflectionRes] = await Promise.all([
        db.from('focus_segments')
          .select('date, segment, status')
          .eq('user_id', user.id)
          .gte('date', weekAgo.toLocaleDateString('en-CA'))
          .order('date', { ascending: true }),
        db.from('trust_points')
          .select('points, action')
          .eq('user_id', user.id)
          .gte('created_at', weekAgoStr),
        db.from('check_ins')
          .select('status')
          .eq('user_id', user.id)
          .gte('sent_at', weekAgoStr),
        db.from('milestones')
          .select('milestone')
          .eq('user_id', user.id)
          .gte('unlocked_at', weekAgoStr),
        db.from('partners')
          .select('partner_name, partner_email, partner_user_id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle(),
        db.from('weekly_reflections')
          .select('reflection, mood_avg, entry_count')
          .eq('user_id', user.id)
          .eq('week_start', weekAgo.toISOString().slice(0, 10))
          .maybeSingle(),
      ]);

      const segments = segmentsRes.data ?? [];
      const points = pointsRes.data ?? [];
      const checkIns = checkInsRes.data ?? [];
      const milestones = milestonesRes.data ?? [];
      const partner = partnerRes.data;

      // Decrypt weekly reflection if available
      let reflection: any = null;
      if (reflectionRes.data?.reflection) {
        try {
          reflection = JSON.parse(decrypt(reflectionRes.data.reflection, user.id));
        } catch { /* reflection decryption failed — skip */ }
      }

      // Calculate stats
      const focusedSegments = segments.filter(s => s.status === 'focused').length;
      const totalSegments = segments.length;
      const focusRate = totalSegments > 0 ? Math.round((focusedSegments / totalSegments) * 100) : 0;

      const totalPoints = points.reduce((sum, p) => sum + p.points, 0);

      const completedCheckIns = checkIns.filter(c => c.status === 'completed').length;
      const totalCheckIns = checkIns.length;
      const checkInRate = totalCheckIns > 0 ? Math.round((completedCheckIns / totalCheckIns) * 100) : 0;

      // Full focused days
      const dayMap = new Map<string, { morning?: string; evening?: string }>();
      for (const s of segments) {
        if (!dayMap.has(s.date)) dayMap.set(s.date, {});
        dayMap.get(s.date)![s.segment as 'morning' | 'evening'] = s.status;
      }
      const fullFocusDays = [...dayMap.values()].filter(
        d => d.morning === 'focused' && d.evening === 'focused'
      ).length;

      // Skip if no meaningful data
      if (totalSegments === 0 && totalCheckIns === 0) {
        results.skipped++;
        continue;
      }

      // Build and send user digest
      // (Email sending via Resend would go here — storing the template for now)
      const digestData = {
        userName: user.name,
        focusRate,
        focusedSegments,
        totalSegments,
        fullFocusDays,
        totalPoints,
        completedCheckIns,
        totalCheckIns,
        checkInRate,
        milestonesCount: milestones.length,
        partnerName: partner?.partner_name,
      };

      // Send digest emails
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY!);
        const FROM = process.env.RESEND_FROM_EMAIL ?? 'Be Candid <noreply@becandid.io>';
        const APP_URL_BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://becandid.io';

        const focusEmoji = focusRate >= 80 ? '🌟' : focusRate >= 50 ? '⚡' : '💪';
        const streakText = fullFocusDays > 0 ? `${fullFocusDays} full focus days` : 'working on it';

        const userHtml = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:32px 20px;">
  <div style="text-align:center;margin-bottom:20px;">
    <div style="display:inline-block;background:#7c3aed;color:white;padding:6px 18px;border-radius:100px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;">Weekly Digest</div>
  </div>
  <div style="background:#fff;border-radius:16px;padding:28px;border:1px solid #e5e7eb;">
    <h2 style="margin:0 0 16px;color:#0f0e1a;font-size:22px;font-family:Georgia,serif;">${focusEmoji} Your week in review</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
      <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Focus rate</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#0f0e1a;font-size:14px;">${focusRate}%</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Full focus days</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#0f0e1a;font-size:14px;">${fullFocusDays} of 7</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Check-in completion</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#0f0e1a;font-size:14px;">${completedCheckIns}/${totalCheckIns} (${checkInRate}%)</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Trust points earned</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#7c3aed;font-size:14px;">+${totalPoints}</td></tr>
      ${milestones.length > 0 ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Milestones unlocked</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#d97706;font-size:14px;">🏅 ${milestones.length}</td></tr>` : ''}
    </table>
    ${reflection ? `
    <div style="margin:20px 0;padding:20px;background:#f0fafb;border-radius:12px;border-left:4px solid #226779;">
      <h3 style="margin:0 0 10px;color:#226779;font-size:15px;font-family:Georgia,serif;">Your Weekly Reflection</h3>
      <p style="margin:0 0 12px;color:#374151;font-size:14px;line-height:1.6;">${escapeHtml(reflection.narrative?.slice(0, 600) || '')}</p>
      ${reflection.growth_moment ? `<p style="margin:0 0 8px;color:#226779;font-size:13px;"><strong>Growth moment:</strong> ${escapeHtml(reflection.growth_moment)}</p>` : ''}
      ${reflection.stringer_insight ? `<p style="margin:0 0 8px;color:#226779;font-size:13px;"><strong>Insight:</strong> ${escapeHtml(reflection.stringer_insight)}</p>` : ''}
      ${reflection.looking_ahead ? `<p style="margin:0;color:#6b7280;font-size:13px;font-style:italic;">${escapeHtml(reflection.looking_ahead)}</p>` : ''}
    </div>` : ''}
    <a href="${APP_URL_BASE}/dashboard/journal" style="display:block;text-align:center;background:#7c3aed;color:white;padding:14px 24px;border-radius:12px;text-decoration:none;font-weight:600;font-size:15px;">View Growth Journal →</a>
  </div>
</div>
</body></html>`;

        await resend.emails.send({
          from: FROM,
          to: user.email,
          subject: `${focusEmoji} Your weekly focus digest — ${focusRate}% focused, ${streakText}`,
          html: userHtml,
        });

        // Send partner summary
        if (partner?.partner_email) {
          const partnerHtml = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:32px 20px;">
  <div style="background:#fff;border-radius:16px;padding:28px;border:1px solid #e5e7eb;">
    <h2 style="margin:0 0 8px;color:#0f0e1a;font-size:20px;font-family:Georgia,serif;">${escapeHtml(user.name)}'s weekly digest</h2>
    <p style="margin:0 0 16px;color:#6b7280;font-size:14px;">Here's how they did this week.</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
      <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Focus rate</td><td style="padding:8px 0;text-align:right;font-weight:600;font-size:14px;">${focusRate}%</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Full focus days</td><td style="padding:8px 0;text-align:right;font-weight:600;font-size:14px;">${fullFocusDays} of 7</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Check-ins completed</td><td style="padding:8px 0;text-align:right;font-weight:600;font-size:14px;">${completedCheckIns}/${totalCheckIns}</td></tr>
    </table>
    <a href="${APP_URL_BASE}/partner/focus" style="display:block;text-align:center;background:#7c3aed;color:white;padding:14px 24px;border-radius:12px;text-decoration:none;font-weight:600;font-size:15px;">View Their Focus Board →</a>
  </div>
</div>
</body></html>`;

          await resend.emails.send({
            from: FROM,
            to: partner.partner_email,
            subject: `📊 ${escapeHtml(user.name)}'s weekly focus digest — ${focusRate}% focused`,
            html: partnerHtml,
          });
        }
      } catch (emailErr) {
        console.error(`[cron/digest] Email error for ${user.id}:`, emailErr);
      }

      results.sent++;
    } catch (err) {
      console.error(`[cron/digest] Error for user ${user.id}:`, err);
      results.errors++;
    }
  }

    await logCronRun(db, 'digest', {sent: results.sent, skipped: results.skipped, errors: results.errors, users_processed: results.sent + results.skipped});
  return NextResponse.json({ ok: true, ...results });
}
