'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ── Step backgrounds: dark-to-light sunrise gradient ──────────
const STEP_BACKGROUNDS = ['#0f1218', '#1a1520', '#5c3a2e', '#fbf9f8'];
const STEP_TEXT_LIGHT = [true, true, true, false]; // true = light text on dark bg

// ── Step 2 data ───────────────────────────────────────────────
const PARTNER_SEES = [
  { icon: 'flag', text: 'Flags by category and severity', detail: 'You see that something happened and how serious it was — not what they were looking at.' },
  { icon: 'schedule', text: 'When flags occurred', detail: 'Date and time only. No URLs, no screenshots, no browsing history.' },
  { icon: 'trending_up', text: 'Their focus streak', detail: 'How many consecutive days they have stayed focused. Streaks reset on a flag but rebuild immediately.' },
  { icon: 'forum', text: 'AI conversation guides', detail: 'Personalized guides for how to have a meaningful, non-judgmental conversation with them.' },
  { icon: 'edit_note', text: 'Journal activity (not content)', detail: 'You see "3 entries this week" — never what they wrote. Their reflections stay private.' },
];

const PARTNER_NEVER_SEES = [
  { icon: 'lock', text: 'URLs or websites visited' },
  { icon: 'lock', text: 'Screenshots or screen recordings' },
  { icon: 'lock', text: 'Journal entries or reflections' },
  { icon: 'lock', text: 'Browsing history of any kind' },
  { icon: 'lock', text: 'Mood or check-in responses' },
];

// ── Step 3 data ───────────────────────────────────────────────
const HOW_TO_SHOW_UP = [
  {
    icon: 'favorite',
    title: 'Lead with gratitude',
    body: 'When they confess, start with "Thank you for telling me." Those five words create safety.',
  },
  {
    icon: 'help',
    title: 'Ask what they need',
    body: '"What do you need from me right now?" lets them guide the conversation instead of feeling lectured.',
  },
  {
    icon: 'do_not_disturb',
    title: "Don't lecture, fix, or compare",
    body: 'They already know. What they need is someone who won\'t flinch — not advice, not a sermon.',
  },
  {
    icon: 'self_care',
    title: 'Take care of yourself too',
    body: "Being an accountability partner is meaningful and heavy. You're allowed to have boundaries and feelings.",
  },
];

export default function PartnerOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [animating, setAnimating] = useState(false);
  const [visibilityTab, setVisibilityTab] = useState<'sees' | 'never'>('sees');

  const totalSteps = 4;
  const isLight = !STEP_TEXT_LIGHT[step];

  function goTo(next: number) {
    if (animating || next === step) return;
    setDirection(next > step ? 'forward' : 'backward');
    setAnimating(true);
    setTimeout(() => {
      setStep(next);
      setAnimating(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 200);
  }

  function handleComplete() {
    // Mark onboarding as complete in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('partner_onboarding_complete', 'true');
    }
    router.push('/partner');
  }

  // Interpolated background
  const bg = STEP_BACKGROUNDS[step];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 overflow-x-hidden transition-colors duration-700 ease-in-out"
      style={{ backgroundColor: bg }}
    >
      <div className={`w-full max-w-md space-y-6 transition-opacity duration-200 ${animating ? 'opacity-0' : 'opacity-100'}`}>
        {/* ── Progress indicator ─────────────────────────── */}
        <div className="flex gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1.5 rounded-full transition-all duration-500"
              style={{
                backgroundColor: i <= step
                  ? (isLight ? '#226779' : '#7ec8db')
                  : (isLight ? '#e0e0e0' : 'rgba(255,255,255,0.15)'),
              }}
            />
          ))}
        </div>

        <p
          className="text-xs font-label font-medium uppercase tracking-widest text-center transition-colors duration-500"
          style={{ color: isLight ? '#226779' : 'rgba(255,255,255,0.5)' }}
        >
          Step {step + 1} of {totalSteps}
        </p>

        {/* ── Step content ───────────────────────────────── */}
        {step === 0 && <StepWelcome isLight={isLight} />}
        {step === 1 && <StepVisibility isLight={isLight} tab={visibilityTab} setTab={setVisibilityTab} />}
        {step === 2 && <StepHowToShowUp isLight={isLight} />}
        {step === 3 && <StepReady />}

        {/* ── Navigation ─────────────────────────────────── */}
        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={() => goTo(step - 1)}
              className="flex items-center gap-1 px-4 py-3 text-sm font-label font-medium rounded-full transition-all cursor-pointer"
              style={{
                color: isLight ? '#444' : 'rgba(255,255,255,0.7)',
              }}
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Back
            </button>
          )}
          {step < totalSteps - 1 ? (
            <button
              onClick={() => goTo(step + 1)}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full font-headline font-bold text-sm shadow-lg transition-all cursor-pointer hover:shadow-xl hover:brightness-110"
              style={{
                backgroundColor: isLight ? '#226779' : '#7ec8db',
                color: isLight ? '#fff' : '#0f1218',
              }}
            >
              Continue
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-primary text-on-primary rounded-full font-headline font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-110 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">check_circle</span>
              Go to Dashboard
            </button>
          )}
        </div>

        {/* Skip link on first 3 steps */}
        {step < totalSteps - 1 && (
          <button
            onClick={handleComplete}
            className="block w-full text-center text-xs font-label cursor-pointer transition-colors"
            style={{ color: isLight ? '#888' : 'rgba(255,255,255,0.35)' }}
          >
            Skip tour and go to dashboard
          </button>
        )}
      </div>
    </div>
  );
}

