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
import VoiceJournal from '@/components/dashboard/VoiceJournal';
import PromptPicker from '@/components/dashboard/PromptPicker';

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

const MOOD_BORDERS: Record<number, string> = {
  1: 'border-l-4 border-l-error',
  2: 'border-l-4 border-l-orange-400',
  3: 'border-l-4 border-l-outline-variant',
  4: 'border-l-4 border-l-primary/60',
  5: 'border-l-4 border-l-emerald-500',
};
const MOOD_BORDER_DEFAULT = 'border-l-4 border-l-outline-variant/30';

const TAG_COLORS: Record<string, string> = {
  loneliness: 'bg-blue-100 text-blue-700',
  boredom: 'bg-amber-100 text-amber-700',
  stress: 'bg-red-100 text-red-700',
  anxiety: 'bg-violet-100 text-violet-700',
  shame: 'bg-rose-100 text-rose-700',
  anger: 'bg-orange-100 text-orange-700',
  sadness: 'bg-indigo-100 text-indigo-700',
  relapse: 'bg-red-50 text-red-600',
  gratitude: 'bg-emerald-100 text-emerald-700',
  progress: 'bg-teal-100 text-teal-700',
  connection: 'bg-sky-100 text-sky-700',
  clarity: 'bg-cyan-100 text-cyan-700',
};
const TAG_COLOR_DEFAULT = 'bg-tertiary-container text-on-tertiary-container';

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

  // Future letter state (surfaced during relapse)
  const [relapseLetter, setRelapseLetter] = useState<{
    id: string; letter: string; sealed_at: string; written_mood: number | null;
  } | null>(null);
  const [letterDismissed, setLetterDismissed] = useState(false);

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

  // Fetch an undelivered future letter when in relapse mode
  useEffect(() => {
    if (triggerType !== 'relapse') return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/letters?undelivered=true&limit=1');
        if (!res.ok || cancelled) return;
        const data = await res.json();
        const letters = data.letters || [];
        if (letters.length > 0 && !cancelled) {
          setRelapseLetter(letters[0]);
          // Mark as delivered
          fetch('/api/letters', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: letters[0].id, delivery_trigger: 'relapse_journal' }),
          }).catch(() => {});
        }
      } catch (e) { console.error(e); }
    })();
    return () => { cancelled = true; };
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

  // Expand/collapse state for journal entry cards
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const toggleExpand = (id: string) => {
    setExpandedEntries(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // -- Shared form renderer --
  const renderForm = (isEdit: boolean) => (
    <div className="space-y-5 animate-fade-in">
      <button onClick={() => { if (!hasContent || confirm(isEdit ? 'Discard changes?' : 'Discard this entry?')) { resetForm(); setView(isEdit ? 'detail' : 'list'); } }}
        className="text-sm text-on-surface-variant hover:text-on-surface font-label cursor-pointer transition-colors duration-200">{'\u2190'} Back</button>

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
            The behavior is the signal, not the problem. Be curious with what comes up.
          </p>
        </div>
      )}

      {/* Future letter from past self (surfaced during relapse) */}
      {!isEdit && relapseLetter && !letterDismissed && (
        <div className="relative rounded-3xl overflow-hidden animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-secondary-container/20 to-tertiary-container/15 pointer-events-none" />
          <div className="relative p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary text-lg">mark_email_read</span>
              <p className="text-xs font-label font-medium text-primary uppercase tracking-wider">
                A letter from your past self
              </p>
            </div>
            <p className="text-xs text-on-surface-variant font-label mb-3">
              Written on {new Date(relapseLetter.sealed_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              {relapseLetter.written_mood && (
                <span>
                  {' '}&middot; when you were feeling{' '}
                  {({ 1: 'heavy', 2: 'low', 3: 'neutral', 4: 'lighter', 5: 'strong' } as Record<number, string>)[relapseLetter.written_mood]}
                </span>
              )}
            </p>
            <div className="pl-4 border-l-2 border-primary/30 mb-3">
              <p className="text-sm text-on-surface font-body leading-relaxed whitespace-pre-wrap italic">
                {relapseLetter.letter}
              </p>
            </div>
            <p className="text-xs text-on-surface-variant font-label text-right">
              &mdash; You, {new Date(relapseLetter.sealed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
            <button
              onClick={() => setLetterDismissed(true)}
              className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant/50 hover:text-on-surface-variant hover:bg-surface-container cursor-pointer transition-all duration-200"
              aria-label="Dismiss letter"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
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
        <div className="flex items-center gap-2 mb-2">
          <label className="text-sm font-label font-medium text-on-surface">Open reflection</label>
          <VoiceJournal
            fieldName="freewrite"
            onTranscript={(text) => setFreewrite(prev => prev ? prev + ' ' + text : text)}
          />
        </div>
        <PromptPicker onSelectPrompt={(text) => setFreewrite(prev => prev ? prev + '\n\n' + text : text)} />
        <div className="mt-2" />
        <textarea value={freewrite} onChange={(e) => setFreewrite(e.target.value)}
          placeholder="Write freely. What happened? What are you feeling right now?"
          className="w-full h-28 px-4 py-3 rounded-3xl bg-secondary-container/30 ring-1 ring-outline-variant/10 text-on-surface text-sm font-body leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-on-surface-variant/50" />
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
                  className={`w-full px-4 py-3 flex items-center justify-between text-left cursor-pointer transition-colors duration-200 ${isOpen || hasAnswer ? colors.bg : 'bg-surface-container-lowest hover:bg-surface-container-low'}`}>
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
                  <span className="text-on-surface-variant text-lg">{isOpen ? '\u25BE' : '\u25B8'}</span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <p className="text-sm text-on-surface-variant italic font-body">{prompt.question}</p>
                      <VoiceJournal
                        fieldName={prompt.id}
                        onTranscript={(text) => setAnswers((prev) => ({ ...prev, [prompt.id]: prev[prompt.id as keyof typeof prev] ? prev[prompt.id as keyof typeof prev] + ' ' + text : text }))}
                      />
                    </div>
                    <p className="text-xs text-on-surface-variant/70 mb-3 font-body">{prompt.hint}</p>
                    <textarea value={answers[prompt.id as keyof typeof answers]}
                      onChange={(e) => setAnswers((prev) => ({ ...prev, [prompt.id]: e.target.value }))}
                      placeholder="Take your time..."
                      className="w-full h-24 px-3 py-2.5 rounded-2xl ring-1 ring-outline-variant/10 bg-surface-container-lowest text-on-surface text-sm font-body leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-on-surface-variant/50" />
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
              className={`flex-1 py-2.5 rounded-2xl border text-center cursor-pointer transition-all duration-200 ${
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
              className={`px-3 py-1.5 rounded-full text-xs font-label font-medium cursor-pointer transition-all duration-200 ${
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
          className="px-4 py-2.5 min-h-[44px] text-sm font-label rounded-2xl ring-1 ring-outline-variant/10 text-on-surface-variant hover:bg-surface-container-low cursor-pointer transition-all duration-200">Cancel</button>
        <button onClick={isEdit ? handleUpdate : handleSave} disabled={!hasContent || saving}
          className={`flex-1 px-6 py-2.5 min-h-[44px] text-sm font-label font-medium rounded-2xl transition-all duration-200 ${
            saved ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : hasContent ? 'bg-primary text-on-primary hover:opacity-90 cursor-pointer shadow-lg shadow-primary/20 hover:shadow-xl' : 'bg-surface-container text-on-surface-variant cursor-not-allowed'
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
            <h1 className="text-2xl font-headline font-bold text-on-surface">Candid Journal</h1>
            <p className="text-sm text-on-surface-variant font-body mt-1">Understanding yourself to align your life</p>
          </div>
          <div className="flex gap-2 shrink-0">
            {entries.length > 0 && (
              <div className="relative">
                <button onClick={() => setShowExport(!showExport)}
                  className="px-3 py-2 min-h-[44px] text-sm font-label rounded-2xl ring-1 ring-outline-variant/10 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface-variant cursor-pointer transition-all duration-200">{'\u2193'} Export</button>
                {showExport && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowExport(false)} />
                    <div className="absolute right-0 mt-2 w-64 bg-surface-container-lowest rounded-2xl shadow-lg ring-1 ring-outline-variant/10 z-20 overflow-hidden">
                      <div className="px-4 py-2 border-b border-outline-variant/10">
                        <p className="text-[10px] text-on-surface-variant font-label uppercase tracking-widest">Export to</p>
                      </div>
                      <a href="/api/journal?export=markdown" className="block px-4 py-3 text-sm hover:bg-surface-container-low text-on-surface font-body cursor-pointer transition-colors duration-200" onClick={() => setShowExport(false)}>
                        <span className="font-label font-medium">Obsidian / Notion</span>
                        <span className="block text-xs text-on-surface-variant mt-0.5">Markdown .md &mdash; works with any Markdown app</span>
                      </a>
                      <a href="/api/journal?export=evernote" className="block px-4 py-3 text-sm hover:bg-surface-container-low text-on-surface font-body border-t border-outline-variant/20 cursor-pointer transition-colors duration-200" onClick={() => setShowExport(false)}>
                        <span className="font-label font-medium">Evernote</span>
                        <span className="block text-xs text-on-surface-variant mt-0.5">ENEX format &mdash; File &rarr; Import in Evernote</span>
                      </a>
                      <a href="/api/journal?export=onenote" className="block px-4 py-3 text-sm hover:bg-surface-container-low text-on-surface font-body border-t border-outline-variant/20 cursor-pointer transition-colors duration-200" onClick={() => setShowExport(false)}>
                        <span className="font-label font-medium">Microsoft OneNote</span>
                        <span className="block text-xs text-on-surface-variant mt-0.5">HTML format &mdash; Insert &rarr; File Printout</span>
                      </a>
                      <a href="/api/journal?export=notes" className="block px-4 py-3 text-sm hover:bg-surface-container-low text-on-surface font-body border-t border-outline-variant/20 cursor-pointer transition-colors duration-200" onClick={() => setShowExport(false)}>
                        <span className="font-label font-medium">Apple Notes</span>
                        <span className="block text-xs text-on-surface-variant mt-0.5">Plain text .txt &mdash; paste into Notes</span>
                      </a>
                      <a href="/api/journal?export=word" className="block px-4 py-3 text-sm hover:bg-surface-container-low text-on-surface font-body border-t border-outline-variant/20 cursor-pointer transition-colors duration-200" onClick={() => setShowExport(false)}>
                        <span className="font-label font-medium">Word Document</span>
                        <span className="block text-xs text-on-surface-variant mt-0.5">Download .doc file</span>
                      </a>
                    </div>
                  </>
                )}
              </div>
            )}
            {view === 'list' && (
              <button onClick={() => { resetForm(); setView('write'); }}
                className="px-4 py-2 min-h-[44px] text-sm font-label font-medium rounded-2xl bg-primary text-on-primary cursor-pointer hover:opacity-90 shadow-lg shadow-primary/20 hover:shadow-xl transition-all duration-200">+ New Entry</button>
            )}
          </div>
        </div>
        <div className="p-4 rounded-3xl bg-gradient-to-r from-secondary-container/40 to-tertiary-container/40 ring-1 ring-outline-variant/10">
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
          <div className="bg-surface-container-lowest rounded-3xl ring-1 ring-outline-variant/10 p-6">
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
                <button onClick={() => startEdit(selected)} className="text-xs text-primary hover:opacity-80 font-label px-2 py-1 rounded-xl ring-1 ring-outline-variant/10 cursor-pointer transition-all duration-200 min-h-[44px] min-w-[44px]">Edit</button>
                <button onClick={() => { if (confirm('Delete this entry?')) handleDelete(selected.id); }} className="text-xs text-error hover:opacity-80 font-label px-2 py-1 cursor-pointer transition-colors duration-200 min-h-[44px]">Delete</button>
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
                Your patterns aren&apos;t random &mdash; they&apos;re a roadmap to alignment. Start tracing the tributaries.
              </p>
              <button onClick={() => { resetForm(); setView('write'); }}
                className="px-5 py-2.5 min-h-[44px] text-sm font-label font-medium rounded-2xl bg-primary text-on-primary cursor-pointer hover:opacity-90 shadow-lg shadow-primary/20 hover:shadow-xl transition-all duration-200">Write Your First Entry</button>
            </div>
          ) : (
            <>
              {/* Search + filter */}
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search entries\u2026"
                className="w-full px-4 py-2.5 rounded-2xl ring-1 ring-outline-variant/10 bg-surface-container-lowest text-on-surface text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-on-surface-variant/50" />
              {allTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 py-1">
                  {filterTag && <button onClick={() => setFilterTag(null)} className="text-[10px] px-2.5 py-1 rounded-full font-label border border-error/30 bg-error/5 text-error cursor-pointer transition-all duration-200 hover:bg-error/10">{`Clear \u00D7`}</button>}
                  {allTags.slice(0, 10).map(([tag, count]) => (
                    <button key={tag} onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                      className={`text-[10px] px-2.5 py-1 rounded-full font-label border cursor-pointer transition-all duration-200 ${filterTag === tag ? 'border-primary/40 bg-primary-container/30 text-primary' : 'border-outline-variant text-on-surface-variant hover:border-primary/30'}`}>
                      {tag} ({count})
                    </button>
                  ))}
                </div>
              )}
              {filtered.map((entry, entryIdx) => {
                const filled = STRINGER_PROMPTS.filter((p) => entry[p.id]);
                const preview = entry.freewrite || entry.tributaries || entry.longing || entry.roadmap || '';
                const isLong = preview.length > 180;
                const isExpanded = expandedEntries.has(entry.id);
                const moodBorder = entry.mood ? (MOOD_BORDERS[entry.mood as number] || MOOD_BORDER_DEFAULT) : MOOD_BORDER_DEFAULT;
                return (
                  <div key={entry.id}
                    className={`w-full text-left p-4 rounded-2xl bg-surface-container-lowest ring-1 ring-outline-variant/10 hover:ring-primary/20 hover:shadow-lg hover:shadow-on-surface/[0.04] transition-all duration-200 ${moodBorder}`}
                    style={{ animation: `fade-up 0.3s ease-out ${entryIdx * 60}ms both` }}>
                    <button onClick={() => { setSelected(entry); setView('detail'); }}
                      className="w-full text-left cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-label font-medium text-on-surface">
                          {new Date(entry.created_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-xs text-on-surface-variant font-label">{timeAgo(entry.created_at)}</span>
                        {entry.mood && <span className="text-sm">{MOODS.find((m) => m.v === entry.mood)?.emoji}</span>}
                        {/* Completion indicator dots */}
                        <span className="flex items-center gap-0.5 ml-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${entry.tributaries ? 'bg-primary' : 'bg-outline-variant/30'}`} title="Tributaries" />
                          <span className={`w-1.5 h-1.5 rounded-full ${entry.longing ? 'bg-primary' : 'bg-outline-variant/30'}`} title="Longing" />
                          <span className={`w-1.5 h-1.5 rounded-full ${entry.roadmap ? 'bg-primary' : 'bg-outline-variant/30'}`} title="Roadmap" />
                        </span>
                        {entry.trigger_type === 'relapse' && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-label bg-error/10 text-error">relapse</span>}
                        {entry.trigger_type === 'reminder' && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-label bg-secondary-container text-secondary">reminder</span>}
                      </div>
                      <p className={`text-sm text-on-surface-variant font-body leading-relaxed ${!isExpanded && isLong ? 'line-clamp-3' : ''}`}>
                        {preview}
                      </p>
                    </button>
                    {isLong && (
                      <button onClick={() => toggleExpand(entry.id)}
                        className="text-xs text-primary font-label font-medium mt-1 cursor-pointer hover:opacity-80 transition-opacity">
                        {isExpanded ? 'Show less' : 'Read more'}
                      </button>
                    )}
                    {filled.length > 0 && (
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {filled.map((p, i) => (
                          <span key={p.id} className={`text-[10px] px-2 py-0.5 rounded-full font-label font-medium ${PROMPT_COLORS[i].accent} ${PROMPT_COLORS[i].bg}`}>
                            {['\uD83C\uDF0A', '\uD83D\uDC9B', '\uD83E\uDDED'][i]} {p.label}
                          </span>
                        ))}
                      </div>
                    )}
                    {(entry.tags?.length ?? 0) > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(entry.tags as string[]).map((tag: string) => (
                          <span key={tag} className={`px-2 py-0.5 rounded-full text-[10px] font-label font-medium ${TAG_COLORS[tag] || TAG_COLOR_DEFAULT}`}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
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
