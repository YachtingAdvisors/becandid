export const dynamic = 'force-dynamic';
// POST /api/cron/checkin
// Hourly cron: sends check-ins based on user's frequency setting,
// expires overdue check-ins, and notifies both user and partner.

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import {
  shouldSendCheckIn,
  calculateDueDate,
  expireOverdueCheckIns,
  type CheckInFrequency,
} from '@/lib/checkInEngine';
import { generateContextualPrompt } from '@/lib/checkInPrompts';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const secret = req.headers.get('x-cron-secret') ?? authHeader?.replace('Bearer ', '');
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = createServiceClient();
  const results = { sent: 0, skipped: 0, expired: 0, errors: 0 };

  // Step 1: Expire overdue check-ins
  results.expired = await expireOverdueCheckIns(db);

  // Step 2: Fetch users with check-ins enabled
  const { data: users } = await db
    .from('users')
    .select('id, name, email, phone, goals, check_in_enabled, check_in_hour, check_in_frequency, timezone')
    .eq('check_in_enabled', true);

  if (!users) return NextResponse.json({ ok: true, ...results });

  for (const user of users) {
    try {
      // Get last sent check-in
      const { data: lastCheckIn } = await db
        .from('check_ins')
        .select('sent_at')
        .eq('user_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const frequency = (user.check_in_frequency ?? 'daily') as CheckInFrequency;

      const should = shouldSendCheckIn({
        checkInHour: user.check_in_hour ?? 21,
        timezone: user.timezone ?? 'America/New_York',
        frequency,
        lastSentAt: lastCheckIn?.sent_at ? new Date(lastCheckIn.sent_at) : null,
      });

      if (!should) { results.skipped++; continue; }

      // Get active partner
      const { data: partner } = await db
        .from('partners')
        .select('partner_user_id, partner_name, partner_email')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      const sentAt = new Date();
      const dueAt = calculateDueDate(sentAt, frequency);

      // Generate contextual prompt using Claude
      const prompt = await generateContextualPrompt(
        db, user.id, user.name, user.goals ?? [], frequency
      );

      // Create check-in record
      const { data: checkIn } = await db
        .from('check_ins')
        .insert({
          user_id: user.id,
          partner_user_id: partner?.partner_user_id ?? null,
          prompt,
          status: 'pending',
          sent_at: sentAt.toISOString(),
          due_at: dueAt.toISOString(),
        })
        .select()
        .single();

      if (!checkIn) { results.errors++; continue; }

      // Send notifications to user and partner
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY!);
        const FROM = process.env.RESEND_FROM_EMAIL ?? 'alerts@becandid.io';
        const {
          buildUserCheckInEmail,
          buildPartnerCheckInEmail,
          buildUserCheckInSMS,
          buildPartnerCheckInSMS,
        } = await import('@/lib/checkInNotifications');

        const userEmail = buildUserCheckInEmail({
          userName: user.name,
          prompt: checkIn.prompt,
          checkInId: checkIn.id,
          dueAt: dueAt.toISOString(),
          frequency,
        });

        const sends: Promise<any>[] = [
          resend.emails.send({ from: FROM, to: user.email, ...userEmail }),
        ];

        // Notify partner
        if (partner?.partner_email) {
          const partnerEmail = buildPartnerCheckInEmail({
            partnerName: partner.partner_name,
            monitoredUserName: user.name,
            checkInId: checkIn.id,
            dueAt: dueAt.toISOString(),
          });
          sends.push(resend.emails.send({ from: FROM, to: partner.partner_email, ...partnerEmail }));
        }

        // SMS if phone numbers available
        if (user.phone) {
          const twilio = (await import('twilio')).default;
          const smsClient = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);
          const smsBody = buildUserCheckInSMS(user.name, checkIn.prompt);
          sends.push(
            smsClient.messages.create({
              body: smsBody,
              from: process.env.TWILIO_PHONE_NUMBER!,
              to: user.phone,
            })
          );
        }

        await Promise.allSettled(sends);
      } catch (notifErr) {
        console.error(`[cron/checkin] Notification error for ${user.id}:`, notifErr);
        // Non-fatal — check-in was created even if notification fails
      }

      results.sent++;
    } catch (err) {
      console.error(`[cron/checkin] Error for user ${user.id}:`, err);
      results.errors++;
    }
  }

  return NextResponse.json({ ok: true, ...results });
}

function generateCheckInPrompt(name: string, frequency: CheckInFrequency): string {
  const greetings = [
    `Hey ${name}, time for your check-in.`,
    `${name} — how are things going?`,
    `Check-in time, ${name}.`,
    `${name}, let's take a moment to reflect.`,
  ];

  const frequencyNote = frequency === 'daily'
    ? ''
    : frequency === 'weekly'
      ? ' This is your weekly check-in.'
      : frequency === 'every_2_weeks'
        ? ' This is your bi-weekly check-in.'
        : '';

  const greeting = greetings[Math.floor(Math.random() * greetings.length)];
  return `${greeting}${frequencyNote} How are you feeling about your focus goals? Both you and your partner will need to check in for this to count.`;
}
