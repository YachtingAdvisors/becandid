'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RivalAssessmentAccordion() {
  const [open, setOpen] = useState(true);

  return (
    <div className="relative bg-on-surface text-surface rounded-xl overflow-hidden transition-all duration-300">
      {/* Cinematic background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-tertiary/20 opacity-40 mix-blend-overlay" />

      <button
        onClick={() => setOpen(!open)}
        className="relative w-full flex items-center gap-3 p-5 cursor-pointer hover:bg-white/5 transition-colors duration-300"
      >
        <div className="w-10 h-10 rounded-xl bg-surface/15 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-surface text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>psychology_alt</span>
        </div>
        <div className="flex-1 text-left">
          <h3 className="font-headline font-bold text-sm text-surface">Rival Assessment</h3>
          <p className="text-[10px] text-surface/70 font-body">Discover which digital rivals challenge you most</p>
        </div>
        <span className="text-[10px] font-label font-bold text-amber-300 uppercase tracking-wider mr-1 px-2 py-0.5 rounded-full bg-amber-300/15 ring-1 ring-amber-300/20">Recommended</span>
        <span className={`material-symbols-outlined text-surface/70 text-lg transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {open && (
        <div className="relative px-5 pb-5 pt-0 border-t border-surface/10">
          <div className="flex items-start gap-4 mt-3">
            <div className="flex-1 space-y-2">
              <p className="text-sm text-surface/80 font-body leading-relaxed">
                A 4-step behavioral assessment inspired by the Predictive Index. Select words that resonate with you and we&apos;ll identify which digital rivals are most likely to challenge you — ranked by match percentage.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['Emotional Patterns', 'Behavioral Habits', 'Trigger Situations', 'Inner Dialogue'].map(step => (
                  <span key={step} className="px-2.5 py-1 rounded-full bg-surface/10 text-surface text-[10px] font-body font-medium">
                    {step}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Link
              href="/dashboard/assessment"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface text-on-surface rounded-full font-body font-bold text-sm hover:bg-surface/90 active:scale-[0.97] transition-all duration-300"
            >
              <span className="material-symbols-outlined text-base">quiz</span>
              Take Assessment
            </Link>
            <span className="text-[10px] text-surface/60 font-body">~3 minutes</span>
          </div>
        </div>
      )}
    </div>
  );
}
