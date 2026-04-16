export const dynamic = 'force-dynamic';

// ============================================================
// POST /api/billing/donate
//
// Creates a one-time Stripe Checkout session with a custom
// donation amount. No pre-created price needed — uses price_data.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { stripe, getOrCreateCustomer } from '@/lib/stripe/server';
import { accountLimiter, checkUserRate } from '@/lib/rateLimit';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://becandid.io';
const MIN_AMOUNT_CENTS = 100; // $1 minimum

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = await checkUserRate(accountLimiter, user.id);
  if (blocked) return blocked;

  const { amount } = await req.json();

  // amount is in dollars from the UI
  const cents = Math.round(Number(amount) * 100);
  if (!cents || cents < MIN_AMOUNT_CENTS) {
    return NextResponse.json({ error: 'Minimum donation is $1' }, { status: 400 });
  }

  try {
    const customerId = await getOrCreateCustomer(user.id);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Support Be Candid',
              description: 'Thank you for supporting Be Candid! You\'ll receive 30 days of Pro + a Supporter badge.',
            },
            unit_amount: cents,
          },
          quantity: 1,
        },
      ],
      success_url: `${APP_URL}/dashboard/settings?donation=success`,
      cancel_url: `${APP_URL}/dashboard/settings?donation=canceled`,
      metadata: {
        supabase_user_id: user.id,
        type: 'donation',
        amount_cents: String(cents),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Donation checkout failed:', error);
    return NextResponse.json({ error: 'Failed to create donation checkout' }, { status: 500 });
  }
}
