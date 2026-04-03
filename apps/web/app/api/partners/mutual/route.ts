export const dynamic = 'force-dynamic';
// POST /api/partners/mutual — enable mutual accountability
// Both users monitor each other via a single partnership

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { safeError, auditLog } from '@/lib/security';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return safeError('POST /api/partners/mutual', 'Unauthorized', 401);

    const blocked = checkUserRate(actionLimiter, user.id);
    if (blocked) return blocked;

    const db = createServiceClient();

    // Find active partnership (user could be either side)
    const { data: asUser } = await db
      .from('partners')
      .select('id, mutual')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    const { data: asPartner } = await db
      .from('partners')
      .select('id, mutual')
      .eq('partner_user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    const partnership = asUser ?? asPartner;
    if (!partnership) {
      return NextResponse.json({ error: 'No active partnership found' }, { status: 404 });
    }

    if (partnership.mutual) {
      return NextResponse.json({ error: 'Already in mutual accountability mode' }, { status: 400 });
    }

    // Only the partner (non-initiator) can upgrade to mutual
    // This ensures the monitored user consented first, and now the partner opts in
    if (asUser && !asPartner) {
      return NextResponse.json({
        error: 'Your partner must enable mutual accountability from their side',
      }, { status: 400 });
    }

    // Enable mutual
    await db.from('partners').update({ mutual: true }).eq('id', partnership.id);

    // Ensure the partner-side user has goals and monitoring set up
    const { data: partnerProfile } = await db
      .from('users')
      .select('goals, monitoring_enabled')
      .eq('id', user.id)
      .single();

    const needsOnboarding = !partnerProfile?.goals?.length;

    auditLog({
      action: 'settings.changed',
      userId: user.id,
      metadata: { change: 'mutual_accountability_enabled', partnershipId: partnership.id },
    });

    return NextResponse.json({
      success: true,
      mutual: true,
      needsOnboarding,
    });
  } catch (err) {
    return safeError('POST /api/partners/mutual', err);
  }
}
