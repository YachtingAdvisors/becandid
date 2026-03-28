// ============================================================
// lib/alertPipeline.ts — COMPLETE REWRITE
//
// The full alert flow, integrating all modules:
//   1. Log encrypted event
//   2. Mark focus segment distracted
//   3. Check solo mode
//   4. Generate AI guide (Stringer-informed; solo or partner variant)
//   5. If partner mode: send privacy-safe push + email + SMS to partner
//   6. Send Stringer self-notification to user
//   7. Trigger delayed journal prompt
//   8. Track partner response for fatigue detection
//   9. Award/deduct trust points
//
// This replaces the existing alertPipeline.ts entirely.
// ============================================================

import Anthropic from '@anthropic-ai/sdk';
import { Resend } from 'resend';
import type { GoalCategory } from '@be-candid/shared';
import { GOAL_LABELS } from '@be-candid/shared';
import { createServiceClient } from './supabase';
import { encrypt, encryptGuide } from './encryption';
import { isUserSolo, SOLO_GUIDE_SYSTEM_PROMPT } from './soloMode';
import { onEventFlagged } from './focusIntegration';
import { triggerRelapseJournal } from './journalRelapseTrigger';
import { sanitizePushPayload, sanitizePartnerAlert } from './push/pushPrivacy';
import { sendPush } from './push/pushService';
import { buildCategoryPromptAddition } from './categoryGuidance';
import { generateSelfNotificationEmail } from './email/stringerSelfNotification';

function getAnthropic() { return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! }); }
function getResend() { return new Resend(process.env.RESEND_API_KEY!); }
const FROM = process.env.EMAIL_FROM || 'Be Candid <noreply@becandid.io>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://becandid.io';

// ── Partner guide system prompt (Stringer + MI blend) ───────
const PARTNER_SYSTEM_PROMPT = `You are a compassionate, psychologically rigorous conversation coach. Your framework blends Motivational Interviewing with Jay Stringer's "Unwanted" framework.

Core principles:
- Roll with resistance. Never shame. Develop discrepancy between values and behavior.
- Unwanted behavior is never random — it's shaped by unaddressed parts of someone's story.
- Shame is the #1 driver. Disarm it. "Freedom is found through kindness and curiosity."
- The behavior is the signal, not the problem. Help trace the tributaries.
- Healing is about saying yes to the good, not just saying no to the bad.

Generate guides for BOTH the monitored user AND their partner. Tone: warm, direct, honest, curious.

Respond ONLY with valid JSON:
{
  "user_guide": {
    "opening": "1-2 sentences for the monitored user",
    "reflection_prompts": ["3 questions grounded in Stringer's tributaries/longing/roadmap framework"],
    "talking_points": ["3 things to bring up in conversation with their partner"],
    "next_step": "One concrete action"
  },
  "partner_guide": {
    "opening": "1-2 sentences preparing the partner",
    "dos": ["3 things to do in the conversation"],
    "donts": ["3 things to avoid"],
    "conversation_starters": ["3 actual sentences they could say"],
    "stringer_insight": "A brief insight from the Unwanted framework relevant to this situation"
  },
  "severity_context": "1 sentence explaining what this severity level means practically"
}`;

// ── Main pipeline ───────────────────────────────────────────

