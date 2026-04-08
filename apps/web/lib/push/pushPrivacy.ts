// ============================================================
// lib/push/pushPrivacy.ts
//
// Sanitizes push notification content so sensitive details
// don't appear on lock screens, notification centers, or
// Apple Watch / Android Wear displays.
//
// Rules:
//   1. Never include category names in notification body
//      (no "Sexual Content detected" on a lock screen)
//   2. Never include event details or timestamps
//   3. Journal prompts are safe — they're Stringer quotes,
//      not descriptions of what happened
//   4. Partner alerts use vague language
//   5. Android: use the "private" visibility channel
//
// Usage: wrap all sendPush calls through sanitizePushPayload()
// before sending.
// ============================================================

interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
}

export interface PrivacyOptions {
  type: 'alert_to_user' | 'alert_to_partner' | 'journal_reminder' |
        'relapse_journal' | 'check_in' | 'nudge' | 'encouragement' |
        'new_device' | 'general';
  category?: string;
  severity?: string;
}

// ── Lock screen safe versions ───────────────────────────────
// These replace the actual content when the phone is locked.

const LOCK_SCREEN_TITLES: Record<string, string> = {
  alert_to_user: 'Be Candid',
  alert_to_partner: 'Be Candid',
  journal_reminder: 'Time to reflect',
  relapse_journal: 'Be Candid',
  check_in: 'Check-in time',
  nudge: 'Be Candid',
  encouragement: 'You have a message',
  new_device: 'Security alert',
  general: 'Be Candid',
};

const LOCK_SCREEN_BODIES: Record<string, string> = {
  alert_to_user: 'Open the app for details.',
  alert_to_partner: 'Your partner needs you. Open the app.',
  journal_reminder: 'Your journal is waiting.',
  relapse_journal: 'Open the app when you\'re ready.',
  check_in: 'Time to check in with your partner.',
  nudge: 'You have a new notification.',
  encouragement: 'Someone is thinking of you.',
  new_device: 'New login detected. Open for details.',
  general: 'You have a new notification.',
};

// ── Sanitize ────────────────────────────────────────────────

export function sanitizePushPayload(
  payload: PushPayload,
  options: PrivacyOptions
): {
  standard: PushPayload;    // Full content (shown when unlocked)
  lockScreen: PushPayload;  // Vague content (shown on lock screen)
  androidConfig: Record<string, any>;
  iosConfig: Record<string, any>;
} {
  // Strip category names from the body text
  let safeBody = payload.body;
  if (options.category) {
    // Remove category labels that might appear
    const categoryLabels = [
      'Sexual Content', 'Pornography', 'Social Media', 'Gambling',
      'Dating Apps', 'Binge Watching', 'Impulse Shopping', 'Gaming',
      'Rage Content', 'Substances', 'Body Image', 'Eating Disorders',
    ];
    for (const label of categoryLabels) {
      safeBody = safeBody.replace(new RegExp(label, 'gi'), 'a focus area');
    }
  }

  // Strip severity from body
  if (options.severity) {
    safeBody = safeBody.replace(/\b(high|medium|low)\s+severity\b/gi, '');
  }

  // Remove any URLs from push body (could contain alert IDs)
  const cleanData = { ...payload.data };
  // Keep deep link URL in data but not in visible body
  safeBody = safeBody.replace(/https?:\/\/[^\s]+/g, '').trim();

  return {
    standard: {
      title: payload.title,
      body: safeBody,
      data: cleanData,
    },
    lockScreen: {
      title: LOCK_SCREEN_TITLES[options.type] || 'Be Candid',
      body: LOCK_SCREEN_BODIES[options.type] || 'You have a new notification.',
      data: cleanData,
    },
    androidConfig: {
      channelId: getAndroidChannel(options.type),
      priority: 'high',
      // VISIBILITY_PRIVATE: shows icon + "Be Candid" but hides body on lock screen
      notification: {
        visibility: 'PRIVATE',
        // Public version shown on lock screen
        publicBody: LOCK_SCREEN_BODIES[options.type],
        publicTitle: LOCK_SCREEN_TITLES[options.type],
      },
    },
    iosConfig: {
      // Show generic content on lock screen, full content when unlocked
      _contentAvailable: true,
      // iOS handles this through notification settings, but we can hint:
      sound: options.type === 'alert_to_partner' ? 'default' : null,
      badge: 1,
    },
  };
}

function getAndroidChannel(type: string): string {
  switch (type) {
    case 'alert_to_user':
    case 'alert_to_partner':
    case 'relapse_journal':
      return 'alerts';       // High importance
    case 'check_in':
      return 'check-ins';    // Medium importance
    default:
      return 'nudges';       // Low importance
  }
}

// ── Partner alert sanitization ──────────────────────────────
// Extra care: the partner's phone might be visible to others.

export function sanitizePartnerAlert(
  userName: string,
  category: string,
  severity: string
): PushPayload {
  // Never mention what was detected — just that attention is needed
  return {
    title: 'Be Candid',
    body: `${userName} could use your support. Open the app to start a conversation.`,
    data: { type: 'alert_to_partner' },
  };
}
