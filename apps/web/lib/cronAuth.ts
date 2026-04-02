import { NextRequest, NextResponse } from 'next/server';

/**
 * Verify cron request authentication.
 *
 * Accepts either:
 *   - Vercel Crons header: `authorization: Bearer <CRON_SECRET>`
 *   - Custom header:       `x-cron-secret: <CRON_SECRET>`
 *
 * Returns null if authenticated, or a 401 NextResponse if not.
 */
export function verifyCronAuth(req: NextRequest): NextResponse | null {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error('[cron] CRON_SECRET env var is not set');
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  const authHeader = req.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const customHeader = req.headers.get('x-cron-secret');

  const token = bearerToken ?? customHeader;

  if (token !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null; // authenticated
}
