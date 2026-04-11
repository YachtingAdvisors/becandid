/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next';
import Link from 'next/link';
import PublicNav from '@/components/PublicNav';
import TransformationJourney from './TransformationJourney';

export const metadata: Metadata = {
  title: 'Methodology — Unwanted Behavior Is Never Random',
  description:
    'Grounded in Jay Stringer\'s research with nearly 4,000 people: every unwanted behavior has a story. Be Candid helps you read it.',
};

/* ─── Icon helper ──────────────────────────────────────────────── */
function Icon({ name, className = '' }: { name: string; className?: string }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}
    >
      {name}
    </span>
  );
}

/* ─── Page ─────────────────────────────────────────────────────── */
export default function MethodologyPage() {
  return (
    <div className="bg-[#020617] min-h-screen text-slate-100 overflow-x-hidden">

      <PublicNav />

      {/* ── Hero (full-bleed background image) ─────────────────── */}
      <section className="relative min-h-[819px] flex items-center justify-center text-center">
        {/* Background image */}
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5Ys--kStjkPby9Zzm20_PmXM5uVfGTfSuggs9r3WJvReEscj7W60sLEU-bUDtF0AeqbE_btr3fg9RPmicpxh6qiQDyEz9kbkYiONgY96ZqIF0rZzvv8n6COzpeCPg7_kjrqpK7j3jkkolkA5PkecMAoDZ2zWxG-K47MB8kCTYKEVOWCWAZ27E-IKn6Qa76TU-IwTauc8Vmc8t8kt1CVrPbj6lj7BcLktihlUai5twB3UU1E20Azu2iAHz59zoPDPhHCQV_js88LSX"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/20 via-[#020617]/60 to-[#020617]" />

        <div className="relative z-10 max-w-3xl mx-auto px-6 pt-32">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase text-teal-400 mb-8"
            style={{ background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.2)' }}
          >
            Our Methodology
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            Unwanted behavior is{' '}
            <span className="text-teal-500">never random.</span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            Grounded in Jay Stringer&apos;s research with nearly 4,000 people: every unwanted behavior
            is connected to what&apos;s happening beneath the surface. Be Candid helps you trace the
            pattern, name what&apos;s underneath, and chart a way forward &mdash; without shame.
          </p>
        </div>
      </section>

      {/* ── Transformation Journey (interactive client component) ─ */}
      <TransformationJourney />

      {/* ── How It Works Pipeline ─────────────────────────────── */}
      <section className="px-6 py-28 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — Pipeline card */}
          <div className="relative">
            {/* Decorative teal blur */}
            <div
              className="absolute -top-16 -left-16 w-72 h-72 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%)' }}
            />
            <div className="bg-stone-900/40 backdrop-blur-md border border-stone-800/50 rounded-2xl p-8 relative">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-stone-500 text-[10px] font-semibold tracking-widest uppercase block mb-1">
                    Awareness Pipeline
                  </span>
                  <span className="text-slate-300 text-sm font-medium">From flag to conversation</span>
                </div>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                </span>
              </div>

              {/* Pipeline steps */}
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="screen_search_desktop" className="text-teal-400 text-base" />
                  </div>
                  <div className="flex-1">
                    <span className="text-slate-300 text-sm font-medium">Screen activity flagged</span>
                    <p className="text-stone-500 text-xs">16 rival categories monitored</p>
                  </div>
                  <Icon name="arrow_downward" className="text-stone-600 text-sm" />
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="auto_awesome" className="text-teal-400 text-base" />
                  </div>
                  <div className="flex-1">
                    <span className="text-slate-300 text-sm font-medium">Conversation guide generated</span>
                    <p className="text-stone-500 text-xs">Motivational Interviewing framework</p>
                  </div>
                  <Icon name="arrow_downward" className="text-stone-600 text-sm" />
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="forum" className="text-teal-400 text-base" />
                  </div>
                  <div className="flex-1">
                    <span className="text-slate-300 text-sm font-medium">Partner notified with care</span>
                    <p className="text-stone-500 text-xs">No category names, no URLs, no shame</p>
                  </div>
                  <Icon name="arrow_downward" className="text-stone-600 text-sm" />
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="edit_note" className="text-teal-400 text-base" />
                  </div>
                  <div className="flex-1">
                    <span className="text-slate-300 text-sm font-medium">Journal entry prompted</span>
                    <p className="text-stone-500 text-xs">Tributaries &rarr; Unmet Longings &rarr; Roadmap</p>
                  </div>
                </div>
              </div>

              {/* Bottom quote */}
              <div className="mt-6 pt-5 border-t border-stone-800/50">
                <p className="text-stone-500 text-xs leading-relaxed italic">
                  &ldquo;Your partner could use your support&rdquo; &mdash; that&apos;s all the notification says. Never the category. Never the details.
                </p>
              </div>
            </div>
          </div>

          {/* Right — Description */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">No shame, by design</h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              Be Candid treats every flag as data to understand, not behavior to punish. Your partner
              becomes a helper, not a monitor. Be Candid guides both of you through honest conversation
              using Motivational Interviewing &mdash; no moralizing, no judgment.
            </p>

            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon name="check" className="text-teal-400 text-sm" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm mb-1">Category-sensitive</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Eating disorders get clinical framing. Substances get recovery-informed language.
                    Sexual content with a spouse gets betrayal-trauma awareness. One size never fits all.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon name="check" className="text-teal-400 text-sm" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm mb-1">Privacy-first awareness</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Partners never see browsing history, URLs, or screenshots. Push notifications
                    never reveal the category on the lock screen. Your journal is AES-256 encrypted.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon name="check" className="text-teal-400 text-sm" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm mb-1">Solo mode built in</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Not ready for a partner? Solo mode gives you self-reflection guides instead.
                    Same Stringer framework, same AI &mdash; just between you and your shadow.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Technology ────────────────────────────────────── */}
      <section className="px-6 py-28 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-teal-400 font-label text-xs font-bold uppercase tracking-widest mb-3">Our Technology</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Smart Detection Without the VPN</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Most accountability apps route all your internet traffic through a VPN &mdash; draining your battery, slowing your connection, and breaking other apps. We built something better.
          </p>
        </div>

        {/* DNS-only explanation */}
        <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
          <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5">
              <h3 className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2">
                <Icon name="block" className="text-xl" />
                Traditional VPN Approach
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Apps like Covenant Eyes and Ever Accountable route <strong className="text-white">every packet of your internet traffic</strong> through a VPN tunnel. Every website, every video stream, every app &mdash; all filtered through their servers.
              </p>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li className="flex items-start gap-2.5">
                  <Icon name="battery_alert" className="text-red-400 text-base mt-0.5 shrink-0" />
                  <span><strong className="text-slate-200">Battery drain</strong> &mdash; VPN processes every packet 24/7, consuming significant power</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Icon name="speed" className="text-red-400 text-base mt-0.5 shrink-0" />
                  <span><strong className="text-slate-200">Speed reduction</strong> &mdash; all traffic routes through an extra hop, slowing browsing and streaming</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Icon name="wifi_off" className="text-red-400 text-base mt-0.5 shrink-0" />
                  <span><strong className="text-slate-200">Connection drops</strong> &mdash; VPN reconnects constantly, breaking video calls and other apps</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Icon name="business" className="text-red-400 text-base mt-0.5 shrink-0" />
                  <span><strong className="text-slate-200">Work conflicts</strong> &mdash; can&apos;t run alongside your company VPN, school network, or other security tools</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Icon name="phone_iphone" className="text-red-400 text-base mt-0.5 shrink-0" />
                  <span><strong className="text-slate-200">iOS limitations</strong> &mdash; Apple restricts VPN apps heavily, causing frequent disconnects</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-teal-500/20 bg-teal-500/5">
              <h3 className="text-lg font-bold text-teal-400 mb-3 flex items-center gap-2">
                <Icon name="verified_user" className="text-xl" />
                Be Candid&apos;s DNS-Only Approach
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Instead of routing all traffic, Be Candid only intercepts <strong className="text-white">DNS queries</strong> &mdash; the tiny lookup that happens when your device asks &ldquo;where is this website?&rdquo; Everything else passes through untouched.
              </p>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li className="flex items-start gap-2.5">
                  <Icon name="check_circle" className="text-teal-400 text-base mt-0.5 shrink-0" />
                  <span><strong className="text-slate-200">~200KB/day</strong> vs gigabytes &mdash; DNS queries are tiny packets (~100 bytes each)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Icon name="check_circle" className="text-teal-400 text-base mt-0.5 shrink-0" />
                  <span><strong className="text-slate-200">Zero speed impact</strong> &mdash; your actual browsing, streaming, and apps run at full speed</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Icon name="check_circle" className="text-teal-400 text-base mt-0.5 shrink-0" />
                  <span><strong className="text-slate-200">Minimal battery use</strong> &mdash; processing 2,000 DNS lookups/day is negligible</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Icon name="check_circle" className="text-teal-400 text-base mt-0.5 shrink-0" />
                  <span><strong className="text-slate-200">No app conflicts</strong> &mdash; no TLS inspection, no certificate issues, no broken video calls</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Icon name="check_circle" className="text-teal-400 text-base mt-0.5 shrink-0" />
                  <span><strong className="text-slate-200">Rival-specific</strong> &mdash; only checks domains matching your selected categories, ignoring everything else</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* How it works across platforms */}
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { icon: 'desktop_mac', platform: 'Desktop', method: 'App focus detection + smart screenshot analysis', detail: 'Knows which app is active without touching your network' },
            { icon: 'language', platform: 'Browser', method: 'Extension reads the active tab URL directly', detail: 'No proxy, no VPN — just the browser API' },
            { icon: 'phone_android', platform: 'Android', method: 'UsageStatsManager queries app usage natively', detail: 'Built-in Android API, no root or VPN required' },
            { icon: 'phone_iphone', platform: 'iOS', method: 'DNS-only filtering for domain awareness', detail: 'Minimal footprint — transitioning to Screen Time API' },
          ].map((p) => (
            <div key={p.platform} className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
              <Icon name={p.icon} className="text-teal-400 text-3xl mb-3" />
              <h4 className="font-bold text-white text-sm mb-1">{p.platform}</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-2">{p.method}</p>
              <p className="text-[10px] text-slate-500">{p.detail}</p>
            </div>
          ))}
        </div>

        {/* Privacy promise */}
        <div className="mt-12 p-6 rounded-2xl bg-teal-500/5 border border-teal-500/10 text-center max-w-2xl mx-auto">
          <Icon name="shield" className="text-teal-400 text-3xl mb-2" />
          <h4 className="font-bold text-white text-sm mb-2">Privacy by Architecture</h4>
          <p className="text-sm text-slate-400 leading-relaxed">
            DNS queries are checked <strong className="text-teal-300">locally on your device</strong>. Only the category and timing are synced &mdash; never the domain, never the URL, never the content. Your partner sees &ldquo;Social Media &mdash; 9:47 PM&rdquo; &mdash; not which site you visited.
          </p>
        </div>
      </section>

      {/* ── CTA (asymmetric 2-column) ──────────────────────────── */}
      <section className="px-6 py-28 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold leading-tight text-white">
              Your struggle has a{' '}
              <span className="text-teal-500">story to tell.</span>
            </h2>
          </div>
          <div>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              Be Candid was built on the conviction that unwanted behavior is never a character flaw &mdash;
              it&apos;s a signal. Informed by Jay Stringer&apos;s research, Dr. Kevin Laser and Shawn Laser&apos;s
              practical accountability framework, and Carl Jung&apos;s shadow self concept, the app helps you
              stop fighting yourself and start understanding yourself.
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-8 py-3.5 rounded-full font-semibold text-sm hover:brightness-110 transition"
            >
              Join the Sanctuary
              <Icon name="arrow_forward" className="text-base" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Disclaimer ─────────────────────────────────────────── */}
      <div className="px-6 pb-12">
        <p className="max-w-3xl mx-auto text-center text-xs text-stone-500 leading-relaxed">
          Be Candid is not affiliated with Jay Stringer. Our methodology is independently developed and informed by publicly available research.
        </p>
      </div>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="bg-stone-950 border-t border-stone-800/30 px-6 py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <img src="/logo.png" alt="Be Candid" className="h-8 w-auto brightness-[10] mb-4" />
            <p className="text-slate-500 text-sm leading-relaxed">
              Digital awareness for the self-aware.
            </p>
          </div>

          <div>
            <h4 className="text-slate-300 font-semibold text-sm mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/#features" className="text-slate-500 hover:text-slate-300 transition-colors">Features</Link></li>
              <li><Link href="/download" className="text-slate-500 hover:text-slate-300 transition-colors">Download</Link></li>
              <li><Link href="/pricing" className="text-slate-500 hover:text-slate-300 transition-colors">Pricing</Link></li>
              <li><Link href="/blog" className="text-slate-500 hover:text-slate-300 transition-colors">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-300 font-semibold text-sm mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/legal/privacy" className="text-slate-500 hover:text-slate-300 transition-colors">Privacy</Link></li>
              <li><Link href="/legal/terms" className="text-slate-500 hover:text-slate-300 transition-colors">Terms</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-300 font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/therapists" className="text-slate-500 hover:text-slate-300 transition-colors">Therapists</Link></li>
              <li><Link href="/contact" className="text-slate-500 hover:text-slate-300 transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-stone-800/30 text-center">
          <p className="text-slate-600 text-xs">
            &copy; {new Date().getFullYear()} Be Candid. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
