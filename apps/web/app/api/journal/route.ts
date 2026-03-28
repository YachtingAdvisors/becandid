export const dynamic = 'force-dynamic';
// ============================================================
// app/api/journal/route.ts
//
// GET    → list entries (?limit, ?offset, ?tag, ?trigger_type)
// GET    → export (?export=word | ?export=notes)
// POST   → create entry (awards +10 trust points)
// PATCH  → update entry
// DELETE → delete entry (?id=...)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { onJournalEntry } from '@/lib/relationshipHooks';
import {
  STRINGER_PROMPTS, STRINGER_QUOTES, JOURNAL_TAGS,
  type StringerJournalEntry,
} from '@be-candid/shared';

// ── Export builders ─────────────────────────────────────────

function fmtDate(ts: string) {
  return new Date(ts).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

function fmtTime(ts: string) {
  return new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function buildWordHTML(entries: StringerJournalEntry[]) {
  const rows = entries.map((e) => {
    let ph = '';
    STRINGER_PROMPTS.forEach((p) => {
      const val = e[p.id as keyof StringerJournalEntry] as string | null;
      if (val) {
        ph += `<h3 style="color:#8B6914;font-family:Georgia,serif;font-size:13pt;margin-top:16pt;">${p.label}</h3>
<p style="color:#555;font-family:Georgia,serif;font-size:10pt;font-style:italic;margin-bottom:4pt;">${p.question}</p>
<p style="font-family:Georgia,serif;font-size:11pt;line-height:1.6;color:#333;">${val.replace(/\n/g, '<br/>')}</p>`;
      }
    });
    const moodDots = e.mood
      ? `<p style="font-size:9pt;color:#aaa;margin-top:10pt;">Mood: ${'●'.repeat(e.mood)}${'○'.repeat(5 - e.mood)}</p>` : '';
    const tagLine = e.tags?.length
      ? `<p style="font-size:9pt;color:#bbb;margin-top:6pt;">Tags: ${e.tags.join(', ')}</p>` : '';
    const triggerBadge = e.trigger_type !== 'manual'
      ? `<p style="font-size:9pt;color:#9575cd;margin-top:4pt;">Trigger: ${e.trigger_type}</p>` : '';
    return `<div style="page-break-inside:avoid;margin-bottom:28pt;padding-bottom:20pt;border-bottom:1px solid #ddd;">
<h2 style="font-family:Georgia,serif;font-size:15pt;color:#2C1810;margin-bottom:2pt;">${fmtDate(e.created_at)}</h2>
<p style="font-family:Georgia,serif;font-size:9pt;color:#999;margin-bottom:12pt;">${fmtTime(e.created_at)}</p>
${e.freewrite ? `<p style="font-family:Georgia,serif;font-size:11pt;line-height:1.6;color:#333;">${e.freewrite.replace(/\n/g, '<br/>')}</p>` : ''}
${ph}${moodDots}${tagLine}${triggerBadge}</div>`;
  }).join('\n');

  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head><meta charset="utf-8"><title>Be Candid — Stringer Journal</title>
<style>@page{margin:1in;}body{font-family:Georgia,serif;}</style></head><body>
<div style="text-align:center;margin-bottom:40pt;padding-bottom:20pt;border-bottom:2px solid #8B6914;">
<h1 style="font-family:Georgia,serif;font-size:22pt;color:#2C1810;letter-spacing:2pt;">BE CANDID</h1>
<p style="font-family:Georgia,serif;font-size:12pt;color:#8B6914;font-style:italic;">Stringer Journal — Drawing Wisdom from the Struggle</p>
<p style="font-family:Georgia,serif;font-size:9pt;color:#999;margin-top:8pt;">${entries.length} entries · Exported ${fmtDate(new Date().toISOString())}</p>
</div>${rows}
<div style="text-align:center;margin-top:30pt;padding-top:16pt;border-top:1px solid #ddd;">
<p style="font-family:Georgia,serif;font-size:9pt;color:#aaa;font-style:italic;">"Freedom is found through kindness and curiosity." — Jay Stringer</p>
</div></body></html>`;
}

function buildNotesText(entries: StringerJournalEntry[]) {
  let t = 'BE CANDID — Stringer Journal\nDrawing Wisdom from the Struggle\n';
  t += '═'.repeat(50) + '\n' + entries.length + ' entries · Exported ' + fmtDate(new Date().toISOString()) + '\n\n';
  entries.forEach((e) => {
    t += '─'.repeat(50) + '\n' + fmtDate(e.created_at) + ' · ' + fmtTime(e.created_at);
    if (e.trigger_type !== 'manual') t += ' · [' + e.trigger_type + ']';
    t += '\n' + '─'.repeat(50) + '\n\n';
    if (e.freewrite) t += e.freewrite + '\n\n';
    STRINGER_PROMPTS.forEach((p) => {
      const val = e[p.id as keyof StringerJournalEntry] as string | null;
      if (val) t += '▸ ' + p.label + '\n  ' + p.question + '\n\n' + val + '\n\n';
    });
    if (e.tags?.length) t += 'Tags: ' + e.tags.join(', ') + '\n';
    t += '\n';
  });
  t += '═'.repeat(50) + '\n"Freedom is found through kindness and curiosity." — Jay Stringer\n';
  return t;
}

// ── GET ─────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const exportType = url.searchParams.get('export');

  const db = createServiceClient();
  let query = db.from('stringer_journal').select('*')
    .eq('user_id', user.id).order('created_at', { ascending: false });

  if (!exportType) {
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '30'), 100);
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const tag = url.searchParams.get('tag');
    const trigger = url.searchParams.get('trigger_type');
    if (tag) query = query.contains('tags', [tag]);
    if (trigger) query = query.eq('trigger_type', trigger);
    query = query.range(offset, offset + limit - 1);
  }

  const { data: entries, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (exportType === 'word') {
    return new NextResponse(buildWordHTML((entries || []) as StringerJournalEntry[]), {
      headers: {
        'Content-Type': 'application/msword',
        'Content-Disposition': `attachment; filename="be-candid-journal-${new Date().toISOString().slice(0, 10)}.doc"`,
      },
    });
  }

  if (exportType === 'notes') {
    return new NextResponse(buildNotesText((entries || []) as StringerJournalEntry[]), {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="be-candid-journal-${new Date().toISOString().slice(0, 10)}.txt"`,
      },
    });
  }

  return NextResponse.json({
    entries,
    quote: STRINGER_QUOTES[Math.floor(Math.random() * STRINGER_QUOTES.length)],
  });
}

