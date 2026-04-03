export const dynamic = 'force-dynamic';
// GET /api/referrals — fetch referral stats for the logged-in user

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { safeError } from '@/lib/security';
import { getReferralStats } from '@/lib/referral';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return safeError('GET /api/referrals', 'Unauthorized', 401);

    const blocked = checkUserRate(actionLimiter, user.id);
    if (blocked) return blocked;

    const db = createServiceClient();
    const stats = await getReferralStats(db, user.id);

    return NextResponse.json(stats);
  } catch (err) {
    return safeError('GET /api/referrals', err);
  }
}
