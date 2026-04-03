'use client';
// ============================================================
// BreathingExercise.tsx — 4-7-8 guided breathing exercise
//
// Inhale 4s → Hold 7s → Exhale 8s (one cycle = 19s)
// CSS animations drive the circle visuals; a single setInterval
// manages phase transitions + countdown timer.
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';

// ── Types ────────────────────────────────────────────────────

interface BreathingExerciseProps {
  rounds?: number; // default 4
  onComplete?: () => void;
  variant?: 'standalone' | 'inline'; // inline is smaller
}

type Phase = 'idle' | 'inhale' | 'hold' | 'exhale' | 'complete';

const PHASE_DURATIONS: Record<Exclude<Phase, 'idle' | 'complete'>, number> = {
  inhale: 4,
  hold: 7,
  exhale: 8,
};

const PHASE_LABELS: Record<Phase, string> = {
  idle: 'Ready',
  inhale: 'Breathe in\u2026',
  hold: 'Hold\u2026',
  exhale: 'Breathe out\u2026',
  complete: 'Well done.',
};

const PHASE_ORDER: Array<Exclude<Phase, 'idle' | 'complete'>> = ['inhale', 'hold', 'exhale'];

// ── Component ───────────────────────────────────────────────

export default function BreathingExercise({
  rounds = 4,
  onComplete,
  variant = 'standalone',
}: BreathingExerciseProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [fadeOut, setFadeOut] = useState(false);

  const isInline = variant === 'inline';
  const circleSize = isInline ? 140 : 200;

  // ── Cleanup ─────────────────────────────────────────────
  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => () => clearTimer(), [clearTimer]);

  // ── Start ───────────────────────────────────────────────
  const handleStart = useCallback(() => {
    setCurrentRound(1);
    setPhaseIndex(0);
    setPhase('inhale');
    setSecondsLeft(PHASE_DURATIONS.inhale);
    setFadeOut(false);
  }, []);

  // ── Stop ────────────────────────────────────────────────
  const handleStop = useCallback(() => {
    clearTimer();
    setPhase('idle');
    setSecondsLeft(0);
    setCurrentRound(1);
    setPhaseIndex(0);
    setFadeOut(false);
  }, [clearTimer]);

  // ── State machine tick ──────────────────────────────────
  useEffect(() => {
    if (phase === 'idle' || phase === 'complete') {
      clearTimer();
      return;
    }

    clearTimer();
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;

        // Phase ended — advance
        setPhaseIndex((pi) => {
          const nextPi = pi + 1;
          if (nextPi >= PHASE_ORDER.length) {
            // End of cycle — advance round
            setCurrentRound((r) => {
              if (r >= rounds) {
                // All rounds complete
                setPhase('complete');
                setFadeOut(true);
                return r;
              }
              // Next round, reset to inhale
              setPhase('inhale');
              setSecondsLeft(PHASE_DURATIONS.inhale);
              return r + 1;
            });
            return 0;
          }
          // Next phase in current cycle
          const nextPhase = PHASE_ORDER[nextPi];
          setPhase(nextPhase);
          setSecondsLeft(PHASE_DURATIONS[nextPhase]);
          return nextPi;
        });

        return 0;
      });
    }, 1000);

    return () => clearTimer();
  }, [phase, clearTimer, rounds]);

  // ── Completion callback ─────────────────────────────────
  useEffect(() => {
    if (phase === 'complete' && onComplete) {
      const t = setTimeout(onComplete, 3000);
      return () => clearTimeout(t);
    }
  }, [phase, onComplete]);

  // ── Circle animation class ─────────────────────────────
  const circleAnimClass =
    phase === 'inhale'
      ? 'breathing-inhale'
      : phase === 'hold'
        ? 'breathing-hold'
        : phase === 'exhale'
          ? 'breathing-exhale'
          : phase === 'complete'
            ? 'breathing-exhale'
            : '';

  const glowOpacity =
    phase === 'inhale' || phase === 'hold' ? 'opacity-60' : 'opacity-20';

  return (
    <div className={`flex flex-col items-center gap-${isInline ? '4' : '6'}`}>
      {/* Breathing circle */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: circleSize, height: circleSize }}
      >
        {/* Glow */}
        <div
          className={`absolute inset-0 rounded-full bg-[#226779]/30 blur-2xl transition-opacity duration-1000 ${glowOpacity} pointer-events-none`}
        />

        {/* Circle */}
        <div
          className={`relative rounded-full border-2 border-[#226779]/40 flex items-center justify-center ${circleAnimClass}`}
          style={{ width: circleSize, height: circleSize }}
        >
          {/* Inner gradient */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#226779]/20 via-[#226779]/10 to-transparent pointer-events-none" />

          {/* Phase label + timer */}
          <div className="relative z-10 flex flex-col items-center gap-1">
            <p
              className={`font-headline font-medium text-center ${
                isInline ? 'text-sm' : 'text-base'
              } ${phase === 'complete' ? 'text-emerald-400' : 'text-white/90'}`}
            >
              {PHASE_LABELS[phase]}
            </p>
            {phase !== 'idle' && phase !== 'complete' && (
              <span className="font-headline text-2xl font-bold text-white tabular-nums">
                {secondsLeft}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Round counter */}
      {phase !== 'idle' && phase !== 'complete' && (
        <p className="font-label text-xs text-white/50 tracking-wide">
          Round {currentRound} of {rounds}
        </p>
      )}

      {/* Completion message */}
      {phase === 'complete' && (
        <div className={`text-center space-y-1 ${fadeOut ? 'breathing-fade-in' : ''}`}>
          <p className="font-body text-sm text-white/60 leading-relaxed">
            Take a moment before moving on.
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3">
        {phase === 'idle' && (
          <button
            onClick={handleStart}
            className={`rounded-full bg-[#226779] hover:bg-[#226779]/90 active:bg-[#226779]/80 text-white font-label font-medium transition-all shadow-lg shadow-[#226779]/25 focus:outline-none focus:ring-2 focus:ring-[#226779]/40 ${
              isInline ? 'px-5 py-2 text-sm' : 'px-8 py-3 text-base'
            }`}
          >
            <span className="material-symbols-outlined text-lg align-middle mr-1.5">
              play_arrow
            </span>
            Start
          </button>
        )}
        {phase !== 'idle' && phase !== 'complete' && (
          <button
            onClick={handleStop}
            className={`rounded-full bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.1] text-white/80 font-label transition-all focus:outline-none focus:ring-2 focus:ring-white/20 ${
              isInline ? 'px-4 py-1.5 text-xs' : 'px-6 py-2.5 text-sm'
            }`}
          >
            <span className="material-symbols-outlined text-sm align-middle mr-1">
              stop
            </span>
            Stop
          </button>
        )}
      </div>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes breathing-inhale-kf {
          from {
            transform: scale(0.6);
            box-shadow: 0 0 20px rgba(34, 103, 121, 0.2);
          }
          to {
            transform: scale(1);
            box-shadow: 0 0 40px rgba(34, 103, 121, 0.5);
          }
        }
        .breathing-inhale {
          animation: breathing-inhale-kf 4s ease-in-out forwards;
        }

        @keyframes breathing-hold-kf {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 40px rgba(34, 103, 121, 0.5);
          }
          50% {
            transform: scale(1.03);
            box-shadow: 0 0 45px rgba(34, 103, 121, 0.55);
          }
        }
        .breathing-hold {
          animation: breathing-hold-kf 3.5s ease-in-out infinite;
          transform: scale(1);
        }

        @keyframes breathing-exhale-kf {
          from {
            transform: scale(1);
            box-shadow: 0 0 40px rgba(34, 103, 121, 0.5);
          }
          to {
            transform: scale(0.6);
            box-shadow: 0 0 10px rgba(34, 103, 121, 0.1);
          }
        }
        .breathing-exhale {
          animation: breathing-exhale-kf 8s ease-in-out forwards;
        }

        @keyframes breathing-fade-in-kf {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .breathing-fade-in {
          animation: breathing-fade-in-kf 0.8s ease-out both;
        }
      `}</style>
    </div>
  );
}
