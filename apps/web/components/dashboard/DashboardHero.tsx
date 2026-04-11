'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import MomentumScore from './MomentumScore';
import MilestoneCelebration from './MilestoneCelebration';

interface DashboardHeroProps {
  userName: string;
  currentStreak: number;
  moodTrend?: { start: number; end: number; direction: 'up' | 'down' | 'stable' };
  journalCount7d: number;
  trustPoints: number;
  goals: string[];
}

/* ── Milestone helpers ─────────────────────────────────────── */
const MILESTONES = [7, 14, 30, 60, 90];

function getNextMilestone(streak: number): number {
  for (const m of MILESTONES) {
    if (streak < m) return m;
  }
  return streak + 30; // beyond 90 — every 30 days
}

function getPrevMilestone(streak: number): number {
  for (let i = MILESTONES.length - 1; i >= 0; i--) {
    if (MILESTONES[i] <= streak) return MILESTONES[i];
  }
  return 0;
}

/* ── Greeting helper ───────────────────────────────────────── */
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/* ── Background gradient by streak ─────────────────────────── */
function getBackgroundStyle(streak: number): string {
  if (streak >= 30)
    return 'from-[rgba(132,85,0,0.10)] via-[rgba(253,190,102,0.06)] to-[rgba(132,85,0,0.12)]';
  if (streak >= 7)
    return 'from-[rgba(34,103,121,0.10)] via-[rgba(34,103,121,0.03)] to-[rgba(34,103,121,0.08)]';
  return 'from-surface-container-high via-surface-container-low to-surface-container';
}

/* ── Animated counter hook ─────────────────────────────────── */
function useCountUp(target: number, duration = 800): number {
  const [value, setValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafId = useRef<number>(0);

  useEffect(() => {
    startTime.current = null;
    const step = (ts: number) => {
      if (!startTime.current) startTime.current = ts;
      const elapsed = ts - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        rafId.current = requestAnimationFrame(step);
      }
    };
    rafId.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId.current);
  }, [target, duration]);

  return value;
}

