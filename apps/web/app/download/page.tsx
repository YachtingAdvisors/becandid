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
    <div className="min-h-screen bg-dark-sanctuary text-slate-100">
      <PublicNav />

      <main className="pt-24">
        {/* ── Hero ──────────────────────────────────────────── */}
        <section className="px-6 lg:px-12 pt-20 pb-16 max-w-screen-2xl mx-auto text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/[0.05] rounded-full ring-1 ring-white/[0.06]">
              <MaterialIcon name="download" className="text-cyan-400 text-lg" />
              <span className="font-label text-xs font-bold uppercase tracking-widest text-cyan-400">Get Be Candid</span>
            </div>

            <h1 className="font-headline text-5xl lg:text-7xl font-extrabold text-slate-100 tracking-tighter leading-[1.05]">
              Monitor Your<br />Digital Life
            </h1>

            <p className="font-body text-xl text-stone-400 leading-relaxed opacity-80 max-w-2xl mx-auto">
              Desktop screen monitoring and mobile accountability &mdash; privacy-first, AI-powered, and always by your side.
            </p>
          </div>
        </section>

        {/* ── Primary: Desktop Monitor + Mobile App ─────── */}
        <section className="px-6 lg:px-12 pb-12 max-w-screen-2xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Desktop Screen Monitor */}
            <div className="relative overflow-hidden bg-white/[0.03] backdrop-blur-xl rounded-2xl p-8 ring-1 ring-white/[0.06] hover:ring-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/5 transition-all duration-300">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.05] flex items-center justify-center">
                  <MaterialIcon name="desktop_windows" className="text-cyan-400 text-3xl" />
                </div>
                <div>
                  <h3 className="font-headline text-2xl font-bold text-slate-100">Desktop Monitor</h3>
                  <p className="font-body text-sm text-stone-400">macOS &amp; Windows</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-5">
                {[
                  { icon: 'screenshot_monitor', label: 'Full Screen' },
                  { icon: 'psychology', label: 'AI Analysis' },
                  { icon: 'visibility_off', label: 'Never Stored' },
                ].map((f) => (
                  <span key={f.label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 font-label text-xs font-medium">
                    <MaterialIcon name={f.icon} className="text-sm" />
                    {f.label}
                  </span>
                ))}
              </div>

              <p className="font-body text-sm text-stone-400 leading-relaxed mb-6">
                Monitors your entire screen across all apps. AI analyzes periodic screenshots against your goals, then immediately deletes them. Runs silently in your menu bar.
              </p>

              <a
                href="https://github.com/YachtingAdvisors/becandid/releases/download/v1.0.0/BeCandid-1.0.0-mac-arm64.dmg"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-full font-label font-bold text-sm tracking-wide shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-110 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <MaterialIcon name="download" className="text-lg" />
                Download for Mac
              </a>

              <p className="font-label text-[10px] text-stone-500 mt-3">
                Free &middot; macOS 12+ &middot; Apple Silicon
              </p>

              <details className="mt-4 group">
                <summary className="flex items-center gap-2 cursor-pointer text-xs text-cyan-400 font-label font-medium hover:underline">
                  <MaterialIcon name="help" className="text-sm" />
                  macOS security warning?
                </summary>
                <div className="mt-3 p-4 rounded-xl bg-white/[0.03] ring-1 ring-white/[0.06] space-y-2">
                  <ol className="space-y-1.5">
                    {[
                      'Drag Be Candid to Applications',
                      'Try to open \u2014 click Done on the warning',
                      'System Settings \u2192 Privacy & Security \u2192 Open Anyway',
                    ].map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-stone-400 font-body">
                        <span className="flex-shrink-0 w-4 h-4 rounded-full bg-primary text-on-primary flex items-center justify-center text-[9px] font-bold mt-0.5">{i + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </details>
            </div>

            {/* Mobile App */}
            <div className="relative overflow-hidden bg-white/[0.03] backdrop-blur-xl rounded-2xl p-8 ring-1 ring-white/[0.06] hover:ring-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/5 transition-all duration-300">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.05] flex items-center justify-center">
                  <MaterialIcon name="phone_iphone" className="text-cyan-400 text-3xl" />
                </div>
                <div>
                  <h3 className="font-headline text-2xl font-bold text-slate-100">Mobile App</h3>
                  <p className="font-body text-sm text-stone-400">iPhone, iPad &amp; Android</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-5">
                {[
                  { icon: 'notifications_active', label: 'Push Notifications' },
                  { icon: 'check_circle', label: 'Check-ins' },
                  { icon: 'edit_note', label: 'Journal' },
                ].map((f) => (
                  <span key={f.label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 font-label text-xs font-medium">
                    <MaterialIcon name={f.icon} className="text-sm" />
                    {f.label}
                  </span>
                ))}
              </div>

              <p className="font-body text-sm text-stone-400 leading-relaxed mb-6">
                Your accountability companion on the go. Mood check-ins, guided journaling, conversation guides, and real-time alerts &mdash; all from your home screen.
              </p>

              <div className="space-y-4">
                <div className="bg-white/[0.03] rounded-xl p-4 ring-1 ring-white/[0.06]">
                  <h4 className="font-label text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-3">Install as App</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-label font-medium text-slate-100 mb-1">iPhone / iPad</p>
                      <p className="text-[11px] text-stone-400 font-body">Safari &rarr; Share &rarr; Add to Home Screen</p>
                    </div>
                    <div>
                      <p className="text-xs font-label font-medium text-slate-100 mb-1">Android</p>
                      <p className="text-[11px] text-stone-400 font-body">Chrome &rarr; Menu (&vellip;) &rarr; Install App</p>
                    </div>
                  </div>
                </div>
              </div>

              <p className="font-label text-[10px] text-stone-500 mt-3">
                Free &middot; iOS 16.4+ &middot; Android Chrome
              </p>
            </div>
          </div>
        </section>

        {/* ── Browser Extensions ───────────────────────────── */}
        <section className="px-6 lg:px-12 pb-12 max-w-screen-2xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Chrome Extension */}
            <div className="relative overflow-hidden bg-white/[0.03] backdrop-blur-xl rounded-2xl p-8 ring-1 ring-white/[0.06] hover:ring-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/5 transition-all duration-300">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.05] flex items-center justify-center">
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
                  <h3 className="font-headline text-2xl font-bold text-slate-100">Chrome</h3>
                  <p className="font-body text-sm text-stone-400">Chrome, Edge, Brave, Arc &amp; Chromium browsers</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {EXTENSION_FEATURES.map((f) => (
                  <span key={f.label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 font-label text-xs font-medium">
                    <MaterialIcon name={f.icon} className="text-sm" />
                    {f.label}
                  </span>
                ))}
              </div>

              <p className="font-body text-sm text-stone-400 leading-relaxed mb-6">
                Tracks which sites you visit and for how long. Automatically categorizes browsing, flags harmful content, and syncs to your dashboard in real-time. Works offline.
              </p>

              <a
                href={CHROME_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-full font-label font-bold text-sm tracking-wide shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-110 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <MaterialIcon name="add_circle" className="text-lg" />
                Add to Chrome
              </a>

              <p className="font-label text-[10px] text-stone-500 mt-3">
                Free &middot; Requires a Be Candid account
              </p>
            </div>

            {/* Safari Extension */}
            <div className="relative overflow-hidden bg-white/[0.03] backdrop-blur-xl rounded-2xl p-8 ring-1 ring-white/[0.06] hover:ring-blue-500/20 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.05] flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-8 h-8">
                    <circle cx="12" cy="12" r="11" fill="#006CFF" />
                    <path d="M12 3l2 9-9 2 7-11z" fill="white" opacity="0.9" />
                    <path d="M12 21l-2-9 9-2-7 11z" fill="white" opacity="0.6" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-headline text-2xl font-bold text-slate-100">Safari</h3>
                  <p className="font-body text-sm text-stone-400">macOS &amp; iOS Safari</p>
                </div>
                {!SAFARI_AVAILABLE && (
                  <span className="ml-auto px-3 py-1 rounded-full bg-white/[0.05] text-stone-400 font-label text-[10px] font-bold uppercase tracking-wider">
                    Coming Soon
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {EXTENSION_FEATURES.map((f) => (
                  <span key={f.label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 font-label text-xs font-medium">
                    <MaterialIcon name={f.icon} className="text-sm" />
                    {f.label}
                  </span>
                ))}
              </div>

              <p className="font-body text-sm text-stone-400 leading-relaxed mb-6">
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
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/[0.05] text-stone-500 rounded-full font-label font-bold text-sm tracking-wide opacity-60 cursor-not-allowed"
                >
                  <MaterialIcon name="notifications" className="text-lg" />
                  Notify Me When Available
                </button>
              )}

              <p className="font-label text-[10px] text-stone-500 mt-3">
                macOS 12+ &middot; iOS 16.4+ &middot; Safari 16.4+
              </p>
            </div>
          </div>
        </section>

        {/* Old mobile apps section removed — now in primary hero grid above */}

        {/* ── Desktop PWA (Collapsible) ────────────────────── */}
        <section className="px-6 lg:px-12 pb-12 max-w-screen-2xl mx-auto">
          <button
            onClick={() => setShowDesktopPWA(!showDesktopPWA)}
            className="flex items-center gap-3 w-full text-left cursor-pointer group"
          >
            <MaterialIcon name="laptop_mac" className="text-stone-400 text-xl group-hover:text-cyan-400 transition-colors" />
            <h2 className="font-headline text-lg font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">Desktop PWA</h2>
            <MaterialIcon
              name={showDesktopPWA ? 'expand_less' : 'expand_more'}
              className="text-stone-400 ml-auto"
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
                  className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-6 ring-1 ring-white/[0.06]"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                      <MaterialIcon name={card.icon} className="text-cyan-400 text-xl" />
                    </div>
                    <h3 className="font-headline text-lg font-bold text-slate-100">{card.title}</h3>
                  </div>
                  <ol className="space-y-2.5 mb-4">
                    {card.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-[10px] font-bold font-label mt-0.5">
                          {i + 1}
                        </span>
                        <span className="font-body text-sm text-stone-400 leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="flex items-center gap-2 pt-3 border-t border-white/[0.06]">
                    <MaterialIcon name="info" className="text-cyan-400 text-sm" />
                    <p className="font-label text-[10px] text-stone-400">{card.note}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Use in Browser ───────────────────────────────── */}
        <section className="px-6 lg:px-12 pb-16 max-w-screen-2xl mx-auto">
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-8 ring-1 ring-white/[0.06] hover:ring-cyan-500/15 hover:shadow-md hover:shadow-cyan-500/5 transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <MaterialIcon name="language" className="text-cyan-400 text-2xl" />
                </div>
                <div>
                  <h3 className="font-headline text-xl font-bold text-slate-100">Use in Browser</h3>
                  <p className="font-body text-sm text-stone-400 mt-1">
                    No installation needed. Just visit becandid.io in any modern browser.
                  </p>
                </div>
              </div>
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-full font-label font-bold text-sm tracking-wide shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-110 active:scale-95 transition-all duration-200 whitespace-nowrap cursor-pointer"
              >
                Open Web App
                <MaterialIcon name="arrow_forward" className="text-lg" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Why Extensions + Security ─────────────────────── */}
        <section className="px-6 lg:px-12 py-24 bg-white/[0.02]">
          <div className="max-w-screen-2xl mx-auto grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <MaterialIcon name="extension" className="text-cyan-400 text-2xl" />
                <h2 className="font-headline text-2xl font-bold text-slate-100">Why a browser extension?</h2>
              </div>
              <p className="font-body text-stone-400 leading-relaxed">
                The extension runs quietly in the background, automatically tracking which websites you visit and for how long. Unlike a web app alone, it monitors your entire browsing session &mdash; not just time spent in Be Candid. Domain classification happens locally on your device for maximum privacy.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <MaterialIcon name="encrypted" className="text-cyan-400 text-2xl" />
                <h2 className="font-headline text-2xl font-bold text-slate-100">Your data is safe</h2>
              </div>
              <p className="font-body text-stone-400 leading-relaxed">
                Only domain names are recorded &mdash; never full URLs, search queries, or page content. Domains are SHA-256 hashed before leaving your device. All data is encrypted in transit and at rest. No screenshots, keystrokes, or screen recordings.
              </p>
              <Link
                href="/privacy"
                className="inline-flex items-center gap-2 text-cyan-400 font-label text-sm font-semibold hover:underline cursor-pointer"
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
