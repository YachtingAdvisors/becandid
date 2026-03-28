export const dynamic = 'force-dynamic';
// POST /api/billing — create Stripe checkout session
// GET  /api/billing — get current plan status
// PUT  /api/billing — create Stripe portal session

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { safeError, auditLog } from '@/lib/security';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://becandid.io';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return safeError('GET /api/billing', 'Unauthorized', 401);

    const db = createServiceClient();
    const { data: profile } = await db
      .from('users')
      .select('plan, stripe_customer_id, plan_expires_at')
      .eq('id', user.id)
      .single();

    const isActive = profile?.plan === 'pro' || profile?.plan === 'team';
    const expired = profile?.plan_expires_at && new Date(profile.plan_expires_at) < new Date();

    return NextResponse.json({
      plan: expired ? 'free' : (profile?.plan ?? 'free'),
      hasStripe: !!profile?.stripe_customer_id,
      expiresAt: profile?.plan_expires_at,
      limits: getPlanLimits(expired ? 'free' : (profile?.plan ?? 'free')),
    });
  } catch (err) {
    return safeError('GET /api/billing', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return safeError('POST /api/billing', 'Unauthorized', 401);

    // Dynamic import to avoid errors when Stripe isn't configured
    let Stripe: any;
    try {
      Stripe = (await import('stripe')).default;
    } catch {
      return NextResponse.json({
        error: 'Billing not configured. Set STRIPE_SECRET_KEY.',
        fallback: true,
      }, { status: 503 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' });
    const db = createServiceClient();

    const { data: profile } = await db
      .from('users')
      .select('email, stripe_customer_id')
      .eq('id', user.id)
      .single();

    // Get or create Stripe customer
    let customerId = profile?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email ?? user.email!,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await db.from('users').update({ stripe_customer_id: customerId }).eq('id', user.id);
    }

    const priceId = process.env.STRIPE_PRO_PRICE_ID;
    if (!priceId) {
      return NextResponse.json({ error: 'Pro plan price not configured' }, { status: 503 });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${APP_URL}/dashboard/settings?billing=success`,
      cancel_url: `${APP_URL}/dashboard/settings?billing=cancelled`,
      metadata: { userId: user.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    return safeError('POST /api/billing', err);
  }
}

// Create billing portal session
export async function PUT(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return safeError('PUT /api/billing', 'Unauthorized', 401);

    let Stripe: any;
    try { Stripe = (await import('stripe')).default; } catch {
      return NextResponse.json({ error: 'Billing not configured' }, { status: 503 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' });
    const db = createServiceClient();

    const { data: profile } = await db
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ error: 'No billing account found' }, { status: 404 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${APP_URL}/dashboard/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    return safeError('PUT /api/billing', err);
  }
}

function getPlanLimits(plan: string) {
  const limits = {
    free: {
      aiGuidesPerMonth: 3,
      regenerationsPerMonth: 3,
      maxPartners: 1,
      vulnerabilityWindows: 3,
      weeklyDigest: true,
      patternDetection: false,
    },
    pro: {
      aiGuidesPerMonth: -1, // unlimited
      regenerationsPerMonth: -1,
      maxPartners: 3,
      vulnerabilityWindows: 10,
      weeklyDigest: true,
      patternDetection: true,
    },
    team: {
      aiGuidesPerMonth: -1,
      regenerationsPerMonth: -1,
      maxPartners: 10,
      vulnerabilityWindows: 20,
      weeklyDigest: true,
      patternDetection: true,
    },
  };
  return limits[plan as keyof typeof limits] ?? limits.free;
}
