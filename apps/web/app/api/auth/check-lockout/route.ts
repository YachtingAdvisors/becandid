// ============================================================
// POST /api/auth/check-lockout
//
// Checks whether an email is currently locked out due to too
// many failed login attempts. Rate limited to 10 req/min per IP.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { checkAccountLocked } from '@/lib/accountLockout';
import { checkDistributedRateLimit } from '@/lib/distributedRateLimit';

export async function POST(request: NextRequest) {
  // Rate limit by IP (10 req/min)
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  const blocked = await checkDistributedRateLimit({
    scope: 'auth-check-lockout',
    key: ip,
    max: 10,
    windowMs: 60_000,
  });
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const email = body?.email;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const db = createServiceClient();
    const status = await checkAccountLocked(db, email);

    return NextResponse.json({
      locked: status.locked,
      ...(status.minutesRemaining != null && {
        minutes_remaining: status.minutesRemaining,
      }),
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
