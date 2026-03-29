'use client';

import { useState } from 'react';
import Link from 'next/link';

const TIERS = [
  {
    id: 'free',
    name: 'Free',
    emoji: '🌱',
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'Begin aligning',
    cta: 'Get Started',
    ctaHref: '/auth/signup',
    highlight: false,
    features: [
      { text: 'Screen awareness (16 categories)', included: true },
      { text: '1 accountability partner', included: true },
      { text: '3 AI conversation guides / month', included: true },
      { text: 'Manual journal (no AI prompts)', included: true },
      { text: 'Basic dashboard + streaks', included: true },
      { text: 'Solo mode', included: true },
      { text: 'Relationship level', included: true },
      { text: 'Crisis resource detection', included: true },
      { text: 'Journal reminders', included: false },
      { text: 'Weekly AI reflection', included: false },
      { text: 'Pattern detection', included: false },
      { text: 'Therapist portal', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    emoji: '⚡',
    monthlyPrice: 9.99,
    annualPrice: 99,
    description: 'Full alignment',
    cta: 'Start Free Trial',
    ctaHref: '/auth/signup?plan=pro',
    highlight: true,
    badge: '14 days free',
    features: [
      { text: 'Everything in Free', included: true },
      { text: 'Unlimited AI conversation guides', included: true },
      { text: 'Up to 3 accountability partners', included: true },
      { text: 'Scheduled journal reminders', included: true },
      { text: 'Weekly AI reflection', included: true },
      { text: 'Vulnerability windows', included: true },
      { text: 'Pattern detection', included: true },
      { text: 'Conversation outcome tracking', included: true },
      { text: 'Spouse experience + Committed Contender', included: true },
      { text: 'Data export (JSON)', included: true },
      { text: '365-day data retention', included: true },
      { text: 'Therapist portal', included: false },
    ],
  },
  {
    id: 'therapy',
    name: 'Therapy',
    emoji: '🩺',
    monthlyPrice: 19.99,
    annualPrice: 179,
    description: 'For clinical partnerships',
    cta: 'Upgrade',
    ctaHref: '/auth/signup?plan=therapy',
    highlight: false,
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Therapist portal (read-only)', included: true },
      { text: '5 granular consent toggles', included: true },
      { text: 'Extended data retention', included: true },
      { text: 'Priority AI generation', included: true },
      { text: 'PDF report formatting', included: true },
    ],
  },
];

export default function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual');

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-headline font-bold text-on-surface mb-3">Candid Pricing</h1>
          <p className="text-base text-on-surface-variant max-w-lg mx-auto font-body">
            Start free. Upgrade when you&apos;re ready. Cancel anytime.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-2 mt-6 bg-surface-container rounded-full p-1">
            <button onClick={() => setBilling('monthly')}
              className={`px-4 py-2 rounded-full text-sm font-label font-medium transition-all ${
                billing === 'monthly' ? 'bg-surface-container-lowest text-on-surface shadow-sm' : 'text-on-surface-variant'
              }`}>Monthly</button>
            <button onClick={() => setBilling('annual')}
              className={`px-4 py-2 rounded-full text-sm font-label font-medium transition-all ${
                billing === 'annual' ? 'bg-surface-container-lowest text-on-surface shadow-sm' : 'text-on-surface-variant'
              }`}>
              Annual <span className="text-primary text-xs ml-1">save 17%</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {TIERS.map((tier) => {
            const price = billing === 'monthly' ? tier.monthlyPrice : tier.annualPrice;
            const period = billing === 'monthly' ? '/mo' : '/yr';

            return (
              <div key={tier.id} className={`rounded-3xl p-6 relative ${
                tier.id === 'free'
                  ? 'bg-surface-container-lowest border border-outline-variant'
                  : tier.highlight
                    ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                    : 'bg-secondary-container border border-secondary/10'
              }`}>
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-tertiary-container text-tertiary text-[10px] font-bold font-label uppercase tracking-wider">
                    {tier.badge}
                  </div>
                )}

                <div className="text-center mb-6 pt-2">
                  <span className="text-2xl">{tier.emoji}</span>
                  <h3 className={`text-lg font-headline font-semibold mt-2 ${
                    tier.highlight ? 'text-on-primary' : 'text-on-surface'
                  }`}>{tier.name}</h3>
                  <p className={`text-xs ${tier.highlight ? 'text-on-primary/70' : 'text-on-surface-variant'}`}>{tier.description}</p>
                  <div className="mt-3">
                    {price === 0 ? (
                      <p className={`text-3xl font-headline font-bold ${tier.highlight ? 'text-on-primary' : 'text-on-surface'}`}>Free</p>
                    ) : (
                      <>
                        <p className={`text-3xl font-headline font-bold ${tier.highlight ? 'text-on-primary' : 'text-on-surface'}`}>${price}</p>
                        <p className={`text-xs ${tier.highlight ? 'text-on-primary/70' : 'text-on-surface-variant'}`}>{period}</p>
                        {billing === 'annual' && tier.monthlyPrice > 0 && (
                          <p className={`text-[10px] mt-0.5 ${tier.highlight ? 'text-on-primary/60' : 'text-on-surface-variant'}`}>
                            ${(tier.annualPrice / 12).toFixed(2)}/month
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  {tier.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className={`text-xs mt-0.5 ${
                        tier.highlight
                          ? f.included ? 'text-on-primary' : 'text-on-primary/30'
                          : f.included ? 'text-primary' : 'text-outline-variant'
                      }`}>
                        {f.included ? '✓' : '—'}
                      </span>
                      <span className={`text-xs font-body ${
                        tier.highlight
                          ? f.included ? 'text-on-primary' : 'text-on-primary/40'
                          : f.included ? 'text-on-surface' : 'text-on-surface-variant/50'
                      }`}>
                        {f.text}
                      </span>
                    </div>
                  ))}
                </div>

                <Link href={tier.ctaHref}
                  className={`block w-full py-3 text-sm font-headline font-bold rounded-full text-center transition-all ${
                    tier.highlight
                      ? 'bg-on-primary text-primary hover:opacity-90'
                      : 'bg-surface-container text-on-surface hover:bg-surface-container-low'
                  }`}>
                  {tier.cta}
                </Link>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-on-surface-variant mt-8 font-body">
          All plans include end-to-end encryption, push notification privacy, crisis resource detection, and tools for digital integrity.
        </p>

        <div className="text-center mt-12">
          <p className="text-sm text-on-surface-variant italic font-body">
            &ldquo;Freedom is found through kindness and curiosity.&rdquo; &mdash; Jay Stringer
          </p>
        </div>
      </div>
    </div>
  );
}
