export const dynamic = 'force-dynamic';
// GET /api/alerts — list alerts for current user with events and conversations
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = createServiceClient();
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '30'), 100);

  const { data: alerts } = await db
    .from('alerts')
    .select(`
      id, sent_at, email_sent, sms_sent, ai_guide_user, ai_guide_partner,
      events (id, category, severity, platform, app_name, timestamp),
      conversations (id, completed_at, outcome, notes)
    `)
    .eq('user_id', user.id)
    .order('sent_at', { ascending: false })
    .limit(limit);

  return NextResponse.json({ alerts: alerts ?? [] });
}
