'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface PauseContext {
  streak: number;
  lastInsight: string | null;
  quote: { text: string; author: string } | null;
  partner: { name: string; phone: string | null } | null;
}

export default function PausePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = searchParams.get('category') || 'unknown';
  const returnUrl = searchParams.get('return') || '';

  const [context, setContext] = useState<PauseContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [seconds, setSeconds] = useState(10);
  const [paused, setPaused] = useState(false);
  const [complete, setComplete] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasLoggedShow = useRef(false);

  // Log that the interstitial was shown
  useEffect(() => {
    if (hasLoggedShow.current) return;
    hasLoggedShow.current = true;
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category,
        severity: 'low',
        platform: 'web',
        metadata: { type: 'interstitial_shown' },
      }),
    }).catch(() => {});
  }, [category]);

  // Fetch context
  useEffect(() => {
    fetch('/api/pause/context')
      .then(r => r.json())
      .then(setContext)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Countdown timer
  useEffect(() => {
    if (paused || complete) return;
    if (seconds <= 0) {
      setComplete(true);
      return;
    }
    timerRef.current = setTimeout(() => {
      setSeconds(s => s - 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [seconds, paused, complete]);

  const handleInteract = useCallback(() => {
    if (!complete && seconds > 0) {
      setPaused(true);
    }
  }, [complete, seconds]);

  const resumeTimer = useCallback(() => {
    setPaused(false);
  }, []);

  const logEvent = useCallback(async (type: string) => {
    await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category,
        severity: 'low',
        platform: 'web',
        metadata: { type },
      }),
    }).catch(() => {});
  }, [category]);

  const handleGoBack = useCallback(async () => {
    await logEvent('interstitial_redirected');
    router.push('/dashboard');
  }, [logEvent, router]);

  const handleContinue = useCallback(async () => {
    await logEvent('interstitial_bypassed');
    if (returnUrl) {
      try {
        const decoded = decodeURIComponent(returnUrl);
        window.location.href = decoded;
      } catch {
        window.location.href = returnUrl;
      }
    } else {
      router.back();
    }
  }, [logEvent, returnUrl, router]);

  const handleJournal = useCallback(async () => {
    await logEvent('interstitial_redirected');
    router.push('/dashboard/stringer-journal?trigger=manual');
  }, [logEvent, router]);

  // SVG countdown ring
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = complete ? 0 : ((10 - seconds) / 10) * circumference;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      onMouseDown={handleInteract}
      onTouchStart={handleInteract}
    >
      {/* Breathing background */}
      <div
        className="absolute inset-0 transition-all duration-[4000ms] ease-in-out"
        style={{
          background: complete
            ? 'linear-gradient(135deg, #fef3c7 0%, #f5e6d3 30%, #e8d5c4 60%, #dbeafe 100%)'
            : 'linear-gradient(135deg, #fef9c3 0%, #fde68a 25%, #f5e6d3 50%, #e8d5c4 75%, #d1d5db 100%)',
          animation: 'breathe 8s ease-in-out infinite',
        }}
      />

      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-white/20" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md w-full">

        {/* Countdown ring */}
        {!complete && (
          <div className="relative mb-8">
            <svg width="140" height="140" className="transform -rotate-90">
              {/* Background ring */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke="rgba(34, 103, 121, 0.1)"
                strokeWidth="4"
              />
              {/* Progress ring */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke="#226779"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - progress}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-headline text-4xl font-bold text-on-surface/80">
                {seconds}
              </span>
            </div>
          </div>
        )}

        {/* Completed state icon */}
        {complete && (
          <div className="mb-8 animate-fade-up">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                self_improvement
              </span>
            </div>
          </div>
        )}

        {/* Paused indicator */}
        {paused && !complete && (
          <button
            onClick={resumeTimer}
            className="mb-4 px-4 py-1.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-sm border border-outline-variant/20 text-xs font-label text-on-surface-variant hover:bg-surface-container-low/80 transition-colors cursor-pointer focus:outline-none"
          >
            <span className="material-symbols-outlined text-xs align-middle mr-1">play_arrow</span>
            Tap to resume
          </button>
        )}

        {/* Main content area */}
        <div className="space-y-5 mb-8">
          {/* Streak */}
          {!loading && context?.streak !== undefined && context.streak > 0 && (
            <p className="font-headline text-lg font-bold text-on-surface/90">
              You&apos;ve been focused for {context.streak} day{context.streak !== 1 ? 's' : ''}
            </p>
          )}

          {/* Last journal insight */}
          {!loading && context?.lastInsight && (
            <div className="bg-surface-container-lowest/60 backdrop-blur-sm rounded-2xl border border-outline-variant/15 px-5 py-4">
              <p className="text-xs font-label text-on-surface-variant/60 uppercase tracking-wider mb-1.5">Last time you wrote</p>
              <p className="font-headline italic text-sm text-on-surface/80 leading-relaxed">
                &ldquo;{context.lastInsight.length > 160
                  ? context.lastInsight.slice(0, 160) + '...'
                  : context.lastInsight}&rdquo;
              </p>
            </div>
          )}

          {/* Quote */}
          {!loading && context?.quote && (
            <div className="px-4">
              <p className="font-headline italic text-sm text-on-surface/60 leading-relaxed">
                &ldquo;{context.quote.text}&rdquo;
              </p>
              <p className="text-[10px] font-label text-on-surface-variant/40 mt-1">
                &mdash; {context.quote.author}
              </p>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="space-y-3 animate-pulse">
              <div className="h-5 bg-surface-container-low/40 rounded-lg w-48 mx-auto" />
              <div className="h-16 bg-surface-container-low/30 rounded-2xl w-full" />
              <div className="h-10 bg-surface-container-low/20 rounded-lg w-56 mx-auto" />
            </div>
          )}

          {/* Call partner button (always visible if partner exists) */}
          {!loading && context?.partner && (
            <a
              href={context.partner.phone ? `tel:${context.partner.phone}` : '#'}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface-container-lowest/70 backdrop-blur-sm border border-outline-variant/20 text-sm font-label font-medium text-on-surface hover:bg-surface-container-lowest hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
              onClick={(e) => {
                if (!context.partner?.phone) e.preventDefault();
              }}
            >
              <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>call</span>
              Call {context.partner.name}
            </a>
          )}
        </div>

        {/* Post-countdown choices */}
        {complete && (
          <div className="animate-fade-up space-y-4">
            <p className="font-headline text-xl font-bold text-on-surface/80 mb-6">
              The choice is yours.
            </p>

            <div className="flex flex-col items-center gap-3 w-full">
              {/* Go Back — primary, prominent */}
              <button
                onClick={handleGoBack}
                className="w-full max-w-xs px-6 py-3.5 bg-primary text-on-primary rounded-full font-headline font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-110 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <span className="material-symbols-outlined text-lg align-middle mr-1.5">arrow_back</span>
                Go Back
              </button>

              {/* Continue — ghost, muted */}
              <button
                onClick={handleContinue}
                className="w-full max-w-xs px-6 py-3 rounded-full text-sm font-label text-on-surface-variant/50 hover:text-on-surface-variant/70 hover:bg-surface-container-low/30 transition-all duration-200 cursor-pointer focus:outline-none"
              >
                Continue
              </button>

              {/* Journal instead */}
              <button
                onClick={handleJournal}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-label text-primary/70 hover:text-primary transition-colors cursor-pointer focus:outline-none"
              >
                <span className="material-symbols-outlined text-sm">edit_note</span>
                Journal instead
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Breathing animation keyframes */}
      <style jsx>{`
        @keyframes breathe {
          0%, 100% {
            background-size: 100% 100%;
            opacity: 1;
          }
          50% {
            background-size: 120% 120%;
            opacity: 0.92;
          }
        }
      `}</style>
    </div>
  );
}
