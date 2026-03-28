// ============================================================
// app/dashboard/stringer-journal/page.tsx
//
// The journal page reads URL params set by push notifications:
//   ?action=write         → opens directly in write mode
//   ?trigger=relapse      → marks entry as relapse-triggered
//   ?trigger=reminder     → marks entry as reminder-triggered
//   ?alert=<id>           → links entry to a specific alert
//   ?prompt=<text>        → pre-fills the prompt that was shown
//
// This means tapping a push notification deep-links directly
// into a journal entry pre-configured with the right context.
// ============================================================

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  STRINGER_PROMPTS, STRINGER_QUOTES, JOURNAL_TAGS,
} from '@be-candid/shared';

const MOODS = [
  { v: 1, label: 'Heavy', emoji: '😔' },
  { v: 2, label: 'Low', emoji: '😕' },
  { v: 3, label: 'Neutral', emoji: '😐' },
  { v: 4, label: 'Lighter', emoji: '🙂' },
  { v: 5, label: 'Hopeful', emoji: '😊' },
];

const PROMPT_COLORS = [
  { bg: 'bg-blue-500/5', border: 'border-blue-200', accent: 'text-blue-600', ring: 'ring-blue-500/20' },
  { bg: 'bg-amber-500/5', border: 'border-amber-200', accent: 'text-amber-600', ring: 'ring-amber-500/20' },
  { bg: 'bg-emerald-500/5', border: 'border-emerald-200', accent: 'text-emerald-600', ring: 'ring-emerald-500/20' },
];

