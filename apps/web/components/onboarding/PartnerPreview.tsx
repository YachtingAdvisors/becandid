'use client';

import { useState } from 'react';

const PARTNER_SEES = [
  { icon: 'flag', text: 'That a flag was triggered', detail: 'They see the category (e.g. "Social Media") and severity — not what you were looking at.' },
  { icon: 'schedule', text: 'When it happened', detail: 'Date and time. No URLs, no screenshots, no browsing history.' },
  { icon: 'smart_toy', text: 'A custom conversation guide', detail: 'A personalized guide is generated for how to have a meaningful conversation with you — grounded in Motivational Interviewing, focused on clarity and alignment.' },
  { icon: 'trending_up', text: 'Your focus streak', detail: 'How many days in a row you\'ve been focused. Streaks reset on a flag but start rebuilding immediately.' },
  { icon: 'edit_note', text: 'That you journaled (not what you wrote)', detail: 'They see "3 journal entries this week" — never the content. Your reflections are private.' },
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
}: {
  onContinue: () => void;
  onSolo: () => void;
}) {
  const [tab, setTab] = useState<'sees' | 'never'>('sees');

  return (
    <div className="max-w-md w-full mx-auto">
      <div className="text-center mb-6">
        <p className="text-xs text-primary font-label font-medium uppercase tracking-widest mb-2">Transparency</p>
        <h1 className="text-2xl font-headline font-semibold text-on-surface mb-2">
          What your partner will see
        </h1>
        <p className="text-sm text-on-surface-variant leading-relaxed font-body">
          Accountability is clarity. You should know exactly what your partner can see, because congruence starts with honesty.
        </p>
      </div>

      {/* Tab toggle */}
      <div className="flex bg-surface-container rounded-full p-1 mb-5">
        <button
          onClick={() => setTab('sees')}
          className={`flex-1 py-2 text-sm font-label font-medium rounded-full transition-all ${
            tab === 'sees' ? 'bg-surface-container-lowest text-on-surface shadow-sm' : 'text-on-surface-variant'
          }`}
        >
          They can see
        </button>
        <button
          onClick={() => setTab('never')}
          className={`flex-1 py-2 text-sm font-label font-medium rounded-full transition-all ${
            tab === 'never' ? 'bg-surface-container-lowest text-on-surface shadow-sm' : 'text-on-surface-variant'
          }`}
        >
          They never see
        </button>
      </div>

      {/* Content */}
      {tab === 'sees' && (
        <div className="space-y-3">
          {PARTNER_SEES.map((item, i) => (
            <div key={i} className="p-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant">
              <div className="flex items-center gap-3 mb-1">
                <span className="material-symbols-outlined text-lg">{item.icon}</span>
                <p className="text-sm font-medium text-on-surface font-label">{item.text}</p>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed pl-8 font-body">{item.detail}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'never' && (
        <div className="space-y-2">
          {PARTNER_NEVER_SEES.map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3.5 rounded-2xl bg-primary-container/30 border border-primary/10">
              <span className="material-symbols-outlined text-lg">{item.icon}</span>
              <p className="text-sm font-medium text-on-surface font-label">{item.text}</p>
            </div>
          ))}
          <div className="mt-3 p-3 rounded-2xl bg-secondary-container/50 border border-secondary/10">
            <p className="text-xs text-on-secondary-container italic leading-relaxed font-body">
              Your journal is your space for honest self-understanding. The person you are online is the person you are \u2014 and this space helps you explore that with integrity. It&apos;s never shared.
            </p>
          </div>
        </div>
      )}

      {/* Mock alert preview */}
      <div className="mt-5 p-4 rounded-2xl bg-secondary-container/30 border border-outline-variant">
        <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-label font-medium mb-2">Example alert your partner receives</p>
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
        <p className="text-[10px] text-on-surface-variant mt-2 text-center italic font-body">
          Notice: no category, no details, no timestamps on the lock screen.
        </p>
      </div>

      {/* Actions */}
      <div className="mt-6 space-y-2">
        <button onClick={onContinue}
          className="w-full py-3 text-sm font-headline font-bold rounded-full bg-primary text-on-primary hover:opacity-90 transition-opacity">
          Got it — invite a partner
        </button>
        <button onClick={onSolo}
          className="w-full py-3 text-sm font-headline font-bold rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container-low transition-colors">
          I&apos;ll start in solo mode for now
        </button>
      </div>

      <p className="text-center text-[11px] text-on-surface-variant/60 mt-3 font-body">
        You can always invite a partner later from Settings
      </p>
    </div>
  );
}
