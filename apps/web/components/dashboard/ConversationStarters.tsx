'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';

interface Starter {
  text: string;
  theme: string;
}

interface ConversationStartersProps {
  monitoredUserId: string;
}

export default function ConversationStarters({ monitoredUserId }: ConversationStartersProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const { data: apiData, error: fetchError, isLoading: loading } = useSWR<any>(
    `/api/partner/conversation-starters?user_id=${monitoredUserId}`,
  );

  const starters: Starter[] = apiData?.starters ?? [];
  const empty = apiData?.empty ?? false;
  const fallback: string | null = apiData?.fallback ?? null;
  const error = !!fetchError || (!loading && !apiData?.starters && !apiData?.empty);

  const copyToClipboard = useCallback(async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2500);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2500);
    }
  }, []);

  // Theme pill colors
  const themeColors: Record<string, string> = {
    loneliness: 'bg-blue-100 text-blue-700',
    conflict: 'bg-red-100 text-red-700',
    growth: 'bg-emerald-100 text-emerald-700',
    stress: 'bg-amber-100 text-amber-700',
    hope: 'bg-teal-100 text-teal-700',
    grief: 'bg-purple-100 text-purple-700',
    shame: 'bg-rose-100 text-rose-700',
    connection: 'bg-sky-100 text-sky-700',
    exhaustion: 'bg-orange-100 text-orange-700',
    fear: 'bg-violet-100 text-violet-700',
    healing: 'bg-lime-100 text-lime-700',
    progress: 'bg-cyan-100 text-cyan-700',
    vulnerability: 'bg-pink-100 text-pink-700',
    identity: 'bg-indigo-100 text-indigo-700',
  };

  function getThemeColor(theme: string) {
    const lower = theme.toLowerCase();
    return themeColors[lower] || 'bg-surface-container-low text-on-surface-variant';
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-amber-500 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
          <h2 className="font-headline text-lg font-bold text-on-surface">Before You Check In</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl border border-outline-variant/20 p-5 bg-gradient-to-br from-amber-50/50 to-primary/5 animate-pulse">
              <div className="h-4 bg-surface-container-low/60 rounded-lg w-full mb-3" />
              <div className="h-4 bg-surface-container-low/40 rounded-lg w-3/4 mb-4" />
              <div className="flex items-center justify-between">
                <div className="h-5 bg-surface-container-low/40 rounded-full w-16" />
                <div className="h-8 bg-surface-container-low/30 rounded-full w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (empty || error) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-amber-500 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
          <h2 className="font-headline text-lg font-bold text-on-surface">Before You Check In</h2>
        </div>
        <div className="rounded-2xl border border-outline-variant/20 p-6 bg-gradient-to-br from-amber-50/30 to-primary/5 text-center">
          <span className="material-symbols-outlined text-on-surface-variant/40 text-4xl mb-3 block">edit_note</span>
          <p className="text-sm font-body text-on-surface-variant leading-relaxed max-w-sm mx-auto">
            {fallback || "Your partner hasn't journaled recently. Try asking: 'How are you really doing?'"}
          </p>
        </div>
      </div>
    );
  }

  // Starters
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="material-symbols-outlined text-amber-500 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
        <h2 className="font-headline text-lg font-bold text-on-surface">Before You Check In</h2>
      </div>
      <p className="text-xs font-body text-on-surface-variant -mt-2 mb-1">
        Conversation starters based on recent journal themes
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {starters.map((starter, idx) => (
          <div
            key={idx}
            className="group rounded-2xl border border-outline-variant/20 p-5 bg-gradient-to-br from-amber-50/50 to-primary/5 hover:shadow-lg hover:border-primary/20 transition-all duration-300"
          >
            <p className="font-headline italic text-sm text-on-surface leading-relaxed mb-4 min-h-[3rem]">
              &ldquo;{starter.text}&rdquo;
            </p>
            <div className="flex items-center justify-between gap-2">
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-label font-medium uppercase tracking-wide ${getThemeColor(starter.theme)}`}>
                {starter.theme}
              </span>
              <button
                onClick={() => copyToClipboard(starter.text, idx)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-label font-medium text-primary bg-primary/8 hover:bg-primary/15 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <span className="material-symbols-outlined text-sm">
                  {copiedIdx === idx ? 'check' : 'content_copy'}
                </span>
                {copiedIdx === idx ? 'Copied' : 'Use this'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Toast */}
      {copiedIdx !== null && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-inverse-surface text-inverse-on-surface rounded-full shadow-xl font-label text-sm font-medium animate-fade-up flex items-center gap-2">
          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          Copied to clipboard
        </div>
      )}
    </div>
  );
}