export default function DashboardHero({
  userName,
  currentStreak,
  moodTrend,
  journalCount7d,
  trustPoints,
  goals,
}: DashboardHeroProps) {
  const [greeting, setGreeting] = useState('Good morning');
  const [mounted, setMounted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const CELEBRATION_MILESTONES = [1, 3, 7, 14, 30, 60, 90, 180, 365];

  // Animated counters
  const animatedStreak = useCountUp(currentStreak, 1000);
  const animatedJournals = useCountUp(journalCount7d, 700);
  const animatedTrust = useCountUp(trustPoints, 900);

  useEffect(() => {
    setGreeting(getGreeting());
    setMounted(true);

    // Show celebration if streak exactly hits a milestone and not already seen today
    if (CELEBRATION_MILESTONES.includes(currentStreak)) {
      const key = `milestone-celebrated-${currentStreak}`;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, 'true');
        setShowCelebration(true);
      }
    }
  }, [currentStreak]);

  const firstName = userName?.split(' ')[0] || 'there';
  const nextMilestone = getNextMilestone(currentStreak);
  const prevMilestone = getPrevMilestone(currentStreak);
  const progress = nextMilestone === prevMilestone
    ? 1
    : (currentStreak - prevMilestone) / (nextMilestone - prevMilestone);

  // SVG ring values
  const size = 128;
  const strokeWidth = 9;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - Math.min(progress, 1));

  // Mood trajectory text
  let moodText = '';
  if (moodTrend) {
    if (moodTrend.direction === 'up') {
      moodText = `Your mood climbed from ${moodTrend.start.toFixed(1)} to ${moodTrend.end.toFixed(1)} this week`;
    } else if (moodTrend.direction === 'down') {
      moodText = `Your mood dipped from ${moodTrend.start.toFixed(1)} to ${moodTrend.end.toFixed(1)} this week`;
    } else {
      moodText = `Steady mood this week at ${moodTrend.end.toFixed(1)}`;
    }
  }

  const bgGradient = getBackgroundStyle(currentStreak);
  const rivalsTracked = goals.length;

  return (
    <>
    {/* Milestone celebration modal */}
    {showCelebration && (
      <MilestoneCelebration
        milestone={currentStreak}
        userName={firstName}
        communityCount={Math.floor(Math.random() * 400) + 50}
        onDismiss={() => setShowCelebration(false)}
      />
    )}
    <section
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${bgGradient} p-6 sm:p-8 ring-1 ring-outline-variant/10`}
    >
      {/* Animated gradient overlay */}
      <div className="hero-gradient-shift absolute inset-0 pointer-events-none opacity-40 rounded-3xl" />

      {/* Decorative glow orb — top-right accent */}
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary/[0.06] blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Greeting — improved typography hierarchy */}
        <p className="font-label text-[11px] text-on-surface-variant/50 uppercase tracking-[0.2em] mb-1.5">
          Dashboard
        </p>
        <h1 className="font-headline text-2xl sm:text-3xl md:text-[2rem] font-extrabold tracking-tight text-on-surface mb-1">
          {greeting}, {firstName}
        </h1>
        <p className="font-body text-sm text-on-surface-variant/70 mb-6">
          {currentStreak === 0
            ? 'Ready to start building momentum?'
            : currentStreak >= 30
              ? 'You\'re on an incredible run. Keep going.'
              : 'Every day you show up, you grow stronger.'}
        </p>

        {/* Momentum Score — primary engagement indicator */}
        <div className="mb-6">
          <MomentumScore />
        </div>

        {/* Main content row */}
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
          {/* Streak ring — with shimmer effect */}
          <div className="relative shrink-0 group">
            {/* Shimmer glow behind the ring */}
            <div className="hero-streak-shimmer absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <svg width={size} height={size} className="transform -rotate-90 drop-shadow-sm">
              {/* Background track */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                className="text-outline-variant/20 dark:text-outline-variant/15"
                strokeWidth={strokeWidth}
              />
              {/* Progress arc */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="url(#streakGradient)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={mounted ? dashOffset : circumference}
                style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.22, 1, 0.36, 1)' }}
              />
              {/* Gradient definition for the arc */}
              <defs>
                <linearGradient id="streakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  {currentStreak >= 30 ? (
                    <>
                      <stop offset="0%" stopColor="var(--color-tertiary)" />
                      <stop offset="100%" stopColor="var(--color-tertiary-container)" />
                    </>
                  ) : currentStreak >= 7 ? (
                    <>
                      <stop offset="0%" stopColor="var(--color-primary)" />
                      <stop offset="100%" stopColor="var(--color-primary-container)" />
                    </>
                  ) : (
                    <>
                      <stop offset="0%" stopColor="var(--color-on-surface-variant)" />
                      <stop offset="100%" stopColor="var(--color-outline)" />
                    </>
                  )}
                </linearGradient>
              </defs>
            </svg>
            {/* Center number — animated count-up */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-headline text-3xl font-extrabold text-on-surface leading-none tabular-nums">
                {animatedStreak}
              </span>
              <span className="font-label text-[10px] text-on-surface-variant/70 uppercase tracking-wider mt-0.5">
                {currentStreak === 1 ? 'day' : 'days'}
              </span>
            </div>
          </div>

          {/* Text content */}
          <div className="flex-1 text-center sm:text-left space-y-3">
            {/* Streak context */}
            <p className="font-body text-sm text-on-surface-variant">
              {currentStreak === 0
                ? 'Start your streak today. Every day counts.'
                : `${nextMilestone - currentStreak} day${nextMilestone - currentStreak !== 1 ? 's' : ''} until your ${nextMilestone}-day milestone`}
            </p>

            {/* Mood trajectory */}
            {moodText && (
              <p className="font-body text-sm text-on-surface flex items-center gap-1.5 justify-center sm:justify-start">
                <span className="material-symbols-outlined text-base text-primary">
                  {moodTrend?.direction === 'up'
                    ? 'trending_up'
                    : moodTrend?.direction === 'down'
                      ? 'trending_down'
                      : 'trending_flat'}
                </span>
                {moodText}
              </p>
            )}

            {/* Quick stats pills — with animated values and hover states */}
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-lowest dark:bg-surface-container-high text-xs font-label font-medium text-on-surface ring-1 ring-outline-variant/15 hover:ring-primary/30 transition-all duration-300 hover:shadow-sm">
                <span className="material-symbols-outlined text-sm text-primary">edit_note</span>
                <span className="tabular-nums">{animatedJournals}</span> journal{journalCount7d !== 1 ? 's' : ''} this week
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-lowest dark:bg-surface-container-high text-xs font-label font-medium text-on-surface ring-1 ring-outline-variant/15 hover:ring-tertiary/30 transition-all duration-300 hover:shadow-sm">
                <span className="material-symbols-outlined text-sm text-tertiary">stars</span>
                <span className="tabular-nums">{animatedTrust}</span> trust pts
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-lowest dark:bg-surface-container-high text-xs font-label font-medium text-on-surface ring-1 ring-outline-variant/15 hover:ring-secondary/30 transition-all duration-300 hover:shadow-sm">
                <span className="material-symbols-outlined text-sm text-secondary">flag</span>
                {rivalsTracked} rival{rivalsTracked !== 1 ? 's' : ''} tracked
              </span>
            </div>
          </div>
        </div>

        {/* Quick action row — improved hover feedback */}
        <div className="flex flex-wrap gap-2.5 mt-8 justify-center sm:justify-start">
          <Link
            href="/dashboard/stringer-journal"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-on-primary text-sm font-label font-semibold hover:bg-primary-dim hover:shadow-md hover:shadow-primary/20 transition-all duration-300 shadow-sm"
          >
            <span className="material-symbols-outlined text-base">edit_note</span>
            Journal
          </Link>
          <Link
            href="/dashboard/checkins"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface-container-lowest dark:bg-surface-container-high text-on-surface text-sm font-label font-semibold ring-1 ring-outline-variant/20 hover:ring-primary/40 hover:shadow-sm transition-all duration-300"
          >
            <span className="material-symbols-outlined text-base">check_circle</span>
            Check-in
          </Link>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface-container-lowest dark:bg-surface-container-high text-on-surface text-sm font-label font-semibold ring-1 ring-outline-variant/20 hover:ring-primary/40 hover:shadow-sm transition-all duration-300"
          >
            <span className="material-symbols-outlined text-base">psychology</span>
            Coach
          </button>
        </div>
      </div>

      {/* CSS animations for gradient shift + streak shimmer */}
      <style jsx>{`
        .hero-gradient-shift {
          background: linear-gradient(
            135deg,
            transparent 0%,
            rgba(34, 103, 121, 0.05) 25%,
            transparent 45%,
            rgba(132, 85, 0, 0.04) 65%,
            transparent 85%,
            rgba(34, 103, 121, 0.03) 100%
          );
          background-size: 300% 300%;
          animation: heroShift 12s ease-in-out infinite;
        }
        @keyframes heroShift {
          0% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
          100% { background-position: 0% 0%; }
        }
        .hero-streak-shimmer {
          background: conic-gradient(
            from 0deg,
            transparent 0%,
            rgba(34, 103, 121, 0.08) 10%,
            transparent 20%,
            transparent 100%
          );
          animation: shimmerRotate 4s linear infinite;
        }
        @keyframes shimmerRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
    </>
  );
}
