export const dynamic = 'force-dynamic';
// GET   /api/auth/profile — fetch profile
// PATCH /api/auth/profile — update profile
// POST  /api/auth/profile — create profile (signup)

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { UpdateProfileSchema } from '@be-candid/shared';
import { safeError, sanitizeName, sanitizePhone, auditLog } from '@/lib/security';
import { generateReferralCode, applyReferralReward } from '@/lib/referral';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return safeError('GET /api/auth/profile', 'Unauthorized', 401);

    const db = createServiceClient();
    const { data: profile } = await db.from('users').select('*').eq('id', user.id).single();
    if (!profile) return safeError('GET /api/auth/profile', 'Not found', 404);

    return NextResponse.json({ profile });
  } catch (err) {
    return safeError('GET /api/auth/profile', err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return safeError('PATCH /api/auth/profile', 'Unauthorized', 401);

    const blocked = checkUserRate(actionLimiter, user.id);
    if (blocked) return blocked;

    const body = await req.json().catch(() => null);
    if (!body) return safeError('PATCH /api/auth/profile', 'Invalid JSON', 400);

    const parsed = UpdateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten() }, { status: 400 });
    }

    // Sanitize text fields
    const updateData: Record<string, any> = { ...parsed.data, updated_at: new Date().toISOString() };
    if (updateData.name) updateData.name = sanitizeName(updateData.name);
    if (updateData.phone) {
      const cleanPhone = sanitizePhone(updateData.phone);
      if (!cleanPhone) {
        return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
      }
      updateData.phone = cleanPhone;
    }

    const db = createServiceClient();

    // If goals are changing, fetch old goals for comparison
    let oldGoals: string[] | null = null;
    if (updateData.goals) {
      const { data: current } = await db.from('users').select('goals, name').eq('id', user.id).single();
      oldGoals = current?.goals ?? [];
    }

    const { error } = await db.from('users').update(updateData).eq('id', user.id);
    if (error) return safeError('PATCH /api/auth/profile', error);

    auditLog({ action: 'profile.update', userId: user.id, metadata: { fields: Object.keys(parsed.data) } });

    // Notify partner when rivals change
    if (updateData.goals && oldGoals) {
      const newGoals: string[] = updateData.goals;
      const added = newGoals.filter((g: string) => !oldGoals!.includes(g));
      const removed = oldGoals.filter((g: string) => !newGoals.includes(g));

      if (added.length > 0 || removed.length > 0) {
        try {
          const { data: partner } = await db
            .from('partners')
            .select('partner_email, partner_name, partner_user_id')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .maybeSingle();

          const { data: profile } = await db.from('users').select('name').eq('id', user.id).single();

          if (partner?.partner_email) {
            const { Resend } = await import('resend');
            const resend = new Resend(process.env.RESEND_API_KEY!);
            const from = process.env.RESEND_FROM_EMAIL ?? 'alerts@updates.becandid.io';
            const userName = profile?.name ?? 'Your partner';

            const addedList = added.length > 0 ? `<p style="margin:0 0 8px;"><strong>New focus areas:</strong> ${added.join(', ')}</p>` : '';
            const removedList = removed.length > 0 ? `<p style="margin:0 0 8px;"><strong>Removed:</strong> ${removed.join(', ')}</p>` : '';

            await resend.emails.send({
              from,
              to: partner.partner_email,
              subject: `${userName} updated their rivals`,
              html: `<p><strong>${userName}</strong> has updated the rivals they're focusing on.</p>${addedList}${removedList}<p>This means their growth direction may be shifting. Check in with them about what they're climbing toward.</p>`,
            });
          }
        } catch (notifErr) {
          console.error('[auth/profile] Partner notification on goals change failed:', notifErr);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return safeError('PATCH /api/auth/profile', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return safeError('POST /api/auth/profile', 'Unauthorized', 401);

    const blocked = checkUserRate(actionLimiter, user.id);
    if (blocked) return blocked;

    const body = await req.json().catch(() => null);
    if (!body?.name) return safeError('POST /api/auth/profile', 'Name required', 400);

    const db = createServiceClient();

    // Check if profile already exists
    const { data: existing } = await db.from('users').select('id').eq('id', user.id).maybeSingle();
    if (existing) return NextResponse.json({ success: true }); // Already exists

    // Generate a unique referral code for this user
    const refCode = generateReferralCode();

    // Set trial: 21 days standard, will become 30 if they add a partner in session
    const trialDays = 21;
    const trialEnds = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString();

    const { error } = await db.from('users').insert({
      id: user.id,
      email: user.email!,
      name: sanitizeName(body.name),
      referral_code: refCode,
      trial_ends_at: trialEnds,
      subscription_status: 'trialing',
    });

    if (error) return safeError('POST /api/auth/profile', error);

    auditLog({ action: 'auth.signup', userId: user.id });

    // Notify admin of new signup
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY!);
      const from = process.env.RESEND_FROM_EMAIL ?? 'alerts@updates.becandid.io';
      await resend.emails.send({
        from,
        to: 'slaser90@gmail.com',
        subject: `New signup: ${sanitizeName(body.name)}`,
        html: `<p><strong>${sanitizeName(body.name)}</strong> (${user.email}) just signed up for Be Candid.</p><p>Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}</p>`,
      });
    } catch (emailErr) {
      console.error('[auth/profile] Admin notification failed:', emailErr);
    }

    // Process referral if a code was provided
    if (body.referral_code && typeof body.referral_code === 'string') {
      const { data: referrer } = await db
        .from('users')
        .select('id')
        .eq('referral_code', body.referral_code)
        .maybeSingle();

      if (referrer && referrer.id !== user.id) {
        await db
          .from('users')
          .update({ referred_by: referrer.id })
          .eq('id', user.id);

        await applyReferralReward(db, referrer.id, user.id, body.referral_code);
        auditLog({ action: 'referral.applied', userId: user.id, metadata: { referrerId: referrer.id } });
      }
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    return safeError('POST /api/auth/profile', err);
  }
}
