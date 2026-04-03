// ============================================================
// POST /api/auth/record-attempt
//
// Records a failed or successful login attempt. On success,
// clears all prior failed attempts for the email.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { recordFailedAttempt, clearFailedAttempts } from '@/lib/accountLockout';
import { authLimiter, rateLimitResponse } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  if (!authLimiter.check(`record-attempt:${ip}`)) {
    return rateLimitResponse(60);
  }

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
      await clearFailedAttempts(db, email);
    } else {
      await recordFailedAttempt(db, email, ip);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
