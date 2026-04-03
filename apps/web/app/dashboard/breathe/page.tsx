// ============================================================
// app/dashboard/breathe/page.tsx — Standalone breathing exercise
// ============================================================

'use client';

import Link from 'next/link';
import BreathingExercise from '@/components/dashboard/BreathingExercise';

export default function BreathePage() {
  return (
    <div className="fixed inset-0 z-[9998] flex flex-col items-center justify-center overflow-hidden select-none">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-[#226779]/20 to-slate-900" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-[#226779]/8 blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-6 max-w-md w-full text-center">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-2xl text-[#226779]">
              self_improvement
            </span>
            <h1 className="font-headline text-2xl font-bold text-white">
              Breathe
            </h1>
          </div>
          <p className="font-body text-sm text-white/50 leading-relaxed max-w-sm">
            The 4-7-8 technique activates your parasympathetic nervous system
            &mdash; slowing your heart rate and calming the urge to act
            impulsively.
          </p>
        </div>

        {/* Exercise */}
        <BreathingExercise variant="standalone" />

        {/* Back link */}
        <Link
          href="/dashboard"
          className="mt-4 font-label text-xs text-white/30 hover:text-white/50 transition-colors"
        >
          <span className="material-symbols-outlined text-xs align-middle mr-1">
            arrow_back
          </span>
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
