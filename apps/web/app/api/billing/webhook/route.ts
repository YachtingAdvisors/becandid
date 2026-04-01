export const dynamic = 'force-dynamic';
// POST /api/billing/webhook — Stripe webhook handler
// Updates user plan when subscription is created, updated, or cancelled

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  let event: any;

  try {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('[webhook] STRIPE_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
    }

    // Verify signature
    let Stripe: any;
    try { Stripe = (await import('stripe')).default; } catch {
      return NextResponse.json({ error: 'Stripe not available' }, { status: 503 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' });

    try {
      event = stripe.webhooks.constructEvent(body, sig!, webhookSecret);
    } catch (err: any) {
      console.error('[webhook] Signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
  } catch (err) {
    console.error('[webhook] Failed to parse webhook:', err);
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const db = createServiceClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const subscriptionId = session.subscription;

        if (userId && subscriptionId) {
          await db.from('users').update({
            plan: 'pro',
            stripe_subscription_id: subscriptionId,
            plan_expires_at: null, // Active subscription
          }).eq('id', userId);

          console.info(`[stripe] User ${userId} upgraded to Pro`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        const { data: user } = await db
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle();

        if (user) {
          const isActive = subscription.status === 'active' || subscription.status === 'trialing';
          await db.from('users').update({
            plan: isActive ? 'pro' : 'free',
            plan_expires_at: isActive ? null : new Date(subscription.current_period_end * 1000).toISOString(),
          }).eq('id', user.id);

          console.info(`[stripe] User ${user.id} subscription ${subscription.status}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        const { data: user } = await db
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle();

        if (user) {
          // Keep Pro access until period end
          await db.from('users').update({
            plan: 'free',
            plan_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
          }).eq('id', user.id);

          console.info(`[stripe] User ${user.id} subscription cancelled, access until ${new Date(subscription.current_period_end * 1000).toISOString()}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        const { data: user } = await db
          .from('users')
          .select('id, email')
          .eq('stripe_customer_id', customerId)
          .maybeSingle();

        if (user) {
          console.info(`[stripe] Payment failed for user ${user.id} (${user.email})`);
          // Could send a payment failed email here
        }
        break;
      }

      default:
        console.info(`[stripe] Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error(`[webhook] Error processing ${event.type}:`, err);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
