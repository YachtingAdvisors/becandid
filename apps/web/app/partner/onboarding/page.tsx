'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const STEPS = [
  {
    icon: 'favorite',
    title: 'You Matter Here',
    body: 'Someone chose you because they trust you. Being an accountability partner isn\'t about policing — it\'s about showing up. Your presence alone makes a difference.',
    highlight: 'You don\'t need to fix anything. Just be present.',
  },
  {
    icon: 'forum',
    title: 'When Alerts Come',
    body: 'If your partner gets flagged, you\'ll receive a notification with an AI-generated conversation guide. It tells you what to say, what NOT to say, and how to lead with curiosity instead of judgment. Read it before you talk.',
    highlight: 'The guide is your playbook. Use it.',
  },
  {
    icon: 'check_circle',
    title: 'Check-ins',
    body: 'You\'ll receive periodic check-ins where you share how you feel about their progress — confident, hopeful, concerned, or worried. Your honest assessment helps them see how they\'re showing up to the people who matter.',
    highlight: 'Both of you confirm. Both of you grow.',
  },
  {
    icon: 'explore',
    title: 'Your Own Journey (Optional)',
    body: 'You can also use Be Candid for yourself — set your own rivals, track your own screen time, and invite your own accountability partner. It\'s completely optional, but those who do get the most out of the experience.',
    highlight: 'Add a partner of your own and get 30 free days instead of 15.',
  },
];

export default function PartnerOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  async function handleComplete() {
    setLoading(true);
    router.push('/partner/focus');
  }

  async function handleStartOwnJourney() {
    setLoading(true);
    // Redirect to onboarding with partner step so they can invite someone
    // and earn 30 days instead of 15
    router.push('/onboarding?step=partner&bonus=true');
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12 overflow-x-hidden">
      <div className="w-full max-w-md space-y-6">
        {/* Progress */}
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors ${
              i <= step ? 'bg-primary' : 'bg-outline-variant'
            }`} />
          ))}
        </div>

        {/* Card */}
        <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>{current.icon}</span>
          </div>
          <h2 className="font-headline text-2xl font-bold text-on-surface mb-4">{current.title}</h2>
          <p className="text-sm text-on-surface-variant leading-relaxed mb-4 font-body">{current.body}</p>
          <div className="px-4 py-3 rounded-2xl bg-primary-container/30 border border-primary/20">
            <p className="text-sm text-primary font-medium font-label">{current.highlight}</p>
          </div>
        </div>

        {/* Last step: two CTAs */}
        {isLast && (
          <div className="space-y-3">
            <button onClick={handleStartOwnJourney} disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-on-primary rounded-full font-headline font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer">
              <span className="material-symbols-outlined text-lg">rocket_launch</span>
              Start My Own Journey (30 Free Days)
            </button>
            <button onClick={handleComplete} disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 text-on-surface-variant rounded-full font-label font-medium text-sm ring-1 ring-outline-variant hover:bg-surface-container-low transition-all cursor-pointer">
              {loading ? 'Loading...' : 'Skip for now — just be a partner'}
            </button>
          </div>
        )}

        {/* Navigation (non-last steps) */}
        {!isLast && (
          <div className="flex gap-3">
            {step > 0 && (
              <button onClick={() => setStep(step - 1)} className="flex items-center gap-1 px-4 py-3 text-sm font-label font-medium text-on-surface-variant hover:bg-surface-container-low rounded-full transition-all cursor-pointer">
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                Back
              </button>
            )}
            <button onClick={() => setStep(step + 1)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-on-primary rounded-full font-headline font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-110 transition-all cursor-pointer">
              Continue
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
