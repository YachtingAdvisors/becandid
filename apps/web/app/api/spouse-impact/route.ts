export const dynamic = 'force-dynamic';
// ============================================================
// app/api/spouse-impact/route.ts
//
// GET → returns spouse impact data for the USER's dashboard
// Only includes data the spouse has consented to share.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { decrypt } from '@/lib/encryption';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { checkFeatureGate } from '@/lib/stripe/featureGate';

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = await checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  // Feature gate: spouse experience requires Pro+
  const gate = await checkFeatureGate(user.id, 'spouseExperience');
  if (!gate.allowed) {
    return NextResponse.json(
      { error: gate.reason, upgrade_to: gate.requiredPlan },
      { status: 403 },
    );
  }

  const db = createServiceClient();

  // Check if user has a spouse partner
  const { data: partner } = await db.from('partners')
    .select('id, partner_name, partner_user_id, relationship, spouse_trust_trend, spouse_contender_level')
    .eq('user_id', user.id)
    .eq('relationship', 'spouse')
    .eq('status', 'accepted')
    .single();

  if (!partner) {
    return NextResponse.json({ is_spouse_relationship: false });
  }

  // Get consented impact check-ins (visible_to_partner = true)
  const { data: impacts } = await db.from('spouse_impact')
    .select('feelings, trust_level, created_at')
    .eq('partner_id', partner.id)
    .eq('visible_to_partner', true)
    .order('created_at', { ascending: false })
    .limit(10);

  // Aggregate recent feelings
  const feelingCounts: Record<string, number> = {};
  (impacts || []).forEach((i: any) => {
    (i.feelings || []).forEach((f: string) => { feelingCounts[f] = (feelingCounts[f] || 0) + 1; });
  });
  const recentFeelings = Object.entries(feelingCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([f]) => f);

  // Get shared journal entries
  const { data: sharedEntries } = await db.from('spouse_journal')
    .select('id, created_at, shared_at, freewrite, impact, needs')
    .eq('partner_id', partner.id)
    .eq('shared_with_partner', true)
    .order('shared_at', { ascending: false })
    .limit(3);

  // Decrypt shared entries
  const decryptedShared = (sharedEntries || []).map((e: any) => ({
    id: e.id,
    created_at: e.created_at,
    shared_at: e.shared_at,
    freewrite: e.freewrite ? decrypt(e.freewrite, partner.partner_user_id) : null,
    impact: e.impact ? decrypt(e.impact, partner.partner_user_id) : null,
    needs: e.needs ? decrypt(e.needs, partner.partner_user_id) : null,
  }));

  return NextResponse.json({
    is_spouse_relationship: true,
    spouse_name: partner.partner_name || 'Your spouse',
    trust_trend: partner.spouse_trust_trend || 'unknown',
    contender_level: partner.spouse_contender_level || 0,
    recent_feelings: recentFeelings,
    shared_entries: decryptedShared,
  });
}
