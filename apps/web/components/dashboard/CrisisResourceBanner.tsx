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

import type { CrisisDetectionResult } from '@/lib/crisisDetection';

export default function CrisisResourceBanner({ result }: { result: CrisisDetectionResult }) {
  if (!result.detected) return null;

  const isUrgent = result.severity === 'urgent';

  return (
    <div className={`rounded-xl border p-5 ${
      isUrgent
        ? 'bg-red-50 border-red-200'
        : 'bg-amber-50 border-amber-200'
    }`}>
      <div className="flex items-start gap-3">
        <span className="text-xl mt-0.5">{isUrgent ? '❤️' : '💛'}</span>
        <div className="flex-1">
          <h3 className={`text-sm font-semibold ${isUrgent ? 'text-red-800' : 'text-amber-800'}`}>
            {isUrgent ? 'It sounds like you\'re going through something heavy' : 'You\'re not alone in this'}
          </h3>
          <p className={`text-sm mt-1 leading-relaxed ${isUrgent ? 'text-red-700' : 'text-amber-700'}`}>
            {isUrgent
              ? 'What you\'re feeling matters. You don\'t have to carry this alone. These resources are confidential and free.'
              : 'If you\'re struggling, talking to someone can help. These resources are available anytime.'}
          </p>

          <div className="mt-3 space-y-2">
            {result.resources.map((r) => (
              <a
                key={r.id}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`block p-3 rounded-lg border ${
                  isUrgent ? 'bg-white border-red-100 hover:border-red-300' : 'bg-white border-amber-100 hover:border-amber-300'
                } transition-colors`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink">{r.name}</p>
                    <p className="text-xs text-ink-muted mt-0.5">{r.description}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className={`text-sm font-bold ${isUrgent ? 'text-red-600' : 'text-amber-600'}`}>
                      {r.contact}
                    </p>
                    <p className="text-[10px] text-ink-muted">{r.available}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>

          <p className="text-[11px] mt-3 text-ink-muted/70 italic">
            This is shown privately to you. It&apos;s not shared with your partner or stored anywhere.
          </p>
        </div>
      </div>
    </div>
  );
}
