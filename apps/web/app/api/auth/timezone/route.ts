export const dynamic = 'force-dynamic';
// PATCH /api/auth/timezone
// Update the user's timezone setting

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';

const VALID_TIMEZONES = [
  'Pacific/Honolulu', 'America/Anchorage', 'America/Los_Angeles',
  'America/Denver', 'America/Phoenix', 'America/Chicago',
  'America/New_York', 'America/Puerto_Rico', 'America/Sao_Paulo',
  'Europe/London', 'Europe/Paris', 'Europe/Athens',
  'Asia/Dubai', 'Asia/Kolkata', 'Asia/Singapore',
  'Asia/Tokyo', 'Australia/Sydney', 'Pacific/Auckland',
];

export async function PATCH(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = await checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  const { timezone } = await req.json();

  if (!timezone || !VALID_TIMEZONES.includes(timezone)) {
    return NextResponse.json({ error: 'Invalid timezone' }, { status: 400 });
  }

  const { error } = await supabase
    .from('users')
    .update({ timezone, updated_at: new Date().toISOString() })
    .eq('id', user.id);

  if (error) {
    return NextResponse.json({ error: 'Failed to update timezone' }, { status: 500 });
  }

  return NextResponse.json({ success: true, timezone });
}
