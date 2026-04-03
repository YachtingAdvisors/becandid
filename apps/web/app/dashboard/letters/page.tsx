'use client';

import { useState, useEffect, useCallback } from 'react';

// ── Types ──────────────────────────────────────────────────

interface Letter {
  id: string;
  letter?: string;
  written_mood: number | null;
  sealed_at: string;
  delivered_at: string | null;
  delivery_trigger: string | null;
  created_at: string;
}

// ── Constants ──────────────────────────────────────────────

const MOODS = [
  { v: 1, label: 'Heavy', emoji: '\uD83D\uDE14' },
  { v: 2, label: 'Low', emoji: '\uD83D\uDE15' },
  { v: 3, label: 'Neutral', emoji: '\uD83D\uDE10' },
  { v: 4, label: 'Lighter', emoji: '\uD83D\uDE42' },
  { v: 5, label: 'Strong', emoji: '\uD83D\uDCAA' },
];

const MOOD_LABELS: Record<number, string> = {
  1: 'Heavy', 2: 'Low', 3: 'Neutral', 4: 'Lighter', 5: 'Strong',
};

const MOOD_EMOJIS: Record<number, string> = {
  1: '\uD83D\uDE14', 2: '\uD83D\uDE15', 3: '\uD83D\uDE10', 4: '\uD83D\uDE42', 5: '\uD83D\uDCAA',
};

const MAX_CHARS = 5000;

// ── Helpers ────────────────────────────────────────────────

