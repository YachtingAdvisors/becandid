export const dynamic = 'force-dynamic';

// ============================================================
// POST /api/coach — Conversation Coach streaming endpoint
//
// Accepts a message + history, returns a streaming coach response
// grounded in Stringer's *Unwanted* framework.
// ============================================================

import { NextRequest } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { rateLimitResponse } from '@/lib/rateLimit';
import { streamCoachResponse } from '@/lib/conversationCoach';
import { safeError } from '@/lib/security';
import { checkCoachLimit } from '@/lib/coachLimits';

// Coach-specific rate limiter: 50 messages/hour
const coachLimiter = (() => {
  const STORE = new Map<string, { count: number; resetAt: number }>();
  return {
    check(key: string): boolean {
      const now = Date.now();
      const entry = STORE.get(key);
      if (!entry || now > entry.resetAt) {
        STORE.set(key, { count: 1, resetAt: now + 3_600_000 });
        return true;
      }
      if (entry.count >= 50) return false;
      entry.count++;
      return true;
    },
  };
})();

// ─── Request Validation ─────────────────────────────────────

interface CoachRequestBody {
  message: string;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
  alert_id?: string;
}

function validateBody(body: unknown): CoachRequestBody | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, unknown>;

  if (typeof b.message !== 'string' || b.message.length === 0) return null;
  if (b.message.length > 1000) return null;

  if (!Array.isArray(b.history)) return null;
  if (b.history.length > 100) return null; // safety cap

  for (const msg of b.history) {
    if (!msg || typeof msg !== 'object') return null;
    if (msg.role !== 'user' && msg.role !== 'assistant') return null;
    if (typeof msg.content !== 'string') return null;
    if (msg.content.length > 5000) return null;
  }

  if (b.alert_id !== undefined && typeof b.alert_id !== 'string') return null;

  return {
    message: b.message,
    history: b.history as CoachRequestBody['history'],
    alert_id: b.alert_id as string | undefined,
  };
}

// ─── POST Handler ───────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // Auth
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Rate limit
    if (!coachLimiter.check(user.id)) {
      return rateLimitResponse(60);
    }

    // Coach session limit by plan
    const db = createServiceClient();
    const coachLimit = await checkCoachLimit(db, user.id);
    if (!coachLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Coach session limit reached',
          upgrade_url: '/pricing',
          remaining: 0,
          limit: coachLimit.limit,
          plan: coachLimit.plan,
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Parse + validate body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const validated = validateBody(body);
    if (!validated) {
      return new Response(
        JSON.stringify({ error: 'Invalid request. Message must be 1-1000 characters.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Log coach session usage for limit tracking
    await db.from('audit_log').insert({
      user_id: user.id,
      action: 'coach_session',
      metadata: { alert_id: validated?.alert_id ?? null },
    }).catch(() => {});

    // Stream response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const gen = streamCoachResponse({
            userId: user.id,
            message: validated.message,
            history: validated.history,
            alertId: validated.alert_id,
          });

          for await (const chunk of gen) {
            controller.enqueue(encoder.encode(chunk));
          }

          controller.close();
        } catch (err) {
          console.error('[coach] Stream error:', err);
          // Send error indicator so the client knows something went wrong
          controller.enqueue(
            encoder.encode('\n\n[error] I\'m having trouble responding right now. Please try again in a moment.')
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-store',
        'X-Content-Type-Options': 'nosniff',
        'X-Coach-Remaining': String(coachLimit.remaining),
        'X-Coach-Limit': String(coachLimit.limit),
        'X-Coach-Plan': coachLimit.plan,
      },
    });
  } catch (err) {
    console.error('[coach] Unexpected error:', err);
    return safeError('POST /api/coach', err);
  }
}
