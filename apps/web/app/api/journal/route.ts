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
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { safeError } from '@/lib/security';
import { encryptJournalEntry, decryptJournalEntries } from '@/lib/encryption';
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
<head><meta charset="utf-8"><title>Be Candid — Candid Journal</title>
<style>@page{margin:1in;}body{font-family:Georgia,serif;}</style></head><body>
<div style="text-align:center;margin-bottom:40pt;padding-bottom:20pt;border-bottom:2px solid #8B6914;">
<h1 style="font-family:Georgia,serif;font-size:22pt;color:#2C1810;letter-spacing:2pt;">BE CANDID</h1>
<p style="font-family:Georgia,serif;font-size:12pt;color:#8B6914;font-style:italic;">Candid Journal — Drawing Wisdom from the Struggle</p>
<p style="font-family:Georgia,serif;font-size:9pt;color:#999;margin-top:8pt;">${entries.length} entries · Exported ${fmtDate(new Date().toISOString())}</p>
</div>${rows}
<div style="text-align:center;margin-top:30pt;padding-top:16pt;border-top:1px solid #ddd;">
<p style="font-family:Georgia,serif;font-size:9pt;color:#aaa;font-style:italic;">"Freedom is found through kindness and curiosity."</p>
</div></body></html>`;
}

function buildNotesText(entries: StringerJournalEntry[]) {
  let t = 'BE CANDID — Candid Journal\nDrawing Wisdom from the Struggle\n';
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
  t += '═'.repeat(50) + '\n"Freedom is found through kindness and curiosity."\n';
  return t;
}

// ── Markdown (Obsidian / Notion) ────────────────────────────

function buildMarkdown(entries: StringerJournalEntry[]) {
  let md = `# Be Candid — Candid Journal\n*Drawing Wisdom from the Struggle*\n\n`;
  md += `> ${entries.length} entries · Exported ${fmtDate(new Date().toISOString())}\n\n---\n\n`;

  entries.forEach((e) => {
    md += `## ${fmtDate(e.created_at)}\n`;
    md += `*${fmtTime(e.created_at)}*`;
    if (e.trigger_type !== 'manual') md += ` · \`${e.trigger_type}\``;
    md += '\n\n';
    if (e.freewrite) md += e.freewrite + '\n\n';
    STRINGER_PROMPTS.forEach((p) => {
      const val = e[p.id as keyof StringerJournalEntry] as string | null;
      if (val) md += `### ${p.label}\n> ${p.question}\n\n${val}\n\n`;
    });
    if (e.mood) {
      const moods = ['', 'Heavy', 'Low', 'Neutral', 'Lighter', 'Hopeful'];
      md += `**Mood:** ${moods[e.mood]} (${'●'.repeat(e.mood)}${'○'.repeat(5 - e.mood)})\n\n`;
    }
    if (e.tags?.length) md += `**Tags:** ${e.tags.map(t => `#${t.replace(/\s+/g, '-')}`).join(' ')}\n\n`;
    md += '---\n\n';
  });

  md += `> *"Freedom is found through kindness and curiosity."*\n`;
  return md;
}

// ── Evernote (ENEX) ─────────────────────────────────────────

