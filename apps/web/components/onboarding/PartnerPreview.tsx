'use client';

import { useState } from 'react';

const PARTNER_SEES = [
  { key: 'flags', icon: 'flag', text: 'That a flag was triggered', detail: 'They see the category (e.g. "Social Media") and severity — not what you were looking at.' },
  { key: 'timing', icon: 'schedule', text: 'When it happened', detail: 'Date and time. No URLs, no screenshots, no browsing history.' },
  { key: 'guide', icon: 'forum', text: 'A custom conversation guide', detail: 'Click here to see a suggested message and question you could ask them based on the circumstances.' },
  { key: 'streak', icon: 'trending_up', text: 'Your focus streak', detail: 'How many days in a row you\'ve been focused. Streaks reset on a flag but start rebuilding immediately.' },
  { key: 'journal_activity', icon: 'edit_note', text: 'That you journaled (not what you wrote)', detail: 'They see "3 journal entries this week" — never the content. Your reflections are private.' },
];

const PARTNER_NEVER_SEES = [
  { icon: 'lock', text: 'URLs or websites visited' },
  { icon: 'lock', text: 'Screenshots or screen recordings' },
  { icon: 'lock', text: 'Your journal entries or reflections' },
  { icon: 'lock', text: 'Your mood or check-in responses' },
  { icon: 'lock', text: 'Content of push notifications you receive' },
];

