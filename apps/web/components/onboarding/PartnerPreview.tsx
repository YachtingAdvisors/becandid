// ============================================================
// components/onboarding/PartnerPreview.tsx
//
// Shows during onboarding BEFORE the partner invite step.
// Previews exactly what the partner will (and won't) see.
//
// This matters because the #1 reason people hesitate to invite
// a partner is fear of what the partner will know. Showing them
// upfront reduces that anxiety and increases invite rates.
//
// Add to onboarding flow between Stringer intro and partner invite:
//   <PartnerPreview onContinue={() => setStep('partner')} onSolo={() => enableSoloMode()} />
// ============================================================

'use client';

import { useState } from 'react';

const PARTNER_SEES = [
  { icon: '⚡', text: 'That a flag was triggered', detail: 'They see the category (e.g. "Social Media") and severity — not what you were looking at.' },
  { icon: '🕐', text: 'When it happened', detail: 'Date and time. No URLs, no screenshots, no browsing history.' },
  { icon: '🤖', text: 'An AI conversation guide', detail: 'Claude generates a guide for how to have a productive conversation with you — grounded in Motivational Interviewing, not shame.' },
  { icon: '📊', text: 'Your focus streak', detail: 'How many days in a row you\'ve been focused. Streaks reset on a flag but start rebuilding immediately.' },
  { icon: '📓', text: 'That you journaled (not what you wrote)', detail: 'They see "3 journal entries this week" — never the content. Your reflections are private.' },
];

const PARTNER_NEVER_SEES = [
  { icon: '🔒', text: 'URLs or websites visited' },
  { icon: '🔒', text: 'Screenshots or screen recordings' },
  { icon: '🔒', text: 'Your journal entries or reflections' },
  { icon: '🔒', text: 'Your mood or check-in responses' },
  { icon: '🔒', text: 'Content of push notifications you receive' },
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
        <p className="text-xs text-brand font-medium uppercase tracking-widest mb-2">Transparency</p>
        <h1 className="text-2xl font-display font-semibold text-ink mb-2">
          What your partner will see
        </h1>
        <p className="text-sm text-ink-muted leading-relaxed">
          Be Candid is built on radical transparency — you should know exactly what your partner can access.
        </p>
      </div>

      {/* Tab toggle */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-5">
        <button
          onClick={() => setTab('sees')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            tab === 'sees' ? 'bg-white text-ink shadow-sm' : 'text-ink-muted'
          }`}
        >
          They can see
        </button>
        <button
          onClick={() => setTab('never')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            tab === 'never' ? 'bg-white text-ink shadow-sm' : 'text-ink-muted'
          }`}
        >
          They never see
        </button>
      </div>

      {/* Content */}
      {tab === 'sees' && (
        <div className="space-y-3">
          {PARTNER_SEES.map((item, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-white border border-surface-border">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-base">{item.icon}</span>
                <p className="text-sm font-medium text-ink">{item.text}</p>
              </div>
              <p className="text-xs text-ink-muted leading-relaxed pl-8">{item.detail}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'never' && (
        <div className="space-y-2">
          {PARTNER_NEVER_SEES.map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-100">
              <span className="text-base">{item.icon}</span>
              <p className="text-sm font-medium text-emerald-800">{item.text}</p>
            </div>
          ))}
          <div className="mt-3 p-3 rounded-lg bg-violet-50 border border-violet-100">
            <p className="text-xs text-violet-700 italic leading-relaxed">
              "Freedom is found through kindness and curiosity." Your journal is your space for honest self-examination. It's never shared.
            </p>
          </div>
        </div>
      )}

      {/* Mock alert preview */}
      <div className="mt-5 p-4 rounded-xl bg-gray-50 border border-surface-border">
        <p className="text-[10px] text-ink-muted uppercase tracking-wider font-medium mb-2">Example alert your partner receives</p>
        <div className="bg-white rounded-lg p-3 border border-surface-border shadow-sm">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-md bg-brand flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">C</span>
            </div>
            <span className="text-xs font-semibold text-ink">Be Candid</span>
            <span className="text-[10px] text-ink-muted ml-auto">2m ago</span>
          </div>
          <p className="text-xs text-ink">Your partner could use your support.</p>
          <p className="text-[10px] text-ink-muted mt-0.5">Open the app to start a conversation.</p>
        </div>
        <p className="text-[10px] text-ink-muted mt-2 text-center italic">
          Notice: no category, no details, no timestamps on the lock screen.
        </p>
      </div>

      {/* Actions */}
      <div className="mt-6 space-y-2">
        <button onClick={onContinue}
          className="w-full py-3 text-sm font-medium rounded-xl bg-brand text-white hover:bg-brand-dark transition-colors">
          Got it — invite a partner
        </button>
        <button onClick={onSolo}
          className="w-full py-3 text-sm font-medium rounded-xl border border-surface-border text-ink-muted hover:bg-gray-50 transition-colors">
          I'll start in solo mode for now
        </button>
      </div>

      <p className="text-center text-[11px] text-ink-muted/60 mt-3">
        You can always invite a partner later from Settings
      </p>
    </div>
  );
}
