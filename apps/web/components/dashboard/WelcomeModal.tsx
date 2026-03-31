'use client';

import { useEffect, useState } from 'react';

const STEPS_PREVIEW = [
  { icon: 'schedule', title: 'Set your check-in schedule' },
  { icon: 'center_focus_strong', title: 'Start your Focus Board' },
  { icon: 'edit_note', title: 'Write your first journal entry' },
  { icon: 'check_circle', title: 'Complete your first check-in' },
];

interface WelcomeModalProps {
  userName: string;
  onGetStarted: () => void;
  onDismiss: () => void;
}

export default function WelcomeModal({ userName, onGetStarted, onDismiss }: WelcomeModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show once per session
    if (sessionStorage.getItem('bc_welcome_shown')) {
      onGetStarted(); // Close immediately, but keep checklist
      return;
    }
    setVisible(true);
    sessionStorage.setItem('bc_welcome_shown', '1');

    // Lock body scroll
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    if (!visible) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setVisible(false);
        onGetStarted();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [visible, onGetStarted]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm motion-safe:animate-[fadeIn_0.2s_ease]"
        onClick={() => { setVisible(false); onGetStarted(); }}
      />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-lg bg-surface-container-lowest rounded-3xl shadow-2xl ring-1 ring-outline-variant/10 p-8 sm:p-10 motion-safe:animate-fade-up">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary-container/40 flex items-center justify-center">
            <span
              className="material-symbols-outlined text-primary text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              waving_hand
            </span>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h2 className="font-headline text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
            Welcome to your dashboard{userName ? `, ${userName}` : ''}!
          </h2>
          <p className="font-body text-sm text-on-surface-variant mt-3 leading-relaxed max-w-sm mx-auto">
            We&apos;ve prepared a quick setup guide to help you get the most out of Be Candid. Here&apos;s what we&apos;ll walk through:
          </p>
        </div>

        {/* Steps preview */}
        <div className="space-y-3 mb-8">
          {STEPS_PREVIEW.map((step, i) => (
            <div
              key={step.icon}
              className="flex items-center gap-3 px-4 py-3 bg-surface-container-low/60 rounded-xl"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/[0.08] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-base">{step.icon}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-label text-xs font-semibold text-primary/60 w-4">{i + 1}.</span>
                <span className="font-label text-sm font-medium text-on-surface">{step.title}</span>
              </div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="space-y-3">
          <button
            onClick={() => { setVisible(false); onGetStarted(); }}
            className="w-full py-4 bg-primary text-on-primary rounded-full font-label font-bold text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-110 active:scale-[0.98] cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 focus:ring-2 focus:ring-primary/30 focus:outline-none"
          >
            Let&apos;s get started
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>

          <button
            onClick={() => {
              setVisible(false);
              onDismiss();
            }}
            className="w-full py-3 text-on-surface-variant/60 hover:text-on-surface font-label text-sm cursor-pointer transition-colors duration-200 focus:ring-2 focus:ring-primary/30 focus:outline-none rounded-full"
          >
            I&apos;ll explore on my own
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
