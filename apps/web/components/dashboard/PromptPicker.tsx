'use client';
// ============================================================
// PromptPicker.tsx — Journal prompt suggestion widget
//
// "Need a prompt?" link that expands into a category-filtered
// prompt picker showing 3 random therapeutic prompts at a time.
// ============================================================

import { useState, useCallback, useMemo } from 'react';
import { THERAPEUTIC_PROMPTS } from '@be-candid/shared';

type Category = 'all' | 'reflection' | 'letter' | 'imagination' | 'body' | 'relationship';

interface PromptPickerProps {
  onSelectPrompt: (prompt: string) => void;
}

const CATEGORY_CONFIG: Array<{ value: Category; label: string; icon: string }> = [
  { value: 'all', label: 'All', icon: 'auto_awesome' },
  { value: 'reflection', label: 'Reflection', icon: 'psychology' },
  { value: 'letter', label: 'Letter', icon: 'mail' },
  { value: 'imagination', label: 'Imagination', icon: 'lightbulb' },
  { value: 'body', label: 'Body', icon: 'accessibility_new' },
  { value: 'relationship', label: 'Relationship', icon: 'favorite' },
];

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default function PromptPicker({ onSelectPrompt }: PromptPickerProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<Category>('all');
  const [shuffleKey, setShuffleKey] = useState(0);

  const filtered = useMemo(() => {
    const pool =
      category === 'all'
        ? THERAPEUTIC_PROMPTS
        : THERAPEUTIC_PROMPTS.filter((p) => p.category === category);
    return pickRandom(pool, 3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, shuffleKey]);

  const handleShuffle = useCallback(() => {
    setShuffleKey((k) => k + 1);
  }, []);

  const handleUse = useCallback(
    (text: string) => {
      onSelectPrompt(text);
      setOpen(false);
    },
    [onSelectPrompt],
  );

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs text-primary/70 hover:text-primary font-label cursor-pointer transition-colors duration-200"
      >
        <span className="material-symbols-outlined text-sm">auto_awesome</span>
        Need a prompt?
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 space-y-3 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-wider">
          Journal prompts
        </p>
        <button
          onClick={() => setOpen(false)}
          className="w-6 h-6 rounded-full flex items-center justify-center text-on-surface-variant/50 hover:text-on-surface-variant hover:bg-surface-container cursor-pointer transition-all duration-200"
          aria-label="Close prompt picker"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-1.5">
        {CATEGORY_CONFIG.map((cat) => (
          <button
            key={cat.value}
            onClick={() => {
              setCategory(cat.value);
              setShuffleKey((k) => k + 1);
            }}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-label font-medium cursor-pointer transition-all duration-200 ${
              category === cat.value
                ? 'bg-primary-container text-primary border border-primary-container'
                : 'bg-surface-container text-on-surface-variant border border-transparent hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-xs">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Prompts */}
      <div className="space-y-2">
        {filtered.map((prompt, i) => (
          <div
            key={`${shuffleKey}-${i}`}
            className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low/50 hover:bg-surface-container-low transition-colors duration-200"
          >
            <p className="flex-1 text-sm text-on-surface font-body leading-relaxed">
              {prompt.text}
            </p>
            <button
              onClick={() => handleUse(prompt.text)}
              className="shrink-0 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-label font-medium hover:bg-primary/20 cursor-pointer transition-colors duration-200"
            >
              Use this
            </button>
          </div>
        ))}
      </div>

      {/* Shuffle */}
      <button
        onClick={handleShuffle}
        className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-on-surface font-label cursor-pointer transition-colors duration-200"
      >
        <span className="material-symbols-outlined text-sm">refresh</span>
        Shuffle
      </button>
    </div>
  );
}
