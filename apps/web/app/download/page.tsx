'use client';

import Link from 'next/link';
import { useState } from 'react';
import PublicNav from '@/components/PublicNav';

function MaterialIcon({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>;
}

/* ── Chrome Web Store URL (update once published) ────────────── */
const CHROME_STORE_URL = '#'; // TODO: replace with Chrome Web Store link after submission
const SAFARI_AVAILABLE = false; // flip to true once Safari extension ships

const EXTENSION_FEATURES = [
  { icon: 'monitoring', label: 'Real-time Monitoring' },
  { icon: 'shield', label: 'Privacy-first' },
  { icon: 'wifi_off', label: 'Offline Support' },
  { icon: 'category', label: 'Auto-categorization' },
];

const PWA_PLATFORMS = [
  {
    icon: 'phone_iphone',
    title: 'iPhone & iPad',
    steps: [
      'Open becandid.io in Safari',
      'Tap the Share button (box with arrow)',
      'Scroll down → "Add to Home Screen"',
      'Tap "Add"',
    ],
    note: 'iOS 16.4+ required',
  },
  {
    icon: 'phone_android',
    title: 'Android',
    steps: [
      'Open becandid.io in Chrome',
      'Tap the three-dot menu (⋮)',
      'Tap "Add to Home Screen" or "Install App"',
      'Tap "Install"',
    ],
    note: 'Push notifications supported',
  },
];

export default function DownloadPage() {
  const [showDesktopPWA, setShowDesktopPWA] = useState(false);

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <PublicNav />

      <main className="pt-24">
        {/* ── Hero ──────────────────────────────────────────── */}
        <section className="px-6 lg:px-12 pt-20 pb-16 max-w-screen-2xl mx-auto text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-surface-container-low rounded-full">
              <MaterialIcon name="extension" className="text-primary text-lg" />
              <span className="font-label text-xs font-bold uppercase tracking-widest text-primary">Browser Extensions</span>
            </div>

            <h1 className="font-headline text-5xl lg:text-7xl font-extrabold text-on-surface tracking-tighter leading-[1.05]">
              Monitor Your<br />Digital Life
            </h1>

            <p className="font-body text-xl text-on-surface-variant leading-relaxed opacity-80 max-w-2xl mx-auto">
              Install the Be Candid browser extension for real-time awareness monitoring. Privacy-first &mdash; only domain names are tracked, never full URLs or page content.
            </p>
          </div>
        </section>

        {/* ── Browser Extensions (Primary) ─────────────────── */}
        <section className="px-6 lg:px-12 pb-12 max-w-screen-2xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Chrome Extension */}
            <div className="relative overflow-hidden bg-gradient-to-br from-primary/[0.06] to-primary/[0.02] rounded-2xl p-8 ring-1 ring-primary/15 hover:ring-primary/30 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#4285F4" />
                    <circle cx="12" cy="12" r="4" fill="white" />
                    <path d="M12 2a10 10 0 0 1 8.66 5H12" fill="#EA4335" />
                    <path d="M3.34 7A10 10 0 0 1 12 2v5" fill="#FBBC05" />
                    <path d="M2 12a10 10 0 0 0 1.34 5l4.33-7.5" fill="#FBBC05" />
                    <path d="M12 22a10 10 0 0 1-8.66-5l4.33-7.5" fill="#34A853" />
                    <path d="M20.66 17A10 10 0 0 0 22 12H12" fill="#4285F4" />
                    <path d="M12 22a10 10 0 0 0 8.66-5H12" fill="#34A853" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-headline text-2xl font-bold text-on-surface">Chrome</h3>
                  <p className="font-body text-sm text-on-surface-variant">Chrome, Edge, Brave, Arc &amp; Chromium browsers</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {EXTENSION_FEATURES.map((f) => (
                  <span key={f.label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/[0.08] text-primary font-label text-xs font-medium">
                    <MaterialIcon name={f.icon} className="text-sm" />
                    {f.label}
                  </span>
                ))}
              </div>

              <p className="font-body text-sm text-on-surface-variant leading-relaxed mb-6">
                Tracks which sites you visit and for how long. Automatically categorizes browsing, flags harmful content, and syncs to your dashboard in real-time. Works offline.
              </p>

              <a
                href={CHROME_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-on-primary rounded-full font-label font-bold text-sm tracking-wide shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-110 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <MaterialIcon name="add_circle" className="text-lg" />
                Add to Chrome
              </a>

              <p className="font-label text-[10px] text-on-surface-variant/60 mt-3">
                Free &middot; Requires a Be Candid account
              </p>
            </div>

            {/* Safari Extension */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-500/[0.04] to-blue-500/[0.01] rounded-2xl p-8 ring-1 ring-outline-variant/10 hover:ring-blue-500/20 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-8 h-8">
                    <circle cx="12" cy="12" r="11" fill="#006CFF" />
                    <path d="M12 3l2 9-9 2 7-11z" fill="white" opacity="0.9" />
                    <path d="M12 21l-2-9 9-2-7 11z" fill="white" opacity="0.6" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-headline text-2xl font-bold text-on-surface">Safari</h3>
                  <p className="font-body text-sm text-on-surface-variant">macOS &amp; iOS Safari</p>
                </div>
                {!SAFARI_AVAILABLE && (
                  <span className="ml-auto px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-label text-[10px] font-bold uppercase tracking-wider">
                    Coming Soon
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {EXTENSION_FEATURES.map((f) => (
                  <span key={f.label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/[0.08] text-blue-600 font-label text-xs font-medium">
                    <MaterialIcon name={f.icon} className="text-sm" />
                    {f.label}
                  </span>
                ))}
              </div>

              <p className="font-body text-sm text-on-surface-variant leading-relaxed mb-6">
                Same privacy-first monitoring for Safari on Mac and iPhone. All the same features as the Chrome extension, built with Apple&rsquo;s Safari Web Extension framework.
              </p>

              {SAFARI_AVAILABLE ? (
                <a
                  href="#"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-full font-label font-bold text-sm tracking-wide shadow-lg shadow-blue-600/20 hover:shadow-xl hover:brightness-110 active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  <MaterialIcon name="download" className="text-lg" />
                  Get for Safari
                </a>
              ) : (
                <button
                  disabled
                  className="inline-flex items-center gap-2 px-8 py-4 bg-surface-container text-on-surface-variant rounded-full font-label font-bold text-sm tracking-wide opacity-60 cursor-not-allowed"
                >
                  <MaterialIcon name="notifications" className="text-lg" />
                  Notify Me When Available
                </button>
              )}

              <p className="font-label text-[10px] text-on-surface-variant/60 mt-3">
                macOS 12+ &middot; iOS 16.4+ &middot; Safari 16.4+
              </p>
            </div>
          </div>
        </section>

        {/* ── Desktop Screen Monitor ────────────────────── */}
        <section className="px-6 lg:px-12 pb-12 max-w-screen-2xl mx-auto">
          <div className="relative overflow-hidden bg-gradient-to-br from-violet-500/[0.05] to-violet-500/[0.01] rounded-2xl p-8 ring-1 ring-violet-500/10 hover:ring-violet-500/20 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col md:flex-row md:items-start gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                    <MaterialIcon name="desktop_windows" className="text-violet-600 text-3xl" />
                  </div>
                  <div>
                    <h3 className="font-headline text-2xl font-bold text-on-surface">Desktop Screen Monitor</h3>
                    <p className="font-body text-sm text-on-surface-variant">macOS &amp; Windows</p>
                  </div>
                  <span className="ml-auto px-3 py-1 rounded-full bg-violet-500/10 text-violet-600 font-label text-[10px] font-bold uppercase tracking-wider">
                    New
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {[
                    { icon: 'screenshot_monitor', label: 'Full Screen Monitoring' },
                    { icon: 'psychology', label: 'AI Analysis' },
                    { icon: 'login', label: 'Auto-launch' },
                    { icon: 'visibility_off', label: 'Screenshots Never Stored' },
                  ].map((f) => (
                    <span key={f.label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-500/[0.08] text-violet-600 font-label text-xs font-medium">
                      <MaterialIcon name={f.icon} className="text-sm" />
                      {f.label}
                    </span>
                  ))}
                </div>

                <p className="font-body text-sm text-on-surface-variant leading-relaxed mb-6">
                  Goes beyond browsers &mdash; monitors your entire screen across all apps. Takes periodic screenshots every 5 minutes, analyzes them with AI to detect categories you&rsquo;re tracking, then immediately deletes the image. Runs silently in your menu bar.
                </p>

                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://github.com/YachtingAdvisors/becandid/releases/download/v1.0.0/BeCandid-1.0.0-mac-arm64.dmg"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-violet-600 text-white rounded-full font-label font-bold text-sm tracking-wide shadow-lg shadow-violet-600/20 hover:shadow-xl hover:brightness-110 active:scale-95 transition-all duration-200 cursor-pointer"
                  >
                    <MaterialIcon name="download" className="text-lg" />
                    Download for Mac
                  </a>
                  <button
                    disabled
                    className="inline-flex items-center gap-2 px-8 py-4 bg-surface-container text-on-surface-variant rounded-full font-label font-bold text-sm tracking-wide opacity-60 cursor-not-allowed"
                  >
                    <MaterialIcon name="download" className="text-lg" />
                    Windows — Coming Soon
                  </button>
                </div>

                <p className="font-label text-[10px] text-on-surface-variant/60 mt-3">
                  Free &middot; Requires a Be Candid account &middot; macOS 12+ / Windows 10+
                </p>
              </div>

              {/* How it works mini-diagram */}
              <div className="md:w-72 flex-shrink-0 bg-white/60 rounded-xl p-5 ring-1 ring-violet-500/5">
                <h4 className="font-label text-[10px] font-bold uppercase tracking-wider text-violet-600 mb-4">How It Works</h4>
                <div className="space-y-3">
                  {[
                    { step: '1', text: 'Takes a screenshot every 5 min' },
                    { step: '2', text: 'Compares with previous — skips if unchanged' },
                    { step: '3', text: 'AI classifies against your goals' },
                    { step: '4', text: 'Creates event if flagged — deletes image' },
                  ].map((s) => (
                    <div key={s.step} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px] font-bold">
                        {s.step}
                      </span>
                      <span className="font-body text-xs text-on-surface-variant leading-relaxed">{s.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Mobile Apps (Secondary) ──────────────────────── */}
        <section className="px-6 lg:px-12 pb-12 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <MaterialIcon name="phone_iphone" className="text-primary text-xl" />
            <h2 className="font-headline text-xl font-bold text-on-surface">Mobile Apps</h2>
            <span className="font-label text-[10px] font-bold uppercase tracking-wider text-on-surface-variant bg-surface-container px-3 py-1 rounded-full">PWA</span>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {PWA_PLATFORMS.map((card) => (
              <div
                key={card.title}
                className="bg-surface-container-lowest rounded-2xl p-6 ring-1 ring-outline-variant/10 hover:ring-primary/15 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MaterialIcon name={card.icon} className="text-primary text-xl" />
                  </div>
                  <h3 className="font-headline text-lg font-bold text-on-surface">{card.title}</h3>
                </div>

                <ol className="space-y-2.5 mb-4">
                  {card.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-[10px] font-bold font-label mt-0.5">
                        {i + 1}
                      </span>
                      <span className="font-body text-sm text-on-surface-variant leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>

                <div className="flex items-center gap-2 pt-3 border-t border-outline-variant/10">
                  <MaterialIcon name="info" className="text-primary text-sm" />
                  <p className="font-label text-[10px] text-on-surface-variant">{card.note}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Desktop PWA (Collapsible) ────────────────────── */}
        <section className="px-6 lg:px-12 pb-12 max-w-screen-2xl mx-auto">
          <button
            onClick={() => setShowDesktopPWA(!showDesktopPWA)}
            className="flex items-center gap-3 w-full text-left cursor-pointer group"
          >
            <MaterialIcon name="laptop_mac" className="text-on-surface-variant text-xl group-hover:text-primary transition-colors" />
            <h2 className="font-headline text-lg font-bold text-on-surface group-hover:text-primary transition-colors">Desktop PWA</h2>
            <MaterialIcon
              name={showDesktopPWA ? 'expand_less' : 'expand_more'}
              className="text-on-surface-variant ml-auto"
            />
          </button>

          {showDesktopPWA && (
            <div className="grid md:grid-cols-2 gap-6 mt-4">
              {[
                {
                  icon: 'laptop_mac',
                  title: 'macOS',
                  steps: [
                    'Open becandid.io in Chrome or Edge',
                    'Click the install icon (⊕) in the address bar',
                    'Click "Install"',
                  ],
                  note: 'Runs as a standalone window',
                },
                {
                  icon: 'desktop_windows',
                  title: 'Windows',
                  steps: [
                    'Open becandid.io in Chrome or Edge',
                    'Click the install icon (⊕) in the address bar',
                    'Click "Install"',
                  ],
                  note: 'Adds to Start Menu and Taskbar',
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="bg-surface-container-lowest rounded-2xl p-6 ring-1 ring-outline-variant/10"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <MaterialIcon name={card.icon} className="text-primary text-xl" />
                    </div>
                    <h3 className="font-headline text-lg font-bold text-on-surface">{card.title}</h3>
                  </div>
                  <ol className="space-y-2.5 mb-4">
                    {card.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-[10px] font-bold font-label mt-0.5">
                          {i + 1}
                        </span>
                        <span className="font-body text-sm text-on-surface-variant leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="flex items-center gap-2 pt-3 border-t border-outline-variant/10">
                    <MaterialIcon name="info" className="text-primary text-sm" />
                    <p className="font-label text-[10px] text-on-surface-variant">{card.note}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Use in Browser ───────────────────────────────── */}
        <section className="px-6 lg:px-12 pb-16 max-w-screen-2xl mx-auto">
          <div className="bg-surface-container-lowest rounded-2xl p-8 ring-1 ring-outline-variant/10 hover:ring-primary/15 hover:shadow-md transition-all duration-300">
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
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-on-primary rounded-full font-label font-bold text-sm tracking-wide shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-110 active:scale-95 transition-all duration-200 whitespace-nowrap cursor-pointer"
              >
                Open Web App
                <MaterialIcon name="arrow_forward" className="text-lg" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Why Extensions + Security ─────────────────────── */}
        <section className="px-6 lg:px-12 py-24 bg-surface-container-low">
          <div className="max-w-screen-2xl mx-auto grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <MaterialIcon name="extension" className="text-primary text-2xl" />
                <h2 className="font-headline text-2xl font-bold text-on-surface">Why a browser extension?</h2>
              </div>
              <p className="font-body text-on-surface-variant leading-relaxed">
                The extension runs quietly in the background, automatically tracking which websites you visit and for how long. Unlike a web app alone, it monitors your entire browsing session &mdash; not just time spent in Be Candid. Domain classification happens locally on your device for maximum privacy.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <MaterialIcon name="encrypted" className="text-primary text-2xl" />
                <h2 className="font-headline text-2xl font-bold text-on-surface">Your data is safe</h2>
              </div>
              <p className="font-body text-on-surface-variant leading-relaxed">
                Only domain names are recorded &mdash; never full URLs, search queries, or page content. Domains are SHA-256 hashed before leaving your device. All data is encrypted in transit and at rest. No screenshots, keystrokes, or screen recordings.
              </p>
              <Link
                href="/privacy"
                className="inline-flex items-center gap-2 text-primary font-label text-sm font-semibold hover:underline cursor-pointer"
              >
                Read our Privacy Policy
                <MaterialIcon name="arrow_forward" className="text-base" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
