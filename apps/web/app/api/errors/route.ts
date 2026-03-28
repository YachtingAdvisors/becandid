export const dynamic = 'force-dynamic';
// POST /api/errors — receive client-side error reports
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body?.errors || !Array.isArray(body.errors)) {
      return NextResponse.json({ ok: true }); // Don't error on bad reports
    }

    // Rate limit: max 10 error reports per request
    const errors = body.errors.slice(0, 10);

    for (const error of errors) {
      console.error('[CLIENT_ERROR]', JSON.stringify({
        message: String(error.message ?? '').slice(0, 500),
        digest: error.digest,
        url: String(error.url ?? '').slice(0, 200),
        timestamp: error.timestamp,
        userAgent: String(error.userAgent ?? '').slice(0, 200),
      }));
    }

    return NextResponse.json({ ok: true, received: errors.length });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
