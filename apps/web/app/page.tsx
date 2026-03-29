import Link from 'next/link';

const FEATURES = [
  {
    icon: '\u{1F916}',
    title: 'AI Conversation Guides',
    desc: 'When a pattern surfaces, personalized guides grounded in Motivational Interviewing help you and your partner have meaningful conversations about alignment.',
  },
  {
    icon: '\u{1F4D3}',
    title: 'Stringer Journal',
    desc: 'Guided prompts based on Jay Stringer\u2019s framework help you understand the tributaries, longings, and roadmap beneath your patterns \u2014 so your digital life matches your real life.',
  },
  {
    icon: '\u{1F514}',
    title: 'Partner Awareness',
    desc: 'Your accountability partner receives context and AI-generated conversation starters when patterns emerge \u2014 clarity, not surveillance.',
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
    title: 'Alignment Tracking',
    desc: 'Morning and evening segments keep you grounded. Build streaks, track congruence, and see how your screen time matches who you want to be.',
  },
  {
    icon: '\u{1F6E1}\u{FE0F}',
    title: 'AI Content Filtering',
    desc: 'AI-powered content filtering blocks harmful websites while allowing age-appropriate browsing for teens and adults.',
  },
  {
    icon: '\u{23F1}\u{FE0F}',
    title: 'Screen Time Controls',
    desc: 'Set healthy limits by category, schedule downtime, and build self-regulation with visual usage breakdowns.',
  },
  {
    icon: '\u{1F468}\u{200D}\u{1F469}\u{200D}\u{1F467}',
    title: 'Guardian Dashboard',
    desc: 'Parents get a dedicated dashboard with teen activity summaries, alerts, and conversation guides while respecting privacy.',
  },
  {
    icon: '\u{1F6AB}',
    title: 'Sexting Prevention',
    desc: 'AI detection and real-time alerts help protect teens from harmful messaging patterns with age-appropriate guidance.',
  },
];

