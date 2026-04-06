export const dynamic = 'force-dynamic';
// GET /api/check-ins — list check-ins for current user (as user or partner)
// Returns check-ins with dual confirmation status

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { getCheckInStats } from '@/lib/checkInEngine';
import { safeError } from '@/lib/security';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const blocked = checkUserRate(actionLimiter, user.id);
    if (blocked) return blocked;

    const db = createServiceClient();
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50);
    const role = searchParams.get('role'); // 'user' | 'partner' | null (both)

    let query = db
      .from('check_ins')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(limit);

    if (role === 'partner') {
      query = query.eq('partner_user_id', user.id);
    } else if (role === 'user') {
      query = query.eq('user_id', user.id);
    } else {
      // Both: check-ins where user is either the monitored user or partner
      query = query.or(`user_id.eq.${user.id},partner_user_id.eq.${user.id}`);
    }

    const { data: checkIns } = await query;

    // Get stats for the monitored user
    const stats = await getCheckInStats(db, user.id);

    return NextResponse.json({
      checkIns: checkIns ?? [],
      stats,
    });
  } catch (err: any) {
    return safeError('GET /api/check-ins', err);
  }
}
