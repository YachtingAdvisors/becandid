// ============================================================
// Account Lockout — Application-layer brute-force protection
//
// Uses the login_attempts table from migration 013 to track
// failed login attempts and enforce progressive lockouts:
//   - 5 failures in 15 min  → locked for 15 minutes
//   - 10 failures in 1 hour → locked for 1 hour
// ============================================================

import type { SupabaseClient } from '@supabase/supabase-js';

interface LockoutStatus {
  locked: boolean;
  minutesRemaining?: number;
}

/**
 * Check whether an account is currently locked due to too many
 * failed login attempts.
 */
export async function checkAccountLocked(
  db: SupabaseClient,
  email: string
): Promise<LockoutStatus> {
  const normalizedEmail = email.toLowerCase().trim();

  // Count failures in the last hour (covers both tiers)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  const { data: hourAttempts, error: hourErr } = await db
    .from('login_attempts')
    .select('created_at')
    .eq('email', normalizedEmail)
    .eq('success', false)
    .gte('created_at', oneHourAgo)
    .order('created_at', { ascending: false });

  if (hourErr || !hourAttempts) {
    // Fail open — don't lock users out if the DB query fails
    console.error('checkAccountLocked error:', hourErr);
    return { locked: false };
  }

  // Tier 2: 10+ failures in 1 hour → locked for 1 hour from last attempt
  if (hourAttempts.length >= 10) {
    const lastAttempt = new Date(hourAttempts[0].created_at);
    const unlockAt = new Date(lastAttempt.getTime() + 60 * 60 * 1000);
    const remaining = Math.ceil((unlockAt.getTime() - Date.now()) / 60000);
    if (remaining > 0) {
      return { locked: true, minutesRemaining: remaining };
    }
  }

  // Tier 1: 5+ failures in 15 minutes → locked for 15 minutes from last attempt
  const recentAttempts = hourAttempts.filter(
    (a) => new Date(a.created_at).getTime() >= new Date(fifteenMinAgo).getTime()
  );

  if (recentAttempts.length >= 5) {
    const lastAttempt = new Date(recentAttempts[0].created_at);
    const unlockAt = new Date(lastAttempt.getTime() + 15 * 60 * 1000);
    const remaining = Math.ceil((unlockAt.getTime() - Date.now()) / 60000);
    if (remaining > 0) {
      return { locked: true, minutesRemaining: remaining };
    }
  }

  return { locked: false };
}

/**
 * Record a failed login attempt for the given email and IP.
 */
export async function recordFailedAttempt(
  db: SupabaseClient,
  email: string,
  ip: string
): Promise<void> {
  const { error } = await db.from('login_attempts').insert({
    email: email.toLowerCase().trim(),
    ip_address: ip,
    success: false,
  });

  if (error) {
    console.error('recordFailedAttempt error:', error);
  }
}

/**
 * Clear failed login attempts for an email after successful login.
 */
export async function clearFailedAttempts(
  db: SupabaseClient,
  email: string
): Promise<void> {
  const { error } = await db
    .from('login_attempts')
    .delete()
    .eq('email', email.toLowerCase().trim())
    .eq('success', false);

  if (error) {
    console.error('clearFailedAttempts error:', error);
  }
}
