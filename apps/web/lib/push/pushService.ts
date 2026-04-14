// ============================================================
// Be Candid — Push Notification Service
// Sends Web Push notifications via the web-push library.
//
// Prerequisites:
//   npm install web-push @types/web-push
//
// Environment variables:
//   VAPID_PUBLIC_KEY  — base64url-encoded VAPID public key
//   VAPID_PRIVATE_KEY — base64url-encoded VAPID private key
//   VAPID_SUBJECT     — mailto: URI (e.g. mailto:push@becandid.io)
//
// Generate VAPID keys:
//   npx web-push generate-vapid-keys
// ============================================================

import webpush from 'web-push';
import type { SupabaseClient } from '@supabase/supabase-js';

// ─── Types ──────────────────────────────────────────────────

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

interface PushToken {
  id: string;
  token: string;
  platform: string;
}

// ─── Configure VAPID ────────────────────────────────────────

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY ?? '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY ?? '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? 'mailto:push@becandid.io';

// TODO(push-setup): VAPID keys must be generated and set in .env for web push
// to actually deliver notifications. Without them, all web pushes are silently
// skipped. Generate keys with: npx web-push generate-vapid-keys
// Then set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in your environment.
const VAPID_CONFIGURED = !!(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);

if (VAPID_CONFIGURED) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
} else if (process.env.NODE_ENV === 'production') {
  console.error(
    '[push] VAPID keys not configured — web push notifications will NOT be delivered. ' +
    'Run `npx web-push generate-vapid-keys` and set VAPID_PUBLIC_KEY + VAPID_PRIVATE_KEY.'
  );
}

// ─── Send to a single subscription ─────────────────────────

/**
 * Send a push notification to a single token/subscription.
 * For web tokens, the token is a JSON-stringified PushSubscription.
 */
export async function sendPush(
  token: string,
  platform: string,
  payload: PushPayload
): Promise<void> {
  if (platform === 'web') {
    await sendWebPush(token, payload);
  }
  // Future: handle 'android' / 'ios' via Expo or FCM here
}

async function sendWebPush(
  subscriptionJson: string,
  payload: PushPayload
): Promise<void> {
  if (!VAPID_CONFIGURED) {
    // Log at error level in production so this doesn't go unnoticed
    const logFn = process.env.NODE_ENV === 'production' ? console.error : console.warn;
    logFn('[push] VAPID keys not configured — web push NOT delivered. Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY.');
    return;
  }

  const subscription = JSON.parse(subscriptionJson) as webpush.PushSubscription;

  await webpush.sendNotification(subscription, JSON.stringify(payload), {
    TTL: 60 * 60, // 1 hour
    urgency: 'normal',
  });
}

// ─── Send to all of a user's devices ────────────────────────

/**
 * Send a push notification to all registered devices for a user.
 * Automatically removes stale/expired subscriptions (410 Gone).
 *
 * @param db  - Supabase service client (bypasses RLS)
 * @param userId - Target user's ID
 * @param payload - Notification content
 * @returns Number of successful deliveries
 */
export async function sendPushToUser(
  db: SupabaseClient,
  userId: string,
  payload: PushPayload
): Promise<number> {
  const { data: tokens, error } = await db
    .from('push_tokens')
    .select('id, token, platform')
    .eq('user_id', userId);

  if (error || !tokens || tokens.length === 0) {
    return 0;
  }

  let sent = 0;
  const staleIds: string[] = [];

  await Promise.allSettled(
    tokens.map(async (row: PushToken) => {
      try {
        await sendPush(row.token, row.platform, payload);
        sent++;
      } catch (err: any) {
        // 410 Gone means the subscription expired — clean it up
        if (err?.statusCode === 410 || err?.statusCode === 404) {
          staleIds.push(row.id);
        } else {
          console.error(`[push] Failed to send to ${row.platform} token ${row.id}:`, err?.message ?? err);
        }
      }
    })
  );

  // Remove stale subscriptions
  if (staleIds.length > 0) {
    await db.from('push_tokens').delete().in('id', staleIds);
  }

  return sent;
}
