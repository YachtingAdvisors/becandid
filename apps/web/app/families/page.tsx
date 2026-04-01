import type { Metadata } from 'next';
import PublicNav from '@/components/PublicNav';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Families — Digital Safety for Every Age',
  description:
    'Protect your family online with AI-powered content filtering, screen time limits, real-time alerts, and focus tracking designed for every age.',
};

const FEATURES = [
  {
    icon: 'shield',
    title: 'Content Filtering',
    desc: 'AI-powered content filtering blocks harmful websites while allowing age-appropriate browsing.',
  },
  {
    icon: 'timer',
    title: 'Screen Time Limits',
    desc: 'Set healthy limits by category, schedule downtime, and help teens build self-regulation.',
  },
  {
    icon: 'notifications_active',
    title: 'Real-Time Alerts',
    desc: 'Get notified immediately when concerning patterns emerge, with AI-generated conversation guides.',
  },
  {
    icon: 'target',
    title: 'Focus Tracking',
    desc: 'Track focus streaks and build digital wellness habits with positive reinforcement.',
  },
];

const STEPS = [
  {
    num: '01',
    icon: 'person_add',
    title: 'Parent signs up',
    desc: 'Create your Be Candid account and set up your family dashboard with your preferences.',
  },
  {
    num: '02',
    icon: 'mail',
    title: 'Invite your teen',
    desc: 'Send an invite to your teen. They get their own account with age-appropriate features.',
  },
  {
    num: '03',
    icon: 'dashboard',
    title: 'Both get dashboards',
    desc: 'Parents see activity summaries and alerts. Teens see their own progress and goals.',
  },
];

