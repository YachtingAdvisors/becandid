export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { safeError } from '@/lib/security';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = createServiceClient();
    const { data } = await db
      .from('users')
      .select('dashboard_layout')
      .eq('id', user.id)
      .single();

    return NextResponse.json({ layout: data?.dashboard_layout ?? null });
  } catch (err: any) {
    return safeError('GET /api/dashboard/layout', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const layout = {
      order: Array.isArray(body.order) ? body.order.slice(0, 50) : [],
      hidden: Array.isArray(body.hidden) ? body.hidden.slice(0, 50) : [],
    };

    const db = createServiceClient();
    await db
      .from('users')
      .update({ dashboard_layout: layout })
      .eq('id', user.id);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return safeError('POST /api/dashboard/layout', err);
  }
}