function buildENEX(entries: StringerJournalEntry[]) {
  const notes = entries.map((e) => {
    let content = '';
    if (e.freewrite) content += `<p>${escXml(e.freewrite).replace(/\n/g, '<br/>')}</p>`;
    STRINGER_PROMPTS.forEach((p) => {
      const val = e[p.id as keyof StringerJournalEntry] as string | null;
      if (val) {
        content += `<h3>${escXml(p.label)}</h3>`;
        content += `<p style="font-style:italic;color:#888;">${escXml(p.question)}</p>`;
        content += `<p>${escXml(val).replace(/\n/g, '<br/>')}</p>`;
      }
    });
    if (e.mood) {
      const moods = ['', 'Heavy', 'Low', 'Neutral', 'Lighter', 'Hopeful'];
      content += `<p><b>Mood:</b> ${moods[e.mood]}</p>`;
    }
    if (e.tags?.length) content += `<p><b>Tags:</b> ${e.tags.join(', ')}</p>`;

    const created = new Date(e.created_at).toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const tagXml = (e.tags || []).map(t => `<tag>${escXml(t)}</tag>`).join('');

    return `<note>
<title>${escXml(fmtDate(e.created_at))} — Be Candid Journal</title>
<content><![CDATA[<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd"><en-note>${content}</en-note>]]></content>
<created>${created}</created>
${tagXml}
<note-attributes><source>Be Candid</source></note-attributes>
</note>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-export SYSTEM "http://xml.evernote.com/pub/evernote-export4.dtd">
<en-export export-date="${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '')}" application="Be Candid">
${notes}
</en-export>`;
}

function escXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── OneNote HTML ────────────────────────────────────────────

function buildOneNoteHTML(entries: StringerJournalEntry[]) {
  const rows = entries.map((e) => {
    let ph = '';
    STRINGER_PROMPTS.forEach((p) => {
      const val = e[p.id as keyof StringerJournalEntry] as string | null;
      if (val) {
        ph += `<h3 style="color:#226779;margin-top:12px;">${p.label}</h3>
<p style="color:#888;font-style:italic;font-size:12px;">${p.question}</p>
<p>${val.replace(/\n/g, '<br/>')}</p>`;
      }
    });
    const moodLine = e.mood
      ? `<p style="font-size:12px;color:#999;">Mood: ${'●'.repeat(e.mood)}${'○'.repeat(5 - e.mood)}</p>` : '';
    const tagLine = e.tags?.length
      ? `<p style="font-size:12px;color:#999;">Tags: ${e.tags.join(', ')}</p>` : '';
    return `<div style="margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid #eee;">
<h2 style="color:#333;font-size:16px;">${fmtDate(e.created_at)} · ${fmtTime(e.created_at)}</h2>
${e.freewrite ? `<p>${e.freewrite.replace(/\n/g, '<br/>')}</p>` : ''}
${ph}${moodLine}${tagLine}</div>`;
  }).join('\n');

  return `<html><head><meta charset="utf-8"><title>Be Candid Journal</title></head>
<body style="font-family:Segoe UI,sans-serif;max-width:700px;margin:0 auto;padding:20px;">
<h1 style="color:#226779;text-align:center;">Be Candid — Candid Journal</h1>
<p style="text-align:center;color:#888;">${entries.length} entries · Exported ${fmtDate(new Date().toISOString())}</p>
<hr/>${rows}
<p style="text-align:center;color:#aaa;font-style:italic;margin-top:20px;">"Freedom is found through kindness and curiosity."</p>
</body></html>`;
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
  if (error) return safeError('GET /api/journal', error);

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

  if (exportType === 'markdown') {
    return new NextResponse(buildMarkdown((entries || []) as StringerJournalEntry[]), {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="be-candid-journal-${new Date().toISOString().slice(0, 10)}.md"`,
      },
    });
  }

  if (exportType === 'evernote') {
    return new NextResponse(buildENEX((entries || []) as StringerJournalEntry[]), {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Content-Disposition': `attachment; filename="be-candid-journal-${new Date().toISOString().slice(0, 10)}.enex"`,
      },
    });
  }

  if (exportType === 'onenote') {
    return new NextResponse(buildOneNoteHTML((entries || []) as StringerJournalEntry[]), {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="be-candid-journal-${new Date().toISOString().slice(0, 10)}.html"`,
      },
    });
  }

  return NextResponse.json({
    entries: decryptJournalEntries(entries || [], user.id),
    quote: STRINGER_QUOTES[Math.floor(Math.random() * STRINGER_QUOTES.length)],
  });
}

// ── POST ────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  const { freewrite, tributaries, longing, roadmap, mood, tags, alert_id, trigger_type, prompt_shown } = body;

  if (!freewrite?.trim() && !tributaries?.trim() && !longing?.trim() && !roadmap?.trim()) {
    return NextResponse.json({ error: 'At least one field required' }, { status: 400 });
  }

  const db = createServiceClient();
  const rawEntry = {
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
  };
  const encryptedEntry = encryptJournalEntry(rawEntry, user.id);
  const { data: entry, error } = await db.from('stringer_journal').insert(encryptedEntry).select().single();

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

  const blocked = checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  const { id, freewrite, tributaries, longing, roadmap, mood, tags } = body;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const db = createServiceClient();
  const rawUpdate = {
    freewrite: freewrite?.trim() || null,
    tributaries: tributaries?.trim() || null,
    longing: longing?.trim() || null,
    roadmap: roadmap?.trim() || null,
    mood: mood || null,
    tags: tags || [],
    updated_at: new Date().toISOString(),
  };
  const encryptedUpdate = encryptJournalEntry(rawUpdate, user.id);
  const { data, error } = await db.from('stringer_journal').update(encryptedUpdate).eq('id', id).eq('user_id', user.id).select().single();

  if (error) return safeError('PATCH /api/journal', error);
  return NextResponse.json({ entry: data });
}

// ── DELETE ──────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const db = createServiceClient();
  const { error } = await db.from('stringer_journal').delete().eq('id', id).eq('user_id', user.id);
  if (error) return safeError('DELETE /api/journal', error);
  return NextResponse.json({ deleted: true });
}
