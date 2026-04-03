export const dynamic = 'force-dynamic';
// POST /api/partners/accept — accept a partner invitation
//
// Two modes:
//   1. Authenticated user: reads user from session cookies (normal flow)
//   2. Inline signup: caller passes { token, userId } when the session cookie
//      may not be set yet (sign-up-and-accept race condition). The userId is
//      only trusted because the invite token itself is the secret.
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient, ensureUserRow } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { token, userId: inlineUserId } = body;
  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 });

  const db = createServiceClient();

  // --- Resolve the accepting user ---
  let acceptingUserId: string | null = null;

  // Try cookie-based session first
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    acceptingUserId = user.id;
  } else if (inlineUserId && typeof inlineUserId === 'string') {
    // Inline signup flow: the session cookie hasn't propagated yet.
    // Verify the userId actually exists in Supabase auth before trusting it.
    const { data: authUser } = await db.auth.admin.getUserById(inlineUserId);
    if (authUser?.user) {
      acceptingUserId = authUser.user.id;
      // Ensure the public.users row exists (signup is fire-and-forget)
      await ensureUserRow(db, authUser.user);
    }
  }

  if (!acceptingUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // --- Validate invite token ---
  const { data: partner } = await db
    .from('partners')
    .select('id')
    .eq('invite_token', token)
    .eq('status', 'pending')
    .maybeSingle();

  if (!partner) {
    return NextResponse.json({ error: 'Invalid or expired invite' }, { status: 404 });
  }

  // Update partner record
  await db.from('partners').update({
    partner_user_id: acceptingUserId,
    status: 'active',
    accepted_at: new Date().toISOString(),
  }).eq('id', partner.id);

  // Grant the accepting partner 30 free days
  const { data: acceptingUser } = await db
    .from('users')
    .select('subscription_plan, subscription_status, trial_ends_at')
    .eq('id', acceptingUserId)
    .single();

  if (acceptingUser && acceptingUser.subscription_plan === 'free') {
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const currentTrialEnd = acceptingUser.trial_ends_at ? new Date(acceptingUser.trial_ends_at) : null;
    // Only extend if new date is further out than existing trial
    if (!currentTrialEnd || new Date(thirtyDaysFromNow) > currentTrialEnd) {
      await db.from('users').update({
        subscription_status: 'trialing',
        trial_ends_at: thirtyDaysFromNow,
      }).eq('id', acceptingUserId);
    }
  }

  return NextResponse.json({ success: true });
}
