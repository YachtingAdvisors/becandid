export const dynamic = 'force-dynamic';

// ============================================================
// app/api/billing/route.ts
//
// POST  -> create Stripe Checkout session (upgrade/subscribe)
// GET   -> get current subscription status
// PATCH -> create Stripe Customer Portal session (manage billing)
// PUT   -> (legacy) alias for PATCH — kept for backward compat
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { createCheckoutSession, createPortalSession } from '@/lib/stripe/server';
import { STRIPE_CONFIG, getPlanLimits } from '@/lib/stripe/config';
import { accountLimiter, checkUserRate } from '@/lib/rateLimit';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://becandid.io';

// -- POST: Create checkout session --------------------------------

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = checkUserRate(accountLimiter, user.id);
  if (blocked) return blocked;

  const body = await req.json();
  let { price_id } = body;

  // Accept both raw Stripe price IDs and key names (e.g. "pro_monthly")
  const priceKeys = STRIPE_CONFIG.prices as Record<string, string>;
  if (price_id && price_id in priceKeys) {
    price_id = priceKeys[price_id];
  }

  // Validate price ID
  const validPrices = Object.values(STRIPE_CONFIG.prices);
  if (!price_id || !validPrices.includes(price_id)) {
    return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
  }

  try {
    const session = await createCheckoutSession(
      user.id,
      price_id,
      `${APP_URL}/dashboard/settings?checkout=success`,
      `${APP_URL}/dashboard/settings?checkout=canceled`
    );

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout session creation failed:', error);
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
  }
}

// -- GET: Current subscription status -----------------------------

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = createServiceClient();
  const { data: profile } = await db.from('users')
    .select('subscription_plan, subscription_status, trial_ends_at, stripe_customer_id, grandfathered, is_supporter, supporter_until, total_donated')
    .eq('id', user.id)
    .single();

  const plan = profile?.subscription_plan || 'free';
  const limits = getPlanLimits(plan);

  // Count AI guides used this month
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const { count: guidesUsed } = await db.from('alerts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', monthStart.toISOString())
    .not('user_guide', 'is', null);

  const isTrialing = profile?.subscription_status === 'trialing';
  const trialEndsAt = profile?.trial_ends_at;
  const trialDaysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86400000))
    : 0;

  return NextResponse.json({
    plan,
    status: profile?.subscription_status || 'active',
    limits,
    usage: {
      ai_guides_used: guidesUsed ?? 0,
      ai_guides_limit: limits.aiGuidesPerMonth === Infinity ? null : limits.aiGuidesPerMonth,
    },
    trial: isTrialing ? {
      active: true,
      days_left: trialDaysLeft,
      ends_at: trialEndsAt,
    } : null,
    grandfathered: !!profile?.grandfathered,
    has_payment_method: !!profile?.stripe_customer_id,
    supporter: {
      is_supporter: profile?.is_supporter || false,
      supporter_until: profile?.supporter_until || null,
      total_donated: profile?.total_donated || 0,
    },
    prices: STRIPE_CONFIG.prices,
  });
}

// -- PATCH: Open customer portal ----------------------------------

export async function PATCH(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = checkUserRate(accountLimiter, user.id);
  if (blocked) return blocked;

  try {
    const session = await createPortalSession(
      user.id,
      `${APP_URL}/dashboard/settings`
    );

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Portal session creation failed:', error);
    return NextResponse.json({ error: 'Failed to open billing portal' }, { status: 500 });
  }
}

// -- PUT: Legacy alias for PATCH (BillingSection uses PUT) --------

export async function PUT(req: NextRequest) {
  return PATCH(req);
}