// ── Step 1: Welcome ─────────────────────────────────────────

function StepWelcome({ isLight }: { isLight: boolean }) {
  return (
    <div className="text-center space-y-5">
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto"
        style={{ backgroundColor: isLight ? 'rgba(34,103,121,0.1)' : 'rgba(126,200,219,0.1)' }}
      >
        <span
          className="material-symbols-outlined text-5xl"
          style={{ fontVariationSettings: "'FILL' 1", color: isLight ? '#226779' : '#7ec8db' }}
        >
          handshake
        </span>
      </div>

      <h1
        className="text-3xl font-headline font-extrabold tracking-tight transition-colors duration-500"
        style={{ color: isLight ? '#1a1a1a' : '#f5f0eb' }}
      >
        Welcome, Partner
      </h1>

      <p
        className="text-base leading-relaxed font-body"
        style={{ color: isLight ? '#555' : 'rgba(255,255,255,0.8)' }}
      >
        Someone trusts you enough to invite you into their journey.
      </p>

      <div
        className="rounded-3xl p-6 text-left space-y-4"
        style={{
          backgroundColor: isLight ? 'rgba(34,103,121,0.05)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${isLight ? 'rgba(34,103,121,0.15)' : 'rgba(255,255,255,0.1)'}`,
        }}
      >
        <p
          className="text-sm leading-relaxed font-body"
          style={{ color: isLight ? '#444' : 'rgba(255,255,255,0.85)' }}
        >
          Be Candid helps people align their digital life with who they want to be. It
          watches for patterns, not content, and uses honest conversations instead of
          shame to help people grow.
        </p>
        <p
          className="text-sm leading-relaxed font-body"
          style={{ color: isLight ? '#444' : 'rgba(255,255,255,0.85)' }}
        >
          You don&apos;t need to install anything or learn a system. Your role is
          simpler and harder: to be someone who shows up with honesty and care.
        </p>
      </div>

      <div
        className="rounded-2xl px-5 py-3"
        style={{
          backgroundColor: isLight ? 'rgba(34,103,121,0.08)' : 'rgba(126,200,219,0.1)',
          border: `1px solid ${isLight ? 'rgba(34,103,121,0.2)' : 'rgba(126,200,219,0.2)'}`,
        }}
      >
        <p
          className="text-sm font-medium font-label"
          style={{ color: isLight ? '#226779' : '#7ec8db' }}
        >
          You&apos;re here because someone chose honesty. Let&apos;s set you up.
        </p>
      </div>
    </div>
  );
}

// ── Step 2: What You'll See ─────────────────────────────────

