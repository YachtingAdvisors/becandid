export const dynamic = 'force-dynamic';
// ============================================================
// app/api/privacy/route.ts
//
// GET    → export all user data as JSON (GDPR Article 15)
// PUT    → update data retention preferences
// DELETE → purge specific data categories
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { decrypt, decryptJournalEntries, decryptGuide } from '@/lib/encryption';
import { accountLimiter, actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { safeError } from '@/lib/security';

// ── GET: Full data export ───────────────────────────────────

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Data export is expensive — use strict rate limit
  const blocked = await checkUserRate(accountLimiter, user.id);
  if (blocked) return blocked;

  const db = createServiceClient();
  const uid = user.id;

  // Fetch ALL user data in parallel (GDPR Article 15 — complete export)
  const [
    profileResult,
    eventsResult,
    alertsResult,
    journalResult,
    journalPrefsResult,
    checkinsResult,
    conversationOutcomesResult,
    partnersResult,
    therapistConnectionsResult,
    focusSegmentsResult,
    trustPointsResult,
    milestonesResult,
    nudgesResult,
    siteListsResult,
    contentRulesResult,
    vulnerabilityWindowsResult,
    weeklyReflectionsResult,
    familySystemsNotesResult,
    fastsResult,
    quoteFavoritesResult,
    screenTimeUsageResult,
    categoryTimeLimitsResult,
    pushTokensResult,
    spouseImpactResult,
  ] = await Promise.all([
    db.from('users').select('*').eq('id', uid).single(),
    db.from('events').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(50000),
    db.from('alerts').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(50000),
    db.from('stringer_journal').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(50000),
    db.from('journal_preferences').select('*').eq('user_id', uid).single(),
    db.from('check_ins').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(50000),
    db.from('conversation_outcomes').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(50000),
    db.from('partners').select('*').eq('user_id', uid).limit(10000),
    db.from('therapist_connections').select('*').eq('user_id', uid).limit(10000),
    db.from('focus_segments').select('*').eq('user_id', uid).order('date', { ascending: false }).limit(50000),
    db.from('trust_points').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(50000),
    db.from('milestones').select('*').eq('user_id', uid).limit(10000),
    db.from('nudges').select('*').eq('user_id', uid).order('sent_at', { ascending: false }).limit(50000),
    db.from('site_lists').select('*').eq('user_id', uid).limit(10000),
    db.from('content_rules').select('*').eq('user_id', uid).limit(10000),
    db.from('vulnerability_windows').select('*').eq('user_id', uid).limit(10000),
    db.from('weekly_reflections').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(10000),
    db.from('family_systems_notes').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(10000),
    db.from('fasts').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(10000),
    db.from('quote_favorites').select('*').eq('user_id', uid).limit(10000),
    db.from('screen_time_usage').select('*').eq('user_id', uid).order('date', { ascending: false }).limit(50000),
    db.from('category_time_limits').select('*').eq('user_id', uid).limit(10000),
    db.from('push_tokens').select('id, platform, created_at').eq('user_id', uid).limit(100),
    db.from('spouse_impact').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(10000),
  ]);

  // Decrypt journal entries
  const decryptedJournal = decryptJournalEntries(journalResult.data || [], uid);

  // Decrypt event metadata
  const decryptedEvents = (eventsResult.data || []).map((e: any) => ({
    ...e,
    metadata: e.metadata ? (() => { try { return decrypt(e.metadata, uid); } catch { return e.metadata; } })() : null,
  }));

  // Decrypt alerts (conversation guides)
  const decryptedAlerts = (alertsResult.data || []).map((a: any) => ({
    ...a,
    user_guide: a.user_guide ? decryptGuide(a.user_guide, uid) : null,
    partner_guide: a.partner_guide ? decryptGuide(a.partner_guide, uid) : null,
  }));

  // Decrypt conversation outcomes (notes and reflections)
  const decryptedOutcomes = (conversationOutcomesResult.data || []).map((o: any) => ({
    ...o,
    user_notes: o.user_notes ? decrypt(o.user_notes, uid) : null,
    partner_notes: o.partner_notes ? decrypt(o.partner_notes, uid) : null,
    ai_reflection: o.ai_reflection ? decrypt(o.ai_reflection, uid) : null,
  }));

  // Decrypt weekly reflections
  const decryptedReflections = (weeklyReflectionsResult.data || []).map((r: any) => ({
    ...r,
    reflection: r.reflection ? (() => { try { return JSON.parse(decrypt(r.reflection, uid)); } catch { return r.reflection; } })() : null,
  }));

  // Decrypt family systems notes
  const decryptedFamilyNotes = (familySystemsNotesResult.data || []).map((n: any) => ({
    ...n,
    content: n.content ? decrypt(n.content, uid) : null,
  }));

  // Redact partner personal info
  const redactedPartners = (partnersResult.data || []).map((p: any) => ({
    ...p,
    partner_email: p.partner_email ? '***@***' : null,
  }));

  // Push tokens — only expose existence, not raw token
  const sanitizedPushTokens = (pushTokensResult.data || []).map((t: any) => ({
    id: t.id,
    platform: t.platform,
    created_at: t.created_at,
    note: 'Raw token redacted for security',
  }));

  const exportData = {
    _meta: {
      exported_at: new Date().toISOString(),
      format_version: '2.0',
      description: 'Complete GDPR data export from Be Candid (Article 15). This file contains ALL personal data stored about you.',
      tables_included: [
        'users', 'events', 'alerts', 'stringer_journal', 'journal_preferences',
        'check_ins', 'conversation_outcomes', 'partners', 'therapist_connections',
        'focus_segments', 'trust_points', 'milestones', 'nudges', 'site_lists',
        'content_rules', 'vulnerability_windows', 'weekly_reflections',
        'family_systems_notes', 'fasts', 'quote_favorites', 'screen_time_usage',
        'category_time_limits', 'push_tokens', 'spouse_impact',
      ],
    },
    user: {
      id: uid,
      email: user.email,
      created_at: user.created_at,
      profile: profileResult.data,
    },
    events: decryptedEvents,
    alerts: decryptedAlerts,
    journal_entries: decryptedJournal,
    journal_preferences: journalPrefsResult.data,
    check_ins: checkinsResult.data || [],
    conversation_outcomes: decryptedOutcomes,
    partners: redactedPartners,
    therapist_connections: therapistConnectionsResult.data || [],
    focus_segments: focusSegmentsResult.data || [],
    trust_points: trustPointsResult.data || [],
    milestones: milestonesResult.data || [],
    nudges: nudgesResult.data || [],
    site_lists: siteListsResult.data || [],
    content_rules: contentRulesResult.data || [],
    vulnerability_windows: vulnerabilityWindowsResult.data || [],
    weekly_reflections: decryptedReflections,
    family_systems_notes: decryptedFamilyNotes,
    fasts: fastsResult.data || [],
    quote_favorites: quoteFavoritesResult.data || [],
    screen_time_usage: screenTimeUsageResult.data || [],
    category_time_limits: categoryTimeLimitsResult.data || [],
    push_tokens: sanitizedPushTokens,
    spouse_impact: spouseImpactResult.data || [],
  };

  // Log the export
  await db.from('audit_log').insert({
    user_id: uid,
    action: 'data_export',
    metadata: {
      format_version: '2.0',
      entry_counts: {
        events: decryptedEvents.length,
        alerts: decryptedAlerts.length,
        journal: decryptedJournal.length,
        checkins: (checkinsResult.data || []).length,
        conversation_outcomes: decryptedOutcomes.length,
        focus_segments: (focusSegmentsResult.data || []).length,
        weekly_reflections: decryptedReflections.length,
        fasts: (fastsResult.data || []).length,
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

  const blocked = await checkUserRate(actionLimiter, user.id);
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

// ── DELETE: Purge data ──────────────────────────────────────

export async function DELETE(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = await checkUserRate(accountLimiter, user.id);
  if (blocked) return blocked;

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
