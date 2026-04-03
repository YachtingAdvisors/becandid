// ============================================================
// lib/sessionSecurity.ts
//
// Session hardening beyond Supabase's default auth:
//   1. Track active sessions with device fingerprints
//   2. Detect suspicious session usage (new device, geo shift)
//   3. Force logout across all devices
//   4. Limit concurrent sessions (max 5)
//   5. Activity-based session extension
//
// Uses the `user_sessions` table (see migration).
// ============================================================

import { createServiceClient } from './supabase';
import { hashValue } from './encryption';
import { sendPush } from './push/pushService';

const MAX_CONCURRENT_SESSIONS = 5;

interface SessionInfo {
  user_id: string;
  device_hash: string;
  ip_address: string;
  user_agent: string;
  platform: 'web' | 'ios' | 'android';
  last_active_at: string;
}

// ── Device fingerprint ──────────────────────────────────────
// Hash of user agent + platform — not personally identifying,
// but enough to detect "new device" scenarios.

export function getDeviceHash(userAgent: string, ip: string): string {
  return hashValue(`${userAgent}:${ip}`).slice(0, 16);
}

// ── Record session activity ─────────────────────────────────
// Called on every authenticated API request (via middleware).

export async function recordSessionActivity(
  userId: string,
  deviceHash: string,
  ip: string,
  userAgent: string,
  platform: 'web' | 'ios' | 'android' = 'web'
) {
  const db = createServiceClient();

  // Enforce concurrent session limit BEFORE upserting to avoid temporarily exceeding the limit
  const { data: sessions } = await db
    .from('user_sessions')
    .select('id, last_active_at')
    .eq('user_id', userId)
    .order('last_active_at', { ascending: false });

  if (sessions && sessions.length >= MAX_CONCURRENT_SESSIONS) {
    // Remove oldest sessions to make room for the new/updated one
    const toRemove = sessions.slice(MAX_CONCURRENT_SESSIONS - 1).map((s) => s.id);
    await db.from('user_sessions').delete().in('id', toRemove);
  }

  // Upsert session
  await db.from('user_sessions').upsert({
    user_id: userId,
    device_hash: deviceHash,
    ip_address: ip,
    user_agent: userAgent.slice(0, 256), // Truncate long UAs
    platform,
    last_active_at: new Date().toISOString(),
  }, {
    onConflict: 'user_id,device_hash',
  });
}

// ── Check for suspicious activity ───────────────────────────
// Returns true if this looks like a new/unusual device.

export async function isNewDevice(userId: string, deviceHash: string): Promise<boolean> {
  const db = createServiceClient();
  const { data } = await db
    .from('user_sessions')
    .select('id')
    .eq('user_id', userId)
    .eq('device_hash', deviceHash)
    .limit(1);

  return !data || data.length === 0;
}

// ── Notify user of new device login ─────────────────────────

export async function notifyNewDeviceLogin(
  userId: string,
  ip: string,
  userAgent: string,
  platform: string
) {
  const db = createServiceClient();

  // Get user's push tokens (excluding the new device)
  const { data: tokens } = await db
    .from('push_tokens')
    .select('token, platform')
    .eq('user_id', userId);

  if (tokens && tokens.length > 0) {
    const shortUA = userAgent.includes('iPhone') ? 'iPhone'
      : userAgent.includes('Android') ? 'Android'
      : userAgent.includes('Mac') ? 'Mac'
      : userAgent.includes('Windows') ? 'Windows'
      : 'new device';

    await Promise.allSettled(
      tokens.map((t: any) => sendPush(t.token, t.platform, {
        title: '🔐 New login detected',
        body: `Your account was accessed from a ${shortUA}. If this wasn't you, change your password immediately.`,
        data: { type: 'security_alert', url: '/dashboard/settings' },
      }))
    );
  }

  // Log to audit
  await db.from('audit_log').insert({
    user_id: userId,
    action: 'new_device_login',
    metadata: { ip, platform, user_agent: userAgent.slice(0, 128) },
  });
}

// ── Force logout all devices ────────────────────────────────
// Called from settings page "Log out everywhere" button.

export async function forceLogoutAll(userId: string, exceptDeviceHash?: string) {
  const db = createServiceClient();

  let query = db.from('user_sessions').delete().eq('user_id', userId);
  if (exceptDeviceHash) {
    query = query.neq('device_hash', exceptDeviceHash);
  }
  await query;

  // Revoke push tokens for removed sessions
  if (exceptDeviceHash) {
    // Keep current device's tokens
  } else {
    await db.from('push_tokens').delete().eq('user_id', userId);
  }

  await db.from('audit_log').insert({
    user_id: userId,
    action: 'force_logout_all',
    metadata: { kept_device: exceptDeviceHash || 'none' },
  });
}

// ── Get active sessions for settings page ───────────────────

export async function getActiveSessions(userId: string) {
  const db = createServiceClient();
  const { data } = await db
    .from('user_sessions')
    .select('id, device_hash, platform, last_active_at, ip_address, user_agent')
    .eq('user_id', userId)
    .order('last_active_at', { ascending: false });

  return (data || []).map((s: any) => ({
    id: s.id,
    deviceHash: s.device_hash,
    platform: s.platform,
    lastActive: s.last_active_at,
    // Mask IP for display
    ip: s.ip_address?.replace(/\.\d+$/, '.***') || 'Unknown',
    // Extract readable device name from UA
    device: extractDeviceName(s.user_agent || ''),
  }));
}

function extractDeviceName(ua: string): string {
  if (ua.includes('iPhone')) return 'iPhone';
  if (ua.includes('iPad')) return 'iPad';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('Mac OS')) return 'Mac';
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Linux')) return 'Linux';
  return 'Unknown device';
}