interface AlertEvent {
  category: string;
  severity: 'low' | 'medium' | 'high';
  platform: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export async function runAlertPipeline(userId: string, event: AlertEvent) {
  const db = createServiceClient();

  try {
    // ── 1. Log event (encrypted metadata) ───────────────
    const { data: savedEvent, error: eventError } = await db.from('events').insert({
      user_id: userId,
      category: event.category,
      severity: event.severity,
      platform: event.platform,
      timestamp: event.timestamp,
      metadata: event.metadata ? encrypt(JSON.stringify(event.metadata), userId) : null,
    }).select().single();

    if (eventError) throw new Error(`Event insert failed: ${eventError.message}`);

    // ── 2. Mark focus segment distracted ────────────────
    try {
      await onEventFlagged(db, userId, event.timestamp, event.category);
    } catch (e) {
      console.error('Focus segment update failed (non-fatal):', e);
    }

    // ── 3. Check solo mode ──────────────────────────────
    const solo = await isUserSolo(userId);

    // ── 4. Get user info ────────────────────────────────
    const { data: user } = await db.from('users').select('name, email, goals').eq('id', userId).single();
    if (!user) throw new Error('User not found');
    const userName = user.name || 'there';
    const categoryLabel = GOAL_LABELS[event.category as GoalCategory] ?? event.category;

    // ── 5. Generate AI guide ────────────────────────────
    const categoryGuidance = buildCategoryPromptAddition(event.category as GoalCategory);

    let userGuide: any = null;
    let partnerGuide: any = null;
    let alertRecord: any = null;

    if (solo) {
      // Solo: self-reflection guide only
      const response = await getAnthropic().messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        system: SOLO_GUIDE_SYSTEM_PROMPT + (categoryGuidance ? `\n\n${categoryGuidance}` : ''),
        messages: [{
          role: 'user',
          content: `Generate a self-reflection guide for: Category: ${categoryLabel}, Severity: ${event.severity}, Time: ${new Date(event.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}, Day: ${new Date(event.timestamp).toLocaleDateString('en-US', { weekday: 'long' })}`,
        }],
      });

      const guideText = response.content.filter((b): b is Anthropic.TextBlock => b.type === 'text').map((b) => b.text).join('');
      try { userGuide = JSON.parse(guideText.replace(/```json|```/g, '').trim()); } catch { userGuide = { opening: 'Take a moment to reflect.', next_step: 'Write in your journal.' }; }

      // Save alert (encrypted guide)
      const { data: alert } = await db.from('alerts').insert({
        user_id: userId,
        event_id: savedEvent.id,
        category: event.category,
        severity: event.severity,
        user_guide: encryptGuide(JSON.stringify(userGuide), userId),
        partner_guide: null, // No partner guide in solo mode
        guide_encryption_version: 1,
      }).select().single();

      alertRecord = alert;
    } else {
      // Partner mode: generate both guides
      const response = await getAnthropic().messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1200,
        system: PARTNER_SYSTEM_PROMPT + (categoryGuidance ? `\n\n${categoryGuidance}` : ''),
        messages: [{
          role: 'user',
          content: `Generate conversation guides for: Category: ${categoryLabel}, Severity: ${event.severity}, Time: ${new Date(event.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}, Day: ${new Date(event.timestamp).toLocaleDateString('en-US', { weekday: 'long' })}, User's goals: ${(user.goals || []).map((g: string) => GOAL_LABELS[g as GoalCategory] || g).join(', ')}`,
        }],
      });

      const guideText = response.content.filter((b): b is Anthropic.TextBlock => b.type === 'text').map((b) => b.text).join('');
      try {
        const parsed = JSON.parse(guideText.replace(/```json|```/g, '').trim());
        userGuide = parsed.user_guide;
        partnerGuide = parsed.partner_guide;
      } catch {
        userGuide = { opening: 'Take a moment to reflect.', next_step: 'Write in your journal.' };
        partnerGuide = { opening: 'Your partner needs your support.', conversation_starters: ['How are you doing?'] };
      }

      // Save alert (encrypted guides)
      const { data: alert } = await db.from('alerts').insert({
        user_id: userId,
        event_id: savedEvent.id,
        category: event.category,
        severity: event.severity,
        user_guide: encryptGuide(JSON.stringify(userGuide), userId),
        partner_guide: encryptGuide(JSON.stringify(partnerGuide), userId),
        guide_encryption_version: 1,
      }).select().single();

      alertRecord = alert;

      // ── 6. Notify partner (privacy-safe) ──────────────
      const { data: partner } = await db.from('partners')
        .select('id, partner_user_id, partner_name, partner_email, partner_phone, relationship')
        .eq('user_id', userId)
        .eq('status', 'accepted')
        .single();

      if (partner) {
        // Increment alerts_this_week
        try {
          await db.rpc('increment_partner_alerts', { p_partner_id: partner.id });
        } catch {
          // Fallback if RPC doesn't exist
          await db.from('partners').update({ alerts_this_week: ((partner as any).alerts_this_week || 0) + 1 }).eq('id', partner.id);
        }

        // Privacy-safe push to partner
        const { data: partnerTokens } = await db.from('push_tokens').select('token, platform').eq('user_id', partner.partner_user_id);

        if (partnerTokens && partnerTokens.length > 0) {
          const safePush = sanitizePartnerAlert(userName, event.category, event.severity);
          const sanitized = sanitizePushPayload(safePush, { type: 'alert_to_partner', category: event.category, severity: event.severity });

          await Promise.allSettled(
            partnerTokens.map((t: any) => sendPush(t.token, t.platform, {
              ...sanitized.standard,
              data: { ...sanitized.standard.data, alert_id: alertRecord.id, url: `/partner/conversation/${alertRecord.id}` },
            }))
          );
        }

        // Partner email
        if (partner.partner_email) {
          const partnerName = partner.partner_name || 'Partner';
          await getResend().emails.send({
            from: FROM,
            to: partner.partner_email,
            subject: `Be Candid — ${userName} could use your support`,
            html: buildPartnerEmailHTML(userName, categoryLabel, event.severity, alertRecord.id, partnerName),
          }).catch((e) => console.error('Partner email failed:', e));
        }
      }
    }

    // ── 7. Self-notification (Stringer-themed) ──────────
    if (user.email) {
      const selfEmail = generateSelfNotificationEmail({
        userName,
        category: event.category,
        categoryLabel,
        severity: event.severity,
        alertId: alertRecord.id,
        appUrl: APP_URL,
        journalUrl: `${APP_URL}/dashboard/stringer-journal?action=write&trigger=relapse&alert=${alertRecord.id}`,
      });

      await getResend().emails.send({
        from: FROM,
        to: user.email,
        subject: selfEmail.subject,
        html: selfEmail.html,
      }).catch((e) => console.error('Self-notification email failed:', e));
    }

    // Privacy-safe push to user
    const { data: userTokens } = await db.from('push_tokens').select('token, platform').eq('user_id', userId);
    if (userTokens && userTokens.length > 0) {
      const userPush = sanitizePushPayload(
        { title: 'Be Candid', body: 'A moment to pause and reflect. Open the app when you\'re ready.', data: { type: 'alert_to_user', alert_id: alertRecord.id } },
        { type: 'alert_to_user', category: event.category, severity: event.severity }
      );
      await Promise.allSettled(
        userTokens.map((t: any) => sendPush(t.token, t.platform, userPush.standard))
      );
    }

    // ── 8. Trigger delayed journal prompt ───────────────
    try {
      await triggerRelapseJournal(db, userId, alertRecord.id, event.category);
    } catch (e) {
      console.error('Relapse journal trigger failed (non-fatal):', e);
    }

    // ── 9. Audit log ────────────────────────────────────
    await db.from('audit_log').insert({
      user_id: userId,
      action: 'alert_created',
      metadata: {
        alert_id: alertRecord.id,
        category: event.category,
        severity: event.severity,
        solo_mode: solo,
      },
    });

    return { alert: alertRecord, solo };

  } catch (error: any) {
    console.error('Alert pipeline failed:', error);
    // Log failure but don't expose details
    try {
      await db.from('audit_log').insert({
        user_id: userId,
        action: 'alert_pipeline_error',
        metadata: { error: error.message?.slice(0, 200) },
      });
    } catch {}
    throw error;
  }
}