function fmtDate(ts: string) {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

function fmtDateShort(ts: string) {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

// ── Page Component ─────────────────────────────────────────

export default function LettersPage() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);

  // Write form state
  const [letterText, setLetterText] = useState('');
  const [mood, setMood] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [sealed, setSealed] = useState(false);
  const [sealAnimating, setSealAnimating] = useState(false);

  // ── Fetch letters ────────────────────────────────────────

  const fetchLetters = useCallback(async () => {
    try {
      const res = await fetch('/api/letters');
      if (res.ok) {
        const data = await res.json();
        setLetters(data.letters || []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchLetters(); }, [fetchLetters]);

  // ── Seal letter ──────────────────────────────────────────

  const handleSeal = async () => {
    if (!letterText.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch('/api/letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          letter: letterText.trim(),
          written_mood: mood,
        }),
      });
      if (res.ok) {
        setSealAnimating(true);
        setTimeout(() => {
          setSealed(true);
          setSealAnimating(false);
        }, 600);
        setTimeout(() => {
          setSealed(false);
          setLetterText('');
          setMood(null);
          fetchLetters();
        }, 4000);
      }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  // ── Partition letters ────────────────────────────────────

  const sealedLetters = letters.filter((l) => !l.delivered_at);
  const deliveredLetters = letters.filter((l) => l.delivered_at);

  // ── Render ───────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-headline font-bold text-on-surface">
          Letter to My Future Self
        </h1>
        <p className="text-sm text-on-surface-variant font-body mt-1">
          Words of strength, sealed until you need them most
        </p>
      </div>

      {/* ── Write Section ─────────────────────────────────── */}
      {sealed ? (
        <div className="mb-10 animate-fade-in">
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-8 text-center">
            <div className="text-5xl mb-4 animate-bounce-once">
              {'\u2709\uFE0F'}
            </div>
            <h2 className="text-lg font-headline font-bold text-on-surface mb-2">
              Your letter is sealed
            </h2>
            <p className="text-sm text-on-surface-variant font-body leading-relaxed max-w-md mx-auto">
              It will find you when you need it most. In a hard moment,
              you will hear from the version of yourself who wrote this.
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-10">
          <div className={`relative rounded-3xl overflow-hidden transition-all duration-600 ${sealAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
            {/* Warm gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-secondary-container/30 to-tertiary-container/20 pointer-events-none" />
            <div className="relative p-6 sm:p-8">
              {/* Prompt */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-primary text-xl">edit_note</span>
                  <h2 className="text-base font-headline font-bold text-on-surface">
                    Write a letter
                  </h2>
                </div>
                <p className="text-sm text-on-surface-variant font-body leading-relaxed italic">
                  Write to the person you will be in your hardest moment.
                  What do they need to hear from you right now?
                </p>
              </div>

              {/* Textarea */}
              <div className="mb-4">
                <textarea
                  value={letterText}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_CHARS) setLetterText(e.target.value);
                  }}
                  placeholder="Dear future me..."
                  rows={8}
                  className="w-full px-5 py-4 rounded-2xl bg-surface-container-lowest/80 backdrop-blur-sm ring-1 ring-outline-variant/20 text-on-surface text-sm font-body leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-on-surface-variant/40"
                />
                <div className="flex justify-end mt-1.5">
                  <span className={`text-xs font-label ${letterText.length > MAX_CHARS * 0.9 ? 'text-error' : 'text-on-surface-variant/50'}`}>
                    {letterText.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Mood selector */}
              <div className="mb-6">
                <label className="block text-sm font-label font-medium text-on-surface mb-2">
                  How are you feeling right now?{' '}
                  <span className="text-on-surface-variant font-normal">(optional)</span>
                </label>
                <div className="flex gap-2">
                  {MOODS.map((m) => (
                    <button
                      key={m.v}
                      onClick={() => setMood(mood === m.v ? null : m.v)}
                      className={`flex-1 py-2.5 rounded-2xl border text-center cursor-pointer transition-all duration-200 ${
                        mood === m.v
                          ? 'border-primary bg-primary-container/30 ring-2 ring-primary/20'
                          : 'border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low'
                      }`}
                    >
                      <div className="text-lg">{m.emoji}</div>
                      <div className="text-[10px] text-on-surface-variant font-label mt-0.5">{m.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Seal button */}
              <button
                onClick={handleSeal}
                disabled={!letterText.trim() || saving}
                className={`w-full py-3.5 rounded-2xl text-sm font-label font-medium transition-all duration-300 ${
                  letterText.trim()
                    ? 'bg-primary text-on-primary cursor-pointer hover:opacity-90 shadow-lg shadow-primary/20 hover:shadow-xl'
                    : 'bg-surface-container text-on-surface-variant cursor-not-allowed'
                }`}
              >
                {saving ? (
                  'Sealing\u2026'
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-lg">lock</span>
                    Seal This Letter
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Letters Section ───────────────────────────────── */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : letters.length === 0 && !sealed ? (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-3 block">mail</span>
          <p className="text-sm text-on-surface-variant font-body">
            No letters yet. Write one during a moment of strength.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Sealed Letters */}
          {sealedLetters.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-on-surface-variant text-lg">lock</span>
                <h2 className="text-base font-headline font-bold text-on-surface">
                  Sealed Letters
                </h2>
                <span className="text-xs font-label text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                  {sealedLetters.length}
                </span>
              </div>
              <div className="space-y-3">
                {sealedLetters.map((l) => (
                  <div
                    key={l.id}
                    className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 flex items-center gap-4"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-primary-container/30 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary text-xl">mail</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-label font-medium text-on-surface">
                        Sealed on {fmtDate(l.sealed_at)}
                      </p>
                      <p className="text-xs text-on-surface-variant font-body mt-0.5">
                        Waiting to be delivered when you need it
                      </p>
                    </div>
                    {l.written_mood && (
                      <div className="shrink-0 text-center">
                        <div className="text-lg">{MOOD_EMOJIS[l.written_mood]}</div>
                        <div className="text-[10px] text-on-surface-variant font-label">
                          {MOOD_LABELS[l.written_mood]}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delivered Letters */}
          {deliveredLetters.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-on-surface-variant text-lg">mark_email_read</span>
                <h2 className="text-base font-headline font-bold text-on-surface">
                  Delivered Letters
                </h2>
                <span className="text-xs font-label text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                  {deliveredLetters.length}
                </span>
              </div>
              <div className="space-y-4">
                {deliveredLetters.map((l) => (
                  <div
                    key={l.id}
                    className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-xl bg-secondary-container/30 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-secondary text-lg">mark_email_read</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-label text-on-surface-variant">
                          Written on {fmtDateShort(l.sealed_at)}
                          {l.written_mood && (
                            <span> &middot; Feeling {MOOD_LABELS[l.written_mood]?.toLowerCase()} {MOOD_EMOJIS[l.written_mood]}</span>
                          )}
                        </p>
                        <p className="text-xs font-label text-on-surface-variant/70 mt-0.5">
                          Delivered {fmtDateShort(l.delivered_at!)}
                          {l.delivery_trigger === 'relapse_journal' && ' \u00B7 during a journal entry'}
                          {l.delivery_trigger === 'manual_open' && ' \u00B7 opened manually'}
                        </p>
                      </div>
                    </div>
                    <div className="pl-1 border-l-2 border-primary/20 ml-1">
                      <p className="text-sm text-on-surface font-body leading-relaxed whitespace-pre-wrap pl-4">
                        {l.letter}
                      </p>
                    </div>
                    <p className="text-xs text-on-surface-variant font-label mt-4 text-right italic">
                      &mdash; You, {fmtDateShort(l.sealed_at)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
