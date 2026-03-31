'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Step {
  key: string;
  title: string;
  description: string;
  icon: string;
  href: string;
}

const STEPS: Step[] = [
  {
    key: 'checkin_configured',
    title: 'Set your check-in schedule',
    description: 'Choose when and how often you want to check in.',
    icon: 'schedule',
    href: '/dashboard/settings',
  },
  {
    key: 'focus_started',
    title: 'Start your Focus Board',
    description: 'Begin tracking your daily morning and evening focus.',
    icon: 'center_focus_strong',
    href: '/dashboard/focus',
  },
  {
    key: 'first_journal',
    title: 'Write your first journal entry',
    description: 'Reflect on your day in the Candid Journal.',
    icon: 'edit_note',
    href: '/dashboard/stringer-journal',
  },
  {
    key: 'first_checkin',
    title: 'Complete your first check-in',
    description: 'Log how you\'re doing to build your streak.',
    icon: 'check_circle',
    href: '/dashboard/checkins',
  },
];

interface GettingStartedCardProps {
  completedSteps: Record<string, boolean>;
  onDismiss: () => void;
}

export default function GettingStartedCard({ completedSteps, onDismiss }: GettingStartedCardProps) {
  const [dismissed, setDismissed] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  const completedCount = STEPS.filter((s) => completedSteps[s.key]).length;
  const allDone = completedCount === STEPS.length;
  const progressPercent = (completedCount / STEPS.length) * 100;

  // Auto-dismiss after celebration
  useEffect(() => {
    if (allDone && !celebrating) {
      setCelebrating(true);
      const timer = setTimeout(() => {
        setDismissed(true);
        onDismiss();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [allDone, celebrating, onDismiss]);

  if (dismissed) return null;

  return (
    <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-primary/15 border-l-4 border-primary p-5 motion-safe:animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/[0.08] flex items-center justify-center shrink-0">
            <span
              className="material-symbols-outlined text-primary text-lg"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {allDone ? 'celebration' : 'rocket_launch'}
            </span>
          </div>
          <div>
            <h3 className="font-headline text-base font-bold text-on-surface">
              {allDone ? 'All set!' : 'Getting Started'}
            </h3>
            <p className="font-label text-xs text-primary font-medium">
              {allDone
                ? 'You\'re ready to go — great job!'
                : `${completedCount} of ${STEPS.length} complete`}
            </p>
          </div>
        </div>

        {!allDone && (
          <button
            onClick={() => { setDismissed(true); onDismiss(); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant/40 hover:text-on-surface-variant hover:bg-surface-container cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 shrink-0"
            aria-label="Dismiss getting started"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-surface-container rounded-full overflow-hidden mb-5">
        <div
          className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Steps */}
      {!allDone && (
        <div className="space-y-1.5">
          {STEPS.map((step) => {
            const done = completedSteps[step.key];
            return (
              <Link
                key={step.key}
                href={step.href}
                className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all duration-200 cursor-pointer group ${
                  done
                    ? 'opacity-50'
                    : 'hover:bg-surface-container-low hover:ring-1 hover:ring-outline-variant/10'
                }`}
              >
                {/* Check circle */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                    done
                      ? 'bg-primary'
                      : 'ring-2 ring-outline-variant/30 group-hover:ring-primary/40'
                  }`}
                >
                  {done && (
                    <span className="material-symbols-outlined text-on-primary text-sm">check</span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`font-label text-sm font-medium ${
                    done ? 'text-on-surface-variant line-through' : 'text-on-surface'
                  }`}>
                    {step.title}
                  </p>
                  <p className="font-body text-xs text-on-surface-variant/70 truncate">
                    {step.description}
                  </p>
                </div>

                {/* Arrow / done */}
                {done ? (
                  <span className="font-label text-[10px] font-semibold text-primary bg-primary/[0.08] px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Done
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-outline-variant/40 text-lg group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200">
                    chevron_right
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
