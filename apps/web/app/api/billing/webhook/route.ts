export const dynamic = 'force-dynamic';
// ============================================================
// app/api/billing/webhook/route.ts
//
// DEPRECATED: This endpoint is superseded by /api/webhooks/stripe.
// Returns 410 Gone so any stale Stripe webhook config pointing
// here will surface an error in the Stripe dashboard, prompting
// the operator to update it to the canonical URL.
//
// Previously this contained a full duplicate handler that could
// process Stripe events independently, risking double-processing
// (e.g. duplicate subscription syncs, duplicate dunning emails).
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

export async function POST(_req: NextRequest) {
  console.warn(
    '[billing/webhook] Received request on deprecated endpoint. ' +
    'Update your Stripe webhook URL to /api/webhooks/stripe.'
  );

  return NextResponse.json(
    {
      error: 'This webhook endpoint is deprecated. Use /api/webhooks/stripe instead.',
      migration: 'Update your Stripe Dashboard webhook URL to https://becandid.io/api/webhooks/stripe',
    },
    { status: 410 }
  );
}
