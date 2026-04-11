'use client';

import { useState } from 'react';
import Link from 'next/link';
import PublicNav from '@/components/PublicNav';
import JsonLd from '@/components/JsonLd';
import { productSchema } from '@/lib/structuredData';

interface Tier {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  logo: string;
  description: string;
  cta: string;
  ctaHref: string;
  highlight: boolean;
  badge?: string;
  features: { text: string; included: boolean }[];
}

const TIER_ICONS: Record<string, string> = {
  free: 'eco',
  pro: 'bolt',
  therapy: 'medical_services',
};

const TIERS: Tier[] = [
  {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    logo: '/free-logo.png',
    description: 'Begin aligning',
    cta: 'Get Started',
    ctaHref: '/auth/signup',
    highlight: false,
    features: [
      { text: 'Screen awareness (16 categories)', included: true },
      { text: '1 accountability partner', included: true },
      { text: '3 conversation guides / month', included: true },
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
      { text: 'Unlimited conversation guides', included: true },
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

const TRUST_BADGES = [
  { icon: 'lock', label: '256-bit encryption' },
  { icon: 'verified_user', label: 'HIPAA compliant' },
  { icon: 'event_available', label: 'Cancel anytime' },
  { icon: 'credit_card_off', label: 'No credit card required' },
];

export default function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual');

  return (
    <div className="min-h-screen bg-dark-sanctuary">
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
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-slate-100 mb-2">
            Invest in your integrity
          </h1>
          {/* Gradient underline */}
          <div className="mx-auto mt-2 mb-4 h-1 w-24 rounded-full bg-gradient-to-r from-primary via-cyan-500 to-primary" />
          <p className="text-base text-slate-400 max-w-lg mx-auto font-body leading-relaxed">
            Start free. Upgrade when you&apos;re ready. Cancel anytime.
          </p>

          {/* Billing toggle — pill-style with sliding indicator */}
          <div className="relative inline-flex items-center mt-8 bg-stone-800/80 rounded-full p-1.5">
            {/* Sliding indicator */}
            <div
              className="absolute top-1.5 bottom-1.5 rounded-full bg-gradient-to-r from-primary/80 to-cyan-600/80 shadow-lg shadow-primary/20 transition-all duration-500 ease-out"
              style={{
                left: billing === 'monthly' ? '6px' : 'calc(50% + 2px)',
                width: 'calc(50% - 8px)',
              }}
            />
            <button
              onClick={() => setBilling('monthly')}
              className={`relative z-10 px-6 py-2.5 rounded-full text-sm font-label font-semibold transition-colors duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400/30 ${
                billing === 'monthly'
                  ? 'text-white'
                  : 'text-stone-400 hover:text-slate-200'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('annual')}
              className={`relative z-10 px-6 py-2.5 rounded-full text-sm font-label font-semibold transition-colors duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400/30 ${
                billing === 'annual'
                  ? 'text-white'
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
                className={`rounded-[2rem] p-7 relative cursor-pointer transition-all duration-500 hover:scale-[1.02] ${
                  tier.highlight
                    ? 'pricing-glow bg-gradient-to-b from-primary to-primary-container text-on-primary shadow-lg shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30'
                    : 'bg-white/[0.03] backdrop-blur-md border border-white/5 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.3)] hover:border-white/10 hover:shadow-2xl hover:shadow-cyan-500/10'
                }`}
              >
                {/* FREE DURING BETA badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-bold font-label uppercase tracking-wider border border-emerald-400/30">
                  Free During Beta
                </div>

                <div className="text-center mb-8 pt-2">
                  {tier.logo ? (
                    <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto shadow-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={tier.logo} alt={`${tier.name} logo`} className="w-full h-full object-cover" />
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
                  {tier.badge && (
                    <span className="inline-block mt-1.5 px-3 py-0.5 rounded-full bg-cyan-400/15 text-cyan-300 text-[10px] font-bold font-label uppercase tracking-wider border border-cyan-400/25">
                      {tier.badge}
                    </span>
                  )}
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
                      <p className="text-4xl font-headline font-extrabold tracking-tight text-emerald-400">
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

                {/* Feature list with stagger animation */}
                <div className="pricing-stagger space-y-2.5 mb-8">
                  {tier.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      {f.included ? (
                        <span
                          className={`material-symbols-outlined text-[16px] mt-0.5 flex-shrink-0 ${
                            tier.highlight
                              ? 'text-on-primary'
                              : 'text-teal-400'
                          }`}
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          check_circle
                        </span>
                      ) : (
                        <span className="material-symbols-outlined text-[16px] mt-0.5 flex-shrink-0 text-stone-600">
                          close
                        </span>
                      )}
                      <span
                        className={`text-xs font-body leading-relaxed ${
                          f.included
                            ? tier.highlight
                              ? 'text-on-primary'
                              : 'text-slate-300'
                            : 'text-stone-500'
                        }`}
                      >
                        {f.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA button with gradient + glow */}
                <Link
                  href={tier.ctaHref}
                  className={`block w-full py-3.5 text-sm font-headline font-bold rounded-full text-center transition-all duration-300 cursor-pointer active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-cyan-400/30 ${
                    tier.highlight
                      ? 'bg-gradient-to-r from-white to-slate-100 text-primary shadow-lg hover:shadow-xl hover:shadow-white/20 hover:brightness-110'
                      : 'bg-gradient-to-r from-primary to-cyan-600 text-white shadow-md hover:shadow-lg hover:shadow-primary/30 hover:brightness-110'
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Trust badges */}
        <div className="max-w-5xl mx-auto mt-12">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {TRUST_BADGES.map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-2 text-stone-400"
              >
                <span
                  className="material-symbols-outlined text-[20px] text-cyan-500/70"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {badge.icon}
                </span>
                <span className="text-xs font-label font-medium tracking-wide">
                  {badge.label}
                </span>
              </div>
            ))}
          </div>
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
