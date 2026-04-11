// ============================================================
// lib/stripe/server.ts
//
// Server-side Stripe helpers. Used by API routes.
// ============================================================

import Stripe from 'stripe';
import { createServiceClient } from '@/lib/supabase';
import { STRIPE_CONFIG, priceIdToPlan } from './config';

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-06-20',
    });
  }
  return _stripe;
}

/** Lazy-initialized Stripe instance via Proxy */
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as any)[prop];
  },
});

// ── Get or create Stripe customer ───────────────────────────

export async function getOrCreateCustomer(userId: string): Promise<string> {
  const db = createServiceClient();
  const { data: user } = await db.from('users')
    .select('stripe_customer_id, email, name')
    .eq('id', userId)
    .single();

  if (user?.stripe_customer_id) return user.stripe_customer_id;

  // Create new customer
  const customer = await stripe.customers.create({
    email: user?.email || undefined,
    name: user?.name || undefined,
    metadata: { supabase_user_id: userId },
  });

  await db.from('users').update({
    stripe_customer_id: customer.id,
  }).eq('id', userId);

  return customer.id;
}

// ── Create checkout session ─────────────────────────────────

export async function createCheckoutSession(
  userId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  const customerId = await getOrCreateCustomer(userId);

  // Check if user is eligible for trial
  const db = createServiceClient();
  const { data: user } = await db.from('users')
    .select('trial_ends_at, subscription_plan')
    .eq('id', userId)
    .single();

  const hasUsedTrial = !!user?.trial_ends_at;
  const isUpgrade = user?.subscription_plan && user.subscription_plan !== 'free';

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
    // 21-day trial for first-time subscribers only
    subscription_data: (!hasUsedTrial && !isUpgrade) ? {
      trial_period_days: STRIPE_CONFIG.trialDays,
      metadata: { supabase_user_id: userId },
    } : {
      metadata: { supabase_user_id: userId },
    },
    metadata: { supabase_user_id: userId },
    // Enable Link for one-click checkout
    payment_method_collection: 'if_required',
  });

  return session;
}

// ── Create customer portal session ──────────────────────────
// Lets users manage billing, update card, cancel, etc.

export async function createPortalSession(
  userId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  const customerId = await getOrCreateCustomer(userId);

  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

// ── Sync subscription status from Stripe to Supabase ────────
// Called by webhook handler after any subscription change.

export async function syncSubscription(subscription: Stripe.Subscription) {
  const db = createServiceClient();
  const userId = subscription.metadata?.supabase_user_id;

  if (!userId) {
    // Try to find user by Stripe customer ID
    const { data: user } = await db.from('users')
      .select('id')
      .eq('stripe_customer_id', subscription.customer as string)
      .single();
    if (!user) {
      console.error('Cannot find user for subscription:', subscription.id);
      return;
    }
    return syncSubscriptionForUser(db, user.id, subscription);
  }

  return syncSubscriptionForUser(db, userId, subscription);
}

async function syncSubscriptionForUser(
  db: any,
  userId: string,
  subscription: Stripe.Subscription
) {
  const priceId = subscription.items.data[0]?.price?.id;
  const plan = priceId ? priceIdToPlan(priceId) : 'free';

  const statusMap: Record<string, string> = {
    active: 'active',
    trialing: 'trialing',
    past_due: 'past_due',
    canceled: 'canceled',
    unpaid: 'canceled',
    incomplete: 'active', // Payment pending but access granted
    incomplete_expired: 'canceled',
    paused: 'canceled',
  };

  const status = statusMap[subscription.status] || 'active';

  const update: any = {
    subscription_plan: status === 'canceled' ? 'free' : plan,
    subscription_status: status,
  };

  // Set trial_ends_at if trialing
  if (subscription.trial_end) {
    update.trial_ends_at = new Date(subscription.trial_end * 1000).toISOString();
  }

  await db.from('users').update(update).eq('id', userId);

  // Audit log
  await db.from('audit_log').insert({
    user_id: userId,
    action: 'subscription_updated',
    metadata: {
      plan,
      status: subscription.status,
      stripe_subscription_id: subscription.id,
    },
  });
}
