'use client';

import Link from 'next/link';

function MaterialIcon({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>;
}

const PLATFORM_CARDS = [
  {
    icon: 'phone_iphone',
    title: 'iPhone & iPad',
    steps: [
      'Open becandid.io in Safari',
      'Tap the Share button (box with arrow)',
      'Scroll down and tap "Add to Home Screen"',
      'Tap "Add" to confirm',
    ],
    note: 'Works on iOS 16.4+ with full PWA support',
  },
  {
    icon: 'phone_android',
    title: 'Android',
    steps: [
      'Open becandid.io in Chrome',
      'Tap the three-dot menu (\u22EE)',
      'Tap "Add to Home Screen" or "Install App"',
      'Tap "Install" to confirm',
    ],
    note: 'Full offline support and push notifications',
  },
  {
    icon: 'laptop_mac',
    title: 'macOS',
    steps: [
      'Open becandid.io in Chrome or Edge',
      'Click the install icon (\u2295) in the address bar',
      'Or go to Menu \u2192 "Install Be Candid..."',
      'Click "Install" to confirm',
    ],
    note: 'Runs as a standalone window \u2014 no browser chrome',
  },
  {
    icon: 'desktop_windows',
    title: 'Windows',
    steps: [
      'Open becandid.io in Chrome or Edge',
      'Click the install icon (\u2295) in the address bar',
      'Or go to Settings \u2192 Apps \u2192 Install this site',
      'Click "Install" to confirm',
    ],
    note: 'Adds to Start Menu and Taskbar',
  },
];

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* ── TopNavBar ──────────────────────────────────────── */}
      <header className="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-xl">
        <nav className="flex justify-between items-center px-6 lg:px-12 py-6 max-w-screen-2xl mx-auto">
          <Link href="/" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Be Candid" className="w-8 h-8 object-contain" />
            <span className="text-2xl font-bold text-primary tracking-tighter">Be Candid</span>
          </Link>
          <div className="hidden md:flex items-center gap-10 font-body text-base tracking-tight">
            <Link href="/#features" className="text-on-surface opacity-80 hover:text-primary transition-colors duration-300">Features</Link>
            <Link href="/pricing" className="text-on-surface opacity-80 hover:text-primary transition-colors duration-300">Pricing</Link>
            <Link href="/download" className="text-primary font-semibold transition-colors duration-300">Download</Link>
            <Link href="/families" className="text-on-surface opacity-80 hover:text-primary transition-colors duration-300">Families</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/signin" className="text-on-surface opacity-80 hover:text-primary transition-colors duration-300 font-label text-sm font-semibold">
              Log in
            </Link>
            <Link href="/auth/signup" className="px-8 py-3 bg-primary text-on-primary rounded-full font-label text-sm font-semibold tracking-wide hover:brightness-110 active:scale-95 transition-all">
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <main className="pt-24">
        {/* ── Hero Section ──────────────────────────────────── */}
        <section className="px-6 lg:px-12 pt-20 pb-16 max-w-screen-2xl mx-auto text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-surface-container-low rounded-full">
              <MaterialIcon name="download" className="text-primary text-lg" />
              <span className="font-label text-xs font-bold uppercase tracking-widest text-primary">Install Anywhere</span>
            </div>

            <h1 className="font-headline text-5xl lg:text-7xl font-extrabold text-on-surface tracking-tighter leading-[1.05]">
              Download Be Candid
            </h1>

            <p className="font-body text-xl text-on-surface-variant leading-relaxed opacity-80 max-w-2xl mx-auto">
              Install Be Candid on any device. No app store required &mdash; it works instantly as a web app you can add to your home screen.
            </p>
          </div>
        </section>

        {/* ── Platform Cards Grid ──────────────────────────── */}
        <section className="px-6 lg:px-12 pb-16 max-w-screen-2xl mx-auto">
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {PLATFORM_CARDS.map((card) => (
              <div
                key={card.title}
                className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/10 hover:border-primary/20 transition-colors duration-300"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MaterialIcon name={card.icon} className="text-primary text-2xl" />
                  </div>
                  <h3 className="font-headline text-xl font-bold text-on-surface">{card.title}</h3>
                </div>

                <ol className="space-y-4 mb-6">
                  {card.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold font-label mt-0.5">
                        {i + 1}
                      </span>
                      <span className="font-body text-sm text-on-surface-variant leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>

                <div className="flex items-center gap-2 pt-4 border-t border-outline-variant/10">
                  <MaterialIcon name="info" className="text-primary text-base" />
                  <p className="font-label text-xs text-on-surface-variant">{card.note}</p>
                </div>
              </div>
            ))}

            {/* ── Web App Card (spans full remaining width) ──── */}
            <div className="md:col-span-2 xl:col-span-3 bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/10 hover:border-primary/20 transition-colors duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MaterialIcon name="language" className="text-primary text-2xl" />
                  </div>
                  <div>
                    <h3 className="font-headline text-xl font-bold text-on-surface">Use in Browser</h3>
                    <p className="font-body text-sm text-on-surface-variant mt-1">
                      No installation needed. Just visit becandid.io in any modern browser.
                    </p>
                  </div>
                </div>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-on-primary rounded-full font-label font-bold text-sm tracking-wide hover:brightness-110 active:scale-95 transition-all whitespace-nowrap"
                >
                  Open Web App
                  <MaterialIcon name="arrow_forward" className="text-lg" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Why a Web App + Security Note ─────────────────── */}
        <section className="px-6 lg:px-12 py-24 bg-surface-container-low">
          <div className="max-w-screen-2xl mx-auto grid md:grid-cols-2 gap-12">
            {/* Why a web app? */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <MaterialIcon name="web" className="text-primary text-2xl" />
                <h2 className="font-headline text-2xl font-bold text-on-surface">Why a web app?</h2>
              </div>
              <p className="font-body text-on-surface-variant leading-relaxed">
                Be Candid uses Progressive Web App technology for instant updates, no app store approval delays, and cross-platform compatibility. Every improvement we make is available the moment you open the app &mdash; no downloads or update prompts required.
              </p>
            </div>

            {/* Security note */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <MaterialIcon name="encrypted" className="text-primary text-2xl" />
                <h2 className="font-headline text-2xl font-bold text-on-surface">Your data is safe</h2>
              </div>
              <p className="font-body text-on-surface-variant leading-relaxed">
                Your data is encrypted end-to-end regardless of which platform you use. Whether you install the app or use it in your browser, the same enterprise-grade security protects every conversation, journal entry, and check-in.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
