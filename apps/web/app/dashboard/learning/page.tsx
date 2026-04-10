'use client';

import { useState } from 'react';

// ── LASER steps ───────────────────────────────────────────────

interface LaserStep {
  letter: string;
  title: string;
  tagline: string;
  body: string;
  prompt: string;
  icon: string;
  color: string;
  bgGradient: string;
}

const LASER_STEPS: LaserStep[] = [
  {
    letter: 'L',
    title: 'Locate',
    tagline: 'Where am I right now?',
    body: 'Ask yourself: what am I about to do, and what have I done so far? Who is within reach, and what unlikely escape has made itself available to me? Locating yourself in the moment is the first step to breaking autopilot. Most unwanted behavior happens when we stop noticing where we are.',
    prompt: 'Take 10 seconds. Look around. Name where you are, what device you are on, and what you were about to do.',
    icon: 'my_location',
    color: 'text-sky-500',
    bgGradient: 'from-sky-500/10 to-sky-600/5',
  },
  {
    letter: 'A',
    title: 'Acknowledge Without Shame',
    tagline: 'Shame is the #1 driver of unwanted behavior.',
    body: 'Research has found shame is the number-one driver of unwanted behavior \u2014 300\u00d7 more likely per unit of shame. L.A.S.E.R. disarms it instead of adding to it. What was happening emotionally, relationally, physically in the hour \u2014 even the minutes \u2014 before? Acknowledge this without shame and acknowledge the place it has brought you to.',
    prompt: 'Complete the sentence: "Before this moment, I was feeling ___ because ___."',
    icon: 'self_improvement',
    color: 'text-amber-500',
    bgGradient: 'from-amber-500/10 to-amber-600/5',
  },
  {
    letter: 'S',
    title: 'Surface',
    tagline: 'Name the need beneath the wave.',
    body: 'Beneath every struggle is a legitimate need \u2014 belonging, rest, agency, tenderness. Name it without judgment. Surface it, as it is often beneath the waves and rushing water of the emotions you have just experienced. Your unwanted behavior was never really about the behavior itself; it was about the unmet need driving it.',
    prompt: 'What did you actually need in that moment? Belonging? Rest? Control? Comfort? Name it.',
    icon: 'water',
    color: 'text-teal-500',
    bgGradient: 'from-teal-500/10 to-teal-600/5',
  },
  {
    letter: 'E',
    title: 'Engage',
    tagline: 'Your behavior is not random. There is information here.',
    body: 'Reach out to others. Your behavior is not random. There is information here to be discussed, not condemnation to wallow in alone. Whether it is a partner, a friend, a therapist, or a group \u2014 engaging breaks the isolation that unwanted behavior thrives in.',
    prompt: 'Who is one person you could reach out to right now? Open their contact. You do not have to have the perfect words.',
    icon: 'group',
    color: 'text-violet-500',
    bgGradient: 'from-violet-500/10 to-violet-600/5',
  },
  {
    letter: 'R',
    title: 'Restart',
    tagline: 'There is no limit to beginning again.',
    body: 'There is no limit to the human ability to begin again after any setback. Turning setbacks into comebacks is the stuff history was made of. A restart is not failure \u2014 it is the bravest thing you can do. Every single person you admire has restarted more times than you know.',
    prompt: 'Say it out loud or write it down: "I am restarting right now. This setback does not define me."',
    icon: 'restart_alt',
    color: 'text-emerald-500',
    bgGradient: 'from-emerald-500/10 to-emerald-600/5',
  },
];

// ── Lesson metadata ───────────────────────────────────────────

interface Lesson {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  icon: string;
  available: boolean;
}

const LESSONS: Lesson[] = [
  { id: 'laser', number: 1, title: 'The L.A.S.E.R. Framework', subtitle: 'A 5-step reset for any moment of struggle', icon: 'bolt', available: true },
  { id: 'tributaries', number: 2, title: 'Tributaries', subtitle: 'Tracing what flows into your behavior', icon: 'water', available: false },
  { id: 'longing', number: 3, title: 'The Unmet Longing', subtitle: 'What did you actually need?', icon: 'favorite', available: false },
  { id: 'roadmap', number: 4, title: 'The Roadmap', subtitle: 'What is this revealing about who you want to become?', icon: 'map', available: false },
  { id: 'shame-resilience', number: 5, title: 'Shame Resilience', subtitle: 'Why shame fuels the cycle and how to break it', icon: 'shield', available: false },
];

