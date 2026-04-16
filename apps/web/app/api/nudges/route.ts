export const dynamic = 'force-dynamic';
// GET   /api/nudges — list unacknowledged nudges
// PATCH /api/nudges — acknowledge a nudge by id

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: nudges } = await supabase
    .from('nudges')
    .select('*')
    .eq('user_id', user.id)
    .eq('acknowledged', false)
    .order('sent_at', { ascending: false })
    .limit(10);

  return NextResponse.json({ nudges: nudges ?? [] });
}

export async function PATCH(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  await supabase
    .from('nudges')
    .update({ acknowledged: true, acknowledged_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id);

  return NextResponse.json({ success: true });
}