// ── POST ────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { freewrite, tributaries, longing, roadmap, mood, tags, alert_id, trigger_type, prompt_shown } = body;

  if (!freewrite?.trim() && !tributaries?.trim() && !longing?.trim() && !roadmap?.trim()) {
    return NextResponse.json({ error: 'At least one field required' }, { status: 400 });
  }

  const db = createServiceClient();
  const { data: entry, error } = await db.from('stringer_journal').insert({
    user_id: user.id,
    freewrite: freewrite?.trim() || null,
    tributaries: tributaries?.trim() || null,
    longing: longing?.trim() || null,
    roadmap: roadmap?.trim() || null,
    mood: mood || null,
    tags: tags || [],
    alert_id: alert_id || null,
    trigger_type: trigger_type || 'manual',
    prompt_shown: prompt_shown || null,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Award trust points
  await db.rpc('award_trust_points', {
    p_user_id: user.id, p_points: 10,
    p_reason: 'stringer_journal', p_reference_id: entry.id,
  });

  // Relationship XP for journaling
  const allPrompts = !!(entry.tributaries && entry.longing && entry.roadmap);
  await onJournalEntry(user.id, allPrompts).catch(() => {});

  return NextResponse.json({ entry, points_earned: 10 }, { status: 201 });
}

// ── PATCH ───────────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { id, freewrite, tributaries, longing, roadmap, mood, tags } = body;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const db = createServiceClient();
  const { data, error } = await db.from('stringer_journal').update({
    freewrite: freewrite?.trim() || null,
    tributaries: tributaries?.trim() || null,
    longing: longing?.trim() || null,
    roadmap: roadmap?.trim() || null,
    mood: mood || null,
    tags: tags || [],
    updated_at: new Date().toISOString(),
  }).eq('id', id).eq('user_id', user.id).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ entry: data });
}

// ── DELETE ──────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const db = createServiceClient();
  const { error } = await db.from('stringer_journal').delete().eq('id', id).eq('user_id', user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deleted: true });
}
