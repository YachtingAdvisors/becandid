// ============================================================
// app/dashboard/stringer-journal/page.tsx
//
// The journal page reads URL params set by push notifications:
//   ?action=write         -> opens directly in write mode
//   ?trigger=relapse      -> marks entry as relapse-triggered
//   ?trigger=reminder     -> marks entry as reminder-triggered
//   ?alert=<id>           -> links entry to a specific alert
//   ?prompt=<text>        -> pre-fills the prompt that was shown
//
// This means tapping a push notification deep-links directly
// into a journal entry pre-configured with the right context.
// ============================================================

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  STRINGER_PROMPTS, JOURNAL_TAGS,
  getRandomQuote, type MotivatorQuote,
} from '@be-candid/shared';
import { checkForCrisisLanguage } from '@/lib/crisisDetection';
import CrisisResourceBanner from '@/components/dashboard/CrisisResourceBanner';

const MOODS = [
  { v: 1, label: 'Heavy', emoji: '\uD83D\uDE14' },
  { v: 2, label: 'Low', emoji: '\uD83D\uDE15' },
  { v: 3, label: 'Neutral', emoji: '\uD83D\uDE10' },
  { v: 4, label: 'Lighter', emoji: '\uD83D\uDE42' },
  { v: 5, label: 'Hopeful', emoji: '\uD83D\uDE0A' },
];

