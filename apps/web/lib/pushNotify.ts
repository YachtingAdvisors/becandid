// ============================================================
// lib/pushNotify.ts — High-level push notification helper
//
// Wraps the low-level pushService with notification_prefs
// checks and privacy sanitization. Use this from crons,
// API routes, and background jobs instead of calling
// sendPushToUser directly.
//
// Usage:
//   import { pushNotifyUser } from '@/lib/pushNotify';
//   await pushNotifyUser(db, userId, {
//     type: 'check_in',
//     title: 'Check-in time',
//     body: 'Time to check in with your partner.',
//     data: { url: '/dashboard/checkins' },
//   });
// ============================================================

import type { SupabaseClient } from '@supabase/supabase-js';
import { sendPushToUser, type PushPayload } from './push/pushService';
import { sanitizePushPayload, type PrivacyOptions } from './push/pushPrivacy';

interface PushNotifyOptions {
  /** Privacy type — controls lock-screen sanitization */
  type: PrivacyOptions['type'];
  title: string;
  body: string;
  data?: Record<string, string>;
  /** Optional overrides for privacy options */
  category?: string;
  severity?: string;
}

// Map privacy types → notification_prefs keys.
// If the user has the corresponding pref set to false, the push is skipped.
const PREF_KEYS: Partial<Record<PrivacyOptions['type'], string>> = {
  alert_to_user: 'alert_push',
  alert_to_partner: 'alert_push',
  check_in: 'alert_push',      // check-in push gated on general push pref
  nudge: 'alert_push',
  journal_reminder: 'alert_push',
  relapse_journal: 'alert_push',
  encouragement: 'alert_push',
};

/**
 * Send a push notification to a user, respecting their
 * notification_prefs and applying privacy sanitization.
 *
 * @returns Number of successful deliveries (0 if prefs block it
 *          or user has no push tokens).
 */
export async function pushNotifyUser(
  db: SupabaseClient,
  userId: string,
  options: PushNotifyOptions,
): Promise<number> {
  // 1. Check notification preferences
  const prefKey = PREF_KEYS[options.type];
  if (prefKey) {
    const { data: user } = await db
      .from('users')
      .select('notification_prefs')
      .eq('id', userId)
      .single();

    const prefs = (user?.notification_prefs ?? {}) as Record<string, boolean>;
    if (prefs[prefKey] === false) {
      return 0; // User opted out
    }
  }

  // 2. Sanitize payload for privacy
  const raw: PushPayload = {
    title: options.title,
    body: options.body,
    data: options.data,
  };

  const sanitized = sanitizePushPayload(raw, {
    type: options.type,
    category: options.category,
    severity: options.severity,
  });

  // 3. Send via the standard push service (handles stale token cleanup)
  return sendPushToUser(db, userId, sanitized.standard);
}