export default function PartnerPreview({
  onContinue,
  onSolo,
  onBack,
}: {
  onContinue: (visibility?: Record<string, boolean>) => void;
  onSolo: () => void;
  onBack?: () => void;
}) {
  const [tab, setTab] = useState<'sees' | 'never'>('sees');
  const [enabled, setEnabled] = useState<Set<string>>(
    () => new Set(PARTNER_SEES.map(s => s.key))
  );

  const allEnabled = enabled.size === PARTNER_SEES.length;

  const toggleItem = (key: string) => {
    setEnabled(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectAll = () => {
    setEnabled(new Set(PARTNER_SEES.map(s => s.key)));
  };

  const handleContinue = () => {
    const visibility: Record<string, boolean> = {};
    for (const item of PARTNER_SEES) {
      visibility[item.key] = enabled.has(item.key);
    }
    onContinue(visibility);
  };

  return (
    <div className="max-w-md w-full mx-auto">
      <div className="text-center mb-6">
        <p className="text-xs text-cyan-400 font-label font-medium uppercase tracking-widest mb-2">Transparency</p>
        <h1 className="text-2xl font-headline font-semibold text-slate-100 mb-2">
          What your partner will see
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed font-body">
          Awareness is clarity. You should know exactly what your partner can see, because congruence starts with honesty. <span className="text-primary-container font-semibold">You&apos;re inviting them to see your humanity, while keeping your dignity.</span>
        </p>
      </div>

      {/* Tab toggle */}
      <div className="flex bg-surface-container rounded-full p-1 mb-5">
        <button
          onClick={() => setTab('sees')}
          className={`flex-1 py-2 text-sm font-label font-medium rounded-full transition-all cursor-pointer ${
            tab === 'sees' ? 'bg-surface-container-lowest text-on-surface shadow-sm' : 'text-on-surface-variant'
          }`}
        >
          They can see
        </button>
        <button
          onClick={() => setTab('never')}
          className={`flex-1 py-2 text-sm font-label font-medium rounded-full transition-all cursor-pointer ${
            tab === 'never' ? 'bg-surface-container-lowest text-on-surface shadow-sm' : 'text-on-surface-variant'
          }`}
        >
          They never see
        </button>
      </div>

      {/* Content */}
      {tab === 'sees' && (
        <div className="space-y-3">
          {/* Select all row */}
          <button
            onClick={selectAll}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl transition-all cursor-pointer ${
              allEnabled
                ? 'bg-primary/10 ring-1 ring-primary/20'
                : 'bg-white/[0.04] ring-1 ring-white/10 hover:ring-primary/20'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className={`material-symbols-outlined text-base ${allEnabled ? 'text-primary' : 'text-slate-400'}`}
                style={{ fontVariationSettings: allEnabled ? "'FILL' 1" : "'FILL' 0" }}>
                {allEnabled ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <span className={`text-sm font-label font-bold ${allEnabled ? 'text-primary' : 'text-slate-300'}`}>
                Share everything
              </span>
            </div>
            <span className="text-[10px] text-primary font-label font-semibold uppercase tracking-wider">
              Recommended
            </span>
          </button>

          {!allEnabled && (
            <p className="text-[11px] text-amber-400/80 font-body text-center leading-relaxed px-2">
              More sharing builds stronger accountability. Most users share everything.
            </p>
          )}

          {PARTNER_SEES.map((item) => {
            const isOn = enabled.has(item.key);
            return (
              <button
                key={item.key}
                onClick={() => toggleItem(item.key)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isOn
                    ? 'bg-surface-container-lowest border-outline-variant'
                    : 'bg-white/[0.02] border-white/5 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 mb-1">
                  <span className="material-symbols-outlined text-lg shrink-0">{item.icon}</span>
                  <p className="text-sm font-medium text-on-surface font-label flex-1">{item.text}</p>
                  {/* Toggle switch */}
                  <div
                    className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${
                      isOn ? 'bg-primary' : 'bg-outline-variant'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                        isOn ? 'translate-x-[18px]' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed pl-8 font-body">{item.detail}</p>
              </button>
            );
          })}
        </div>
      )}

      {tab === 'never' && (
        <div className="space-y-2">
          {PARTNER_NEVER_SEES.map((item, i) => (
            <div key={i} className="flex items-center gap-3 py-3 px-4">
              <span className="material-symbols-outlined text-lg text-slate-400">{item.icon}</span>
              <p className="text-sm text-slate-200 font-body">{item.text}</p>
            </div>
          ))}
          <div className="mt-3 p-3 rounded-2xl bg-white/[0.04]">
            <p className="text-xs text-slate-300 italic leading-relaxed font-body">
              Your journal is your space for honest self-understanding. The person you are online is the person you are, and this space helps you explore that with integrity. It&apos;s never shared.
            </p>
          </div>
        </div>
      )}

      {/* Mock alert preview */}
      <div className="mt-5 p-4 rounded-2xl bg-white/[0.04] border border-white/10">
        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-label font-medium mb-2">Example alert your partner receives</p>
        <div className="bg-surface-container-lowest rounded-2xl p-3 border border-outline-variant shadow-sm">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-on-primary text-[10px] font-bold">C</span>
            </div>
            <span className="text-xs font-semibold text-on-surface font-label">Be Candid</span>
            <span className="text-[10px] text-on-surface-variant ml-auto font-body">2m ago</span>
          </div>
          <p className="text-xs text-on-surface font-body">Your partner could use your support.</p>
          <p className="text-[10px] text-on-surface-variant mt-0.5 font-body">Open the app to start a conversation.</p>
        </div>
        <p className="text-xs text-slate-200 mt-2.5 text-center font-body leading-relaxed">
          Notice: no category, no details, no timestamps on the lock screen.
        </p>
      </div>

      {/* Actions */}
      <div className="mt-6 space-y-2 relative z-10">
        <button onClick={handleContinue}
          className="w-full py-3 text-sm font-headline font-bold rounded-full bg-primary text-on-primary hover:opacity-90 transition-opacity cursor-pointer">
          Got it — invite a partner
        </button>
        <button onClick={onSolo}
          className="w-full py-3 text-sm font-headline font-bold rounded-full border border-white/20 text-slate-300 hover:bg-white/5 transition-colors cursor-pointer">
          I&apos;ll start in solo mode for now
        </button>
        {onBack && (
          <button onClick={onBack}
            className="w-full py-2 text-sm font-label font-medium text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
            &larr; Back
          </button>
        )}
      </div>

      <p className="text-center text-[11px] text-slate-400/60 mt-3 font-body">
        You can always change these settings later
      </p>
    </div>
  );
}
