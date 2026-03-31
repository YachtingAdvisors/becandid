export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';

/**
 * PATCH /api/walkthrough
 * Body: { dismiss?: boolean }
 *
 * Sets walkthrough_dismissed_at = NOW() to permanently hide the walkthrough.
 */
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const db = createServiceClient();

    if (body.dismiss) {
      const { error } = await db
        .from('users')
        .update({ walkthrough_dismissed_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
