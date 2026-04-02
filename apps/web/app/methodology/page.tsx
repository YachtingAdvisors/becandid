/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next';
import Link from 'next/link';
import PublicNav from '@/components/PublicNav';

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

      {/* ── Three Pillars ──────────────────────────────────────── */}
      <section className="px-6 py-28 max-w-7xl mx-auto">
        {/* Section header */}
        <div className="flex items-center gap-6 mb-4">
          <h2 className="text-3xl md:text-4xl font-bold whitespace-nowrap">The Stringer Framework</h2>
          <div className="flex-1 h-px bg-stone-800/60" />
        </div>
        <p className="text-slate-400 text-lg mb-16 max-w-2xl">
          Every journal entry and AI conversation guide follows three questions drawn from
          Jay Stringer&apos;s <em>Unwanted</em> research. Each one peels back a layer.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Pillar 1 — Tributaries */}
          <div className="bg-stone-900/40 backdrop-blur-md border border-stone-800/50 p-10 rounded-2xl hover:bg-stone-800/60 transition-all duration-500">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center mb-6">
              <Icon name="water" className="text-teal-400 text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Tributaries</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              What was happening in the hours or days before? What were you feeling?
              Where were you? Who were you with &mdash; or avoiding?
            </p>
            <p className="text-slate-500 text-xs leading-relaxed mb-8">
              Unwanted behavior doesn&apos;t appear out of nowhere. It follows a current.
              Tributaries help you trace the stream back to its source.
            </p>
            <div className="border-t border-stone-800/50 pt-4">
              <span className="text-stone-500 text-xs font-semibold tracking-widest uppercase">Question 01</span>
            </div>
          </div>

          {/* Pillar 2 — Unmet Longings (offset) */}
          <div className="bg-stone-900/40 backdrop-blur-md border border-stone-800/50 p-10 rounded-2xl hover:bg-stone-800/60 transition-all duration-500 md:translate-y-8">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center mb-6">
              <Icon name="heart_broken" className="text-teal-400 text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Unmet Longings</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              What did you actually need in that moment? Connection? Rest?
              Validation? Escape from something specific?
            </p>
            <p className="text-slate-500 text-xs leading-relaxed mb-8">
              The behavior was never the point &mdash; it was a counterfeit solution to a real need.
              Naming the longing is where healing begins.
            </p>
            <div className="border-t border-stone-800/50 pt-4">
              <span className="text-stone-500 text-xs font-semibold tracking-widest uppercase">Question 02</span>
            </div>
          </div>

          {/* Pillar 3 — Roadmap */}
          <div className="bg-stone-900/40 backdrop-blur-md border border-stone-800/50 p-10 rounded-2xl hover:bg-stone-800/60 transition-all duration-500">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center mb-6">
              <Icon name="map" className="text-teal-400 text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Roadmap</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              What does this pattern reveal about what needs attention in your life?
              What&apos;s one thing you could do differently next time?
            </p>
            <p className="text-slate-500 text-xs leading-relaxed mb-8">
              Your struggle is not a dead end. It&apos;s a map. The roadmap turns what you learn
              about yourself into a single, concrete next step.
            </p>
            <div className="border-t border-stone-800/50 pt-4">
              <span className="text-stone-500 text-xs font-semibold tracking-widest uppercase">Question 03</span>
            </div>
          </div>
        </div>
      </section>

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
                    <span className="text-slate-300 text-sm font-medium">AI conversation guide generated</span>
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
              becomes a helper, not a monitor. The AI guides both of you through honest conversation
              using Motivational Interviewing &mdash; no moralizing, no judgment.
            </p>

            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon name="check" className="text-teal-400 text-sm" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm mb-1">Category-sensitive AI</h4>
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
