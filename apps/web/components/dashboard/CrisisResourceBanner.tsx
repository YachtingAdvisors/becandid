// ============================================================
// components/dashboard/CrisisResourceBanner.tsx
//
// Renders inline in the journal write view when crisis language
// is detected. Warm, non-judgmental, and actionable.
//
// Usage in stringer-journal page:
//   import { checkForCrisisLanguage } from '@/lib/crisisDetection';
//   import CrisisResourceBanner from '@/components/dashboard/CrisisResourceBanner';
//
//   const crisisCheck = checkForCrisisLanguage(freewrite);
//   {crisisCheck.detected && <CrisisResourceBanner result={crisisCheck} />}
// ============================================================

'use client';

import { useState } from 'react';
import type { CrisisDetectionResult } from '@/lib/crisisDetection';
import BreathingExercise from '@/components/dashboard/BreathingExercise';

export default function CrisisResourceBanner({ result }: { result: CrisisDetectionResult }) {
  const [showBreathing, setShowBreathing] = useState(false);
  const [breathingDone, setBreathingDone] = useState(false);

  if (!result.detected) return null;

  const isUrgent = result.severity === 'urgent';

  return (
    <div className={`rounded-2xl border p-5 mt-3 ${
      isUrgent
        ? 'bg-error/5 border-error/30'
        : 'bg-tertiary-container/30 border-tertiary-container'
    }`}>
      <div className="flex items-start gap-3">
        <span className="text-xl mt-0.5">{isUrgent ? '\u2764\uFE0F' : '\uD83D\uDC9B'}</span>
        <div className="flex-1">
          <h3 className={`text-sm font-headline font-bold ${isUrgent ? 'text-error' : 'text-tertiary'}`}>
            {isUrgent ? 'It sounds like you\'re going through something heavy' : 'You\'re not alone in this'}
          </h3>
          <p className={`text-sm font-body mt-1 leading-relaxed ${isUrgent ? 'text-error/80' : 'text-on-tertiary-container/80'}`}>
            {isUrgent
              ? 'What you\'re feeling matters. You don\'t have to carry this alone.'
              : 'If you\'re struggling, talking to someone can help.'}
          </p>

          {/* Grounding exercise — breathe before acting */}
          {!breathingDone && (
            <div className="mt-3">
              {!showBreathing ? (
                <button
                  onClick={() => setShowBreathing(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-lowest ring-1 ring-outline-variant/20 hover:ring-primary/30 cursor-pointer transition-all text-sm font-label font-semibold text-on-surface"
                >
                  <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>air</span>
                  Take 3 breaths first
                  <span className="text-[10px] text-on-surface-variant font-normal ml-1">~1 min</span>
                </button>
              ) : (
                <div className="bg-surface-container-lowest rounded-xl ring-1 ring-outline-variant/20 p-4">
                  <BreathingExercise
                    rounds={3}
                    variant="inline"
                    onComplete={() => { setBreathingDone(true); setShowBreathing(false); }}
                  />
                </div>
              )}
            </div>
          )}

          {breathingDone && (
            <p className="mt-3 text-xs font-label font-semibold text-emerald-600 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              Good. You grounded yourself. Now here are your resources:
            </p>
          )}

          <div className="mt-3 space-y-2">
            {result.resources.map((r) => (
              <a
                key={r.id}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`block p-3 rounded-2xl border ${
                  isUrgent ? 'bg-surface-container-lowest border-error/20 hover:border-error/40' : 'bg-surface-container-lowest border-tertiary-container/50 hover:border-tertiary-container'
                } transition-colors`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-label font-semibold text-on-surface">{r.name}</p>
                    <p className="text-xs text-on-surface-variant font-body mt-0.5">{r.description}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className={`text-sm font-headline font-bold ${isUrgent ? 'text-error' : 'text-tertiary'}`}>
                      {r.contact}
                    </p>
                    <p className="text-[10px] text-on-surface-variant font-label">{r.available}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>

          <p className="text-[11px] mt-3 text-on-surface-variant/60 italic font-body">
            <span className="material-symbols-outlined text-[10px] align-middle mr-0.5">lock</span>
            This is shown privately to you. It&apos;s not shared with your partner or stored anywhere.
          </p>
        </div>
      </div>
    </div>
  );
}