export default function FamiliesPage() {
  return (
    <div className="min-h-screen bg-[#fbf9f8]">
      <PublicNav />

      {/* Hero */}
      <section
        className="relative pt-36 pb-28 px-6 overflow-hidden"
        style={{
          background: 'linear-gradient(165deg, #226779 0%, #a4e4f8 100%)',
        }}
      >
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <p className="font-label text-xs uppercase tracking-widest text-on-primary/70 mb-4">
            For Families
          </p>
          <h1 className="font-headline font-extrabold text-4xl md:text-5xl lg:text-6xl text-on-primary leading-[1.08] tracking-tight mb-6">
            Accountability for the whole family
          </h1>
          <p className="text-lg sm:text-xl text-on-primary/80 leading-relaxed max-w-2xl mx-auto mb-10 font-body">
            Be Candid helps teens build healthy digital habits with support from
            parents who care &mdash; not surveillance that shames.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-surface-container-lowest text-primary text-base font-headline font-bold rounded-full hover:brightness-105 hover:shadow-xl transition-all duration-200 shadow-[0_20px_40px_-20px_rgba(49,51,51,0.06)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            <span className="material-symbols-outlined text-[20px]">
              family_restroom
            </span>
            Protect Your Family
          </Link>
          <p className="mt-5 text-sm text-on-primary/60 font-body">
            Be Candid works for teens 13+ with parental consent
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center font-label text-xs font-semibold text-primary uppercase tracking-widest mb-4">
            How Teen Mode Works
          </p>
          <h2 className="font-headline font-extrabold text-4xl md:text-5xl tracking-tight text-on-surface text-center mb-4">
            Simple setup, lasting impact
          </h2>
          <p className="text-center text-on-surface-variant mb-20 max-w-lg mx-auto font-body leading-relaxed">
            Three steps to build a healthier digital environment for your
            family.
          </p>

          <div className="grid sm:grid-cols-3 gap-8">
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="bg-surface-container-lowest rounded-[2rem] p-7 text-center sm:text-left shadow-[0_20px_40px_-20px_rgba(49,51,51,0.06)] ring-1 ring-outline-variant/10 hover:ring-primary/20 hover:shadow-lg transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-container text-primary mb-5">
                  <span className="material-symbols-outlined text-[22px]">
                    {step.icon}
                  </span>
                </div>
                <p className="font-label text-xs text-primary uppercase tracking-widest font-semibold mb-2">
                  Step {step.num}
                </p>
                <h3 className="font-headline font-bold text-lg text-on-surface mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed font-body">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy section */}
      <section className="py-28 px-6 bg-surface-container-low">
        <div className="max-w-5xl mx-auto">
          <p className="text-center font-label text-xs font-semibold text-primary uppercase tracking-widest mb-4">
            Privacy by Design
          </p>
          <h2 className="font-headline font-extrabold text-4xl md:text-5xl tracking-tight text-on-surface text-center mb-4">
            What parents see vs. what&apos;s private
          </h2>
          <p className="text-center text-on-surface-variant mb-20 max-w-lg mx-auto font-body leading-relaxed">
            We believe healing happens in safe spaces. Your teen&apos;s journal
            is their sacred therapeutic space.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Parents see */}
            <div className="bg-surface-container-lowest rounded-[2rem] p-8 shadow-[0_20px_40px_-20px_rgba(49,51,51,0.06)] ring-1 ring-outline-variant/10">
              <h3 className="font-headline font-bold text-lg text-on-surface mb-5 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[24px]">
                  visibility
                </span>
                Parents see
              </h3>
              <ul className="space-y-3.5">
                {[
                  'Flagged events and activity summaries',
                  'Screen time usage and trends',
                  'Real-time alerts with conversation guides',
                  'Focus scores and streaks',
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-on-surface font-body"
                  >
                    <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">
                      check_circle
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Always private */}
            <div className="bg-surface-container-lowest rounded-[2rem] p-8 ring-1 ring-primary-container shadow-[0_20px_40px_-20px_rgba(49,51,51,0.06)]">
              <h3 className="font-headline font-bold text-lg text-on-surface mb-5 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[24px]">
                  lock
                </span>
                Always private
              </h3>
              <ul className="space-y-3.5">
                {[
                  'Journal entries and guided reflections',
                  'Private conversation details',
                  'Mood and emotional data',
                  'Therapeutic content and notes',
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-on-surface font-body"
                  >
                    <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">
                      lock
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center font-label text-xs font-semibold text-primary uppercase tracking-widest mb-4">
            Features
          </p>
          <h2 className="font-headline font-extrabold text-4xl md:text-5xl tracking-tight text-on-surface text-center mb-4">
            Built for families
          </h2>
          <p className="text-center text-on-surface-variant mb-20 max-w-lg mx-auto font-body leading-relaxed">
            Everything teens and parents need for healthy digital life.
          </p>

          <div className="grid sm:grid-cols-2 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-surface-container-lowest rounded-[2rem] p-8 shadow-[0_20px_40px_-20px_rgba(49,51,51,0.06)] ring-1 ring-outline-variant/10 hover:ring-primary/20 hover:shadow-lg transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-container text-primary mb-5">
                  <span className="material-symbols-outlined text-[24px]">
                    {f.icon}
                  </span>
                </div>
                <h3 className="font-headline font-bold text-base text-on-surface mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed font-body">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Credibility */}
      <section className="py-8 border-y border-outline-variant/20">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-primary">
            verified
          </span>
          <p className="text-center text-sm text-on-surface-variant font-body">
            Designed by neurologists and licensed mental health counselors
          </p>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-28 px-6"
        style={{
          background: 'linear-gradient(165deg, #0e5b6c 0%, #226779 100%)',
        }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <span className="material-symbols-outlined text-[40px] text-on-primary/60 mb-4 block">
            family_restroom
          </span>
          <h2 className="font-headline font-extrabold text-4xl md:text-5xl tracking-tight text-on-primary mb-4">
            Protect your family
          </h2>
          <p className="text-on-primary/70 mb-10 max-w-md mx-auto font-body leading-relaxed">
            Start today. Free plan available. Takes 3 minutes to set up.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-surface-container-lowest text-primary text-base font-headline font-bold rounded-full hover:brightness-105 hover:shadow-xl transition-all duration-200 shadow-[0_20px_40px_-20px_rgba(49,51,51,0.06)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            <span className="material-symbols-outlined text-[20px]">
              arrow_forward
            </span>
            Create Your Account
          </Link>
          <p className="mt-6 text-sm text-on-primary/50 font-body">
            Be Candid works for teens 13+ with parental consent
          </p>
        </div>
      </section>
    </div>
  );
}
