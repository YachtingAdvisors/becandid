export const dynamic = 'force-dynamic';
// POST /api/billing/promo — apply a promo code to bypass payment

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { safeError, auditLog } from '@/lib/security';

// Valid promo codes and what they grant
const PROMO_CODES: Record<string, { plan: string; days: number }> = {
  'HONEST': { plan: 'pro', days: 365 },
  'honest': { plan: 'pro', days: 365 },
  'Honest': { plan: 'pro', days: 365 },
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return safeError('POST /api/billing/promo', 'Unauthorized', 401);

    const body = await req.json().catch(() => null);
    if (!body?.code) return NextResponse.json({ error: 'Promo code required' }, { status: 400 });

    const code = body.code.trim();
    const promo = PROMO_CODES[code];

    if (!promo) {
      return NextResponse.json({ error: 'Invalid promo code' }, { status: 400 });
    }

    const db = createServiceClient();
    const expiresAt = new Date(Date.now() + promo.days * 24 * 60 * 60 * 1000).toISOString();

    await db.from('users').update({
      subscription_plan: promo.plan,
      subscription_status: 'active',
      plan_expires_at: expiresAt,
    }).eq('id', user.id);

    auditLog({
      action: 'settings.changed' as any,
      userId: user.id,
      metadata: { promo_code: code, plan: promo.plan, days: promo.days },
    });

    return NextResponse.json({
      success: true,
      plan: promo.plan,
      expires_at: expiresAt,
      message: `Promo code applied! You now have ${promo.plan} access for ${promo.days} days.`,
    });
  } catch (err) {
    return safeError('POST /api/billing/promo', err);
  }
}
