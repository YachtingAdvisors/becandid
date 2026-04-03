export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';

/**
 * GET /api/partners/scores
 *
 * Computes a compatibility/effectiveness score for each active partner.
 * Score = weighted average of:
 *   - Response time (30%): how quickly they respond to alerts
 *   - Check-in rate (35%): % of check-ins they completed
 *   - Avg conversation rating (35%): partner_rating from conversation_outcomes
 */
export async function GET(_req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = createServiceClient();

    // Get all active partners
    const { data: partners } = await db
      .from('partners')
      .select('id, partner_name, partner_user_id')
      .eq('user_id', user.id)
      .in('status', ['active', 'accepted']);

    if (!partners || partners.length === 0) {
      return NextResponse.json({ scores: [] });
    }

    // Get alerts for response time calculation
    const { data: alerts } = await db
      .from('alerts')
      .select('id, partner_notified, partner_responded_at, sent_at')
      .eq('user_id', user.id)
      .eq('partner_notified', true);

    // Get all check-ins
    const { data: checkIns } = await db
      .from('check_ins')
      .select('id, partner_user_id, partner_confirmed_at, status')
      .eq('user_id', user.id);

    // Get conversation outcomes for ratings
    const { data: outcomes } = await db
      .from('conversation_outcomes')
      .select('partner_rating, alert_id')
      .eq('user_id', user.id)
      .not('partner_rating', 'is', null);

    // Get conversation counts
    const { data: conversations } = await db
      .from('conversations')
      .select('id, user_id')
      .eq('user_id', user.id);

    const scores = partners.map(partner => {
      const partnerUserId = partner.partner_user_id;

      // Response time: avg minutes between alert sent_at and partner_responded_at
      const partnerAlerts = (alerts ?? []).filter(a => a.partner_responded_at);
      let responseTime = 0;
      if (partnerAlerts.length > 0) {
        const totalMinutes = partnerAlerts.reduce((sum, a) => {
          const sent = new Date(a.sent_at).getTime();
          const responded = new Date(a.partner_responded_at).getTime();
          return sum + Math.max(0, (responded - sent) / 60000);
        }, 0);
        responseTime = totalMinutes / partnerAlerts.length;
      }

      // Check-in rate: % where partner confirmed
      const partnerCheckIns = (checkIns ?? []).filter(
        c => c.partner_user_id === partnerUserId
      );
      const completedCheckIns = partnerCheckIns.filter(c => c.partner_confirmed_at != null);
      const checkInRate = partnerCheckIns.length > 0
        ? (completedCheckIns.length / partnerCheckIns.length) * 100
        : 0;

      // Average rating
      const ratings = (outcomes ?? []).map(o => o.partner_rating).filter((r): r is number => r != null);
      const avgRating = ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : 0;

      // Conversation count
      const conversationCount = conversations?.length ?? 0;

      // Composite score (0-100)
      // Response time: ideal < 15 min (100pts), max at 480 min (0pts)
      const responseScore = partnerAlerts.length > 0
        ? Math.max(0, Math.min(100, 100 - ((responseTime - 15) / (480 - 15)) * 100))
        : 50; // neutral if no data

      const ratingScore = ratings.length > 0
        ? ((avgRating - 1) / 4) * 100
        : 50; // neutral if no data

      const checkInScore = partnerCheckIns.length > 0 ? checkInRate : 50;

      const score = Math.round(
        responseScore * 0.30 +
        checkInScore * 0.35 +
        ratingScore * 0.35
      );

      return {
        partnerId: partner.id,
        partnerName: partner.partner_name,
        score: Math.max(0, Math.min(100, score)),
        responseTime: Math.round(responseTime),
        checkInRate: Math.round(checkInRate),
        avgRating: Math.round(avgRating * 10) / 10,
        conversationCount,
      };
    });

    return NextResponse.json({ scores });
  } catch (err) {
    console.error('Partner scores error:', err);
    return NextResponse.json({ error: 'Failed to compute scores' }, { status: 500 });
  }
}