const PILLARS = [
  {
    emoji: '\u{1F30A}',
    title: 'Trace the Tributaries',
    desc: 'Your patterns don\u2019t come from nowhere. Identify the family dynamics, attachment wounds, and emotional currents that shape who you are online and off.',
  },
  {
    emoji: '\u{1F49B}',
    title: 'Name the Longing',
    desc: 'Beneath every pattern is an unmet need \u2014 for connection, significance, or rest. The Stringer Journal helps you name it so you can meet it with integrity.',
  },
  {
    emoji: '\u{1F9ED}',
    title: 'Follow the Roadmap',
    desc: 'With clarity about your story and desires, build concrete steps toward congruence \u2014 where the person you are online is the person you are.',
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Define who you want to be',
    desc: 'Choose the areas where you want alignment \u2014 from screen time to social media, and everything in between.',
  },
  {
    num: '02',
    title: 'Invite a trusted partner',
    desc: 'A friend, spouse, mentor, or coach. They get clarity and AI-generated conversation guides. Or go solo \u2014 your call.',
  },
  {
    num: '03',
    title: 'Build digital integrity',
    desc: 'Track alignment streaks, journal with Stringer prompts, and have conversations that build congruence between your screen time and your real life.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Header (sticky, glass) ─────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/80 glass-effect border-b border-outline-variant/30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Be Candid" className="h-8 w-auto" />
          </Link>

          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-6">
              <a href="#pillars" className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">
                Features
              </a>
              <Link href="/pricing" className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">
                Pricing
              </Link>
              <a href="#download" className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">
                Download
              </a>
              <a href="#cta" className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">
                About
              </a>
              <Link href="/families" className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">
                Families
              </Link>
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
            Accountability for every
            <br />
            stage of life
          </h1>

          <p className="text-lg sm:text-xl text-on-primary/80 leading-relaxed max-w-2xl mx-auto mb-10">
            The most confident, inspiring and attractive people are those whose screen time
            and face time matches the person they want to be across their lifetime.
          </p>

          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-surface-container-lowest text-primary text-base font-semibold rounded-full hover:bg-surface-container-low transition-colors"
          >
            Become Who You Want to Be
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
            Designed with neurologists and licensed mental health counselors to help you understand yourself, not restrict yourself
          </p>
        </div>
      </section>

      {/* ── For Adults & Families ──────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Adults Card */}
          <div className="card p-8">
            <div className="text-3xl mb-4">{'\uD83E\uDDED'}</div>
            <h3 className="font-headline font-bold text-xl text-on-surface mb-2">For Adults</h3>
            <p className="text-sm text-on-surface-variant mb-4">Self-directed accountability with AI-powered conversation guides, partner support, and the Stringer therapeutic framework.</p>
            <Link href="/auth/signup" className="text-primary font-label font-bold text-sm uppercase tracking-wider hover:underline">Get Started &rarr;</Link>
          </div>
          {/* Families Card */}
          <div className="card p-8 bg-secondary-container/30">
            <div className="text-3xl mb-4">{'\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67'}</div>
            <h3 className="font-headline font-bold text-xl text-on-surface mb-2">For Teens &amp; Families</h3>
            <p className="text-sm text-on-surface-variant mb-4">Parent-managed content filtering, screen time controls, real-time alerts, and age-appropriate guidance &mdash; accountability without surveillance.</p>
            <Link href="/families" className="text-primary font-label font-bold text-sm uppercase tracking-wider hover:underline">Learn More &rarr;</Link>
          </div>
        </div>
      </section>

      {/* ── 3-Pillar Section (Stringer Framework) ─────────── */}
      <section id="pillars" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center font-label text-xs font-semibold text-primary uppercase tracking-widest mb-3">
            Built on Jay Stringer&apos;s Framework
          </p>
          <h2 className="font-headline font-extrabold text-3xl sm:text-4xl text-on-surface text-center mb-4">
            Understand yourself, align your life
          </h2>
          <p className="text-center text-on-surface-variant mb-16 max-w-lg mx-auto">
            Congruence builds confidence. Be Candid helps you understand the story
            beneath your patterns so your digital life matches who you really are.
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
            Everything you need for digital integrity
          </h2>
          <p className="text-center text-on-surface-variant mb-16 max-w-lg mx-auto">
            Awareness, journaling, conversation guides, and alignment tracking &mdash; all in one place.
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
            Three steps to align your screen time with who you want to be.
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

      {/* ── Download Section ─────────────────────────────── */}
      <section id="download" className="py-24 px-6 bg-surface-container-low">
        <div className="max-w-5xl mx-auto">
          <p className="text-center font-label text-xs font-semibold text-primary uppercase tracking-widest mb-3">
            Available Everywhere
          </p>
          <h2 className="font-headline font-extrabold text-3xl sm:text-4xl text-on-surface text-center mb-4">
            Download Be Candid
          </h2>
          <p className="text-center text-on-surface-variant mb-16 max-w-lg mx-auto">
            Native apps for mobile and desktop. Your data syncs seamlessly across all devices, end-to-end encrypted.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* iOS */}
            <div className="card p-8 text-center flex flex-col items-center gap-4 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center text-3xl">
                📱
              </div>
              <div>
                <h3 className="font-headline font-bold text-lg text-on-surface">iPhone &amp; iPad</h3>
                <p className="text-sm text-on-surface-variant mt-1">iOS 16+ required</p>
              </div>
              <a
                href="https://apps.apple.com/app/be-candid"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-6 bg-primary text-on-primary rounded-full font-label font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity text-center"
              >
                App Store
              </a>
              <p className="text-xs text-on-surface-variant">Includes Screen Time awareness</p>
            </div>

            {/* Android */}
            <div className="card p-8 text-center flex flex-col items-center gap-4 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 rounded-2xl bg-secondary-container flex items-center justify-center text-3xl">
                🤖
              </div>
              <div>
                <h3 className="font-headline font-bold text-lg text-on-surface">Android</h3>
                <p className="text-sm text-on-surface-variant mt-1">Android 10+ required</p>
              </div>
              <a
                href="https://play.google.com/store/apps/details?id=io.becandid.app"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-6 bg-primary text-on-primary rounded-full font-label font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity text-center"
              >
                Google Play
              </a>
              <p className="text-xs text-on-surface-variant">Includes UsageStats awareness</p>
            </div>

            {/* Web App */}
            <div className="card p-8 text-center flex flex-col items-center gap-4 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 rounded-2xl bg-tertiary-container flex items-center justify-center text-3xl">
                🌐
              </div>
              <div>
                <h3 className="font-headline font-bold text-lg text-on-surface">Web App</h3>
                <p className="text-sm text-on-surface-variant mt-1">Chrome, Safari, Firefox, Edge</p>
              </div>
              <Link
                href="/auth/signup"
                className="w-full py-3 px-6 bg-primary text-on-primary rounded-full font-label font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity text-center"
              >
                Open in Browser
              </Link>
              <p className="text-xs text-on-surface-variant">No download required — works instantly</p>
            </div>
          </div>

          {/* Desktop Section */}
          <div className="card p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-primary-container/50 flex items-center justify-center text-2xl flex-shrink-0">
                💻
              </div>
              <div className="text-center sm:text-left">
                <h3 className="font-headline font-bold text-xl text-on-surface">Desktop Apps</h3>
                <p className="text-sm text-on-surface-variant mt-1">
                  Full dashboard experience with background awareness. Coming soon for macOS, Windows, and Linux.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center justify-center gap-3 py-3 px-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 opacity-60 cursor-default">
                <span className="text-xl">🍎</span>
                <div className="text-left">
                  <p className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Coming Soon</p>
                  <p className="font-headline font-bold text-on-surface">macOS</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3 py-3 px-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 opacity-60 cursor-default">
                <span className="text-xl">🪟</span>
                <div className="text-left">
                  <p className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Coming Soon</p>
                  <p className="font-headline font-bold text-on-surface">Windows</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3 py-3 px-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 opacity-60 cursor-default">
                <span className="text-xl">🐧</span>
                <div className="text-left">
                  <p className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Coming Soon</p>
                  <p className="font-headline font-bold text-on-surface">Linux</p>
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-on-surface-variant mt-4">
              Desktop apps are currently in beta. <Link href="/auth/signup" className="text-primary hover:underline">Sign up</Link> to get early access.
            </p>
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
            Become who you want to be
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
