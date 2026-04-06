export const dynamic = 'force-dynamic';

// GET  /api/therapist/referrals — therapist's referral stats
// POST /api/therapist/referrals — generate a therapist-specific referral code

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { safeError, auditLog, sanitizeName } from '@/lib/security';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { Resend } from 'resend';
import { emailWrapper } from '@/lib/email/template';

const FROM = process.env.RESEND_FROM_EMAIL ?? 'alerts@updates.becandid.io';
const ADMIN_EMAIL = 'shawn@becandid.io';
const REFERRALS_FOR_REWARD = 3;

function generateCode(name: string): string {
  const clean = name
    .replace(/^(Dr\.?\s*)/i, '')
    .replace(/[^a-zA-Z]/g, '')
    .slice(0, 12)
    .toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `DR-${clean}-${rand}`;
}

// ── GET — referral stats ──────────────────────────────────────

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return safeError('GET /api/therapist/referrals', 'Unauthorized', 401);

    const db = createServiceClient();

    // Verify therapist
    const { data: profile } = await db.from('users')
      .select('is_therapist, name')
      .eq('id', user.id)
      .single();

    if (!profile?.is_therapist) {
      return NextResponse.json({ error: 'Therapist access required' }, { status: 403 });
    }

    // Get referrals
    const { data: referrals } = await db.from('therapist_referrals')
      .select('id, referral_code, status, reward_granted, created_at')
      .eq('therapist_user_id', user.id)
      .order('created_at', { ascending: false });

    const all = referrals || [];
    const code = all.length > 0 ? all[0].referral_code : null;
    const total = all.length;
    const signedUp = all.filter(r => r.status === 'signed_up' || r.status === 'subscribed').length;
    const subscribed = all.filter(r => r.status === 'subscribed').length;
    const rewardsEarned = all.filter(r => r.reward_granted).length;

    return NextResponse.json({
      code,
      total,
      signed_up: signedUp,
      subscribed,
      rewards_earned: rewardsEarned,
      referrals_for_reward: REFERRALS_FOR_REWARD,
      progress: subscribed % REFERRALS_FOR_REWARD,
    });
  } catch (err) {
    return safeError('GET /api/therapist/referrals', err);
  }
}

// ── POST — generate referral code ─────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return safeError('POST /api/therapist/referrals', 'Unauthorized', 401);

    const blocked = checkUserRate(actionLimiter, user.id);
    if (blocked) return blocked;

    const db = createServiceClient();

    // Verify therapist
    const { data: profile } = await db.from('users')
      .select('is_therapist, name')
      .eq('id', user.id)
      .single();

    if (!profile?.is_therapist) {
      return NextResponse.json({ error: 'Therapist access required' }, { status: 403 });
    }

    // Check if therapist already has a code
    const { data: existing } = await db.from('therapist_referrals')
      .select('referral_code')
      .eq('therapist_user_id', user.id)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({
        code: existing[0].referral_code,
        message: 'Referral code already exists.',
      });
    }

    const therapistName = sanitizeName(profile.name || 'Therapist');
    const code = generateCode(therapistName);

    // Create initial referral record as a "seed" so the code is saved
    await db.from('therapist_referrals').insert({
      therapist_user_id: user.id,
      referral_code: code,
      status: 'pending',
    });

    auditLog({
      action: 'settings.changed' as any,
      userId: user.id,
      metadata: { event: 'therapist_referral_code_generated', code },
    });

    // Notify admin
    try {
      const resend = new Resend(process.env.RESEND_API_KEY!);
      await resend.emails.send({
        from: FROM,
        to: ADMIN_EMAIL,
        subject: `Therapist referral code generated — ${therapistName}`,
        html: emailWrapper({
          preheader: `${therapistName} is actively referring clients`,
          body: `
            <h2 class="text-heading" style="margin:0 0 8px;color:#1a1a2e;font-size:20px;font-weight:700;">
              New Therapist Referral Code
            </h2>
            <p class="text-body" style="margin:0 0 16px;color:#6b7280;font-size:14px;">
              <strong>${therapistName}</strong> just generated a referral code. They're actively referring clients.
            </p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;background:#f3f4f6;border-radius:8px;">
              <tr><td style="padding:12px 16px;">
                <p style="margin:0;font-size:13px;color:#6b7280;">Referral Code</p>
                <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:#1a1a2e;letter-spacing:0.05em;">${code}</p>
              </td></tr>
            </table>
          `,
          ctaUrl: 'https://becandid.io/admin',
          ctaLabel: 'View Dashboard',
        }),
      });
    } catch {
      // Non-blocking — admin email is best-effort
    }

    return NextResponse.json({
      code,
      message: 'Referral code generated! Share it with your clients.',
    });
  } catch (err) {
    return safeError('POST /api/therapist/referrals', err);
  }
}
