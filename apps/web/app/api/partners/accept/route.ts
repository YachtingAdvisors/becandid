export const dynamic = 'force-dynamic';
// POST /api/partners/accept — accept a partner invitation
//
// Requires an authenticated session and the signed-in email must match
// the invited partner_email on the pending invite.
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient, ensureUserRow } from '@/lib/supabase';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { getInviteTokenCandidates, isInviteExpired, normalizeInviteToken } from '@/lib/inviteTokens';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const token = normalizeInviteToken(body?.token);
  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 });

  const db = createServiceClient();

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await ensureUserRow(db, user);

  const blocked = await checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  const { data: partner } = await db
    .from('partners')
    .select('id, partner_email, invite_expires_at')
    .in('invite_token', getInviteTokenCandidates(token))
    .eq('status', 'pending')
    .maybeSingle();

  if (!partner) {
    return NextResponse.json({ error: 'Invalid or expired invite' }, { status: 404 });
  }
  if (isInviteExpired(partner.invite_expires_at)) {
    return NextResponse.json({ error: 'This invitation has expired' }, { status: 410 });
  }

  const signedInEmail = user.email?.trim().toLowerCase();
  const invitedEmail = partner.partner_email.trim().toLowerCase();

  if (!signedInEmail || signedInEmail !== invitedEmail) {
    return NextResponse.json(
      { error: 'Sign in with the invited email address to accept this partnership' },
      { status: 403 }
    );
  }

  await db.from('partners').update({
    partner_user_id: user.id,
    status: 'active',
    accepted_at: new Date().toISOString(),
    invite_token: null,
    invite_expires_at: null,
  }).eq('id', partner.id);

  const { data: acceptingUser } = await db
    .from('users')
    .select('subscription_plan, subscription_status, trial_ends_at')
    .eq('id', user.id)
    .single();

  if (acceptingUser && acceptingUser.subscription_plan === 'free') {
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const currentTrialEnd = acceptingUser.trial_ends_at ? new Date(acceptingUser.trial_ends_at) : null;
    if (!currentTrialEnd || new Date(thirtyDaysFromNow) > currentTrialEnd) {
      await db.from('users').update({
        subscription_status: 'trialing',
        trial_ends_at: thirtyDaysFromNow,
      }).eq('id', user.id);
    }
  }

  return NextResponse.json({ success: true });
}
