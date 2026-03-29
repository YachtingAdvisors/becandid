import Link from 'next/link';

const FEATURES = [
  {
    icon: '\uD83D\uDEE1\uFE0F',
    title: 'Content Filtering',
    desc: 'AI-powered content filtering blocks harmful websites while allowing age-appropriate browsing.',
  },
  {
    icon: '\u23F1\uFE0F',
    title: 'Screen Time Limits',
    desc: 'Set healthy limits by category, schedule downtime, and help teens build self-regulation.',
  },
  {
    icon: '\uD83D\uDD14',
    title: 'Real-Time Alerts',
    desc: 'Get notified immediately when concerning patterns emerge, with AI-generated conversation guides.',
  },
  {
    icon: '\uD83C\uDFAF',
    title: 'Focus Tracking',
    desc: 'Track focus streaks and build digital wellness habits with positive reinforcement.',
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Parent signs up',
    desc: 'Create your Be Candid account and set up your family dashboard with your preferences.',
  },
  {
    num: '02',
    title: 'Invite your teen',
    desc: 'Send an invite to your teen. They get their own account with age-appropriate features.',
  },
  {
    num: '03',
    title: 'Both get dashboards',
    desc: 'Parents see activity summaries and alerts. Teens see their own progress and goals.',
  },
];

export default function FamiliesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/80 backdrop-blur-xl border-b border-outline-variant/30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <img src="/logo.png" alt="Be Candid" className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Home
            </Link>
            <Link
              href="/auth/signup"
              className="px-5 py-2 bg-primary text-on-primary text-sm font-semibold rounded-full hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section
        className="relative pt-32 pb-24 px-6 overflow-hidden"
        style={{
          background: 'linear-gradient(165deg, #226779 0%, #a4e4f8 100%)',
        }}
      >
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="font-headline font-extrabold text-5xl sm:text-6xl text-on-primary leading-[1.08] mb-6">
            Accountability for the whole family
          </h1>
          <p className="text-lg sm:text-xl text-on-primary/80 leading-relaxed max-w-2xl mx-auto mb-10">
            Be Candid helps teens build healthy digital habits with support from parents who
            care &mdash; not surveillance that shames.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-surface-container-lowest text-primary text-base font-semibold rounded-full hover:bg-surface-container-low transition-colors"
          >
            Protect Your Family
          </Link>
          <p className="mt-5 text-sm text-on-primary/60">
            Be Candid works for teens 13+ with parental consent
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center font-label text-xs font-semibold text-primary uppercase tracking-widest mb-3">
            How Teen Mode Works
          </p>
          <h2 className="font-headline font-extrabold text-3xl sm:text-4xl text-on-surface text-center mb-4">
            Simple setup, lasting impact
          </h2>
          <p className="text-center text-on-surface-variant mb-16 max-w-lg mx-auto">
            Three steps to build a healthier digital environment for your family.
          </p>

          <div className="grid sm:grid-cols-3 gap-8">
            {STEPS.map((step) => (
              <div key={step.num} className="text-center sm:text-left">
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-primary-container text-primary font-label text-sm font-bold mb-4">
                  {step.num}
                </div>
                <h3 className="font-headline font-bold text-lg text-on-surface mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy section */}
      <section className="py-24 px-6 bg-surface-container-low">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-headline font-extrabold text-3xl sm:text-4xl text-on-surface text-center mb-4">
            What parents see vs. what&apos;s private
          </h2>
          <p className="text-center text-on-surface-variant mb-16 max-w-lg mx-auto">
            We believe healing happens in safe spaces. Your teen&apos;s journal is their sacred therapeutic space.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Parents see */}
            <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant">
              <h3 className="font-headline font-bold text-lg text-on-surface mb-4 flex items-center gap-2">
                <span className="text-xl">{'\uD83D\uDC41\uFE0F'}</span> Parents see
              </h3>
              <ul className="space-y-3">
                {[
                  'Flagged events and activity summaries',
                  'Screen time usage and trends',
                  'Real-time alerts with conversation guides',
                  'Focus scores and streaks',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-on-surface font-body">
                    <span className="text-primary mt-0.5">{'\u2713'}</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Always private */}
            <div className="bg-surface-container-lowest rounded-3xl p-6 border border-primary-container">
              <h3 className="font-headline font-bold text-lg text-on-surface mb-4 flex items-center gap-2">
                <span className="text-xl">{'\uD83D\uDD12'}</span> Always private
              </h3>
              <ul className="space-y-3">
                {[
                  'Journal entries and Stringer reflections',
                  'Private conversation details',
                  'Mood and emotional data',
                  'Therapeutic content and notes',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-on-surface font-body">
                    <span className="text-primary mt-0.5">{'\uD83D\uDD12'}</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-headline font-extrabold text-3xl sm:text-4xl text-on-surface text-center mb-4">
            Built for families
          </h2>
          <p className="text-center text-on-surface-variant mb-16 max-w-lg mx-auto">
            Everything teens and parents need for healthy digital life.
          </p>

          <div className="grid sm:grid-cols-2 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-surface-container-lowest rounded-3xl p-7 border border-outline-variant hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-headline font-bold text-base text-on-surface mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Credibility */}
      <section className="py-6 border-y border-outline-variant/20">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-center text-sm text-on-surface-variant">
            Designed by neurologists and licensed mental health counselors
          </p>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-24 px-6"
        style={{
          background: 'linear-gradient(165deg, #0e5b6c 0%, #226779 100%)',
        }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-headline font-extrabold text-3xl sm:text-4xl text-on-primary mb-4">
            Protect your family
          </h2>
          <p className="text-on-primary/70 mb-8 max-w-md mx-auto">
            Start today. Free plan available. Takes 3 minutes to set up.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-surface-container-lowest text-primary text-base font-semibold rounded-full hover:bg-surface-container-low transition-colors"
          >
            Create Your Account
          </Link>
          <p className="mt-6 text-sm text-on-primary/50">
            Be Candid works for teens 13+ with parental consent
          </p>
        </div>
      </section>
    </div>
  );
}
