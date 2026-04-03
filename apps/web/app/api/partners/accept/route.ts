export const dynamic = 'force-dynamic';
// POST /api/partners/accept — accept a partner invitation
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 });

  const db = createServiceClient();

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
    partner_user_id: user.id,
    status: 'active',
    accepted_at: new Date().toISOString(),
  }).eq('id', partner.id);

  // Grant the accepting partner 30 free days
  const { data: acceptingUser } = await db
    .from('users')
    .select('subscription_plan, subscription_status, trial_ends_at')
    .eq('id', user.id)
    .single();

  if (acceptingUser && acceptingUser.subscription_plan === 'free') {
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const currentTrialEnd = acceptingUser.trial_ends_at ? new Date(acceptingUser.trial_ends_at) : null;
    // Only extend if new date is further out than existing trial
    if (!currentTrialEnd || new Date(thirtyDaysFromNow) > currentTrialEnd) {
      await db.from('users').update({
        subscription_status: 'trialing',
        trial_ends_at: thirtyDaysFromNow,
      }).eq('id', user.id);
    }
  }

  return NextResponse.json({ success: true });
}
