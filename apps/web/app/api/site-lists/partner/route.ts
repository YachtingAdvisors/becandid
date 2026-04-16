export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { safeError } from '@/lib/security';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';

// ─── GET — fetch WHITELIST sites for the caller's partner ────
// The caller is the partner; we look up who they are a partner FOR,
// then return only whitelist entries for that user.

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const blocked = await checkUserRate(actionLimiter, user.id);
    if (blocked) return blocked;

    const db = createServiceClient();

    // Find who this caller is a partner for.
    // The partner row stores partner_email matching the caller's email,
    // or we look for a partner_user_id field if it exists.
    // The partners table has user_id (the person being helped) and
    // partner_email (the partner). We match on the caller's email.
    const { data: partnerRow } = await db
      .from('partners')
      .select('user_id')
      .eq('partner_email', user.email)
      .in('status', ['active', 'accepted'])
      .maybeSingle();

    if (!partnerRow) {
      return NextResponse.json({ error: 'No active partnership found' }, { status: 404 });
    }

    // Fetch only WHITELIST entries for the partner's user
    const { data: sites, error } = await db
      .from('site_lists')
      .select('id, domain, list_type, added_at')
      .eq('user_id', partnerRow.user_id)
      .eq('list_type', 'whitelist')
      .order('added_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ sites: sites ?? [] });
  } catch (err) {
    return safeError('GET /api/site-lists/partner', err);
  }
}
