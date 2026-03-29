import Link from 'next/link';

const FEATURES = [
  {
    icon: '\u{1F916}',
    title: 'AI Conversation Guides',
    desc: 'When a flag fires, personalized guides grounded in Motivational Interviewing help you and your partner have productive conversations.',
  },
  {
    icon: '\u{1F4D3}',
    title: 'Stringer Journal',
    desc: 'Guided prompts based on Jay Stringer\u2019s framework help you uncover the tributaries, longings, and roadmap beneath compulsive behavior.',
  },
  {
    icon: '\u{1F514}',
    title: 'Partner Alerts',
    desc: 'Your accountability partner gets real-time alerts with context and AI-generated conversation starters when patterns emerge.',
  },
  {
    icon: '\u{1F6A8}',
    title: 'Crisis Detection',
    desc: 'If patterns escalate, Be Candid detects it early and connects you with professional resources \u2014 no judgment.',
  },
  {
    icon: '\u{1F512}',
    title: 'End-to-End Encryption',
    desc: 'Your data is encrypted in transit and at rest. URLs are hashed, never stored. We literally cannot read your content.',
  },
  {
    icon: '\u{1F3AF}',
    title: 'Focus Tracking',
    desc: 'Morning and evening segments keep you anchored. Earn trust points, build streaks, and watch real progress unfold.',
  },
];

const PILLARS = [
  {
    emoji: '\u{1F30A}',
    title: 'Trace the Tributaries',
    desc: 'Compulsive behavior doesn\u2019t come from nowhere. Identify the family dynamics, attachment wounds, and emotional patterns that feed unwanted habits.',
  },
  {
    emoji: '\u{1F49B}',
    title: 'Name the Longing',
    desc: 'Beneath every destructive pattern is an unmet need \u2014 for connection, significance, or safety. The Stringer Journal helps you name it.',
  },
  {
    emoji: '\u{1F9ED}',
    title: 'Follow the Roadmap',
    desc: 'With clarity about your story and desires, build concrete steps toward the life you actually want \u2014 with your partner beside you.',
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Sign up and choose your rivals',
    desc: 'Pick the categories you want accountability for \u2014 from sexual content to social media, substances to gambling.',
  },
  {
    num: '02',
    title: 'Invite a trusted partner',
    desc: 'A friend, spouse, mentor, or coach. They get alerts and AI-generated conversation guides. Or go solo \u2014 your call.',
  },
  {
    num: '03',
    title: 'Get AI-powered accountability',
    desc: 'Track focus streaks, journal with Stringer prompts, earn trust points, and have conversations that actually lead somewhere.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Header (sticky, glass) ─────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/80 glass-effect border-b border-outline-variant/30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-headline text-xl font-extrabold text-primary">
            Be Candid
          </span>

          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-6">
              <a href="#pillars" className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">
                Features
              </a>
              <Link href="/pricing" className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">
                Pricing
              </Link>
              <a href="#cta" className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">
                About
              </a>
            </div>
            <Link href="/auth/signup" className="btn-primary text-sm py-2 px-5">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section
        className="relative pt-32 pb-24 px-6 overflow-hidden"
        style={{
          background: 'linear-gradient(165deg, #226779 0%, #a4e4f8 100%)',
        }}
      >
        <div className="max-w-4xl mx-auto text-center stagger relative z-10">
          <h1 className="font-headline font-extrabold text-5xl sm:text-6xl lg:text-7xl text-on-primary leading-[1.08] mb-6">
            Accountability that goes
            <br />
            beneath the surface
          </h1>

          <p className="text-lg sm:text-xl text-on-primary/80 leading-relaxed max-w-2xl mx-auto mb-10">
            Be Candid combines neuroscience-backed monitoring with Jay Stringer&apos;s
            therapeutic framework to help you understand the &ldquo;why&rdquo; behind
            unwanted behaviors.
          </p>

          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-surface-container-lowest text-primary text-base font-semibold rounded-full hover:bg-surface-container-low transition-colors"
          >
            Start Your Journey
          </Link>

          <p className="mt-5 text-sm text-on-primary/60">
            No credit card required &middot; Free forever plan available
          </p>
        </div>
      </section>

      {/* ── Credibility Bar ───────────────────────────────── */}
      <section className="py-6 border-b border-outline-variant/20">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-center text-sm text-on-surface-variant">
            Designed in collaboration with neurologists and licensed mental health counselors
          </p>
        </div>
      </section>

      {/* ── 3-Pillar Section (Stringer Framework) ─────────── */}
      <section id="pillars" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center font-label text-xs font-semibold text-primary uppercase tracking-widest mb-3">
            Built on Jay Stringer&apos;s Framework
          </p>
          <h2 className="font-headline font-extrabold text-3xl sm:text-4xl text-on-surface text-center mb-4">
            Go deeper than willpower
          </h2>
          <p className="text-center text-on-surface-variant mb-16 max-w-lg mx-auto">
            Most accountability apps just block and monitor. Be Candid helps you understand
            the story beneath the behavior.
          </p>

          <div className="grid sm:grid-cols-3 gap-6">
            {PILLARS.map((p) => (
              <div key={p.title} className="card p-8 text-center">
                <div className="text-4xl mb-5">{p.emoji}</div>
                <h3 className="font-headline font-bold text-lg text-on-surface mb-2">{p.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid (bento) ─────────────────────────── */}
      <section className="py-24 px-6 bg-surface-container-low">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-headline font-extrabold text-3xl sm:text-4xl text-on-surface text-center mb-4">
            Everything you need
          </h2>
          <p className="text-center text-on-surface-variant mb-16 max-w-lg mx-auto">
            Monitoring, journaling, conversation guides, and growth tracking &mdash; all in one place.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="card p-7 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-headline font-bold text-base text-on-surface mb-2">{f.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-headline font-extrabold text-3xl sm:text-4xl text-on-surface text-center mb-4">
            How it works
          </h2>
          <p className="text-center text-on-surface-variant mb-16 max-w-lg mx-auto">
            Three steps. No surveillance. No shame.
          </p>

          <div className="grid sm:grid-cols-3 gap-8">
            {STEPS.map((step) => (
              <div key={step.num} className="text-center sm:text-left">
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-primary-container text-on-primary-container font-label text-sm font-bold mb-4">
                  {step.num}
                </div>
                <h3 className="font-headline font-bold text-lg text-on-surface mb-2">{step.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────── */}
      <section
        id="cta"
        className="py-24 px-6"
        style={{
          background: 'linear-gradient(165deg, #0e5b6c 0%, #226779 100%)',
        }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-headline font-extrabold text-3xl sm:text-4xl text-on-primary mb-4">
            Begin your journey toward freedom
          </h2>
          <p className="text-on-primary/70 mb-8 max-w-md mx-auto">
            Free to start. No credit card required. Takes 3 minutes to set up.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-surface-container-lowest text-primary text-base font-semibold rounded-full hover:bg-surface-container-low transition-colors"
          >
            Create Your Account
          </Link>
          <p className="mt-6 text-sm text-on-primary/50">
            Your data is encrypted end-to-end. We never see your content.
          </p>
        </div>
      </section>
    </div>
  );
}
