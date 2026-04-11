export const dynamic = 'force-dynamic';
// POST /api/check-ins/[id]/confirm

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { confirmUserCheckIn, confirmPartnerCheckIn, type UserMood, type PartnerMood } from '@/lib/checkInEngine';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { safeError, sanitizeText, isValidUUID, auditLog } from '@/lib/security';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return safeError('POST /api/check-ins/confirm', 'Unauthorized', 401);

    const blocked = checkUserRate(actionLimiter, user.id);
    if (blocked) return blocked;

    const checkInId = id;
    if (!isValidUUID(checkInId)) {
      return safeError('POST /api/check-ins/confirm', 'Invalid ID', 400);
    }

    const body = await req.json().catch(() => null);
    if (!body?.mood) {
      return NextResponse.json({ error: 'mood is required' }, { status: 400 });
    }

    const db = createServiceClient();

    const { data: checkIn } = await db
      .from('check_ins')
      .select('user_id, partner_user_id, status')
      .eq('id', checkInId)
      .single();

    if (!checkIn) return safeError('POST /api/check-ins/confirm', 'Not found', 404);

    const isMonitoredUser = checkIn.user_id === user.id;
    const isPartner = checkIn.partner_user_id === user.id;
    if (!isMonitoredUser && !isPartner) return safeError('POST /api/check-ins/confirm', 'Forbidden', 403);

    // Sanitize response text
    const cleanResponse = body.response ? sanitizeText(body.response, 1000) : undefined;

    let result;

    if (isMonitoredUser) {
      const validMoods: UserMood[] = ['great', 'good', 'okay', 'struggling', 'crisis'];
      if (!validMoods.includes(body.mood)) {
        return NextResponse.json({ error: 'Invalid mood' }, { status: 400 });
      }
      result = await confirmUserCheckIn(db, checkInId, user.id, body.mood, cleanResponse);
    } else {
      const validMoods: PartnerMood[] = ['confident', 'hopeful', 'concerned', 'worried'];
      if (!validMoods.includes(body.mood)) {
        return NextResponse.json({ error: 'Invalid mood' }, { status: 400 });
      }
      result = await confirmPartnerCheckIn(db, checkInId, user.id, body.mood, cleanResponse);
    }

    auditLog({
      action: 'checkin.confirmed',
      userId: user.id,
      metadata: { checkInId, role: isMonitoredUser ? 'user' : 'partner', mood: body.mood },
    });

    return NextResponse.json({
      success: true,
      status: result.status,
      role: isMonitoredUser ? 'user' : 'partner',
      bothConfirmed: result.status === 'completed',
      milestonesUnlocked: result.milestonesUnlocked,
    });
  } catch (err: any) {
    const status = err.message?.includes('already') ? 409
      : err.message?.includes('expired') ? 410 : 500;
    return safeError('POST /api/check-ins/confirm', err, status);
  }
}