function StepVisibility({
  isLight,
  tab,
  setTab,
}: {
  isLight: boolean;
  tab: 'sees' | 'never';
  setTab: (t: 'sees' | 'never') => void;
}) {
  return (
    <div className="space-y-5">
      <div className="text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: isLight ? 'rgba(34,103,121,0.1)' : 'rgba(126,200,219,0.1)' }}
        >
          <span
            className="material-symbols-outlined text-4xl"
            style={{ color: isLight ? '#226779' : '#7ec8db' }}
          >
            visibility
          </span>
        </div>
        <h2
          className="text-2xl font-headline font-bold mb-2"
          style={{ color: isLight ? '#1a1a1a' : '#f5f0eb' }}
        >
          What You&apos;ll See
        </h2>
        <p
          className="text-sm leading-relaxed font-body"
          style={{ color: isLight ? '#555' : 'rgba(255,255,255,0.7)' }}
        >
          Your role is presence, not surveillance. Here&apos;s exactly what you can and cannot see.
        </p>
      </div>

      {/* Tab toggle */}
      <div
        className="flex rounded-full p-1"
        style={{ backgroundColor: isLight ? '#e8e8e8' : 'rgba(255,255,255,0.08)' }}
      >
        <button
          onClick={() => setTab('sees')}
          className={`flex-1 py-2.5 text-sm font-label font-medium rounded-full transition-all cursor-pointer ${
            tab === 'sees' ? 'shadow-sm' : ''
          }`}
          style={{
            backgroundColor: tab === 'sees' ? (isLight ? '#fff' : 'rgba(255,255,255,0.12)') : 'transparent',
            color: tab === 'sees'
              ? (isLight ? '#1a1a1a' : '#f5f0eb')
              : (isLight ? '#888' : 'rgba(255,255,255,0.4)'),
          }}
        >
          You can see
        </button>
        <button
          onClick={() => setTab('never')}
          className={`flex-1 py-2.5 text-sm font-label font-medium rounded-full transition-all cursor-pointer ${
            tab === 'never' ? 'shadow-sm' : ''
          }`}
          style={{
            backgroundColor: tab === 'never' ? (isLight ? '#fff' : 'rgba(255,255,255,0.12)') : 'transparent',
            color: tab === 'never'
              ? (isLight ? '#1a1a1a' : '#f5f0eb')
              : (isLight ? '#888' : 'rgba(255,255,255,0.4)'),
          }}
        >
          You never see
        </button>
      </div>

      {/* Content */}
      {tab === 'sees' ? (
        <div className="space-y-3">
          {PARTNER_SEES.map((item, i) => (
            <div
              key={i}
              className="p-3.5 rounded-2xl"
              style={{
                backgroundColor: isLight ? '#fff' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${isLight ? '#e0e0e0' : 'rgba(255,255,255,0.08)'}`,
              }}
            >
              <div className="flex items-center gap-3 mb-1">
                <span
                  className="material-symbols-outlined text-lg"
                  style={{ color: isLight ? '#226779' : '#7ec8db' }}
                >
                  {item.icon}
                </span>
                <p
                  className="text-sm font-medium font-label"
                  style={{ color: isLight ? '#1a1a1a' : '#f5f0eb' }}
                >
                  {item.text}
                </p>
              </div>
              <p
                className="text-xs leading-relaxed pl-8 font-body"
                style={{ color: isLight ? '#666' : 'rgba(255,255,255,0.5)' }}
              >
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {PARTNER_NEVER_SEES.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3.5 rounded-2xl"
              style={{
                backgroundColor: isLight ? 'rgba(34,103,121,0.06)' : 'rgba(126,200,219,0.08)',
                border: `1px solid ${isLight ? 'rgba(34,103,121,0.12)' : 'rgba(126,200,219,0.12)'}`,
              }}
            >
              <span
                className="material-symbols-outlined text-lg"
                style={{ color: isLight ? '#226779' : '#7ec8db' }}
              >
                {item.icon}
              </span>
              <p
                className="text-sm font-medium font-label"
                style={{ color: isLight ? '#1a1a1a' : '#f5f0eb' }}
              >
                {item.text}
              </p>
            </div>
          ))}
          <div
            className="mt-3 p-3 rounded-2xl"
            style={{
              backgroundColor: isLight ? 'rgba(34,103,121,0.04)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${isLight ? 'rgba(34,103,121,0.1)' : 'rgba(255,255,255,0.06)'}`,
            }}
          >
            <p
              className="text-xs italic leading-relaxed font-body"
              style={{ color: isLight ? '#666' : 'rgba(255,255,255,0.5)' }}
            >
              Privacy is fundamental. You see patterns and progress, never content.
              Trust is built through honesty, not monitoring.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Step 3: How to Show Up ──────────────────────────────────

function StepHowToShowUp({ isLight }: { isLight: boolean }) {
  return (
    <div className="space-y-5">
      <div className="text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: isLight ? 'rgba(34,103,121,0.1)' : 'rgba(126,200,219,0.1)' }}
        >
          <span
            className="material-symbols-outlined text-4xl"
            style={{ fontVariationSettings: "'FILL' 1", color: isLight ? '#226779' : '#7ec8db' }}
          >
            shield_person
          </span>
        </div>
        <h2
          className="text-2xl font-headline font-bold mb-2"
          style={{ color: isLight ? '#1a1a1a' : '#f5f0eb' }}
        >
          How to Show Up
        </h2>
        <p
          className="text-sm leading-relaxed font-body"
          style={{ color: isLight ? '#555' : 'rgba(255,255,255,0.7)' }}
        >
          You don&apos;t need to be a therapist. Here are four principles that make all the difference.
        </p>
      </div>

      <div className="space-y-3">
        {HOW_TO_SHOW_UP.map((item, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl"
            style={{
              backgroundColor: isLight ? '#fff' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${isLight ? '#e0e0e0' : 'rgba(255,255,255,0.08)'}`,
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: isLight ? 'rgba(34,103,121,0.1)' : 'rgba(126,200,219,0.1)' }}
              >
                <span
                  className="material-symbols-outlined text-lg"
                  style={{ color: isLight ? '#226779' : '#7ec8db' }}
                >
                  {item.icon}
                </span>
              </div>
              <div>
                <p
                  className="text-sm font-bold font-headline mb-1"
                  style={{ color: isLight ? '#1a1a1a' : '#f5f0eb' }}
                >
                  {item.title}
                </p>
                <p
                  className="text-xs leading-relaxed font-body"
                  style={{ color: isLight ? '#555' : 'rgba(255,255,255,0.65)' }}
                >
                  {item.body}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Link to full training */}
      <Link
        href="/partner/training"
        className="flex items-center justify-center gap-2 py-3 rounded-2xl transition-all"
        style={{
          backgroundColor: isLight ? 'rgba(34,103,121,0.06)' : 'rgba(126,200,219,0.08)',
          border: `1px solid ${isLight ? 'rgba(34,103,121,0.15)' : 'rgba(126,200,219,0.15)'}`,
          color: isLight ? '#226779' : '#7ec8db',
        }}
      >
        <span className="material-symbols-outlined text-lg">school</span>
        <span className="text-sm font-headline font-bold">Read the complete Partner Guide</span>
        <span className="text-sm">&rarr;</span>
      </Link>
    </div>
  );
}

// ── Step 4: You're Ready ────────────────────────────────────

function StepReady() {
  return (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto">
        <span
          className="material-symbols-outlined text-5xl text-primary"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          check_circle
        </span>
      </div>

      <h2 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight">
        You&apos;re Ready
      </h2>

      <p className="text-base text-on-surface-variant leading-relaxed font-body">
        You&apos;re now connected as an accountability partner. Your presence matters
        more than you know.
      </p>

      {/* Quick links */}
      <div className="space-y-3">
        <Link
          href="/partner"
          className="flex items-center gap-3 p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant hover:border-primary/30 hover:shadow-md transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-xl">dashboard</span>
          </div>
          <div className="text-left flex-1">
            <p className="text-sm font-bold font-headline text-on-surface">View Dashboard</p>
            <p className="text-xs text-on-surface-variant font-body">See streaks, stats, and actions</p>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant text-lg">chevron_right</span>
        </Link>

        <Link
          href="/partner/training"
          className="flex items-center gap-3 p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant hover:border-primary/30 hover:shadow-md transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-xl">school</span>
          </div>
          <div className="text-left flex-1">
            <p className="text-sm font-bold font-headline text-on-surface">Read the Partner Guide</p>
            <p className="text-xs text-on-surface-variant font-body">Deep dive into accountability</p>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant text-lg">chevron_right</span>
        </Link>

        <Link
          href="/settings/notifications"
          className="flex items-center gap-3 p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant hover:border-primary/30 hover:shadow-md transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-xl">notifications</span>
          </div>
          <div className="text-left flex-1">
            <p className="text-sm font-bold font-headline text-on-surface">Set Notification Preferences</p>
            <p className="text-xs text-on-surface-variant font-body">Choose how and when you hear from us</p>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant text-lg">chevron_right</span>
        </Link>
      </div>

      <div className="rounded-2xl px-5 py-4 bg-primary-container/30 border border-primary/20">
        <p className="text-sm text-primary font-medium font-label">
          Your presence matters more than you know. Just showing up is the hardest
          and most important part.
        </p>
      </div>
    </div>
  );
}
