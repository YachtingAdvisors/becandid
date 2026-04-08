'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RivalAssessmentAccordion() {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 overflow-hidden transition-all duration-300">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 cursor-pointer hover:bg-surface-container-low/50 transition-colors"
      >
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>psychology_alt</span>
        </div>
        <div className="flex-1 text-left">
          <h3 className="font-headline font-bold text-sm text-on-surface">Rival Assessment</h3>
          <p className="text-[10px] text-on-surface-variant font-body">Discover which digital rivals challenge you most</p>
        </div>
        <span className="text-[10px] font-label font-semibold text-primary/60 uppercase tracking-wider mr-1">Optional</span>
        <span className={`material-symbols-outlined text-on-surface-variant text-lg transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-0 border-t border-outline-variant/10">
          <div className="flex items-start gap-4 mt-3">
            <div className="flex-1 space-y-2">
              <p className="text-sm text-on-surface-variant font-body leading-relaxed">
                A 4-step behavioral assessment inspired by the Predictive Index. Select words that resonate with you and we&apos;ll identify which digital rivals are most likely to challenge you — ranked by match percentage.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['Emotional Patterns', 'Behavioral Habits', 'Trigger Situations', 'Inner Dialogue'].map(step => (
                  <span key={step} className="px-2.5 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-label font-medium">
                    {step}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Link
              href="/dashboard/assessment"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-full font-label font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-110 active:scale-[0.97] transition-all duration-200"
            >
              <span className="material-symbols-outlined text-base">quiz</span>
              Take Assessment
            </Link>
            <span className="text-[10px] text-on-surface-variant font-label">~3 minutes</span>
          </div>
        </div>
      )}
    </div>
  );
}