// ── Page ──────────────────────────────────────────────────────

export default function LearningPage() {
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (idx: number) => {
    setExpandedStep(expandedStep === idx ? null : idx);
  };

  const markComplete = (idx: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  // ── Lesson list view ────────────────────────────────────────

  if (!activeLesson) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 stagger">
        {/* Header */}
        <div className="flex items-center gap-3">
          <span
            className="material-symbols-outlined text-primary text-3xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            school
          </span>
          <div>
            <p className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-widest">
              Growth
            </p>
            <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">
              Learning
            </h1>
            <p className="text-sm text-on-surface-variant font-body">
              Short lessons grounded in research. Learn the frameworks that make accountability work.
            </p>
          </div>
        </div>

        {/* Intro card */}
        <div className="bg-gradient-to-br from-primary-container/40 to-emerald-50/60 rounded-2xl ring-1 ring-primary/10 p-5">
          <div className="flex items-start gap-3">
            <span
              className="material-symbols-outlined text-primary text-xl mt-0.5 flex-shrink-0"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              lightbulb
            </span>
            <div>
              <p className="text-sm text-on-surface leading-relaxed font-body">
                These lessons are designed to be read in moments of calm so the ideas are ready when you need them most.
                Each one takes about 5 minutes.
              </p>
            </div>
          </div>
        </div>

        {/* Lesson cards */}
        <div className="space-y-3">
          {LESSONS.map((lesson) => (
            <button
              key={lesson.id}
              onClick={() => lesson.available && setActiveLesson(lesson.id)}
              disabled={!lesson.available}
              className={`w-full text-left rounded-2xl ring-1 p-5 transition-all duration-200 ${
                lesson.available
                  ? 'ring-outline-variant/30 bg-surface-container-lowest hover:ring-primary/30 hover:bg-primary-container/10 cursor-pointer'
                  : 'ring-outline-variant/10 bg-surface-container-low/50 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    lesson.available
                      ? 'bg-primary/10 text-primary'
                      : 'bg-on-surface/5 text-on-surface-variant/50'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {lesson.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider">
                      Lesson {lesson.number}
                    </span>
                    {!lesson.available && (
                      <span className="text-[10px] font-label font-semibold uppercase tracking-wider bg-on-surface/5 text-on-surface-variant/60 px-2 py-0.5 rounded-full">
                        Coming soon
                      </span>
                    )}
                  </div>
                  <p className="font-headline text-base font-bold text-on-surface mt-0.5">
                    {lesson.title}
                  </p>
                  <p className="text-sm text-on-surface-variant font-body mt-0.5">
                    {lesson.subtitle}
                  </p>
                </div>
                {lesson.available && (
                  <span className="material-symbols-outlined text-on-surface-variant text-xl flex-shrink-0">
                    arrow_forward
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── LASER lesson view ───────────────────────────────────────

  const allComplete = completedSteps.size === LASER_STEPS.length;

  return (
    <div className="max-w-3xl mx-auto space-y-8 stagger">
      {/* Back + header */}
      <div>
        <button
          onClick={() => {
            setActiveLesson(null);
            setExpandedStep(null);
            setCompletedSteps(new Set());
          }}
          className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary font-label transition-colors mb-4"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back to lessons
        </button>

        <div className="flex items-center gap-3">
          <span
            className="material-symbols-outlined text-primary text-3xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            bolt
          </span>
          <div>
            <p className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-widest">
              Lesson 1
            </p>
            <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">
              The L.A.S.E.R. Framework
            </h1>
            <p className="text-sm text-on-surface-variant font-body">
              A 5-step reset you can use in any moment of struggle.
            </p>
          </div>
        </div>
      </div>

      {/* Intro */}
      <div className="bg-gradient-to-br from-primary-container/40 to-sky-50/60 rounded-2xl ring-1 ring-primary/10 p-6">
        <p className="text-sm text-on-surface leading-relaxed font-body">
          <strong className="font-headline text-on-surface">L.A.S.E.R.</strong> stands for{' '}
          <strong>Locate, Acknowledge, Surface, Engage, Restart</strong>. It is a framework
          designed to interrupt the autopilot that leads to unwanted behavior. Instead of adding
          shame, it disarms it. Instead of isolation, it moves you toward connection.
        </p>
        <p className="text-sm text-on-surface-variant leading-relaxed font-body mt-3">
          Read through each step below. When you are ready, try the reflection prompt at the end of each one.
        </p>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-surface-container-low rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(completedSteps.size / LASER_STEPS.length) * 100}%` }}
          />
        </div>
        <span className="text-xs font-label font-semibold text-on-surface-variant whitespace-nowrap">
          {completedSteps.size}/{LASER_STEPS.length}
        </span>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {LASER_STEPS.map((step, idx) => {
          const isOpen = expandedStep === idx;
          const isDone = completedSteps.has(idx);

          return (
            <div
              key={step.letter}
              className={`rounded-2xl ring-1 transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'ring-primary/20 bg-surface-container-lowest shadow-sm'
                  : isDone
                    ? 'ring-emerald-300/30 bg-emerald-50/30'
                    : 'ring-outline-variant/20 bg-surface-container-lowest hover:ring-outline-variant/40'
              }`}
            >
              {/* Collapsed header */}
              <button
                onClick={() => toggleStep(idx)}
                className="w-full text-left px-5 py-4 flex items-center gap-4"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-headline font-extrabold text-lg ${
                    isDone
                      ? 'bg-emerald-100 text-emerald-600'
                      : `bg-gradient-to-br ${step.bgGradient} ${step.color}`
                  }`}
                >
                  {isDone ? (
                    <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check
                    </span>
                  ) : (
                    step.letter
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-headline text-base font-bold ${isDone ? 'text-emerald-700' : 'text-on-surface'}`}>
                    {step.letter} &mdash; {step.title}
                  </p>
                  <p className="text-sm text-on-surface-variant font-body mt-0.5 italic">
                    {step.tagline}
                  </p>
                </div>
                <span
                  className={`material-symbols-outlined text-on-surface-variant text-xl flex-shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                >
                  expand_more
                </span>
              </button>

              {/* Expanded content */}
              {isOpen && (
                <div className="px-5 pb-5 space-y-4">
                  <div className="border-t border-outline-variant/15 pt-4">
                    <p className="text-sm text-on-surface leading-relaxed font-body">
                      {step.body}
                    </p>
                  </div>

                  {/* Reflection prompt */}
                  <div className={`rounded-xl bg-gradient-to-br ${step.bgGradient} p-4 ring-1 ring-black/5`}>
                    <div className="flex items-start gap-3">
                      <span
                        className={`material-symbols-outlined text-lg mt-0.5 flex-shrink-0 ${step.color}`}
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {step.icon}
                      </span>
                      <div>
                        <p className="text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                          Try it now
                        </p>
                        <p className="text-sm text-on-surface font-body leading-relaxed">
                          {step.prompt}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mark complete */}
                  <button
                    onClick={() => markComplete(idx)}
                    className={`w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-label font-semibold transition-colors ${
                      isDone
                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50 hover:bg-emerald-100/80'
                        : 'bg-primary/10 text-primary hover:bg-primary/15'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: isDone ? "'FILL' 1" : "'FILL' 0" }}>
                      {isDone ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    {isDone ? 'Completed' : 'Mark as read'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion state */}
      {allComplete && (
        <div className="bg-gradient-to-br from-emerald-50/80 to-primary-container/40 rounded-2xl ring-1 ring-emerald-200/30 p-6 text-center">
          <span
            className="material-symbols-outlined text-4xl text-emerald-600 mb-2 block"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            emoji_events
          </span>
          <p className="font-headline text-lg font-bold text-on-surface mb-1">
            Lesson complete
          </p>
          <p className="text-sm text-on-surface-variant font-body leading-relaxed max-w-md mx-auto">
            You now have L.A.S.E.R. in your toolkit. Next time you feel the pull of autopilot,
            walk through these five steps. They work best when practiced before you need them.
          </p>
          <button
            onClick={() => {
              setActiveLesson(null);
              setExpandedStep(null);
              setCompletedSteps(new Set());
            }}
            className="mt-4 inline-flex items-center gap-2 bg-primary text-on-primary rounded-full px-5 py-2.5 text-sm font-label font-semibold hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to lessons
          </button>
        </div>
      )}
    </div>
  );
}
