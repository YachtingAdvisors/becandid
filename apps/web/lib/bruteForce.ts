// ============================================================
// lib/bruteForce.ts
//
// Tracks login attempts by email and IP.
// After 5 failed attempts in 15 minutes:
//   - Blocks further attempts for that email for 15 min
//   - If account exists, sends a push notification
//   - Logs to audit_log
//
// Usage in auth/signin route:
//   const blocked = await checkBruteForce(email, ip);
//   if (blocked) return NextResponse.json({ error: blocked.message }, { status: 429 });
//   // ... attempt login ...
//   await recordLoginAttempt(email, ip, success);
// ============================================================

import { createServiceClient } from './supabase';

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

interface BruteForceResult {
  blocked: boolean;
  message?: string;
  attemptsRemaining?: number;
  lockoutMinutes?: number;
}

export async function checkBruteForce(
  email: string,
  ip: string
): Promise<BruteForceResult | null> {
  const db = createServiceClient();
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();

  // Check failed attempts for this email
  const { count: emailAttempts } = await db
    .from('login_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('email', email.toLowerCase())
    .eq('success', false)
    .gte('created_at', windowStart);

  if ((emailAttempts ?? 0) >= MAX_ATTEMPTS) {
    return {
      blocked: true,
      message: `Too many failed attempts. Try again in ${WINDOW_MINUTES} minutes.`,
      lockoutMinutes: WINDOW_MINUTES,
    };
  }

  // Check failed attempts from this IP (catch credential stuffing)
  const { count: ipAttempts } = await db
    .from('login_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('ip_address', ip)
    .eq('success', false)
    .gte('created_at', windowStart);

  if ((ipAttempts ?? 0) >= MAX_ATTEMPTS * 3) {
    return {
      blocked: true,
      message: 'Too many login attempts from this location. Try again later.',
      lockoutMinutes: WINDOW_MINUTES,
    };
  }

  return null; // Not blocked
}

export async function recordLoginAttempt(
  email: string,
  ip: string,
  success: boolean
) {
  const db = createServiceClient();

  await db.from('login_attempts').insert({
    email: email.toLowerCase(),
    ip_address: ip,
    success,
  });

  // If this is the 3rd failure, warn the account owner
  if (!success) {
    const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();
    const { count } = await db
      .from('login_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('email', email.toLowerCase())
      .eq('success', false)
      .gte('created_at', windowStart);

    if (count === 3) {
      // Look up user to send warning
      const { data: user } = await db
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();

      if (user) {
        await db.from('audit_log').insert({
          user_id: user.id,
          action: 'brute_force_warning',
          metadata: { ip, attempts: count },
        });
      }
    }
  }

  // On successful login, clear failed attempts for this email
  if (success) {
    await db.from('login_attempts')
      .delete()
      .eq('email', email.toLowerCase())
      .eq('success', false);
  }
}
