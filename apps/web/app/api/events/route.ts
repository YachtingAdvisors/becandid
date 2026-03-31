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
import { sanitizeText } from '@/lib/security';
import { GOAL_LABELS } from '@be-candid/shared';

const VALID_SEVERITIES = ['low', 'medium', 'high'];
const VALID_PLATFORMS = ['web', 'ios', 'android', 'extension', 'desktop'];
const MAX_BATCH_SIZE = 20;
const MAX_EVENTS_PER_HOUR = 30;

// ── Simple per-user rate tracking ───────────────────────────
const userEventCounts = new Map<string, { count: number; resetAt: number }>();

function checkUserRate(userId: string): boolean {
  const now = Date.now();
  const entry = userEventCounts.get(userId);
  if (!entry || now > entry.resetAt) {
    userEventCounts.set(userId, { count: 1, resetAt: now + 3600000 });
    return true;
  }
  if (entry.count >= MAX_EVENTS_PER_HOUR) return false;
  entry.count++;
  return true;
}

// ── POST ────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!checkUserRate(user.id)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Max 30 events per hour.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  const body = await req.json();

  // ── Batch sync (from offline queue) ───────────────────
  if (body.batch && Array.isArray(body.events)) {
    const events = body.events.slice(0, MAX_BATCH_SIZE);

    // Rate limit by total events, not just by request
    for (let i = 0; i < events.length; i++) {
      if (!checkUserRate(user.id)) {
        return NextResponse.json(
          { error: 'Rate limit exceeded', processed: i },
          { status: 429, headers: { 'Retry-After': '60' } }
        );
      }
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
          metadata: event.metadata,
        });

        results.push({ id: event.id, success: true, alert_id: result.alert.id });
      } catch (e: any) {
        results.push({ id: event.id, success: false, error: 'Processing failed' });
      }
    }

    return NextResponse.json({
      batch: true,
      total: events.length,
      synced: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    });
  }

  // ── Single event ──────────────────────────────────────
  const validated = validateEvent(body);
  if (!validated.valid) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  try {
    const result = await runAlertPipeline(user.id, {
      category: body.category,
      severity: body.severity,
      platform: body.platform || 'unknown',
      timestamp: body.timestamp || new Date().toISOString(),
      metadata: body.metadata,
    });

    return NextResponse.json({
      alert_id: result.alert.id,
      solo_mode: result.solo,
    }, { status: 201 });
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
  let query = db.from('events').select('id, category, severity, platform, timestamp, created_at')
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
