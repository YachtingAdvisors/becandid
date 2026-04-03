'use client';

import { useState, useEffect, useCallback } from 'react';

interface ChallengeData {
  id: string;
  challenge_text: string;
  challenge_type: string;
  completed: boolean;
  completed_at: string | null;
  streak: number;
}

const TYPE_META: Record<string, { icon: string; color: string; bg: string; label: string }> = {
  journal:      { icon: 'edit_note',          color: 'text-amber-600',   bg: 'bg-amber-50 ring-amber-200/40',   label: 'Journal' },
  connection:   { icon: 'people',             color: 'text-pink-600',    bg: 'bg-pink-50 ring-pink-200/40',     label: 'Connection' },
  mindfulness:  { icon: 'self_improvement',   color: 'text-violet-600',  bg: 'bg-violet-50 ring-violet-200/40', label: 'Mindfulness' },
  physical:     { icon: 'directions_run',     color: 'text-emerald-600', bg: 'bg-emerald-50 ring-emerald-200/40', label: 'Physical' },
  gratitude:    { icon: 'favorite',           color: 'text-rose-600',    bg: 'bg-rose-50 ring-rose-200/40',     label: 'Gratitude' },
};

export default function DailyChallenge() {
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  const fetchChallenge = useCallback(async () => {
    try {
      const res = await fetch('/api/challenges');
      if (res.ok) {
        const data = await res.json();
        setChallenge(data);
        if (data.completed) setJustCompleted(true);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchChallenge(); }, [fetchChallenge]);

  const handleComplete = async () => {
    if (!challenge || challenge.completed || completing) return;
    setCompleting(true);
    try {
      const res = await fetch('/api/challenges', { method: 'PATCH' });
      if (res.ok) {
        const data = await res.json();
        setChallenge(data);
        setJustCompleted(true);
      }
    } catch {
      // silently fail
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return <div className="skeleton-shimmer h-36 rounded-2xl" />;
  }

  if (!challenge) return null;

  const meta = TYPE_META[challenge.challenge_type] ?? TYPE_META.journal;
  const isCompleted = challenge.completed || justCompleted;

  return (
    <div className={`bg-surface-container-lowest rounded-3xl border transition-all duration-500 overflow-hidden ${isCompleted ? 'border-emerald-300/50 bg-gradient-to-br from-emerald-50/30 to-surface-container-lowest' : 'border-outline-variant'}`}>
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ring-1 ${meta.bg}`}>
              <span className={`material-symbols-outlined text-lg ${meta.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                {meta.icon}
              </span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-sm text-on-surface">Daily Challenge</h3>
              <span className={`text-[10px] font-label font-semibold uppercase tracking-wider ${meta.color}`}>{meta.label}</span>
            </div>
          </div>
          {challenge.streak > 0 && (
            <div className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-1 rounded-full">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
              <span className="text-[10px] font-label font-bold">{challenge.streak}-day streak</span>
            </div>
          )}
        </div>

        {/* Challenge text */}
        <p className={`font-body text-sm leading-relaxed mb-4 ${isCompleted ? 'text-on-surface-variant' : 'text-on-surface'}`}>
          &ldquo;{challenge.challenge_text}&rdquo;
        </p>

        {/* Action */}
        {isCompleted ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-emerald-600 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <div>
              <span className="text-sm font-label font-bold text-emerald-700">Done!</span>
              <span className="text-[10px] text-on-surface-variant ml-1.5 font-label">+5 trust points</span>
            </div>
          </div>
        ) : (
          <button
            onClick={handleComplete}
            disabled={completing}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-primary text-on-primary rounded-2xl font-label font-bold text-sm uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 cursor-pointer"
          >
            {completing ? (
              <>
                <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                Completing...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">check</span>
                Mark Complete
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
