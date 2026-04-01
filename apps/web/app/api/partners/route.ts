export const dynamic = 'force-dynamic';
// GET  /api/partners — get active partner
// POST /api/partners — invite a partner

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { z } from 'zod';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { safeError, sanitizeName, sanitizeEmail, sanitizePhone, auditLog } from '@/lib/security';

const InviteSchema = z.object({
  partner_name: z.string().min(1).max(100),
  partner_email: z.string().email().max(254),
  partner_phone: z.string().max(20).optional(),
  relationship_type: z.string().min(1).max(50),
});

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Please sign in to view your partner. Your session may have expired.' }, { status: 401 });

    const db = createServiceClient();
    const { data: partners } = await db
      .from('partners')
      .select('id, partner_name, partner_email, partner_phone, status, relationship, invited_at, accepted_at')
      .eq('user_id', user.id)
      .in('status', ['active', 'accepted', 'pending'])
      .order('invited_at', { ascending: false });

    // Also return the legacy single partner for backward compatibility
    const partner = partners?.[0] ?? null;

    const { data: userPlan } = await db
      .from('users').select('subscription_plan').eq('id', user.id).single();
    const isPro = userPlan?.subscription_plan === 'pro' || userPlan?.subscription_plan === 'therapy';

    return NextResponse.json({ partner, partners: partners ?? [], maxPartners: isPro ? 3 : 2 });
  } catch (err) {
    return safeError('GET /api/partners', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Please sign in to invite a partner. Your session may have expired — try refreshing the page.' }, { status: 401 });

    const blocked = checkUserRate(actionLimiter, user.id);
    if (blocked) return blocked;

    const body = await req.json().catch(() => null);
    if (!body) return safeError('POST /api/partners', 'Invalid JSON', 400);

    const parsed = InviteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten() }, { status: 400 });
    }

    // Sanitize
    const cleanName = sanitizeName(parsed.data.partner_name);
    const cleanEmail = sanitizeEmail(parsed.data.partner_email);
    if (!cleanEmail) return NextResponse.json({ error: 'Invalid email' }, { status: 400 });

    // Can't invite yourself
    if (cleanEmail === user.email?.toLowerCase()) {
      return NextResponse.json({ error: 'You cannot be your own partner' }, { status: 400 });
    }

    const cleanPhone = parsed.data.partner_phone ? sanitizePhone(parsed.data.partner_phone) : null;

    const db = createServiceClient();

    // Check partner limit: 2 for free users, 3 for Pro
    const { data: existingPartners } = await db
      .from('partners').select('id').eq('user_id', user.id).in('status', ['active', 'accepted', 'pending']);
    const { data: userPlan } = await db
      .from('users').select('subscription_plan').eq('id', user.id).single();
    const isPro = userPlan?.subscription_plan === 'pro' || userPlan?.subscription_plan === 'therapy';
    const maxPartners = isPro ? 3 : 2;
    const currentCount = existingPartners?.length ?? 0;

    if (currentCount >= maxPartners) {
      const upgradeMsg = isPro
        ? `You've reached the maximum of ${maxPartners} partners.`
        : `You've reached the free plan limit of ${maxPartners} partners. Upgrade to Pro to add a 3rd partner.`;
      return NextResponse.json({ error: upgradeMsg }, { status: 400 });
    }

    const inviteToken = crypto.randomUUID();

    const { data: partner, error } = await db
      .from('partners')
      .insert({
        user_id: user.id,
        partner_email: cleanEmail,
        partner_name: cleanName,
        partner_phone: cleanPhone,
        relationship: parsed.data.relationship_type,
        invite_token: inviteToken,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Partner insert error:', JSON.stringify(error));
      return NextResponse.json({ error: `Partner invite failed: ${error.message}` }, { status: 400 });
    }

    // Store primary relationship type on user (first selected value)
    const primaryRelationship = parsed.data.relationship_type.split(',')[0].trim();
    const { error: userUpdateError } = await db.from('users').update({
      relationship_type: primaryRelationship,
      partner_id: partner.id,
    }).eq('id', user.id);

    if (userUpdateError) {
      console.error('User update error:', JSON.stringify(userUpdateError));
      // Non-fatal — partner was created, user update failed
    }

    // If user is on a trial, extend to 30 days from now (bonus for adding a partner)
    const { data: trialUser } = await db
      .from('users')
      .select('subscription_status, trial_ends_at, created_at')
      .eq('id', user.id)
      .single();

    if (trialUser?.subscription_status === 'trialing') {
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      await db
        .from('users')
        .update({ trial_ends_at: thirtyDaysFromNow })
        .eq('id', user.id);
    }

    auditLog({
      action: 'partner.invite',
      userId: user.id,
      metadata: { partnerEmail: cleanEmail },
    });

    return NextResponse.json({ partner }, { status: 201 });
  } catch (err) {
    return safeError('POST /api/partners', err);
  }
}
