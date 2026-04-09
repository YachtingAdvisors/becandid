'use client';

import { useState } from 'react';
import Link from 'next/link';
import PublicNav from '@/components/PublicNav';
import JsonLd from '@/components/JsonLd';
import { productSchema } from '@/lib/structuredData';

const TIER_ICONS: Record<string, string> = {
  free: 'eco',
  pro: 'bolt',
  therapy: 'medical_services',
};

const TIERS = [
  {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    logo: '/apple-touch-icon.png',
    description: 'Begin aligning',
    cta: 'Get Started',
    ctaHref: '/auth/signup',
    highlight: false,
    features: [
      { text: 'Screen awareness (16 categories)', included: true },
      { text: '1 accountability partner', included: true },
      { text: '3 AI conversation guides / month', included: true },
      { text: '1 therapist connection', included: true },
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
    monthlyPrice: 9.99,
    annualPrice: 79,
    description: 'Full alignment',
    logo: '/pro-logo.png',
    cta: 'Start Free Trial',
    ctaHref: '/auth/signup?plan=pro',
    highlight: true,
    badge: '21 days free',
    features: [
      { text: 'Everything in Free', included: true },
      { text: 'Unlimited AI conversation guides', included: true },
      { text: 'Up to 5 accountability partners', included: true },
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
    monthlyPrice: 19.99,
    annualPrice: 159,
    description: 'For anyone wanting Therapy-level insights \u2014 built by a team of psychiatrists and licensed therapists',
    logo: '/therapy-logo.png',
    cta: 'Upgrade',
    ctaHref: '/auth/signup?plan=therapy',
    highlight: false,
    features: [
      { text: 'Everything in Pro included', included: true },
      { text: 'Unlimited partners', included: true },
      { text: 'Full therapist portal access', included: true },
      { text: 'Therapist reads client journal entries between sessions', included: true },
      { text: 'Daily mood trends & emotional pattern tracking', included: true },
      { text: 'Focus streak history & relapse timeline', included: true },
      { text: 'Digital trigger map — sites, apps, times of day', included: true },
      { text: 'Conversation outcome tracking (partner interactions)', included: true },
      { text: 'Vulnerability window detection & alerts', included: true },
      { text: '5 granular consent toggles — client stays in control', included: true },
      { text: 'HIPAA-ready encryption & audit logging', included: true },
      { text: 'Therapist Data Processing Agreement included', included: true },
    ],
  },
];

export default function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual');

  return (
    <div className="min-h-screen bg-[#0c1214]">
      {/* JSON-LD Product structured data for each tier */}
      {TIERS.map((tier) => (
        <JsonLd
          key={tier.id}
          data={productSchema({
            name: tier.name,
            description: tier.description,
            monthlyPrice: tier.monthlyPrice,
            annualPrice: tier.annualPrice,
            features: tier.features.filter((f) => f.included).map((f) => f.text),
          })}
        />
      ))}

      <PublicNav />

      <div className="max-w-screen-2xl mx-auto px-6 py-24">
        {/* Beta Banner */}
        <div className="max-w-5xl mx-auto mb-10">
          <div className="rounded-2xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-emerald-500/10 border border-emerald-400/20 px-6 py-5 text-center">
            <p className="font-headline text-lg md:text-xl font-extrabold text-emerald-400 mb-1">
              FREE BETA &mdash; All features unlocked for every user. No credit card required.
            </p>
            <p className="font-body text-sm text-stone-400">
              Join our Discord community and help shape the future of Be Candid.
            </p>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-16 max-w-5xl mx-auto">
          <p className="font-label text-xs uppercase tracking-widest text-cyan-400 mb-4">
            Pricing
          </p>
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-slate-100 mb-4">
            Invest in your integrity
          </h1>
          <p className="text-base text-slate-400 max-w-lg mx-auto font-body leading-relaxed">
            Start free. Upgrade when you&apos;re ready. Cancel anytime.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 mt-8 bg-stone-800 rounded-full p-1.5">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-5 py-2.5 rounded-full text-sm font-label font-semibold transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400/30 ${
                billing === 'monthly'
                  ? 'bg-stone-700 text-slate-100 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.3)]'
                  : 'text-stone-400 hover:text-slate-200'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('annual')}
              className={`px-5 py-2.5 rounded-full text-sm font-label font-semibold transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400/30 ${
                billing === 'annual'
                  ? 'bg-stone-700 text-slate-100 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.3)]'
                  : 'text-stone-400 hover:text-slate-200'
              }`}
            >
              Annual{' '}
              <span className="text-cyan-400 text-xs font-bold ml-1">
                save 34%
              </span>
            </button>
          </div>
        </div>

        {/* Tier cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {TIERS.map((tier) => {
            const price =
              billing === 'monthly' ? tier.monthlyPrice : tier.annualPrice;
            const period = billing === 'monthly' ? '/mo' : '/yr';

            return (
              <div
                key={tier.id}
                className={`rounded-[2rem] p-7 relative transition-all duration-300 cursor-pointer ${
                  tier.highlight
                    ? 'bg-gradient-to-b from-primary to-primary-container text-on-primary shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 ring-2 ring-primary'
                    : 'bg-white/[0.03] backdrop-blur-md border border-white/5 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.3)] hover:border-white/10 hover:shadow-lg'
                }`}
              >
                {/* FREE DURING BETA badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-bold font-label uppercase tracking-wider border border-emerald-400/30">
                  Free During Beta
                </div>

                <div className="text-center mb-8 pt-2">
                  {(tier as any).logo ? (
                    <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto shadow-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={(tier as any).logo} alt={`${tier.name} logo`} className={`w-full h-full ${tier.id === 'free' ? 'object-contain p-4 bg-[#1a3a42] brightness-0 invert' : 'object-cover'}`} />
                    </div>
                  ) : (
                    <span
                      className={`material-symbols-outlined text-3xl ${
                        tier.highlight ? 'text-on-primary' : 'text-cyan-400'
                      }`}
                    >
                      {TIER_ICONS[tier.id]}
                    </span>
                  )}
                  <h3
                    className={`text-xl font-headline font-bold mt-3 ${
                      tier.highlight ? 'text-on-primary' : 'text-slate-100'
                    }`}
                  >
                    {tier.name}
                  </h3>
                  <p
                    className={`text-xs font-body mt-1 ${
                      tier.highlight
                        ? 'text-on-primary/70'
                        : 'text-slate-400'
                    }`}
                  >
                    {tier.description}
                  </p>
                  <div className="mt-4">
                    {price === 0 ? (
                      <p
                        className={`text-4xl font-headline font-extrabold tracking-tight ${
                          tier.highlight ? 'text-on-primary' : 'text-slate-100'
                        }`}
                      >
                        Free
                      </p>
                    ) : (
                      <>
                        <div className="flex items-center justify-center gap-3">
                          <p
                            className={`text-2xl font-headline font-extrabold tracking-tight line-through opacity-40 ${
                              tier.highlight
                                ? 'text-on-primary'
                                : 'text-slate-100'
                            }`}
                          >
                            ${price}
                          </p>
                          <p className="text-4xl font-headline font-extrabold tracking-tight text-emerald-400">
                            $0
                          </p>
                        </div>
                        <p
                          className={`text-xs mt-1 ${
                            tier.highlight
                              ? 'text-on-primary/70'
                              : 'text-slate-400'
                          }`}
                        >
                          {period} &mdash; <span className="text-emerald-400 font-semibold">free during beta</span>
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2.5 mb-8">
                  {tier.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span
                        className={`material-symbols-outlined text-[16px] mt-0.5 ${
                          tier.highlight
                            ? 'text-on-primary'
                            : 'text-cyan-400'
                        }`}
                      >
                        check
                      </span>
                      <span
                        className={`text-xs font-body leading-relaxed ${
                          tier.highlight
                            ? 'text-on-primary'
                            : 'text-slate-300'
                        }`}
                      >
                        {f.text}
                      </span>
                    </div>
                  ))}
                </div>

                <Link
                  href={tier.ctaHref}
                  className={`block w-full py-3.5 text-sm font-headline font-bold rounded-full text-center transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400/30 ${
                    tier.highlight
                      ? 'bg-on-primary text-primary shadow-lg hover:shadow-xl hover:brightness-110'
                      : 'bg-gradient-to-r from-cyan-500/20 to-teal-400/20 text-cyan-300 border border-cyan-400/20 shadow-md hover:shadow-lg hover:border-cyan-400/40 hover:brightness-110'
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Group pricing CTA */}
        <div className="max-w-5xl mx-auto mt-12">
          <Link
            href="/pricing/groups"
            className="block bg-white/[0.03] backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:border-emerald-500/20 hover:shadow-lg transition-all group"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <span
                    className="material-symbols-outlined text-emerald-400 text-2xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    groups
                  </span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-slate-100 text-base">
                    Churches & Organizations
                  </h3>
                  <p className="text-xs text-slate-400 font-body mt-0.5">
                    Get Pro features for <span className="text-emerald-400 font-semibold">$7/user/month</span> &mdash; 30% off individual pricing. Privacy-first group plans.
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-500 group-hover:text-emerald-400 transition-colors flex-shrink-0">
                arrow_forward
              </span>
            </div>
          </Link>
        </div>

        {/* Footer note */}
        <div className="max-w-5xl mx-auto mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-stone-500">
            <span className="material-symbols-outlined text-[18px] text-cyan-400">
              lock
            </span>
            <p className="text-xs font-body">
              All plans include end-to-end encryption, push notification
              privacy, crisis resource detection, and tools for digital
              integrity.
            </p>
          </div>
        </div>

        {/* Community + Support CTAs */}
        <div className="max-w-5xl mx-auto mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://discord.gg/sCkyPuqf6"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#5865F2]/20 text-[#5865F2] border border-[#5865F2]/30 font-label font-bold text-sm hover:bg-[#5865F2]/30 hover:border-[#5865F2]/50 transition-all duration-200"
          >
            <span className="material-symbols-outlined text-lg">forum</span>
            Join our Discord
          </a>
          <Link
            href="/donate"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 font-label font-bold text-sm hover:bg-emerald-500/30 hover:border-emerald-400/50 transition-all duration-200"
          >
            <span className="material-symbols-outlined text-lg">volunteer_activism</span>
            Support the project
          </Link>
        </div>

        <div className="text-center mt-14">
          <p className="text-sm text-stone-500 italic font-body">
            &ldquo;Freedom is found through kindness and curiosity.&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
