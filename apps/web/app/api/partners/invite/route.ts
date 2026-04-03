export const dynamic = 'force-dynamic';
// GET /api/partners/invite?token=xxx — lookup an invite by token
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 });

  const limited = checkUserRate(actionLimiter, `invite:${token}`);
  if (limited) return limited;

  const db = createServiceClient();

  const { data: partner } = await db
    .from('partners')
    .select('partner_name, status, user_id')
    .eq('invite_token', token)
    .eq('status', 'pending')
    .maybeSingle();

  if (!partner) {
    return NextResponse.json({ error: 'Invite not found or already used' }, { status: 404 });
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
