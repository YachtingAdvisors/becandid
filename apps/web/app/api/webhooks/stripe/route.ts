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
//
// Database requirement:
//   The `users` table needs a `payment_failed_at` timestamptz column
//   for the dunning state machine (tracks first failure date).
//   ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_failed_at timestamptz;
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe, syncSubscription } from '@/lib/stripe/server';
import { STRIPE_CONFIG } from '@/lib/stripe/config';
import { createServiceClient } from '@/lib/supabase';
import {
  sendPaymentFailedEmail,
  sendPaymentFollowUpEmail,
  sendDowngradeNotificationEmail,
} from '@/lib/email/paymentFailed';

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
          .select('id, email, name, subscription_plan, subscription_status, payment_failed_at')
          .eq('stripe_customer_id', customerId)
          .single();

        if (user) {
          const now = new Date();
          const attemptCount = invoice.attempt_count ?? 1;
          const planName = user.subscription_plan === 'therapy' ? 'Therapy' : 'Pro';
          const isFirstFailure = user.subscription_status !== 'past_due';

          // State machine: active → past_due (first failure)
          if (isFirstFailure) {
            await db.from('users').update({
              subscription_status: 'past_due',
              payment_failed_at: now.toISOString(),
            }).eq('id', user.id);
          }

          // Calculate days since first failure
          const failedAt = user.payment_failed_at
            ? new Date(user.payment_failed_at)
            : now;
          const daysSinceFirstFailure = Math.floor(
            (now.getTime() - failedAt.getTime()) / (1000 * 60 * 60 * 24)
          );

          // Audit log
          await db.from('audit_log').insert({
            user_id: user.id,
            action: 'payment_failed',
            metadata: {
              invoice_id: invoice.id,
              attempt_count: attemptCount,
              days_since_first_failure: daysSinceFirstFailure,
              next_attempt: invoice.next_payment_attempt
                ? new Date(invoice.next_payment_attempt * 1000).toISOString()
                : null,
            },
          });

          // Dunning email sequence based on days since first failure
          try {
            if (daysSinceFirstFailure >= 7) {
              // 7+ days: downgrade to free and send final email
              await db.from('users').update({
                subscription_plan: 'free',
                subscription_status: 'canceled',
                payment_failed_at: null,
              }).eq('id', user.id);

              await db.from('audit_log').insert({
                user_id: user.id,
                action: 'subscription_downgraded_nonpayment',
                metadata: { previous_plan: user.subscription_plan },
              });

              await sendDowngradeNotificationEmail({
                email: user.email,
                name: user.name || 'there',
                planName,
              });

              console.info(`[stripe] User ${user.id} downgraded to free after 7 days of failed payment`);
            } else if (daysSinceFirstFailure >= 3) {
              // 3+ days: follow-up email with streak data
              const [streakRes, journalRes] = await Promise.all([
                db.from('users')
                  .select('current_streak')
                  .eq('id', user.id)
                  .single(),
                db.from('journal_entries')
                  .select('id', { count: 'exact', head: true })
                  .eq('user_id', user.id),
              ]);

              await sendPaymentFollowUpEmail({
                email: user.email,
                name: user.name || 'there',
                planName,
                streakDays: streakRes.data?.current_streak ?? 0,
                journalCount: journalRes.count ?? 0,
              });

              console.info(`[stripe] Sent follow-up dunning email to user ${user.id} (day ${daysSinceFirstFailure})`);
            } else {
              // First failure: gentle heads-up
              await sendPaymentFailedEmail({
                email: user.email,
                name: user.name || 'there',
                planName,
                attemptCount,
                nextAttempt: invoice.next_payment_attempt
                  ? new Date(invoice.next_payment_attempt * 1000)
                  : null,
              });

              console.info(`[stripe] Sent initial dunning email to user ${user.id}, attempt ${attemptCount}`);
            }
          } catch (emailErr) {
            console.error('[stripe] Dunning email error:', emailErr);
          }
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
