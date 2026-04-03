export const dynamic = 'force-dynamic';
// ============================================================
// app/api/privacy/route.ts
//
// GET    → export all user data as JSON (GDPR Article 15)
// PUT    → update data retention preferences
// DELETE → purge specific data categories
//
// GET /api/privacy/sessions → list active sessions
// DELETE /api/privacy/sessions → log out all other devices
// DELETE /api/privacy/sessions?id=<id> → log out specific device
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { decryptJournalEntries, decryptGuide } from '@/lib/encryption';
import { getActiveSessions, forceLogoutAll } from '@/lib/sessionSecurity';
import { accountLimiter, actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { safeError } from '@/lib/security';

// ── GET: Full data export ───────────────────────────────────

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);

  // Sessions sub-route (lightweight — no extra rate limit)
  if (url.pathname.endsWith('/sessions')) {
    const sessions = await getActiveSessions(user.id);
    return NextResponse.json({ sessions });
  }

  // Data export is expensive — use strict rate limit
  const blocked = checkUserRate(accountLimiter, user.id);
  if (blocked) return blocked;

  const db = createServiceClient();

  // Fetch all user data in parallel
  const [
    profileResult,
    eventsResult,
    alertsResult,
    journalResult,
    checkinsResult,
    trustPointsResult,
    milestonesResult,
    prefsResult,
    partnersResult,
  ] = await Promise.all([
    db.from('users').select('*').eq('id', user.id).single(),
    db.from('events').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10000),
    db.from('alerts').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10000),
    db.from('stringer_journal').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10000),
    db.from('check_ins').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10000),
    db.from('trust_points').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10000),
    db.from('milestones').select('*').eq('user_id', user.id).limit(10000),
    db.from('journal_preferences').select('*').eq('user_id', user.id).single(),
    db.from('partners').select('*').eq('user_id', user.id).limit(10000),
  ]);

  // Decrypt journal entries for export
  const decryptedJournal = decryptJournalEntries(journalResult.data || [], user.id);

  const exportData = {
    exported_at: new Date().toISOString(),
    user: {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      profile: profileResult.data,
    },
    events: eventsResult.data || [],
    alerts: (alertsResult.data || []).map((a: any) => ({
      ...a,
      // Decrypt conversation guides if encrypted
      user_guide: a.user_guide ? decryptGuide(a.user_guide, user.id) : null,
      partner_guide: a.partner_guide ? decryptGuide(a.partner_guide, user.id) : null,
    })),
    journal_entries: decryptedJournal,
    check_ins: checkinsResult.data || [],
    trust_points: trustPointsResult.data || [],
    milestones: milestonesResult.data || [],
    journal_preferences: prefsResult.data,
    partners: (partnersResult.data || []).map((p: any) => ({
      ...p,
      // Redact partner's personal info from export
      partner_email: p.partner_email ? '***@***' : null,
    })),
  };

  // Log the export
  await db.from('audit_log').insert({
    user_id: user.id,
    action: 'data_export',
    metadata: {
      entry_counts: {
        events: exportData.events.length,
        alerts: exportData.alerts.length,
        journal: exportData.journal_entries.length,
        checkins: exportData.check_ins.length,
      },
    },
  });

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="be-candid-data-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}

// ── PUT: Update retention preferences ───────────────────────

export async function PUT(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  const { event_retention_days } = body;

  if (!event_retention_days || event_retention_days < 30 || event_retention_days > 365) {
    return NextResponse.json({ error: 'Retention must be 30-365 days' }, { status: 400 });
  }

  const db = createServiceClient();
  const { error } = await db.from('users').update({
    event_retention_days,
  }).eq('id', user.id);

  if (error) return safeError('PUT /api/privacy', error);

  await db.from('audit_log').insert({
    user_id: user.id,
    action: 'retention_updated',
    metadata: { event_retention_days },
  });

  return NextResponse.json({ event_retention_days });
}

// ── DELETE: Purge data or manage sessions ───────────────────

export async function DELETE(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = checkUserRate(accountLimiter, user.id);
  if (blocked) return blocked;

  const url = new URL(req.url);

  // Sessions sub-route
  if (url.pathname.includes('/sessions')) {
    const sessionId = url.searchParams.get('id');
    const db = createServiceClient();

    if (sessionId) {
      // Log out specific device
      await db.from('user_sessions').delete()
        .eq('id', sessionId).eq('user_id', user.id);
      return NextResponse.json({ removed: true });
    } else {
      // Log out all other devices
      const currentDeviceHash = url.searchParams.get('keep');
      await forceLogoutAll(user.id, currentDeviceHash || undefined);
      return NextResponse.json({ logged_out_all: true });
    }
  }

  // Data purge
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  const { purge_type } = body;

  const db = createServiceClient();

  switch (purge_type) {
    case 'events':
      await db.from('events').delete().eq('user_id', user.id);
      break;
    case 'journal':
      await db.from('stringer_journal').delete().eq('user_id', user.id);
      break;
    case 'alerts':
      await db.from('alerts').delete().eq('user_id', user.id);
      break;
    default:
      return NextResponse.json({ error: 'Invalid purge_type' }, { status: 400 });
  }

  await db.from('audit_log').insert({
    user_id: user.id,
    action: 'data_purge',
    metadata: { purge_type },
  });

  return NextResponse.json({ purged: purge_type });
}
