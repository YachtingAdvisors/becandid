'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const STEPS = [
  {
    icon: 'handshake',
    title: 'Your Role',
    body: 'You\'re not a surveillance officer. You\'re a trusted person who shows up when it matters. Every alert comes with an AI conversation guide designed to help you have a productive, shame-free conversation.',
    highlight: 'Your presence is the intervention.',
  },
  {
    icon: 'check_circle',
    title: 'Check-ins',
    body: 'You\'ll receive periodic check-ins that both of you must confirm. Select how you feel about their progress -- confident, hopeful, concerned, or worried. Your honest assessment helps them see how they\'re showing up to the people who matter.',
    highlight: 'Both of you confirm. Both of you earn trust points.',
  },
  {
    icon: 'forum',
    title: 'Conversation Guides',
    body: 'When an alert fires, you\'ll get an AI guide with specific dos and don\'ts for that category. It tells you how to open the conversation, what NOT to say, and questions to ask. Read it before you talk -- it makes a real difference.',
    highlight: 'The guide is your playbook. Use it.',
  },
  {
    icon: 'block',
    title: 'What Not To Do',
    body: 'Never shame them. Never threaten. Never say "just stop." Never bring it up in front of others. Never use it as ammunition in a fight. If you can\'t be safe, you shouldn\'t be their partner.',
    highlight: 'Your job is safety, not judgment.',
  },
];

export default function PartnerOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [enableMutual, setEnableMutual] = useState(false);
  const [loading, setLoading] = useState(false);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  async function handleComplete() {
    setLoading(true);

    if (enableMutual) {
      await fetch('/api/partners/mutual', { method: 'POST' }).catch(() => {});
    }

    router.push('/partner/focus');
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 stagger">
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
            <span className="material-symbols-outlined text-primary text-4xl">{current.icon}</span>
          </div>
          <h2 className="font-headline text-2xl font-bold text-on-surface mb-4">{current.title}</h2>
          <p className="text-sm text-on-surface-variant leading-relaxed mb-4">{current.body}</p>
          <div className="px-4 py-3 rounded-2xl bg-primary-container/30 border border-primary/20">
            <p className="text-sm text-primary font-medium">{current.highlight}</p>
          </div>
        </div>

        {/* Mutual accountability option (last step) */}
        {isLast && (
          <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-5">
            <button
              onClick={() => setEnableMutual(!enableMutual)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                enableMutual ? 'border-primary bg-primary-container/30' : 'border-outline-variant hover:border-primary/40'
              }`}
            >
              <span className="material-symbols-outlined text-primary text-2xl">sync</span>
              <div className="flex-1">
                <div className="text-sm font-semibold text-on-surface">Enable mutual accountability</div>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Both of you monitor each other. You'll set up your own rivals and get the same features.
                </p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                enableMutual ? 'bg-primary border-primary' : 'border-outline-variant'
              }`}>
                {enableMutual && (
                  <span className="material-symbols-outlined text-white text-sm">check</span>
                )}
              </div>
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="flex items-center gap-1 px-4 py-3 text-sm font-label font-medium text-on-surface-variant hover:bg-surface-container-low rounded-full transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30">
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Back
            </button>
          )}
          {!isLast ? (
            <button onClick={() => setStep(step + 1)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-on-primary rounded-full font-headline font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-110 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30">
              Continue
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          ) : (
            <button onClick={handleComplete} disabled={loading} className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-on-primary rounded-full font-headline font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-110 disabled:opacity-50 disabled:shadow-none transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30">
              {loading ? 'Setting up...' : enableMutual ? 'Enable & Continue' : 'I\'m Ready'}
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
