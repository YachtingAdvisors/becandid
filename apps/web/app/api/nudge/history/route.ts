export const dynamic = 'force-dynamic';
// GET /api/nudge/history — get nudge history for the logged-in user

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { safeError } from '@/lib/security';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return safeError('GET /api/nudge/history', 'Unauthorized', 401);

    const { data: nudges } = await supabase
      .from('nudge_log')
      .select('id, mood, message, delivered_email, delivered_sms, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    return NextResponse.json({ nudges: nudges ?? [] });
  } catch (err) {
    return safeError('GET /api/nudge/history', err);
  }
}
