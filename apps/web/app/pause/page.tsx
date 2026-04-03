'use client';
// ============================================================
// /pause — "Before You Open" sacred pause page
//
// A full-viewport interstitial shown when the extension or
// desktop app redirects a user about to engage with rival
// content. NOT a block — a breath.
//
// Query params:
//   ?category=<rival>  — the content category being navigated to
//   &return=<url>      — encoded URL of the original destination
//
// 10-second countdown ring with breathing dark gradient.
// Clicking anything before 10s pauses the countdown.
// After countdown: Go Back (primary), Journal Instead, Continue.
// ============================================================

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import BreathingExercise from '@/components/dashboard/BreathingExercise';

// ── Types ────────────────────────────────────────────────────

interface PauseContext {
  streak: number;
  lastInsight: string | null;
  lastInsightDate: string | null;
  quote: { text: string; author: string; ref: string } | null;
  partner: { name: string; phone: string | null } | null;
  userName: string | null;
}

// ── Constants ────────────────────────────────────────────────

const COUNTDOWN_SECONDS = 10;
const RING_SIZE = 160;
const RING_STROKE = 5;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// ── Page wrapper with Suspense (required for useSearchParams) ─

export default function PausePage() {
  return (
    <Suspense fallback={<PauseShell />}>
      <PauseContent />
    </Suspense>
  );
}

function PauseShell() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900">
      <div className="h-10 w-10 animate-pulse rounded-full bg-primary/30" />
    </div>
  );
}

// ── Main pause content ──────────────────────────────────────

function PauseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = searchParams.get('category') || 'unknown';
  const returnUrl = searchParams.get('return') || '';

  // ── State ────────────────────────────────────────────────
  const [context, setContext] = useState<PauseContext | null>(null);
  const [contextLoaded, setContextLoaded] = useState(false);
  const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS);
  const [paused, setPaused] = useState(false);
  const [complete, setComplete] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef(Date.now());
  const hasLoggedView = useRef(false);
  const [showBreathing, setShowBreathing] = useState(false);

  // ── Log initial view event ───────────────────────────────
  useEffect(() => {
    if (hasLoggedView.current) return;
    hasLoggedView.current = true;
    logEvent('pause_view', { category, return_url: returnUrl });
  }, [category, returnUrl]);

  // ── Fetch context ────────────────────────────────────────
  useEffect(() => {
    fetch('/api/pause/context')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setContext(data);
      })
      .catch(() => {})
      .finally(() => setContextLoaded(true));
  }, []);

  // ── Countdown timer ──────────────────────────────────────
  useEffect(() => {
    if (paused || complete) return;
    if (seconds <= 0) {
      setComplete(true);
      logEvent('pause_countdown_complete', { category });
      return;
    }
    timerRef.current = setTimeout(() => {
      setSeconds((s) => s - 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [seconds, paused, complete, category]);

  // ── Pause on early interaction ───────────────────────────
  const handleEarlyInteraction = useCallback(() => {
    if (!complete && !paused && seconds > 0) {
      setPaused(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      logEvent('pause_early_interaction', {
        category,
        seconds_remaining: seconds,
      });
    }
  }, [complete, paused, seconds, category]);

  const resumeCountdown = useCallback(() => {
    setPaused(false);
  }, []);

  // ── Time spent helper ────────────────────────────────────
  const timeSpent = () => Math.round((Date.now() - startTimeRef.current) / 1000);

  // ── Action handlers ──────────────────────────────────────
  const handleGoBack = useCallback(() => {
    logEvent('pause_go_back', { category, time_spent: timeSpent() });
    router.push('/dashboard');
  }, [category, router]);

  const handleJournal = useCallback(() => {
    logEvent('pause_journal_instead', { category, time_spent: timeSpent() });
    router.push('/dashboard/stringer-journal?trigger=manual');
  }, [category, router]);

  const handleContinue = useCallback(() => {
    logEvent('pause_continue', { category, time_spent: timeSpent() });
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
  }, [category, returnUrl, router]);

  const handleCallPartner = useCallback(() => {
    if (!context?.partner?.phone) return;
    logEvent('pause_call_partner', { category });
    window.location.href = `tel:${context.partner.phone}`;
  }, [context, category]);

  // ── Ring progress (0 = full circle, 1 = empty) ──────────
  const progress = complete
    ? 1
    : (COUNTDOWN_SECONDS - seconds) / COUNTDOWN_SECONDS;
  const strokeOffset = RING_CIRCUMFERENCE * (1 - progress);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden select-none"
      onMouseDown={!complete && !paused ? handleEarlyInteraction : undefined}
      onTouchStart={!complete && !paused ? handleEarlyInteraction : undefined}
    >
      {/* ── Breathing background ─────────────────────────── */}
      <div className="pause-bg absolute inset-0 bg-gradient-to-b from-slate-900 via-[#226779]/20 to-slate-900" />

      {/* Subtle radial glow behind the ring */}
      <div className="pause-bg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-[#226779]/8 blur-3xl pointer-events-none" />

      {/* ── Content ──────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 max-w-md w-full text-center">

        {/* Countdown ring */}
        <div
          className="relative flex items-center justify-center shrink-0"
          style={{ width: RING_SIZE, height: RING_SIZE }}
        >
          <svg
            width={RING_SIZE}
            height={RING_SIZE}
            className="absolute -rotate-90"
          >
            {/* Track */}
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={RING_STROKE}
            />
            {/* Animated arc */}
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              fill="none"
              stroke={complete ? '#34d399' : '#226779'}
              strokeWidth={RING_STROKE}
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={strokeOffset}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Center of ring */}
          <div className="flex flex-col items-center justify-center">
            {complete ? (
              <span
                className="material-symbols-outlined text-4xl text-emerald-400"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
            ) : paused ? (
              <span className="material-symbols-outlined text-3xl text-white/50 animate-pulse">
                pause
              </span>
            ) : (
              <span className="font-headline text-5xl font-bold text-white tabular-nums">
                {seconds}
              </span>
            )}
          </div>
        </div>

        {/* Status line */}
        <div className="min-h-[2.5rem]">
          {complete ? (
            <p className="font-headline text-xl text-white pause-fade-in">
              The choice is yours.
            </p>
          ) : paused ? (
            <div className="space-y-1">
              <p className="font-headline text-lg text-white/70">
                Take your time.
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  resumeCountdown();
                }}
                className="inline-flex items-center gap-1 font-label text-sm text-[#226779]/80 hover:text-[#226779] transition-colors"
              >
                <span className="material-symbols-outlined text-sm">play_arrow</span>
                Resume
              </button>
            </div>
          ) : (
            <p className="font-body text-sm text-white/40 tracking-wide">
              Breathe.
            </p>
          )}
        </div>

        {/* ── Contextual content ────────────────────────── */}
        <div
          className={`flex flex-col items-center gap-5 w-full transition-opacity duration-700 ${
            contextLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Streak */}
          {context && context.streak > 0 && (
            <div className="inline-flex items-center gap-2 text-white/70">
              <span className="material-symbols-outlined text-lg text-amber-400/80">
                local_fire_department
              </span>
              <p className="font-body text-sm">
                You&apos;ve been focused for{' '}
                <span className="font-semibold text-white">
                  {context.streak} {context.streak === 1 ? 'day' : 'days'}
                </span>
              </p>
            </div>
          )}

          {/* Last journal insight */}
          {context?.lastInsight && (
            <div className="w-full rounded-2xl bg-white/[0.04] border border-white/[0.08] px-5 py-4">
              <p className="font-label text-[10px] uppercase tracking-widest text-white/30 mb-2">
                From your journal
              </p>
              <p className="font-body text-sm italic text-white/60 leading-relaxed">
                &ldquo;{context.lastInsight}&rdquo;
              </p>
            </div>
          )}

          {/* Rotating quote */}
          {context?.quote && (
            <div className="px-2">
              <p className="font-body text-sm text-white/45 leading-relaxed">
                &ldquo;{context.quote.text}&rdquo;
              </p>
              <p className="font-label text-[10px] text-white/25 mt-1.5">
                &mdash; {context.quote.author}
              </p>
            </div>
          )}

          {/* Call partner pill */}
          {context?.partner && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCallPartner();
              }}
              disabled={!context.partner.phone}
              className="inline-flex items-center gap-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] px-5 py-2.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span
                className="material-symbols-outlined text-lg text-[#226779]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                call
              </span>
              <span className="font-label text-sm text-white/80">
                Call {context.partner.name}
              </span>
            </button>
          )}

          {/* Loading skeleton */}
          {!contextLoaded && (
            <div className="space-y-3 w-full animate-pulse">
              <div className="h-4 bg-white/5 rounded-lg w-48 mx-auto" />
              <div className="h-16 bg-white/[0.03] rounded-2xl w-full" />
              <div className="h-10 bg-white/[0.03] rounded-lg w-56 mx-auto" />
            </div>
          )}
        </div>

        {/* ── Action buttons (after countdown or pause) ──── */}
        {(complete || paused) && (
          <div className="flex flex-col items-center gap-3 w-full mt-2 pause-fade-in">
            {/* Go Back — primary, prominent, large */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleGoBack();
              }}
              className="w-full max-w-xs rounded-full bg-[#226779] hover:bg-[#226779]/90 active:bg-[#226779]/80 text-white font-label text-base font-medium py-3.5 px-8 transition-all shadow-lg shadow-[#226779]/25 focus:outline-none focus:ring-2 focus:ring-[#226779]/40"
            >
              <span className="material-symbols-outlined text-lg align-middle mr-1.5">
                arrow_back
              </span>
              Go Back
            </button>

            {/* Journal Instead — secondary */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleJournal();
              }}
              className="w-full max-w-xs rounded-full bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.1] text-white/90 font-label text-sm py-3 px-8 transition-all focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              <span className="material-symbols-outlined text-sm align-middle mr-1.5">
                edit_note
              </span>
              Journal Instead
            </button>

            {/* Continue — ghost, small, muted (only after full countdown) */}
            {complete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleContinue();
                }}
                className="mt-4 font-label text-xs text-white/20 hover:text-white/35 transition-colors focus:outline-none"
              >
                Continue anyway
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Animations ───────────────────────────────────── */}
      <style jsx global>{`
        @keyframes pause-breathe {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.85;
            transform: scale(1.03);
          }
        }
        .pause-bg {
          animation: pause-breathe 8s ease-in-out infinite;
        }
        @keyframes pause-fade-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .pause-fade-in {
          animation: pause-fade-in 0.6s ease-out both;
        }
      `}</style>
    </div>
  );
}

// ── Event logging ────────────────────────────────────────────

function logEvent(type: string, metadata: Record<string, unknown>) {
  fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category: 'pause_page',
      severity: 'low',
      platform: 'web',
      metadata: { event_type: type, ...metadata },
    }),
  }).catch(() => {
    // Analytics should never break the UX
  });
}