const PROMPT_COLORS = [
  { bg: 'bg-primary-container/20', border: 'border-primary-container', accent: 'text-primary', ring: 'ring-primary/20' },
  { bg: 'bg-tertiary-container/20', border: 'border-tertiary-container', accent: 'text-tertiary', ring: 'ring-tertiary/20' },
  { bg: 'bg-secondary-container/20', border: 'border-secondary-container', accent: 'text-secondary', ring: 'ring-secondary/20' },
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
  const [quote] = useState<MotivatorQuote>(() => getRandomQuote(null));

  // Form state
  const [freewrite, setFreewrite] = useState('');
  const [answers, setAnswers] = useState({ tributaries: '', longing: '', roadmap: '' });
  const [expandedPrompts, setExpandedPrompts] = useState<Record<string, boolean>>({});
  const [mood, setMood] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Crisis detection
  const crisisCheck = useMemo(() => checkForCrisisLanguage(freewrite), [freewrite]);

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

  // -- Shared form renderer --
  const renderForm = (isEdit: boolean) => (
    <div className="space-y-5 animate-fade-in">
      <button onClick={() => { if (!hasContent || confirm(isEdit ? 'Discard changes?' : 'Discard this entry?')) { resetForm(); setView(isEdit ? 'detail' : 'list'); } }}
        className="text-sm text-on-surface-variant hover:text-on-surface font-label">{'\u2190'} Back</button>

      <div>
        <h2 className="text-xl font-headline font-bold text-on-surface">{isEdit ? 'Edit Entry' : 'New Entry'}</h2>
        <p className="text-sm text-on-surface-variant font-body mt-1">
          Instead of asking &quot;How do I stop?&quot; &mdash; ask <em className="text-primary">&quot;Why is this here?&quot;</em>
        </p>
      </div>

      {/* Relapse context banner */}
      {!isEdit && triggerType === 'relapse' && (
        <div className="p-4 rounded-2xl bg-secondary-container/40 border border-secondary-container">
          <p className="text-sm text-secondary leading-relaxed font-body">
            <strong>This entry is linked to a flagged event.</strong> That takes courage.
            Stringer says the behavior is the signal, not the problem. Be curious with what comes up.
          </p>
        </div>
      )}

      {/* Notification prompt (if opened from a push notification) */}
      {!isEdit && promptFromNotification && (
        <div className="p-4 rounded-2xl bg-tertiary-container/40 border border-tertiary-container">
          <p className="text-xs text-tertiary uppercase tracking-wider font-label font-medium mb-1">Today&apos;s prompt</p>
          <p className="text-sm text-on-tertiary-container leading-relaxed italic font-body">{promptFromNotification}</p>
        </div>
      )}

      {/* Freewrite */}
      <div>
        <label className="block text-sm font-label font-medium text-on-surface mb-2">Open reflection</label>
        <textarea value={freewrite} onChange={(e) => setFreewrite(e.target.value)}
          placeholder="Write freely. What happened? What are you feeling right now?"
          className="w-full h-28 px-4 py-3 rounded-3xl bg-secondary-container/30 border border-outline-variant text-on-surface text-sm font-body leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-on-surface-variant/50" />
        {crisisCheck.detected && <CrisisResourceBanner result={crisisCheck} />}
      </div>

      {/* Guided prompts */}
      <div>
        <p className="text-sm font-label font-medium text-on-surface mb-2">
          Guided prompts <span className="text-on-surface-variant font-normal">(optional)</span>
        </p>
        <div className="space-y-2">
          {STRINGER_PROMPTS.map((prompt, i) => {
            const colors = PROMPT_COLORS[i];
            const isOpen = expandedPrompts[prompt.id];
            const hasAnswer = answers[prompt.id as keyof typeof answers]?.trim();
            return (
              <div key={prompt.id} className={`rounded-2xl border ${hasAnswer ? colors.border : 'border-outline-variant'} overflow-hidden`}>
                <button onClick={() => setExpandedPrompts((prev) => ({ ...prev, [prompt.id]: !prev[prompt.id] }))}
                  className={`w-full px-4 py-3 flex items-center justify-between text-left ${isOpen || hasAnswer ? colors.bg : 'bg-surface-container-lowest'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-base">{['\uD83C\uDF0A', '\uD83D\uDC9B', '\uD83E\uDDED'][i]}</span>
                    <div>
                      <span className={`text-sm font-label font-medium ${hasAnswer ? colors.accent : 'text-on-surface'}`}>{prompt.label}</span>
                      {hasAnswer && !isOpen && (
                        <p className="text-xs text-on-surface-variant mt-0.5 truncate max-w-[180px] sm:max-w-[240px] font-body">
                          {answers[prompt.id as keyof typeof answers].slice(0, 60)}{'\u2026'}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-on-surface-variant text-xs">{isOpen ? '\u25BE' : '\u25B8'}</span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1">
                    <p className="text-sm text-on-surface-variant italic mb-1.5 font-body">{prompt.question}</p>
                    <p className="text-xs text-on-surface-variant/70 mb-3 font-body">{prompt.hint}</p>
                    <textarea value={answers[prompt.id as keyof typeof answers]}
                      onChange={(e) => setAnswers((prev) => ({ ...prev, [prompt.id]: e.target.value }))}
                      placeholder="Take your time\u2026"
                      className="w-full h-24 px-3 py-2.5 rounded-2xl border border-outline-variant bg-surface-container-lowest text-on-surface text-sm font-body leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-on-surface-variant/50" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mood */}
      <div>
        <label className="block text-sm font-label font-medium text-on-surface mb-2">
          How are you feeling? <span className="text-on-surface-variant font-normal">(optional)</span>
        </label>
        <div className="flex gap-2">
          {MOODS.map((m) => (
            <button key={m.v} onClick={() => setMood(mood === m.v ? null : m.v)}
              className={`flex-1 py-2.5 rounded-2xl border text-center transition-all ${
                mood === m.v ? 'border-primary bg-primary-container/30 ring-2 ring-primary/20' : 'border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low'
              }`}>
              <div className="text-lg">{m.emoji}</div>
              <div className="text-[10px] text-on-surface-variant font-label mt-0.5">{m.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-label font-medium text-on-surface mb-2">
          What was present? <span className="text-on-surface-variant font-normal">(optional tags)</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {[...JOURNAL_TAGS, ...(triggerType === 'relapse' ? ['relapse' as const] : [])].map((tag) => (
            <button key={tag} onClick={() => setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])}
              className={`px-3 py-1.5 rounded-full text-xs font-label font-medium transition-all ${
                selectedTags.includes(tag) ? 'bg-tertiary-container text-on-tertiary-container border border-tertiary-container' : 'bg-surface-container text-on-surface-variant border border-transparent hover:bg-surface-container-low'
              }`}>
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="flex gap-3 pt-4 border-t border-outline-variant">
        <button onClick={() => { if (!hasContent || confirm('Discard?')) { resetForm(); setView(isEdit ? 'detail' : 'list'); } }}
          className="px-4 py-2.5 text-sm font-label rounded-2xl border border-outline-variant text-on-surface-variant hover:bg-surface-container-low">Cancel</button>
        <button onClick={isEdit ? handleUpdate : handleSave} disabled={!hasContent || saving}
          className={`flex-1 px-6 py-2.5 text-sm font-label font-medium rounded-2xl transition-all ${
            saved ? 'bg-primary text-on-primary' : hasContent ? 'bg-primary text-on-primary hover:opacity-90' : 'bg-surface-container text-on-surface-variant cursor-not-allowed'
          }`}>
          {saved ? '\u2713 Saved \u00B7 +10 pts' : saving ? 'Saving\u2026' : isEdit ? 'Update Entry' : 'Save Entry'}
        </button>
      </div>
    </div>
  );

  // -- Render --
  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-2xl font-headline font-bold text-on-surface">Stringer Journal</h1>
            <p className="text-sm text-on-surface-variant font-body mt-1">Drawing wisdom from the struggle</p>
          </div>
          <div className="flex gap-2 shrink-0">
            {entries.length > 0 && (
              <div className="relative">
                <button onClick={() => setShowExport(!showExport)}
                  className="px-3 py-2 text-sm font-label rounded-2xl border border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low text-on-surface-variant">{'\u2193'} Export</button>
                {showExport && (
                  <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest rounded-2xl shadow-lg border border-outline-variant z-20 overflow-hidden">
                    <a href="/api/journal?export=word" className="block px-4 py-3 text-sm hover:bg-surface-container-low text-on-surface font-body" onClick={() => setShowExport(false)}>
                      <span className="font-label font-medium">{'\uD83D\uDCC4'} Word Document</span>
                      <span className="block text-xs text-on-surface-variant mt-0.5">Download .doc file</span>
                    </a>
                    <a href="/api/journal?export=notes" className="block px-4 py-3 text-sm hover:bg-surface-container-low text-on-surface font-body border-t border-outline-variant" onClick={() => setShowExport(false)}>
                      <span className="font-label font-medium">{'\uD83D\uDCDD'} Apple Notes</span>
                      <span className="block text-xs text-on-surface-variant mt-0.5">Download .txt &mdash; paste into Notes</span>
                    </a>
                  </div>
                )}
              </div>
            )}
            {view === 'list' && (
              <button onClick={() => { resetForm(); setView('write'); }}
                className="px-4 py-2 text-sm font-label font-medium rounded-2xl bg-primary text-on-primary hover:opacity-90">+ New Entry</button>
            )}
          </div>
        </div>
        <div className="p-4 rounded-3xl bg-gradient-to-r from-secondary-container/40 to-tertiary-container/40 border border-outline-variant">
          <p className="text-sm text-secondary italic leading-relaxed font-body">&ldquo;{quote.text}&rdquo;</p>
          <p className="text-xs text-on-surface-variant font-label mt-1">&mdash; {quote.author}, {quote.ref}</p>
        </div>
      </div>

      {/* Views */}
      {view === 'write' && renderForm(false)}
      {view === 'edit' && renderForm(true)}

      {view === 'detail' && selected && (
        <div className="space-y-4 animate-fade-in">
          <button onClick={() => { setSelected(null); setView('list'); }} className="text-sm text-on-surface-variant hover:text-on-surface font-label">{'\u2190'} Back</button>
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-headline font-bold text-on-surface">
                  {new Date(selected.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-on-surface-variant font-label">{new Date(selected.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
                  {selected.trigger_type !== 'manual' && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-label font-medium ${
                      selected.trigger_type === 'relapse' ? 'bg-error/10 text-error' : 'bg-secondary-container text-secondary'
                    }`}>{selected.trigger_type}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selected.mood && <span className="text-2xl">{MOODS.find((m) => m.v === selected.mood)?.emoji}</span>}
                <button onClick={() => startEdit(selected)} className="text-xs text-primary hover:opacity-80 font-label px-2 py-1 rounded-xl border border-outline-variant">Edit</button>
                <button onClick={() => { if (confirm('Delete this entry?')) handleDelete(selected.id); }} className="text-xs text-error hover:opacity-80 font-label px-2 py-1">Delete</button>
              </div>
            </div>
            {selected.prompt_shown && (
              <div className="p-3 rounded-2xl bg-tertiary-container/30 border border-tertiary-container mb-4">
                <p className="text-xs text-tertiary font-label font-medium mb-0.5">Prompt</p>
                <p className="text-sm text-on-tertiary-container italic font-body">{selected.prompt_shown}</p>
              </div>
            )}
            {selected.freewrite && <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap mb-4 font-body">{selected.freewrite}</p>}
            {STRINGER_PROMPTS.map((p, i) => {
              if (!selected[p.id]) return null;
              const colors = PROMPT_COLORS[i];
              return (
                <div key={p.id} className={`mb-4 p-4 rounded-2xl ${colors.bg} border ${colors.border}`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span>{['\uD83C\uDF0A', '\uD83D\uDC9B', '\uD83E\uDDED'][i]}</span>
                    <h3 className={`text-sm font-label font-semibold ${colors.accent}`}>{p.label}</h3>
                  </div>
                  <p className="text-xs text-on-surface-variant italic mb-2 font-body">{p.question}</p>
                  <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap font-body">{selected[p.id]}</p>
                </div>
              );
            })}
            {selected.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-3 mt-3 border-t border-outline-variant">
                {selected.tags.map((tag: string) => (
                  <span key={tag} className="px-2.5 py-1 rounded-full text-xs font-label bg-tertiary-container text-on-tertiary-container">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {view === 'list' && (
        <div className="space-y-2 animate-fade-in">
          {loading ? (
            <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">{'\uD83D\uDCD3'}</div>
              <h3 className="text-lg font-headline font-bold text-on-surface mb-2">Your journal is empty</h3>
              <p className="text-sm text-on-surface-variant font-body max-w-sm mx-auto mb-5">
                Stringer teaches that our struggles aren&apos;t random &mdash; they&apos;re a roadmap. Start tracing the tributaries.
              </p>
              <button onClick={() => { resetForm(); setView('write'); }}
                className="px-5 py-2.5 text-sm font-label font-medium rounded-2xl bg-primary text-on-primary hover:opacity-90">Write Your First Entry</button>
            </div>
          ) : (
            <>
              {/* Search + filter */}
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search entries\u2026"
                className="w-full px-4 py-2.5 rounded-2xl border border-outline-variant bg-surface-container-lowest text-on-surface text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-on-surface-variant/50" />
              {allTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 py-1">
                  {filterTag && <button onClick={() => setFilterTag(null)} className="text-[10px] px-2.5 py-1 rounded-full font-label border border-error/30 bg-error/5 text-error">{`Clear \u00D7`}</button>}
                  {allTags.slice(0, 10).map(([tag, count]) => (
                    <button key={tag} onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                      className={`text-[10px] px-2.5 py-1 rounded-full font-label border ${filterTag === tag ? 'border-primary/40 bg-primary-container/30 text-primary' : 'border-outline-variant text-on-surface-variant'}`}>
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
                    className="w-full text-left p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant hover:border-primary/30 hover:shadow-sm transition-all">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-label font-medium text-on-surface">
                        {new Date(entry.created_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-xs text-on-surface-variant font-label">{timeAgo(entry.created_at)}</span>
                      {entry.mood && <span className="text-sm">{MOODS.find((m) => m.v === entry.mood)?.emoji}</span>}
                      {entry.trigger_type === 'relapse' && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-label bg-error/10 text-error">relapse</span>}
                      {entry.trigger_type === 'reminder' && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-label bg-secondary-container text-secondary">reminder</span>}
                    </div>
                    <p className="text-sm text-on-surface-variant font-body line-clamp-2 leading-relaxed">{preview.slice(0, 130)}{preview.length > 130 ? '\u2026' : ''}</p>
                    {filled.length > 0 && (
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {filled.map((p, i) => (
                          <span key={p.id} className={`text-[10px] px-2 py-0.5 rounded-full font-label font-medium ${PROMPT_COLORS[i].accent} ${PROMPT_COLORS[i].bg}`}>
                            {['\uD83C\uDF0A', '\uD83D\uDC9B', '\uD83E\uDDED'][i]} {p.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
              {filtered.length === 0 && <p className="text-center text-sm text-on-surface-variant font-body py-8">No entries match your search</p>}
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
