import Link from 'next/link';
import PublicNav from '@/components/PublicNav';

/* ── Chrome Web Store URL (update once published) ────────────── */
const CHROME_STORE_URL = '#'; // TODO: replace with Chrome Web Store link after submission

/* ── Reusable icon component ─────────────────────────────────── */
function MaterialIcon({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>;
}

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden">
      <PublicNav />

      <main>
        {/* ── Hero ──────────────────────────────────────────── */}
        <section
          className="relative pt-40 pb-20 px-6 lg:px-12"
          style={{ background: 'radial-gradient(circle at center, #16809820 0%, #0f172a 70%)' }}
        >
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tighter leading-[1.05]">
              Install Your{' '}
              <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Sanctuary
              </span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Choose the architecture of your accountability. Professional-grade tools for every platform.
            </p>
          </div>
        </section>

        {/* ── Platform Cards ───────────────────────────────── */}
        <section className="px-6 lg:px-12 pb-24 max-w-screen-xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Chrome Extension */}
            <div
              className="rounded-2xl p-8 hover:shadow-xl hover:shadow-teal-500/5 transition-all duration-300"
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-5">
                <MaterialIcon name="language" className="text-teal-400 text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Chrome Extension</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-5">
                Real-time web monitoring with AI content filtering
              </p>

              <ul className="space-y-3 mb-6">
                {['Screen awareness', 'Content filter', '5-min sync intervals'].map((feat) => (
                  <li key={feat} className="flex items-center gap-2.5 text-sm text-slate-400">
                    <MaterialIcon name="check_circle" className="text-teal-500 text-lg" />
                    {feat}
                  </li>
                ))}
              </ul>

              <a
                href={CHROME_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 w-full justify-center px-6 py-3.5 bg-gradient-to-r from-teal-600 to-primary-container text-white rounded-full font-label font-bold text-sm tracking-wide shadow-lg shadow-teal-600/20 hover:shadow-xl hover:brightness-110 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <MaterialIcon name="add_circle" className="text-lg" />
                Add to Chrome
              </a>

              <p className="text-stone-500 text-xs mt-4 text-center">
                Works with Chrome, Edge, Brave, and Arc
              </p>
            </div>

            {/* Desktop App (Recommended) */}
            <div
              className="rounded-2xl p-8 relative hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-300"
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(45, 212, 191, 0.15)',
                boxShadow: '0 0 30px rgba(45, 212, 191, 0.05)',
              }}
            >
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 font-label text-[10px] font-bold uppercase tracking-wider">
                  Recommended
                </span>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-5">
                <MaterialIcon name="desktop_windows" className="text-teal-400 text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Desktop App</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-5">
                Full screen capture + heartbeat monitoring
              </p>

              <ul className="space-y-3 mb-6">
                {['Screenshot analysis', 'Background heartbeat', 'System tray integration'].map((feat) => (
                  <li key={feat} className="flex items-center gap-2.5 text-sm text-slate-400">
                    <MaterialIcon name="check_circle" className="text-teal-500 text-lg" />
                    {feat}
                  </li>
                ))}
              </ul>

              <div className="w-full px-6 py-3.5 bg-stone-700 text-stone-400 rounded-full font-label font-bold text-sm tracking-wide text-center cursor-not-allowed">
                <MaterialIcon name="pause_circle" className="text-lg" />
                {' '}macOS — Temporarily Unavailable
              </div>
              <p className="text-amber-400/80 text-xs mt-4 text-center">
                The macOS build is being updated for Apple notarization. Check back soon.
              </p>
            </div>

            {/* Mobile App */}
            <div
              className="rounded-2xl p-8 hover:shadow-xl hover:shadow-teal-500/5 transition-all duration-300"
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-5">
                <MaterialIcon name="phone_android" className="text-teal-400 text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Mobile App</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-5">
                On-the-go accountability with usage tracking
              </p>

              <ul className="space-y-3 mb-6">
                {['App usage stats (Android)', 'VPN DNS filter', 'Push notifications'].map((feat) => (
                  <li key={feat} className="flex items-center gap-2.5 text-sm text-slate-400">
                    <MaterialIcon name="check_circle" className="text-teal-500 text-lg" />
                    {feat}
                  </li>
                ))}
              </ul>

              <div className="flex gap-2">
                <a
                  href="#"
                  className="flex-1 inline-flex items-center gap-2 justify-center px-4 py-3.5 bg-stone-800 hover:bg-stone-700 text-white rounded-full font-label font-bold text-sm tracking-wide transition-all duration-200 cursor-pointer"
                >
                  App Store
                </a>
                <a
                  href="#"
                  className="flex-1 inline-flex items-center gap-2 justify-center px-4 py-3.5 bg-stone-800 hover:bg-stone-700 text-white rounded-full font-label font-bold text-sm tracking-wide transition-all duration-200 cursor-pointer"
                >
                  Play Store
                </a>
              </div>

              <p className="text-stone-500 text-xs mt-4 text-center">
                PWA available now &mdash; add to home screen
              </p>
            </div>
          </div>
        </section>

        {/* ── PWA Instructions ─────────────────────────────── */}
        <section className="px-6 lg:px-12 pb-24 max-w-screen-xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Install as Web App</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              No app store needed. Add Be Candid to your home screen for an app-like experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '1', title: 'Visit becandid.io', desc: 'Open becandid.io on your phone\'s browser' },
              { step: '2', title: 'Open Share Menu', desc: 'Tap the share button (iOS) or menu (Android)' },
              { step: '3', title: 'Add to Home Screen', desc: 'Select "Add to Home Screen" and confirm' },
            ].map((card) => (
              <div
                key={card.step}
                className="rounded-2xl p-6 text-center"
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div className="w-10 h-10 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  {card.step}
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{card.title}</h3>
                <p className="text-slate-400 text-sm">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Feature Comparison ───────────────────────────── */}
        <section className="px-6 lg:px-12 pb-24 max-w-screen-xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: 'sync', title: 'Cross-Platform Sync', desc: 'Your data follows you everywhere' },
              { icon: 'lock', title: 'End-to-End Encryption', desc: 'All monitoring data encrypted at rest' },
              { icon: 'battery_charging_full', title: 'Battery Optimized', desc: 'Minimal impact on device performance' },
              { icon: 'cloud_off', title: 'Offline Support', desc: 'Events queue locally, sync when connected' },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-2xl p-6 flex items-start gap-4"
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center shrink-0">
                  <MaterialIcon name={card.icon} className="text-teal-400 text-2xl" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">{card.title}</h3>
                  <p className="text-slate-400 text-sm">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────── */}
        <section className="px-6 lg:px-12 pb-24 max-w-screen-xl mx-auto">
          <div
            className="rounded-2xl p-12 text-center"
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Ready to begin?</h2>
            <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
              Your sanctuary awaits. Start building accountability today.
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-600 to-primary-container text-white rounded-full font-label font-bold text-sm tracking-wide shadow-lg shadow-teal-600/20 hover:shadow-xl hover:brightness-110 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              Start Your Sanctuary
              <MaterialIcon name="arrow_forward" className="text-lg" />
            </Link>
          </div>
        </section>

        {/* ── Footer ──────────────────────────────────────── */}
        <footer className="border-t border-white/5 bg-stone-950">
          <div className="max-w-screen-xl mx-auto px-6 py-12">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
              {/* Brand */}
              <div className="col-span-2 lg:col-span-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="Be Candid" className="h-10 w-auto mb-4 brightness-[10]" />
                <p className="font-body text-sm text-stone-500 leading-relaxed max-w-xs">
                  A digital sanctuary for integrity, growth, and honest living.
                </p>
              </div>

              {/* Product */}
              <div>
                <h4 className="font-label text-xs font-semibold uppercase tracking-widest text-stone-400 mb-4">Product</h4>
                <ul className="space-y-2.5">
                  {[
                    { label: 'Features', href: '/#features' },
                    { label: 'Download', href: '/download' },
                    { label: 'Pricing', href: '/pricing' },
                    { label: 'Families', href: '/families' },
                    { label: 'Blog', href: '/blog' },
                    { label: 'Therapists', href: '/therapists' },
                  ].map((item) => (
                    <li key={item.label}>
                      <Link href={item.href} className="font-body text-sm text-stone-500 hover:text-cyan-400 transition-colors duration-200">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h4 className="font-label text-xs font-semibold uppercase tracking-widest text-stone-400 mb-4">Legal</h4>
                <ul className="space-y-2.5">
                  {[
                    { label: 'Privacy Policy', href: '/legal/privacy' },
                    { label: 'Terms of Service', href: '/legal/terms' },
                  ].map((item) => (
                    <li key={item.label}>
                      <Link href={item.href} className="font-body text-sm text-stone-500 hover:text-cyan-400 transition-colors duration-200">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company */}
              <div>
                <h4 className="font-label text-xs font-semibold uppercase tracking-widest text-stone-400 mb-4">Company</h4>
                <ul className="space-y-2.5">
                  {[
                    { label: 'About', href: '/about' },
                    { label: 'Contact', href: 'mailto:support@becandid.io' },
                  ].map((item) => (
                    <li key={item.label}>
                      <a href={item.href} className="font-body text-sm text-stone-500 hover:text-cyan-400 transition-colors duration-200">
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="font-body text-xs text-stone-600">
                &copy; {new Date().getFullYear()} Be Candid. All rights reserved.
              </p>
              <p className="font-body text-[10px] text-stone-700 text-center sm:text-right max-w-sm">
                Be Candid is not a substitute for professional therapy or crisis intervention. If you are in crisis, call or text 988.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
