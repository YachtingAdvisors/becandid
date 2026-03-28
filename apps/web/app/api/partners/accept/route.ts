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
    .select('*')
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

  return NextResponse.json({ success: true });
}
