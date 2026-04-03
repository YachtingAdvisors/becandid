export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/authFromRequest';
import { createServiceClient } from '@/lib/supabase';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';

/**
 * GET /api/extension/settings
 * Returns user monitoring settings for the Chrome extension.
 * Authenticated via Bearer token.
 */
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  const db = createServiceClient();
  const [profileRes, rulesRes] = await Promise.all([
    db.from('users').select('monitoring_enabled, goals, content_filter_level').eq('id', user.id).single(),
    db.from('content_rules').select('domain, rule_type, category').eq('user_id', user.id),
  ]);

  return NextResponse.json({
    monitoring_enabled: profileRes.data?.monitoring_enabled ?? true,
    goals: profileRes.data?.goals ?? [],
    content_filter_level: profileRes.data?.content_filter_level ?? 'standard',
    content_rules: rulesRes.data ?? [],
  });
}
