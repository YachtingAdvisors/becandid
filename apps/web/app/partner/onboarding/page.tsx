'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const STEPS = [
  {
    icon: '🤝',
    title: 'Your Role',
    body: 'You\'re not a surveillance officer. You\'re a trusted person who shows up when it matters. Every alert comes with an AI conversation guide designed to help you have a productive, shame-free conversation.',
    highlight: 'Your presence is the intervention.',
  },
  {
    icon: '📋',
    title: 'Check-ins',
    body: 'You\'ll receive periodic check-ins that both of you must confirm. Select how you feel about their progress — confident, hopeful, concerned, or worried. Your honest assessment helps them see how they\'re showing up to the people who matter.',
    highlight: 'Both of you confirm. Both of you earn trust points.',
  },
  {
    icon: '💬',
    title: 'Conversation Guides',
    body: 'When an alert fires, you\'ll get an AI guide with specific dos and don\'ts for that category. It tells you how to open the conversation, what NOT to say, and questions to ask. Read it before you talk — it makes a real difference.',
    highlight: 'The guide is your playbook. Use it.',
  },
  {
    icon: '🚫',
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
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 stagger">
        {/* Progress */}
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors ${
              i <= step ? 'bg-brand-600' : 'bg-surface-border'
            }`} />
          ))}
        </div>

        {/* Card */}
        <div className="card p-8 text-center">
          <div className="text-5xl mb-4">{current.icon}</div>
          <h2 className="font-display text-2xl font-bold text-ink mb-4">{current.title}</h2>
          <p className="text-sm text-ink-muted leading-relaxed mb-4">{current.body}</p>
          <div className="px-4 py-3 rounded-xl bg-brand-50 border border-brand-200">
            <p className="text-sm text-brand-700 font-medium">{current.highlight}</p>
          </div>
        </div>

        {/* Mutual accountability option (last step) */}
        {isLast && (
          <div className="card p-5">
            <button
              onClick={() => setEnableMutual(!enableMutual)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all ${
                enableMutual ? 'border-brand-500 bg-brand-50' : 'border-surface-border hover:border-brand-300'
              }`}
            >
              <span className="text-2xl">🔄</span>
              <div className="flex-1">
                <div className="text-sm font-semibold text-ink">Enable mutual accountability</div>
                <p className="text-xs text-ink-muted mt-0.5">
                  Both of you monitor each other. You'll set up your own rivals and get the same features.
                </p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                enableMutual ? 'bg-brand-600 border-brand-600' : 'border-gray-300'
              }`}>
                {enableMutual && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="btn-ghost">← Back</button>
          )}
          {!isLast ? (
            <button onClick={() => setStep(step + 1)} className="btn-primary flex-1 justify-center py-3">
              Continue →
            </button>
          ) : (
            <button onClick={handleComplete} disabled={loading} className="btn-primary flex-1 justify-center py-3 disabled:opacity-50">
              {loading ? 'Setting up…' : enableMutual ? 'Enable & Continue →' : 'I\'m Ready →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
