export const dynamic = 'force-dynamic';
// GET /api/partners/invite?token=xxx — lookup an invite by token
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { getInviteTokenCandidates, hashInviteToken, isInviteExpired, normalizeInviteToken } from '@/lib/inviteTokens';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = normalizeInviteToken(searchParams.get('token'));
  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 });

  const limited = checkUserRate(actionLimiter, `invite:${hashInviteToken(token)}`);
  if (limited) return limited;

  const db = createServiceClient();
  const tokenCandidates = getInviteTokenCandidates(token);

  const { data: partner } = await db
    .from('partners')
    .select('partner_name, status, user_id, invite_expires_at')
    .in('invite_token', tokenCandidates)
    .eq('status', 'pending')
    .maybeSingle();

  if (!partner) {
    return NextResponse.json({ error: 'Invite not found or already used' }, { status: 404 });
  }
  if (isInviteExpired(partner.invite_expires_at)) {
    return NextResponse.json({ error: 'This invitation has expired' }, { status: 410 });
  }

  // Get inviter name
  const { data: inviter } = await db
    .from('users')
    .select('name')
    .eq('id', partner.user_id)
    .single();

  return NextResponse.json({
    invite: {
      inviter_name: inviter?.name ?? 'Someone',
      partner_name: partner.partner_name,
      status: partner.status,
    },
  });
}