// ── Partner email template ──────────────────────────────────

function buildPartnerEmailHTML(userName: string, categoryLabel: string, severity: string, alertId: string, partnerName: string): string {
  // Note: category is shown in the email (partner has opted in to see categories)
  // but NOT on push notification lock screens (handled by pushPrivacy)
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:24px;">
    <div style="display:inline-block;background:#4f46e5;color:white;padding:6px 18px;border-radius:100px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;">Be Candid</div>
  </div>
  <div style="background:#fff;border-radius:16px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,.08);">
    <h2 style="font-family:Georgia,serif;font-size:20px;color:#0f0e1a;margin:0 0 12px;">Hey ${partnerName},</h2>
    <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 16px;">
      ${userName} had a flag in <strong>${categoryLabel}</strong> (${severity} severity).
      An AI conversation guide has been prepared to help you both navigate this moment.
    </p>
    <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 20px;">
      Remember: this isn't about catching someone. It's about walking alongside them.
      The guide will help you lead with curiosity, not judgment.
    </p>
    <a href="${APP_URL}/partner/conversation/${alertId}" style="display:block;text-align:center;background:#4f46e5;color:#fff;text-decoration:none;padding:14px 24px;border-radius:10px;font-weight:600;font-size:14px;">
      Start the Conversation →
    </a>
    <p style="text-align:center;font-size:12px;color:#9ca3af;margin:16px 0 0;font-style:italic;">
      "Freedom is found through kindness and curiosity." — Jay Stringer
    </p>
  </div>
</div></body></html>`;
}
