export const dynamic = 'force-dynamic';
// POST /api/billing/promo — apply a promo code to bypass payment

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { safeError, auditLog } from '@/lib/security';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';

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

    const blocked = checkUserRate(actionLimiter, user.id);
    if (blocked) return blocked;

    const body = await req.json().catch(() => null);
    if (!body?.code) return NextResponse.json({ error: 'Promo code required' }, { status: 400 });

    const code = body.code.trim();
    const db = createServiceClient();

    // ── Check organization plans first ──────────────────────────
    const { data: orgPlan } = await db.from('organization_plans')
      .select('id, org_name, price_per_user, max_users, users_enrolled')
      .eq('promo_code', code.toUpperCase())
      .eq('active', true)
      .single();

    if (orgPlan) {
      // Check capacity
      if (orgPlan.users_enrolled >= orgPlan.max_users) {
        return NextResponse.json(
          { error: 'This group plan has reached its member limit. Contact your organization leader.' },
          { status: 400 },
        );
      }

      // Grant Pro features at group pricing
      await db.from('users').update({
        subscription_plan: 'pro',
        subscription_status: 'active',
        plan_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        org_plan_id: orgPlan.id,
      }).eq('id', user.id);

      // Increment enrolled count
      await db.from('organization_plans')
        .update({ users_enrolled: orgPlan.users_enrolled + 1 })
        .eq('id', orgPlan.id);

      auditLog({
        action: 'settings.changed' as any,
        userId: user.id,
        metadata: { promo_code: code, plan: 'pro', org_plan: orgPlan.org_name, type: 'org_plan' },
      });

      return NextResponse.json({
        success: true,
        plan: 'pro',
        org_name: orgPlan.org_name,
        message: `Welcome! You now have Pro access through ${orgPlan.org_name}'s group plan.`,
      });
    }

    // ── Check static promo codes ────────────────────────────────
    const promo = PROMO_CODES[code];

    if (!promo) {
      return NextResponse.json({ error: 'Invalid promo code' }, { status: 400 });
    }

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
