export const dynamic = 'force-dynamic';
// ============================================================
// app/api/therapist/session-prep/route.ts
//
// GET -> generates a 2-week session prep report for a therapist
// Query params:
//   ?client_id=<uuid>   -> which client to prep for
//   ?format=email        -> send report via email instead of returning JSON
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { decryptJournalEntries, decrypt } from '@/lib/encryption';
import { aiGuideLimiter, checkUserRate } from '@/lib/rateLimit';
import Anthropic from '@anthropic-ai/sdk';
import { Resend } from 'resend';
import { emailWrapper } from '@/lib/email/template';
import { escapeHtml } from '@/lib/security';

function getAnthropic() { return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! }); }
function getResend() { return new Resend(process.env.RESEND_API_KEY!); }

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = checkUserRate(aiGuideLimiter, user.id);
  if (blocked) return blocked;

  const url = new URL(req.url);
  const clientId = url.searchParams.get('client_id');
  const format = url.searchParams.get('format'); // 'email' or null

  if (!clientId) return NextResponse.json({ error: 'Missing client_id' }, { status: 400 });

  const db = createServiceClient();

  // Verify therapist has an accepted connection to this client
  const { data: connection } = await db.from('therapist_connections')
    .select('can_see_journal, can_see_moods, can_see_streaks, can_see_outcomes, can_see_patterns, can_see_family_systems')
    .eq('therapist_user_id', user.id)
    .eq('user_id', clientId)
    .eq('status', 'accepted')
    .single();

  if (!connection) {
    return NextResponse.json({ error: 'No active connection to this client' }, { status: 403 });
  }

  const { data: client } = await db.from('users')
    .select('name, created_at').eq('id', clientId).single();

  const { data: therapistProfile } = await db.from('users')
    .select('name, email').eq('id', user.id).single();

  const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000).toISOString();

  // ── Gather data from last 14 days ──────────────────────────

  // Journal entries (decrypted)
  let journalEntries: any[] = [];
  if (connection.can_see_journal) {
    const { data: rawEntries } = await db.from('stringer_journal')
      .select('id, created_at, trigger_type, mood, tags, freewrite, tributaries, longing, roadmap')
      .eq('user_id', clientId)
      .gte('created_at', fourteenDaysAgo)
      .order('created_at', { ascending: false });
    journalEntries = decryptJournalEntries(rawEntries || [], clientId);
  }

  // Moods from journals + check-ins
  let moodData: any[] = [];
  if (connection.can_see_moods) {
    const { data: journalMoods } = await db.from('stringer_journal')
      .select('created_at, mood')
      .eq('user_id', clientId)
      .not('mood', 'is', null)
      .gte('created_at', fourteenDaysAgo)
      .order('created_at', { ascending: true });

    const { data: checkinMoods } = await db.from('check_ins')
      .select('created_at, mood')
      .eq('user_id', clientId)
      .not('mood', 'is', null)
      .gte('created_at', fourteenDaysAgo)
      .order('created_at', { ascending: true });

    moodData = [...(journalMoods || []), ...(checkinMoods || [])]
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  // Focus segments (streak data)
  let segments: any[] = [];
  if (connection.can_see_streaks) {
    const { data } = await db.from('focus_segments')
      .select('date, status, period')
      .eq('user_id', clientId)
      .gte('date', fourteenDaysAgo.split('T')[0])
      .order('date', { ascending: false });
    segments = data || [];
  }

  // Events (category + severity counts)
  let events: any[] = [];
  if (connection.can_see_patterns) {
    const { data } = await db.from('events')
      .select('category, severity, timestamp')
      .eq('user_id', clientId)
      .gte('timestamp', fourteenDaysAgo);
    events = data || [];
  }

  // Conversation outcomes
  let outcomes: any[] = [];
  if (connection.can_see_outcomes) {
    const { data } = await db.from('conversation_outcomes')
      .select('created_at, user_rating, user_felt, partner_rating, partner_felt, ai_reflection')
      .eq('user_id', clientId)
      .gte('created_at', fourteenDaysAgo)
      .order('created_at', { ascending: false });
    outcomes = (data || []).map((o: any) => ({
      ...o,
      ai_reflection: o.ai_reflection ? decrypt(o.ai_reflection, clientId) : null,
    }));
  }

  // Family systems notes (therapist's own notes)
  let familyNotes: any[] = [];
  if (connection.can_see_family_systems) {
    const { data } = await db.from('family_systems_notes')
      .select('dynamic, confirmed, note, note_type, created_at')
      .eq('user_id', clientId)
      .eq('therapist_id', user.id)
      .gte('created_at', fourteenDaysAgo)
      .order('created_at', { ascending: false });
    familyNotes = (data || []).map((n: any) => ({
      ...n,
      note: n.note ? decrypt(n.note, clientId) : null,
    }));
  }

  // Nudges / patterns detected
  let nudges: any[] = [];
  if (connection.can_see_patterns) {
    const { data } = await db.from('nudges')
      .select('trigger_type, category, message, severity, sent_at')
      .eq('user_id', clientId)
      .gte('sent_at', fourteenDaysAgo)
      .order('sent_at', { ascending: false });
    nudges = data || [];
  }

  // ── Build context for Claude ───────────────────────────────

  const contextParts: string[] = [];

  if (journalEntries.length > 0) {
    contextParts.push(`JOURNAL ENTRIES (${journalEntries.length} in last 14 days):\n` +
      journalEntries.map(e => {
        const parts = [`Date: ${e.created_at}`, `Mood: ${e.mood ?? 'not recorded'}`, `Trigger: ${e.trigger_type ?? 'manual'}`];
        if (e.tags?.length) parts.push(`Tags: ${e.tags.join(', ')}`);
        if (e.freewrite) parts.push(`Freewrite: ${e.freewrite}`);
        if (e.tributaries) parts.push(`Tributaries: ${e.tributaries}`);
        if (e.longing) parts.push(`Longing: ${e.longing}`);
        if (e.roadmap) parts.push(`Roadmap: ${e.roadmap}`);
        return parts.join('\n');
      }).join('\n---\n'));
  } else {
    contextParts.push('JOURNAL ENTRIES: None in the last 14 days.');
  }

  if (moodData.length > 0) {
    const moods = moodData.map(m => `${m.created_at}: ${m.mood}/5`);
    const avg = moodData.reduce((s, m) => s + m.mood, 0) / moodData.length;
    contextParts.push(`MOOD DATA (${moodData.length} readings, avg ${avg.toFixed(1)}/5):\n${moods.join('\n')}`);
  } else {
    contextParts.push('MOOD DATA: None recorded in the last 14 days.');
  }

  if (segments.length > 0) {
    const focused = segments.filter(s => s.status === 'focused').length;
    contextParts.push(`FOCUS SEGMENTS: ${focused}/${segments.length} focused in last 14 days.`);
  }

  if (events.length > 0) {
    const categoryCounts: Record<string, number> = {};
    const severityCounts: Record<string, number> = {};
    for (const e of events) {
      categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
      severityCounts[e.severity] = (severityCounts[e.severity] || 0) + 1;
    }
    contextParts.push(`EVENTS (${events.length} total):\nCategories: ${JSON.stringify(categoryCounts)}\nSeverities: ${JSON.stringify(severityCounts)}`);
  }

  if (outcomes.length > 0) {
    contextParts.push(`CONVERSATION OUTCOMES (${outcomes.length}):\n` +
      outcomes.map(o => {
        const parts = [`Date: ${o.created_at}`, `User rating: ${o.user_rating ?? '-'}/5`, `Partner rating: ${o.partner_rating ?? '-'}/5`];
        if (o.user_felt) parts.push(`User felt: ${o.user_felt}`);
        if (o.partner_felt) parts.push(`Partner felt: ${o.partner_felt}`);
        if (o.ai_reflection) parts.push(`Reflection: ${o.ai_reflection}`);
        return parts.join(', ');
      }).join('\n'));
  }

  if (familyNotes.length > 0) {
    contextParts.push(`THERAPIST FAMILY SYSTEMS NOTES (${familyNotes.length}):\n` +
      familyNotes.map(n => `[${n.note_type}] ${n.dynamic ? `Dynamic: ${n.dynamic}, ` : ''}${n.confirmed ? 'Confirmed' : 'Hypothesis'}: ${n.note}`).join('\n'));
  }

  if (nudges.length > 0) {
    contextParts.push(`NUDGES/PATTERNS DETECTED (${nudges.length}):\n` +
      nudges.map(n => `${n.sent_at}: [${n.severity}] ${n.category} — ${n.message}`).join('\n'));
  }

  const clientContext = contextParts.join('\n\n');

  // ── Generate Claude summary ────────────────────────────────

  const systemPrompt = `You are a clinical session prep assistant for a therapist.
Generate a concise 2-week briefing for a therapy session. Include:
1. Mood trajectory (trend, average, notable shifts)
2. Journal themes (recurring tributaries, longings, roadmap insights)
3. Behavioral patterns (time of day, categories, frequency)
4. Suggested talking points (3-5 specific, based on journal content)
5. Risk flags (crisis language, rapid mood drops, missed check-ins)
6. Growth observations (positive patterns, journal consistency)

Be clinical but warm. Use the client's own words when possible.
Respond as JSON with this exact structure:
{
  "mood_trajectory": { "trend": "string", "average": number|null, "notable_shifts": ["string"] },
  "journal_themes": { "tributaries": ["string"], "longings": ["string"], "roadmap_insights": ["string"], "recurring_tags": ["string"] },
  "behavioral_patterns": { "summary": "string", "frequency_note": "string", "time_patterns": "string" },
  "talking_points": ["string"],
  "risk_flags": ["string"],
  "growth_observations": ["string"],
  "overall_summary": "string"
}

If data is insufficient for a section, provide an honest note like "Insufficient data" rather than fabricating content. Output ONLY valid JSON — no markdown fences, no preamble.`;

  const response = await getAnthropic().messages.create({
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: systemPrompt,
    messages: [{ role: 'user', content: `Generate a session prep report for the client "${client?.name || 'Unknown'}". Here is their data from the last 14 days:\n\n${clientContext}` }],
  });

  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('');

  const clean = text.replace(/```json|```/g, '').trim();
  let report: any;
  try {
    report = JSON.parse(clean);
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response', raw: clean }, { status: 500 });
  }

  // Add metadata
  report.client_name = client?.name || 'Unknown';
  report.generated_at = new Date().toISOString();
  report.period_days = 14;
  report.data_summary = {
    journal_entries: journalEntries.length,
    mood_readings: moodData.length,
    focus_segments: segments.length,
    events: events.length,
    outcomes: outcomes.length,
    family_notes: familyNotes.length,
    nudges: nudges.length,
  };

  // ── Email format ───────────────────────────────────────────

  if (format === 'email') {
    if (!therapistProfile?.email) {
      return NextResponse.json({ error: 'No email on file for therapist' }, { status: 400 });
    }

    const emailBody = buildEmailBody(report);
    const html = emailWrapper({
      preheader: escapeHtml(`Session prep for ${String(report.client_name || 'Unknown')} - 2-week briefing`),
      body: emailBody,
      ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://becandid.io'}/therapist/clients/${clientId}`,
      ctaLabel: 'Open Client Portal',
    });

    const subjectClientName = String(report.client_name || 'Unknown').replace(/[\r\n]+/g, ' ').trim();

    await getResend().emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'Be Candid <noreply@becandid.io>',
      to: therapistProfile.email,
      subject: `Session Prep: ${subjectClientName} — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      html,
    });

    return NextResponse.json({ success: true, message: 'Report emailed successfully' });
  }

  return NextResponse.json(report);
}

// ── Email HTML builder ─────────────────────────────────────────

function buildEmailBody(report: any): string {
  const clientName = escapeHtml(String(report.client_name || 'Unknown'));
  const overallSummary = escapeHtml(String(report.overall_summary || ''));
  const moodTrend = escapeHtml(String(report.mood_trajectory?.trend || 'N/A'));
  const averageValue = report.mood_trajectory?.average != null
    ? escapeHtml(`${report.mood_trajectory.average}/5`)
    : 'N/A';
  const notableShifts = renderInlineList(report.mood_trajectory?.notable_shifts);
  const tributaries = renderInlineList(report.journal_themes?.tributaries);
  const longings = renderInlineList(report.journal_themes?.longings);
  const roadmapInsights = renderInlineList(report.journal_themes?.roadmap_insights);
  const recurringTags = renderInlineList(report.journal_themes?.recurring_tags);
  const behavioralSummary = escapeHtml(String(report.behavioral_patterns?.summary || 'N/A'));
  const behavioralFrequency = escapeHtml(String(report.behavioral_patterns?.frequency_note || ''));
  const talkingPoints = renderBulletList(report.talking_points);

  const riskSection = report.risk_flags?.length
    ? `<div style="background:#fef2f2;border-left:3px solid #ef4444;padding:16px;margin-bottom:20px;border-radius:0 8px 8px 0;">
        <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:0.05em;color:#ef4444;margin:0 0 8px;">Risk Flags</h3>
        <ul style="margin:0;padding-left:18px;color:#374151;line-height:1.8;">
          ${renderBulletList(report.risk_flags)}
        </ul>
      </div>`
    : '';

  const growthSection = report.growth_observations?.length
    ? `<div style="background:#f0fdf4;border-left:3px solid #10b981;padding:16px;margin-bottom:20px;border-radius:0 8px 8px 0;">
        <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:0.05em;color:#10b981;margin:0 0 8px;">Growth Observations</h3>
        <ul style="margin:0;padding-left:18px;color:#374151;line-height:1.8;">
          ${renderBulletList(report.growth_observations)}
        </ul>
      </div>`
    : '';

  return `
    <h2 style="color:#226779;font-size:20px;margin-bottom:4px;">Session Prep Report</h2>
    <p style="color:#6b7280;font-size:14px;margin-bottom:20px;">
      ${clientName} &mdash; ${escapeHtml(String(report.period_days || 14))}-day briefing &mdash; Generated ${escapeHtml(new Date(report.generated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }))}
    </p>

    <p style="margin:0 0 20px;color:#374151;line-height:1.6;font-size:14px;">${overallSummary}</p>

    <div style="background:#f8f7ff;border-left:3px solid #226779;padding:16px;margin-bottom:20px;border-radius:0 8px 8px 0;">
      <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:0.05em;color:#226779;margin:0 0 8px;">Mood Trajectory</h3>
      <p style="margin:0;color:#374151;line-height:1.6;font-size:14px;">
        <strong>Trend:</strong> ${moodTrend}<br/>
        <strong>Average:</strong> ${averageValue}
      </p>
      ${notableShifts ? `<p style="margin:8px 0 0;color:#6b7280;font-size:13px;">Notable: ${notableShifts}</p>` : ''}
    </div>

    <div style="background:#f8f7ff;border-left:3px solid #7c3aed;padding:16px;margin-bottom:20px;border-radius:0 8px 8px 0;">
      <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:0.05em;color:#7c3aed;margin:0 0 8px;">Journal Themes</h3>
      ${tributaries ? `<p style="margin:0 0 6px;color:#374151;font-size:13px;"><strong>Tributaries:</strong> ${tributaries}</p>` : ''}
      ${longings ? `<p style="margin:0 0 6px;color:#374151;font-size:13px;"><strong>Longings:</strong> ${longings}</p>` : ''}
      ${roadmapInsights ? `<p style="margin:0 0 6px;color:#374151;font-size:13px;"><strong>Roadmap:</strong> ${roadmapInsights}</p>` : ''}
      ${recurringTags ? `<p style="margin:0;color:#374151;font-size:13px;"><strong>Tags:</strong> ${recurringTags}</p>` : ''}
    </div>

    <div style="background:#fefce8;border-left:3px solid #d97706;padding:16px;margin-bottom:20px;border-radius:0 8px 8px 0;">
      <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:0.05em;color:#d97706;margin:0 0 8px;">Behavioral Patterns</h3>
      <p style="margin:0;color:#374151;line-height:1.6;font-size:14px;">${behavioralSummary}</p>
      ${behavioralFrequency ? `<p style="margin:6px 0 0;color:#6b7280;font-size:13px;">${behavioralFrequency}</p>` : ''}
    </div>

    <div style="background:#f0f9ff;border-left:3px solid #0284c7;padding:16px;margin-bottom:20px;border-radius:0 8px 8px 0;">
      <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:0.05em;color:#0284c7;margin:0 0 8px;">Suggested Talking Points</h3>
      <ol style="margin:0;padding-left:18px;color:#374151;line-height:1.8;">
        ${talkingPoints}
      </ol>
    </div>

    ${riskSection}
    ${growthSection}

    <p style="margin:20px 0 0;color:#9ca3af;font-size:11px;line-height:1.5;text-align:center;">
      Data summary: ${escapeHtml(String(report.data_summary?.journal_entries ?? 0))} journal entries, ${escapeHtml(String(report.data_summary?.mood_readings ?? 0))} mood readings, ${escapeHtml(String(report.data_summary?.events ?? 0))} events, ${escapeHtml(String(report.data_summary?.outcomes ?? 0))} outcomes
    </p>
  `;
}

function renderInlineList(items: unknown): string {
  if (!Array.isArray(items) || items.length === 0) return '';
  return items.map((item) => escapeHtml(String(item))).join(', ');
}

function renderBulletList(items: unknown): string {
  if (!Array.isArray(items) || items.length === 0) return '';
  return items.map((item) => `<li>${escapeHtml(String(item))}</li>`).join('');
}
