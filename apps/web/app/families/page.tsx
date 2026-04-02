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
    <div className="min-h-screen bg-dark-sanctuary">
      <PublicNav />

      {/* Hero */}
      <section
        className="relative pt-36 pb-28 px-6 overflow-hidden"
        style={{
          background: 'linear-gradient(165deg, rgba(14,91,108,0.6) 0%, rgba(34,103,121,0.3) 100%)',
        }}
      >
        <div className="absolute inset-0 bg-dark-sanctuary/40" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <p className="font-label text-xs uppercase tracking-widest text-cyan-400/70 mb-4">
            For Families
          </p>
          <h1 className="font-headline font-extrabold text-4xl md:text-5xl lg:text-6xl text-slate-100 leading-[1.08] tracking-tight mb-6">
            Accountability for the whole family
          </h1>
          <p className="text-lg sm:text-xl text-stone-300/80 leading-relaxed max-w-2xl mx-auto mb-10 font-body">
            Be Candid helps teens build healthy digital habits with support from
            parents who care &mdash; not surveillance that shames.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary text-base font-headline font-bold rounded-full hover:brightness-110 hover:shadow-xl transition-all duration-200 shadow-lg shadow-primary/20 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
          >
            <span className="material-symbols-outlined text-[20px]">
              family_restroom
            </span>
            Protect Your Family
          </Link>
          <p className="mt-5 text-sm text-stone-400/60 font-body">
            Be Candid works for teens 13+ with parental consent
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center font-label text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-4">
            How Teen Mode Works
          </p>
          <h2 className="font-headline font-extrabold text-4xl md:text-5xl tracking-tight text-slate-100 text-center mb-4">
            Simple setup, lasting impact
          </h2>
          <p className="text-center text-stone-400 mb-20 max-w-lg mx-auto font-body leading-relaxed">
            Three steps to build a healthier digital environment for your
            family.
          </p>

          <div className="grid sm:grid-cols-3 gap-8">
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="bg-white/[0.03] backdrop-blur-xl rounded-[2rem] p-7 text-center sm:text-left shadow-[0_4px_40px_rgba(0,0,0,0.2)] ring-1 ring-white/[0.06] hover:ring-cyan-500/20 hover:shadow-lg transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-cyan-500/10 text-cyan-400 mb-5">
                  <span className="material-symbols-outlined text-[22px]">
                    {step.icon}
                  </span>
                </div>
                <p className="font-label text-xs text-cyan-400 uppercase tracking-widest font-semibold mb-2">
                  Step {step.num}
                </p>
                <h3 className="font-headline font-bold text-lg text-slate-100 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-stone-400 leading-relaxed font-body">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy section */}
      <section className="py-28 px-6 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <p className="text-center font-label text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-4">
            Privacy by Design
          </p>
          <h2 className="font-headline font-extrabold text-4xl md:text-5xl tracking-tight text-slate-100 text-center mb-4">
            What parents see vs. what&apos;s private
          </h2>
          <p className="text-center text-stone-400 mb-20 max-w-lg mx-auto font-body leading-relaxed">
            We believe healing happens in safe spaces. Your teen&apos;s journal
            is their sacred therapeutic space.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Parents see */}
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-[2rem] p-8 shadow-[0_4px_40px_rgba(0,0,0,0.2)] ring-1 ring-white/[0.06]">
              <h3 className="font-headline font-bold text-lg text-slate-100 mb-5 flex items-center gap-3">
                <span className="material-symbols-outlined text-cyan-400 text-[24px]">
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
                    className="flex items-start gap-3 text-sm text-stone-300 font-body"
                  >
                    <span className="material-symbols-outlined text-cyan-400 text-[18px] mt-0.5">
                      check_circle
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Always private */}
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-[2rem] p-8 ring-1 ring-teal-500/15 shadow-[0_4px_40px_rgba(0,0,0,0.2)]">
              <h3 className="font-headline font-bold text-lg text-slate-100 mb-5 flex items-center gap-3">
                <span className="material-symbols-outlined text-teal-400 text-[24px]">
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
                    className="flex items-start gap-3 text-sm text-stone-300 font-body"
                  >
                    <span className="material-symbols-outlined text-teal-400 text-[18px] mt-0.5">
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
          <p className="text-center font-label text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-4">
            Features
          </p>
          <h2 className="font-headline font-extrabold text-4xl md:text-5xl tracking-tight text-slate-100 text-center mb-4">
            Built for families
          </h2>
          <p className="text-center text-stone-400 mb-20 max-w-lg mx-auto font-body leading-relaxed">
            Everything teens and parents need for healthy digital life.
          </p>

          <div className="grid sm:grid-cols-2 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-white/[0.03] backdrop-blur-xl rounded-[2rem] p-8 shadow-[0_4px_40px_rgba(0,0,0,0.2)] ring-1 ring-white/[0.06] hover:ring-cyan-500/20 hover:shadow-lg transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 mb-5">
                  <span className="material-symbols-outlined text-[24px]">
                    {f.icon}
                  </span>
                </div>
                <h3 className="font-headline font-bold text-base text-slate-100 mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-stone-400 leading-relaxed font-body">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Credibility */}
      <section className="py-8 border-y border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-cyan-400">
            verified
          </span>
          <p className="text-center text-sm text-stone-400 font-body">
            Designed by neurologists and licensed mental health counselors
          </p>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-28 px-6"
        style={{
          background: 'linear-gradient(165deg, rgba(14,91,108,0.4) 0%, rgba(34,103,121,0.2) 100%)',
        }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <span className="material-symbols-outlined text-[40px] text-cyan-400/60 mb-4 block">
            family_restroom
          </span>
          <h2 className="font-headline font-extrabold text-4xl md:text-5xl tracking-tight text-slate-100 mb-4">
            Protect your family
          </h2>
          <p className="text-stone-400/70 mb-10 max-w-md mx-auto font-body leading-relaxed">
            Start today. Free plan available. Takes 3 minutes to set up.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary text-base font-headline font-bold rounded-full hover:brightness-110 hover:shadow-xl transition-all duration-200 shadow-lg shadow-primary/20 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
          >
            <span className="material-symbols-outlined text-[20px]">
              arrow_forward
            </span>
            Create Your Account
          </Link>
          <p className="mt-6 text-sm text-stone-500 font-body">
            Be Candid works for teens 13+ with parental consent
          </p>
        </div>
      </section>
    </div>
  );
}
