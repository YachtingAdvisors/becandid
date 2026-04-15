export const dynamic = 'force-dynamic';
// ============================================================
// app/api/events/route.ts — REWRITE
//
// POST  → log a single event (from mobile monitoring or web)
// POST with batch=true → sync multiple queued events (offline)
// GET   → list events for the authenticated user
//
// Integrations:
//   - Encrypts metadata before storage
//   - Runs full alert pipeline for each event
//   - Rate limited per user (30 events/hour)
//   - Input validated and sanitized
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/authFromRequest';
import { runAlertPipeline } from '@/lib/alertPipeline';
import { checkDistributedRateLimit } from '@/lib/distributedRateLimit';
import {
  buildIdempotencyKey,
  getIdempotencyState,
  reserveIdempotencyKey,
  storeIdempotentResponse,
} from '@/lib/idempotency';
import { GOAL_LABELS } from '@be-candid/shared';

const VALID_SEVERITIES = ['low', 'medium', 'high'];
const VALID_PLATFORMS = ['web', 'ios', 'android', 'extension', 'desktop'];
const MAX_BATCH_SIZE = 20;
const MAX_EVENTS_PER_HOUR = 30;
const IDEMPOTENCY_TTL_MS = 60 * 60 * 1000;

async function consumeEventBudget(userId: string, count: number) {
  for (let i = 0; i < count; i++) {
    const blocked = await checkDistributedRateLimit({
      scope: 'event-ingest',
      key: userId,
      max: MAX_EVENTS_PER_HOUR,
      windowMs: 3_600_000,
    });
    if (blocked) {
      return { blocked, processed: i };
    }
  }

  return { blocked: null as Response | null, processed: count };
}

// ── POST ────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const candidateEvents = body.batch && Array.isArray(body.events)
    ? body.events.slice(0, MAX_BATCH_SIZE)
    : null;
  const idempotencyKey = typeof body.idempotency_key === 'string'
    ? `events:${user.id}:${body.idempotency_key}`
    : buildIdempotencyKey(
        'events',
        user.id,
        candidateEvents ? { batch: true, events: candidateEvents } : body,
      );

  const existing = await getIdempotencyState(idempotencyKey);
  if (existing.state === 'replay') return existing.response;
  if (existing.state === 'pending') {
    return NextResponse.json(
      { duplicate: true, pending: true },
      { status: 202, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  // ── Batch sync (from offline queue) ───────────────────
  if (body.batch && Array.isArray(body.events)) {
    const events = candidateEvents ?? [];

    const budget = await consumeEventBudget(user.id, events.length);
    if (budget.blocked) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', processed: budget.processed },
        { status: 429, headers: budget.blocked.headers },
      );
    }

    const reservation = await reserveIdempotencyKey(
      idempotencyKey,
      'events',
      user.id,
      IDEMPOTENCY_TTL_MS,
    );
    if (reservation.state === 'replay') return reservation.response;
    if (reservation.state === 'pending') {
      return NextResponse.json(
        { duplicate: true, pending: true },
        { status: 202, headers: { 'Cache-Control': 'no-store' } },
      );
    }

    const results = [];

    for (const event of events) {
      try {
        const validated = validateEvent(event);
        if (!validated.valid) {
          results.push({ id: event.id, success: false, error: validated.error });
          continue;
        }

        const result = await runAlertPipeline(user.id, {
          category: event.category,
          severity: event.severity,
          platform: event.platform || 'unknown',
          timestamp: event.timestamp || new Date().toISOString(),
          app_name: event.app_name || event.metadata?.domain || undefined,
          duration_seconds: event.duration_seconds || event.metadata?.duration_seconds || undefined,
          metadata: event.metadata,
        });

        results.push({ id: event.id, success: true, alert_id: result.alert.id });
      } catch (e: any) {
        results.push({ id: event.id, success: false, error: 'Processing failed' });
      }
    }

    const responseBody = {
      batch: true,
      total: events.length,
      synced: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    };

    await storeIdempotentResponse(idempotencyKey, {
      status: 200,
      body: responseBody,
    });

    return NextResponse.json(responseBody);
  }

  // ── Single event ──────────────────────────────────────
  const validated = validateEvent(body);
  if (!validated.valid) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const budget = await consumeEventBudget(user.id, 1);
  if (budget.blocked) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Max 30 events per hour.' },
      { status: 429, headers: budget.blocked.headers },
    );
  }

  const reservation = await reserveIdempotencyKey(
    idempotencyKey,
    'events',
    user.id,
    IDEMPOTENCY_TTL_MS,
  );
  if (reservation.state === 'replay') return reservation.response;
  if (reservation.state === 'pending') {
    return NextResponse.json(
      { duplicate: true, pending: true },
      { status: 202, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  try {
    const result = await runAlertPipeline(user.id, {
      category: body.category,
      severity: body.severity,
      platform: body.platform || 'unknown',
      timestamp: body.timestamp || new Date().toISOString(),
      app_name: body.app_name || body.metadata?.domain || undefined,
      duration_seconds: body.duration_seconds || body.metadata?.duration_seconds || undefined,
      metadata: body.metadata,
    });

    const responseBody = {
      alert_id: result.alert.id,
      solo_mode: result.solo,
    };

    await storeIdempotentResponse(idempotencyKey, {
      status: 201,
      body: responseBody,
    });

    return NextResponse.json(responseBody, { status: 201 });
  } catch (e: any) {
    console.error('Event processing failed:', e);
    return NextResponse.json({ error: 'Event processing failed' }, { status: 500 });
  }
}

// ── GET ─────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '30'), 100);
  const offset = parseInt(url.searchParams.get('offset') || '0');
  const category = url.searchParams.get('category');

  const db = createServiceClient();
  let query = db.from('events').select('id, category, severity, platform, app_name, duration_seconds, contested, timestamp, created_at')
    .eq('user_id', user.id)
    .order('timestamp', { ascending: false })
    .range(offset, offset + limit - 1);

  if (category) query = query.eq('category', category);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });

  return NextResponse.json({ events: data || [] });
}

// ── Validation ──────────────────────────────────────────────

function validateEvent(event: any): { valid: boolean; error?: string } {
  if (!event.category || typeof event.category !== 'string') {
    return { valid: false, error: 'Missing or invalid category' };
  }
  if (!GOAL_LABELS[event.category as keyof typeof GOAL_LABELS]) {
    return { valid: false, error: `Invalid category: ${event.category}` };
  }
  if (!event.severity || !VALID_SEVERITIES.includes(event.severity)) {
    return { valid: false, error: `Invalid severity. Must be: ${VALID_SEVERITIES.join(', ')}` };
  }
  if (event.platform && !VALID_PLATFORMS.includes(event.platform)) {
    return { valid: false, error: `Invalid platform. Must be: ${VALID_PLATFORMS.join(', ')}` };
  }
  if (event.timestamp) {
    const ts = new Date(event.timestamp);
    if (isNaN(ts.getTime())) return { valid: false, error: 'Invalid timestamp' };
    // Reject events more than 7 days old (offline queue limit)
    if (Date.now() - ts.getTime() > 7 * 86400000) {
      return { valid: false, error: 'Event too old (max 7 days)' };
    }
  }
  return { valid: true };
}
