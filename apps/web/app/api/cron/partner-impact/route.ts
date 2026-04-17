export const dynamic = 'force-dynamic';

// ============================================================
// POST /api/cron/partner-impact
//
// Weekly cron (Sunday 7 PM UTC): sends each active partner a
// "Your Impact" email summarizing how the monitored user is
// doing — journal entries, streak, check-in rate, and a
// personalized encouragement message.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { verifyCronAuth } from '@/lib/cronAuth';
import { emailWrapper } from '@/lib/email/template';
import { escapeHtml } from '@/lib/security';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://becandid.io';

// Vercel Crons send GET requests
export async function GET(req: NextRequest) { return handleCron(req); }
export async function POST(req: NextRequest) { return handleCron(req); }

interface PartnerRelationship {
  id: string;
  user_id: string;
  partner_email: string;
  partner_name: string;
  partner_user_id: string | null;
  created_at: string;
  users: {
    id: string;
    name: string;
    current_streak: number | null;
  };
}

async function handleCron(req: NextRequest) {
  const authError = verifyCronAuth(req);
  if (authError) return authError;

  const db = createServiceClient();
  const results = { sent: 0, skipped: 0, errors: 0 };

  // Get all active partner relationships with user data
  const { data: partnerships } = await db
    .from('partners')
    .select(`
      id,
      user_id,
      partner_email,
      partner_name,
      partner_user_id,
      created_at,
      users!partners_user_id_fkey (
        id,
        name,
        current_streak
      )
    `)
    .eq('status', 'active');

  if (!partnerships || partnerships.length === 0) {
    return NextResponse.json({ ok: true, ...results });
  }

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString();

  for (const partnership of partnerships as unknown as PartnerRelationship[]) {
    try {
      const userId = partnership.user_id;
      const user = partnership.users;

      if (!user || !partnership.partner_email) {
        results.skipped++;
        continue;
      }

      // Fetch the monitored user's stats for the week in parallel
      const [journalRes, checkInsRes, conversationRes, streakAtJoinRes] = await Promise.all([
        // Journal entries this week
        db.from('journal_entries')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('created_at', weekAgoStr),

        // Check-in completion rate
        db.from('check_ins')
          .select('status')
          .eq('user_id', userId)
          .gte('sent_at', weekAgoStr),

        // Last conversation rating
        db.from('conversation_outcomes')
          .select('rating')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),

        // Streak when partner joined (approximate: check audit log or use 0)
        db.from('audit_log')
          .select('metadata')
          .eq('user_id', userId)
          .eq('action', 'partner_joined')
          .gte('created_at', partnership.created_at)
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle(),
      ]);

      const journalCount = journalRes.count ?? 0;
      const checkIns = checkInsRes.data ?? [];
      const completedCheckIns = checkIns.filter(c => c.status === 'completed').length;
      const totalCheckIns = checkIns.length;
      const checkInRate = totalCheckIns > 0
        ? Math.round((completedCheckIns / totalCheckIns) * 100)
        : 0;
      const currentStreak = user.current_streak ?? 0;
      const lastRating = conversationRes.data?.rating ?? null;
      const streakAtJoin = (streakAtJoinRes.data?.metadata as any)?.streak_at_join ?? 0;
      const streakGrowth = currentStreak - streakAtJoin;

      // Skip if no meaningful activity
      if (journalCount === 0 && totalCheckIns === 0 && currentStreak === 0) {
        results.skipped++;
        continue;
      }

      // Determine encouragement tone
      const isPositive = journalCount >= 3 || checkInRate >= 70 || currentStreak >= 7;
      const encouragement = isPositive
        ? 'Your presence is making a real difference.'
        : 'Some weeks are harder. Your partner needs you now more than ever.';

      const userName = escapeHtml(user.name || 'Your partner');
      const partnerName = escapeHtml(partnership.partner_name || 'there');

      // Build stat cards
      const ratingDisplay = lastRating !== null
        ? `<tr>
            <td style="padding:10px 16px;color:#6b7280;font-size:14px;border-bottom:1px solid #f3f4f6;">Last conversation rating</td>
            <td style="padding:10px 16px;text-align:right;font-weight:600;color:#1a1a2e;font-size:14px;border-bottom:1px solid #f3f4f6;">${lastRating}/5</td>
          </tr>`
        : '';

      const streakGrowthDisplay = streakGrowth > 0
        ? `<tr>
            <td style="padding:10px 16px;color:#6b7280;font-size:14px;border-bottom:1px solid #f3f4f6;">Streak growth since you joined</td>
            <td style="padding:10px 16px;text-align:right;font-weight:600;color:#059669;font-size:14px;border-bottom:1px solid #f3f4f6;">+${streakGrowth} days</td>
          </tr>`
        : '';

      const html = emailWrapper({
        preheader: `${userName} journaled ${journalCount} times this week`,
        body: `
          <h2 class="text-heading" style="margin:0 0 6px;color:#1a1a2e;font-size:20px;font-weight:700;">
            Your impact on ${userName}'s journey
          </h2>
          <p class="text-body" style="margin:0 0 20px;color:#6b7280;font-size:13px;">
            Hey ${partnerName}, here's how ${userName} did this week.
          </p>

          <div style="margin:0 0 20px;padding:20px;background:#f0fafb;border-radius:12px;border:1px solid #e0f2f1;">
            <p style="margin:0 0 4px;color:#226779;font-size:18px;font-weight:700;line-height:1.3;">
              ${userName} journaled ${journalCount} time${journalCount !== 1 ? 's' : ''} this week.
            </p>
            <p style="margin:0;color:#226779;font-size:16px;font-weight:600;">
              Their streak grew to ${currentStreak} day${currentStreak !== 1 ? 's' : ''}.
            </p>
          </div>

          <table style="width:100%;border-collapse:collapse;margin-bottom:20px;background:#fafafa;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="padding:10px 16px;color:#6b7280;font-size:14px;border-bottom:1px solid #f3f4f6;">Journal entries</td>
              <td style="padding:10px 16px;text-align:right;font-weight:600;color:#1a1a2e;font-size:14px;border-bottom:1px solid #f3f4f6;">${journalCount}</td>
            </tr>
            <tr>
              <td style="padding:10px 16px;color:#6b7280;font-size:14px;border-bottom:1px solid #f3f4f6;">Current streak</td>
              <td style="padding:10px 16px;text-align:right;font-weight:600;color:#1a1a2e;font-size:14px;border-bottom:1px solid #f3f4f6;">${currentStreak} days</td>
            </tr>
            ${streakGrowthDisplay}
            <tr>
              <td style="padding:10px 16px;color:#6b7280;font-size:14px;border-bottom:1px solid #f3f4f6;">Check-in completion</td>
              <td style="padding:10px 16px;text-align:right;font-weight:600;color:#1a1a2e;font-size:14px;border-bottom:1px solid #f3f4f6;">${completedCheckIns}/${totalCheckIns} (${checkInRate}%)</td>
            </tr>
            ${ratingDisplay}
          </table>

          <p class="text-body" style="margin:0;color:#4b5563;font-size:14px;line-height:1.7;font-style:italic;">
            ${encouragement}
          </p>
        `,
        ctaUrl: `${APP_URL}/partner/dashboard`,
        ctaLabel: 'View Their Progress',
        footerNote: 'You receive this because you are an accountability partner on Be Candid.',
      });

      // Send the email
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY!);
      const FROM = process.env.RESEND_FROM_EMAIL ?? 'Be Candid <noreply@updates.becandid.io>';

      await resend.emails.send({
        from: FROM,
        to: partnership.partner_email,
        subject: `Your impact on ${userName}'s journey this week`,
        html,
      });

      results.sent++;
    } catch (err) {
      console.error(`[cron/partner-impact] Error for partnership ${partnership.id}:`, err);
      results.errors++;
    }
  }

  return NextResponse.json({ ok: true, ...results });
}