function timeAgo(ts: string) {
  const s = (Date.now() - new Date(ts).getTime()) / 1000;
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  if (s < 604800) return Math.floor(s / 86400) + 'd ago';
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function StringerJournalPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read deep-link params from push notification
  const initialAction = searchParams.get('action');
  const triggerType = searchParams.get('trigger') as 'relapse' | 'reminder' | null;
  const alertId = searchParams.get('alert');
  const promptFromNotification = searchParams.get('prompt');

  const [view, setView] = useState<'list' | 'write' | 'detail' | 'edit'>(
    initialAction === 'write' ? 'write' : 'list'
  );
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [showExport, setShowExport] = useState(false);
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [quote] = useState(() => STRINGER_QUOTES[Math.floor(Math.random() * STRINGER_QUOTES.length)]);

  // Form state
  const [freewrite, setFreewrite] = useState('');
  const [answers, setAnswers] = useState({ tributaries: '', longing: '', roadmap: '' });
  const [expandedPrompts, setExpandedPrompts] = useState<Record<string, boolean>>({});
  const [mood, setMood] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // If opened from a relapse notification, pre-populate context
  useEffect(() => {
    if (triggerType === 'relapse') {
      // Auto-expand the tributaries prompt for relapse entries
      setExpandedPrompts({ tributaries: true });
      if (triggerType === 'relapse') {
        setSelectedTags((prev) => prev.includes('relapse') ? prev : [...prev, 'relapse']);
      }
    }
  }, [triggerType]);

  // Fetch entries
  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch('/api/journal');
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const resetForm = () => {
    setFreewrite(''); setAnswers({ tributaries: '', longing: '', roadmap: '' });
    setExpandedPrompts({}); setMood(null); setSelectedTags([]);
  };

  const hasContent = freewrite.trim() || answers.tributaries.trim() || answers.longing.trim() || answers.roadmap.trim();

  // Save new entry
  const handleSave = async () => {
    if (!hasContent) return;
    setSaving(true);
    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          freewrite: freewrite || undefined,
          tributaries: answers.tributaries || undefined,
          longing: answers.longing || undefined,
          roadmap: answers.roadmap || undefined,
          mood, tags: selectedTags,
          alert_id: alertId || undefined,
          trigger_type: triggerType || 'manual',
          prompt_shown: promptFromNotification || undefined,
        }),
      });
      if (res.ok) {
        const { points_earned } = await res.json();
        setSaved(true);
        setTimeout(() => {
          setSaved(false); resetForm(); setView('list'); fetchEntries();
          // Clean URL params
          router.replace('/dashboard/stringer-journal');
        }, 1200);
      }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  // Update existing entry
  const handleUpdate = async () => {
    if (!hasContent || !selected) return;
    setSaving(true);
    try {
      const res = await fetch('/api/journal', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selected.id,
          freewrite: freewrite || undefined,
          tributaries: answers.tributaries || undefined,
          longing: answers.longing || undefined,
          roadmap: answers.roadmap || undefined,
          mood, tags: selectedTags,
        }),
      });
      if (res.ok) {
        const { entry } = await res.json();
        setSelected(entry); setSaved(true);
        setTimeout(() => { setSaved(false); setView('detail'); fetchEntries(); }, 1200);
      }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const startEdit = (entry: any) => {
    setFreewrite(entry.freewrite || '');
    setAnswers({ tributaries: entry.tributaries || '', longing: entry.longing || '', roadmap: entry.roadmap || '' });
    setMood(entry.mood || null); setSelectedTags(entry.tags || []);
    const expanded: Record<string, boolean> = {};
    STRINGER_PROMPTS.forEach((p) => { if (entry[p.id]) expanded[p.id] = true; });
    setExpandedPrompts(expanded);
    setView('edit');
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/journal?id=${id}`, { method: 'DELETE' });
      setEntries((prev) => prev.filter((e) => e.id !== id));
      if (selected?.id === id) { setSelected(null); setView('list'); }
    } catch (e) { console.error(e); }
  };

  // Filtered entries
  const filtered = useMemo(() => {
    let list = entries;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((e) =>
        (e.freewrite || '').toLowerCase().includes(q) ||
        (e.tributaries || '').toLowerCase().includes(q) ||
        (e.longing || '').toLowerCase().includes(q) ||
        (e.roadmap || '').toLowerCase().includes(q)
      );
    }
    if (filterTag) list = list.filter((e) => (e.tags || []).includes(filterTag));
    return list;
  }, [entries, search, filterTag]);

  const allTags = useMemo(() => {
    const tc: Record<string, number> = {};
    entries.forEach((e) => (e.tags || []).forEach((t: string) => { tc[t] = (tc[t] || 0) + 1; }));
    return Object.entries(tc).sort((a, b) => b[1] - a[1]);
  }, [entries]);

  // ── Shared form renderer ──────────────────────────────────
  const renderForm = (isEdit: boolean) => (
    <div className="space-y-5 animate-fade-in">
      <button onClick={() => { if (!hasContent || confirm(isEdit ? 'Discard changes?' : 'Discard this entry?')) { resetForm(); setView(isEdit ? 'detail' : 'list'); } }}
        className="text-sm text-ink-muted hover:text-ink">← Back</button>

      <div>
        <h2 className="text-xl font-display font-semibold text-ink">{isEdit ? 'Edit Entry' : 'New Entry'}</h2>
        <p className="text-sm text-ink-muted mt-1">
          Instead of asking "How do I stop?" — ask <em className="text-brand">"Why is this here?"</em>
        </p>
      </div>

      {/* Relapse context banner */}
      {!isEdit && triggerType === 'relapse' && (
        <div className="p-4 rounded-xl bg-violet-50 border border-violet-100">
          <p className="text-sm text-violet-800 leading-relaxed">
            <strong>This entry is linked to a flagged event.</strong> That takes courage.
            Stringer says the behavior is the signal, not the problem. Be curious with what comes up.
          </p>
        </div>
      )}

      {/* Notification prompt (if opened from a push notification) */}
      {!isEdit && promptFromNotification && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
          <p className="text-xs text-amber-600 uppercase tracking-wider font-medium mb-1">Today's prompt</p>
          <p className="text-sm text-amber-900 leading-relaxed italic">{promptFromNotification}</p>
        </div>
      )}

      {/* Freewrite */}
      <div>
        <label className="block text-sm font-medium text-ink mb-2">Open reflection</label>
        <textarea value={freewrite} onChange={(e) => setFreewrite(e.target.value)}
          placeholder="Write freely. What happened? What are you feeling right now?"
          className="w-full h-28 px-4 py-3 rounded-xl border border-surface-border bg-white text-ink text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand placeholder:text-ink-muted/50" />
      </div>

      {/* Guided prompts */}
      <div>
        <p className="text-sm font-medium text-ink mb-2">
          Guided prompts <span className="text-ink-muted font-normal">(optional)</span>
        </p>
        <div className="space-y-2">
          {STRINGER_PROMPTS.map((prompt, i) => {
            const colors = PROMPT_COLORS[i];
            const isOpen = expandedPrompts[prompt.id];
            const hasAnswer = answers[prompt.id as keyof typeof answers]?.trim();
            return (
              <div key={prompt.id} className={`rounded-xl border ${hasAnswer ? colors.border : 'border-surface-border'} overflow-hidden`}>
                <button onClick={() => setExpandedPrompts((prev) => ({ ...prev, [prompt.id]: !prev[prompt.id] }))}
                  className={`w-full px-4 py-3 flex items-center justify-between text-left ${isOpen || hasAnswer ? colors.bg : 'bg-white'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-base">{['🌊', '💛', '🧭'][i]}</span>
                    <div>
                      <span className={`text-sm font-medium ${hasAnswer ? colors.accent : 'text-ink'}`}>{prompt.label}</span>
                      {hasAnswer && !isOpen && (
                        <p className="text-xs text-ink-muted mt-0.5 truncate max-w-[240px]">
                          {answers[prompt.id as keyof typeof answers].slice(0, 60)}…
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-ink-muted text-xs">{isOpen ? '▾' : '▸'}</span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1">
                    <p className="text-sm text-ink-muted italic mb-1.5">{prompt.question}</p>
                    <p className="text-xs text-ink-muted/70 mb-3">{prompt.hint}</p>
                    <textarea value={answers[prompt.id as keyof typeof answers]}
                      onChange={(e) => setAnswers((prev) => ({ ...prev, [prompt.id]: e.target.value }))}
                      placeholder="Take your time…"
                      className="w-full h-24 px-3 py-2.5 rounded-lg border border-surface-border bg-white text-ink text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand placeholder:text-ink-muted/50" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mood */}
      <div>
        <label className="block text-sm font-medium text-ink mb-2">
          How are you feeling? <span className="text-ink-muted font-normal">(optional)</span>
        </label>
        <div className="flex gap-2">
          {MOODS.map((m) => (
            <button key={m.v} onClick={() => setMood(mood === m.v ? null : m.v)}
              className={`flex-1 py-2.5 rounded-lg border text-center transition-all ${
                mood === m.v ? 'border-brand bg-brand/5 ring-2 ring-brand/20' : 'border-surface-border bg-white hover:bg-gray-50'
              }`}>
              <div className="text-lg">{m.emoji}</div>
              <div className="text-[10px] text-ink-muted mt-0.5">{m.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-ink mb-2">
          What was present? <span className="text-ink-muted font-normal">(optional tags)</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {[...JOURNAL_TAGS, ...(triggerType === 'relapse' ? ['relapse' as const] : [])].map((tag) => (
            <button key={tag} onClick={() => setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedTags.includes(tag) ? 'bg-brand/10 text-brand border border-brand/30' : 'bg-gray-100 text-ink-muted border border-transparent hover:bg-gray-200'
              }`}>
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="flex gap-3 pt-4 border-t border-surface-border">
        <button onClick={() => { if (!hasContent || confirm('Discard?')) { resetForm(); setView(isEdit ? 'detail' : 'list'); } }}
          className="px-4 py-2.5 text-sm rounded-lg border border-surface-border text-ink-muted hover:bg-gray-50">Cancel</button>
        <button onClick={isEdit ? handleUpdate : handleSave} disabled={!hasContent || saving}
          className={`flex-1 px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${
            saved ? 'bg-emerald-500 text-white' : hasContent ? 'bg-brand text-white hover:bg-brand-dark' : 'bg-gray-100 text-ink-muted cursor-not-allowed'
          }`}>
          {saved ? '✓ Saved · +10 pts' : saving ? 'Saving…' : isEdit ? 'Update Entry' : 'Save Entry'}
        </button>
      </div>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-display font-semibold text-ink">Stringer Journal</h1>
            <p className="text-sm text-ink-muted mt-1">Drawing wisdom from the struggle</p>
          </div>
          <div className="flex gap-2">
            {entries.length > 0 && (
              <div className="relative">
                <button onClick={() => setShowExport(!showExport)}
                  className="px-3 py-2 text-sm rounded-lg border border-surface-border bg-white hover:bg-gray-50 text-ink-muted">↓ Export</button>
                {showExport && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-surface-border z-20 overflow-hidden">
                    <a href="/api/journal?export=word" className="block px-4 py-3 text-sm hover:bg-gray-50 text-ink" onClick={() => setShowExport(false)}>
                      <span className="font-medium">📄 Word Document</span>
                      <span className="block text-xs text-ink-muted mt-0.5">Download .doc file</span>
                    </a>
                    <a href="/api/journal?export=notes" className="block px-4 py-3 text-sm hover:bg-gray-50 text-ink border-t border-surface-border" onClick={() => setShowExport(false)}>
                      <span className="font-medium">📝 Apple Notes</span>
                      <span className="block text-xs text-ink-muted mt-0.5">Download .txt — paste into Notes</span>
                    </a>
                  </div>
                )}
              </div>
            )}
            {view === 'list' && (
              <button onClick={() => { resetForm(); setView('write'); }}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-brand text-white hover:bg-brand-dark">+ New Entry</button>
            )}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-violet-50 to-amber-50 border border-violet-100">
          <p className="text-sm text-violet-800 italic leading-relaxed">"{quote.text}"</p>
          <p className="text-xs text-violet-500 mt-1">— Jay Stringer, {quote.ref}</p>
        </div>
      </div>

      {/* Views */}
      {view === 'write' && renderForm(false)}
      {view === 'edit' && renderForm(true)}

      {view === 'detail' && selected && (
        <div className="space-y-4 animate-fade-in">
          <button onClick={() => { setSelected(null); setView('list'); }} className="text-sm text-ink-muted hover:text-ink">← Back</button>
          <div className="bg-white rounded-2xl border border-surface-border p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-display font-semibold text-ink">
                  {new Date(selected.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-ink-muted">{new Date(selected.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
                  {selected.trigger_type !== 'manual' && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      selected.trigger_type === 'relapse' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-violet-50 text-violet-600 border border-violet-200'
                    }`}>{selected.trigger_type}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selected.mood && <span className="text-2xl">{MOODS.find((m) => m.v === selected.mood)?.emoji}</span>}
                <button onClick={() => startEdit(selected)} className="text-xs text-brand hover:text-brand-dark px-2 py-1 rounded border border-surface-border">Edit</button>
                <button onClick={() => { if (confirm('Delete this entry?')) handleDelete(selected.id); }} className="text-xs text-red-400 hover:text-red-600 px-2 py-1">Delete</button>
              </div>
            </div>
            {selected.prompt_shown && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-100 mb-4">
                <p className="text-xs text-amber-600 font-medium mb-0.5">Prompt</p>
                <p className="text-sm text-amber-800 italic">{selected.prompt_shown}</p>
              </div>
            )}
            {selected.freewrite && <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap mb-4">{selected.freewrite}</p>}
            {STRINGER_PROMPTS.map((p, i) => {
              if (!selected[p.id]) return null;
              const colors = PROMPT_COLORS[i];
              return (
                <div key={p.id} className={`mb-4 p-4 rounded-xl ${colors.bg} border ${colors.border}`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span>{['🌊', '💛', '🧭'][i]}</span>
                    <h3 className={`text-sm font-semibold ${colors.accent}`}>{p.label}</h3>
                  </div>
                  <p className="text-xs text-ink-muted italic mb-2">{p.question}</p>
                  <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">{selected[p.id]}</p>
                </div>
              );
            })}
            {selected.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-3 mt-3 border-t border-surface-border">
                {selected.tags.map((tag: string) => (
                  <span key={tag} className="px-2.5 py-1 rounded-full text-xs bg-gray-100 text-ink-muted">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {view === 'list' && (
        <div className="space-y-2 animate-fade-in">
          {loading ? (
            <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-brand/30 border-t-brand rounded-full animate-spin" /></div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📓</div>
              <h3 className="text-lg font-display font-semibold text-ink mb-2">Your journal is empty</h3>
              <p className="text-sm text-ink-muted max-w-sm mx-auto mb-5">
                Stringer teaches that our struggles aren't random — they're a roadmap. Start tracing the tributaries.
              </p>
              <button onClick={() => { resetForm(); setView('write'); }}
                className="px-5 py-2.5 text-sm font-medium rounded-lg bg-brand text-white hover:bg-brand-dark">Write Your First Entry</button>
            </div>
          ) : (
            <>
              {/* Search + filter */}
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search entries…"
                className="w-full px-4 py-2.5 rounded-xl border border-surface-border bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand placeholder:text-ink-muted/50" />
              {allTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 py-1">
                  {filterTag && <button onClick={() => setFilterTag(null)} className="text-[10px] px-2.5 py-1 rounded-full border border-red-200 bg-red-50 text-red-500">Clear ×</button>}
                  {allTags.slice(0, 10).map(([tag, count]) => (
                    <button key={tag} onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                      className={`text-[10px] px-2.5 py-1 rounded-full border ${filterTag === tag ? 'border-brand/40 bg-brand/5 text-brand' : 'border-surface-border text-ink-muted'}`}>
                      {tag} ({count})
                    </button>
                  ))}
                </div>
              )}
              {filtered.map((entry) => {
                const filled = STRINGER_PROMPTS.filter((p) => entry[p.id]);
                const preview = entry.freewrite || entry.tributaries || entry.longing || entry.roadmap || '';
                return (
                  <button key={entry.id} onClick={() => { setSelected(entry); setView('detail'); }}
                    className="w-full text-left p-4 rounded-xl bg-white border border-surface-border hover:border-brand/30 hover:shadow-sm transition-all">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-ink">
                        {new Date(entry.created_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-xs text-ink-muted">{timeAgo(entry.created_at)}</span>
                      {entry.mood && <span className="text-sm">{MOODS.find((m) => m.v === entry.mood)?.emoji}</span>}
                      {entry.trigger_type === 'relapse' && <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-50 text-red-500 border border-red-200">relapse</span>}
                      {entry.trigger_type === 'reminder' && <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-500 border border-violet-200">reminder</span>}
                    </div>
                    <p className="text-sm text-ink-muted line-clamp-2 leading-relaxed">{preview.slice(0, 130)}{preview.length > 130 ? '…' : ''}</p>
                    {filled.length > 0 && (
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {filled.map((p, i) => (
                          <span key={p.id} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${PROMPT_COLORS[i].accent} ${PROMPT_COLORS[i].bg}`}>
                            {['🌊', '💛', '🧭'][i]} {p.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
              {filtered.length === 0 && <p className="text-center text-sm text-ink-muted py-8">No entries match your search</p>}
            </>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.3s ease; }
      `}</style>
    </div>
  );
}
