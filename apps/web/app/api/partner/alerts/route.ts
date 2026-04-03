export const dynamic = 'force-dynamic';
// GET /api/partner/alerts — list alerts for the user this partner monitors

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { safeError } from '@/lib/security';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return safeError('GET /api/partner/alerts', 'Unauthorized', 401);

    const blocked = checkUserRate(actionLimiter, user.id);
    if (blocked) return blocked;

    const db = createServiceClient();

    // Find who this partner monitors
    const { data: partnership } = await db
      .from('partners')
      .select('user_id')
      .eq('partner_user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (!partnership) {
      return NextResponse.json({ alerts: [] });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '30') || 30, 100);

    const { data: alerts } = await db
      .from('alerts')
      .select(`
        id, sent_at, ai_guide_partner,
        events (category, severity, platform, timestamp),
        conversations (completed_at, outcome)
      `)
      .eq('user_id', partnership.user_id)
      .order('sent_at', { ascending: false })
      .limit(limit);

    return NextResponse.json({ alerts: alerts ?? [] });
  } catch (err) {
    return safeError('GET /api/partner/alerts', err);
  }
}
