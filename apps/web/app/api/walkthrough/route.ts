export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { safeError } from '@/lib/security';

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

    const blocked = await checkUserRate(actionLimiter, user.id);
    if (blocked) return blocked;

    const body = await req.json().catch(() => ({}));
    if (body.dismiss) {
      const { error } = await supabase
        .from('users')
        .update({ walkthrough_dismissed_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) {
        return safeError('PATCH /api/walkthrough', error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
