// ============================================================
// POST /api/auth/record-attempt
//
// Records a failed login attempt.
// Successful logins are cleared server-side from an
// authenticated session in /api/auth/sessions.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { recordFailedAttempt } from '@/lib/accountLockout';
import { checkDistributedRateLimit } from '@/lib/distributedRateLimit';

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  const blocked = await checkDistributedRateLimit({
    scope: 'auth-record-attempt',
    key: ip,
    max: 10,
    windowMs: 60_000,
  });
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { email, success } = body ?? {};

    if (!email || typeof email !== 'string' || typeof success !== 'boolean') {
      return NextResponse.json(
        { error: 'Email (string) and success (boolean) are required' },
        { status: 400 }
      );
    }

    const db = createServiceClient();

    if (success) {
      return NextResponse.json(
        { error: 'Successful attempts are recorded server-side after authentication' },
        { status: 400 }
      );
    }

    await recordFailedAttempt(db, email, ip);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
