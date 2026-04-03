export const dynamic = 'force-dynamic';
// POST /api/push/subscribe — store a Web Push subscription
// DELETE /api/push/subscribe — remove the user's web push subscription

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { safeError, auditLog } from '@/lib/security';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { z } from 'zod';

// Validate the shape of a PushSubscription from the browser
const SubscriptionSchema = z.object({
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string().min(1),
      auth: z.string().min(1),
    }),
    expirationTime: z.number().nullable().optional(),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return safeError('POST /api/push/subscribe', 'Unauthorized', 401);

    const blocked = checkUserRate(actionLimiter, user.id);
    if (blocked) return blocked;

    const body = await req.json().catch(() => null);
    const parsed = SubscriptionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid subscription payload' },
        { status: 400 },
      );
    }

    const token = JSON.stringify(parsed.data.subscription);
    const db = createServiceClient();

    // Upsert: if user already has a web push token, update it.
    // The unique constraint is (user_id, token), but we want one web token per user,
    // so delete any existing web tokens first, then insert.
    await db
      .from('push_tokens')
      .delete()
      .eq('user_id', user.id)
      .eq('platform', 'web');

    const { error } = await db.from('push_tokens').insert({
      user_id: user.id,
      token,
      platform: 'web',
    });

    if (error) {
      console.error('push_tokens insert error:', error);
      return NextResponse.json(
        { error: 'Failed to save subscription' },
        { status: 500 },
      );
    }

    auditLog({
      action: 'push.subscribe',
      userId: user.id,
      metadata: { platform: 'web' },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return safeError('POST /api/push/subscribe', err);
  }
}

export async function DELETE(_req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return safeError('DELETE /api/push/subscribe', 'Unauthorized', 401);

    const db = createServiceClient();

    const { error } = await db
      .from('push_tokens')
      .delete()
      .eq('user_id', user.id)
      .eq('platform', 'web');

    if (error) {
      console.error('push_tokens delete error:', error);
      return NextResponse.json(
        { error: 'Failed to remove subscription' },
        { status: 500 },
      );
    }

    auditLog({
      action: 'push.unsubscribe',
      userId: user.id,
      metadata: { platform: 'web' },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return safeError('DELETE /api/push/subscribe', err);
  }
}
