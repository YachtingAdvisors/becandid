export const dynamic = 'force-dynamic';

// ============================================================
// POST /api/cron/isolation-nudges
//
// Runs every 4 hours for users with 'isolation' in their goals.
// Checks for gaps in journaling, check-ins, and partner contact,
// then sends gentle connection nudges via push + email.
//
// Rate limit: max 2 nudges per day per user.
// Schedule: "0 */4 * * *" (every 4 hours)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { sendPushToUser } from '@/lib/push/pushService';
import { Resend } from 'resend';
import { verifyCronAuth } from '@/lib/cronAuth';
import { logCronRun } from '@/lib/cronAudit';
import { emailWrapper } from '@/lib/email/template';
import { escapeHtml } from '@/lib/security';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!);
}
const FROM = process.env.EMAIL_FROM || 'Be Candid <noreply@updates.becandid.io>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://becandid.io';

const MAX_NUDGES_PER_DAY = 2;

interface NudgeMessage {
  pushTitle: string;
  pushBody: string;
  emailSubject: string;
  emailSnippet: string;
}

const NUDGE_NO_JOURNAL: NudgeMessage = {
  pushTitle: 'Connection check',
  pushBody: "When's the last time you talked to someone? Even a text counts.",
  emailSubject: 'A gentle nudge from Be Candid',
  emailSnippet:
    "When's the last time you talked to someone? Even a text counts. Isolation feels quiet, but it costs you the thing you actually need — connection.",
};

const NUDGE_NO_CHECKIN: NudgeMessage = {
  pushTitle: 'Your partner misses you',
  pushBody:
    "Your partner hasn't heard from you. A quick check-in takes 30 seconds.",
  emailSubject: "Your partner hasn't heard from you",
  emailSnippet:
    "Your accountability partner hasn't heard from you recently. A quick check-in takes 30 seconds and keeps the connection alive.",
};

const NUDGE_NO_PARTNER_CONTACT: NudgeMessage = {
  pushTitle: 'Isolation is your rival',
  pushBody:
    'Isolation feels safe, but it costs you the thing you actually need — connection.',
  emailSubject: 'Isolation is your rival, remember?',
  emailSnippet:
    "It's been a while since you've reached out to your partner. Isolation feels safe, but it costs you the thing you actually need — connection. Even one text counts.",
};

export async function GET(req: NextRequest) {
  return handleCron(req);
}
export async function POST(req: NextRequest) {
  return handleCron(req);
}

async function handleCron(req: NextRequest) {
  const authError = verifyCronAuth(req);
  if (authError) return authError;

  const db = createServiceClient();
  const now = new Date();
  const results = { nudgesSent: 0, skipped: 0, errors: 0, total: 0 };

  // Fetch users with 'isolation' in their goals
  const { data: users } = await db
    .from('users')
    .select('id, name, email, goals, timezone')
    .contains('goals', ['isolation']);

  if (!users || users.length === 0) {
    return NextResponse.json({ ok: true, message: 'No isolation users', ...results });
  }

  results.total = users.length;

  for (const user of users) {
    try {
      // Rate limit: check how many nudges we sent today
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);

      const { count: nudgesToday } = await db
        .from('isolation_nudges')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('sent_at', todayStart.toISOString());

      if ((nudgesToday ?? 0) >= MAX_NUDGES_PER_DAY) {
        results.skipped++;
        continue;
      }

      // Check gaps
      const twentyFourHoursAgo = new Date(
        now.getTime() - 24 * 60 * 60 * 1000,
      ).toISOString();
      const fortyEightHoursAgo = new Date(
        now.getTime() - 48 * 60 * 60 * 1000,
      ).toISOString();
      const oneWeekAgo = new Date(
        now.getTime() - 7 * 24 * 60 * 60 * 1000,
      ).toISOString();

      const [journalRes, checkinRes, partnerContactRes] = await Promise.all([
        // Has the user journaled in the last 24 hours?
        db
          .from('stringer_journal')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', twentyFourHoursAgo),
        // Has the user completed a check-in in the last 48 hours?
        db
          .from('check_ins')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .gte('sent_at', fortyEightHoursAgo),
        // Has the user logged a connection event this week?
        db
          .from('connection_events')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', oneWeekAgo),
      ]);

      const hasJournal = (journalRes.count ?? 0) > 0;
      const hasCheckin = (checkinRes.count ?? 0) > 0;
      const hasPartnerContact = (partnerContactRes.count ?? 0) > 0;

      // Determine which nudge to send (prioritize by severity)
      let nudge: NudgeMessage | null = null;
      let nudgeType: string | null = null;

      if (!hasPartnerContact) {
        nudge = NUDGE_NO_PARTNER_CONTACT;
        nudgeType = 'no_partner_contact';
      } else if (!hasCheckin) {
        nudge = NUDGE_NO_CHECKIN;
        nudgeType = 'no_checkin';
      } else if (!hasJournal) {
        nudge = NUDGE_NO_JOURNAL;
        nudgeType = 'no_journal';
      }

      if (!nudge || !nudgeType) {
        results.skipped++;
        continue;
      }

      // Check we haven't sent the same nudge type in the last 12 hours
      const twelveHoursAgo = new Date(
        now.getTime() - 12 * 60 * 60 * 1000,
      ).toISOString();
      const { count: recentSameType } = await db
        .from('isolation_nudges')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('nudge_type', nudgeType)
        .gte('sent_at', twelveHoursAgo);

      if ((recentSameType ?? 0) > 0) {
        results.skipped++;
        continue;
      }

      const firstName = user.name?.split(' ')[0] || 'there';

      // Send push notification
      await sendPushToUser(db, user.id, {
        title: nudge.pushTitle,
        body: nudge.pushBody,
        data: {
          type: 'isolation_nudge',
          url: '/dashboard',
        },
      });

      // Send email
      if (user.email) {
        const html = emailWrapper({
          preheader: nudge.pushBody,
          body: `
            <h2 style="font-family:Georgia,serif;font-size:20px;color:#0f0e1a;margin:0 0 12px;">
              Hey ${escapeHtml(firstName)}
            </h2>
            <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 20px;">
              ${escapeHtml(nudge.emailSnippet)}
            </p>
            <p style="font-size:13px;color:#9ca3af;line-height:1.5;margin:0;">
              Your rival is isolation. Every small connection chips away at it.
            </p>
          `,
          ctaUrl: `${APP_URL}/dashboard`,
          ctaLabel: 'Open Dashboard',
          footerNote:
            'You receive these nudges because isolation is one of your rivals on Be Candid.',
        });

        await getResend()
          .emails.send({
            from: FROM,
            to: user.email,
            subject: nudge.emailSubject,
            html,
          })
          .catch(() => {}); // Non-fatal
      }

      // Record the nudge
      await db.from('isolation_nudges').insert({
        user_id: user.id,
        nudge_type: nudgeType,
        sent_at: now.toISOString(),
      });

      results.nudgesSent++;
    } catch (e) {
      console.error(`[isolation-nudges] Failed for user ${user.id}:`, e);
      results.errors++;
    }
  }

    await logCronRun(db, 'isolation-nudges', {sent: results.nudgesSent, skipped: results.skipped, users_processed: results.total});
  return NextResponse.json({ ok: true, ...results });
}
