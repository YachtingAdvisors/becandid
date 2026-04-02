export const dynamic = 'force-dynamic';

// ============================================================
// app/api/webhooks/stripe/route.ts
//
// Stripe webhook endpoint. Handles:
//   - checkout.session.completed  -> activate subscription
//   - customer.subscription.updated -> plan changes, trial end
//   - customer.subscription.deleted -> cancellation
//   - invoice.payment_failed -> payment retry / dunning
//
// Setup:
//   1. In Stripe Dashboard -> Webhooks -> Add endpoint
//   2. URL: https://becandid.io/api/webhooks/stripe
//   3. Events: checkout.session.completed,
//      customer.subscription.updated,
//      customer.subscription.deleted,
//      invoice.payment_failed
//   4. Copy signing secret to STRIPE_WEBHOOK_SECRET env var
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe, syncSubscription } from '@/lib/stripe/server';
import { STRIPE_CONFIG } from '@/lib/stripe/config';
import { createServiceClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, STRIPE_CONFIG.webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          await syncSubscription(subscription);
          console.info(`[stripe] Checkout completed: ${subscription.id}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscription(subscription);
        console.info(`[stripe] Subscription updated: ${subscription.id} -> ${subscription.status}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscription(subscription);
        console.info(`[stripe] Subscription canceled: ${subscription.id}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Find user by Stripe customer ID
        const db = createServiceClient();
        const { data: user } = await db.from('users')
          .select('id, email, name')
          .eq('stripe_customer_id', customerId)
          .single();

        if (user) {
          // Update status to past_due
          await db.from('users').update({
            subscription_status: 'past_due',
          }).eq('id', user.id);

          // Audit log
          await db.from('audit_log').insert({
            user_id: user.id,
            action: 'payment_failed',
            metadata: {
              invoice_id: invoice.id,
              attempt_count: invoice.attempt_count,
              next_attempt: invoice.next_payment_attempt
                ? new Date(invoice.next_payment_attempt * 1000).toISOString()
                : null,
            },
          });

          console.info(`[stripe] Payment failed for user ${user.id}, attempt ${invoice.attempt_count}`);
        }
        break;
      }

      default:
        console.info(`[stripe] Unhandled event: ${event.type}`);
    }
  } catch (error) {
    console.error(`[Stripe] Webhook handler error for ${event.type}:`, error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
