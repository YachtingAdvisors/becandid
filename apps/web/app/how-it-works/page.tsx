/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next';
import Link from 'next/link';
import PublicNav from '@/components/PublicNav';

export const metadata: Metadata = {
  title: 'Methodology — The Architecture of Honesty',
  description:
    'A structured path toward digital clarity. Three pillars of self-confrontation, environmental design, and cognitive mastery.',
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
            The Framework
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            The Architecture of{' '}
            <span className="text-teal-500">Honesty</span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            A structured path toward digital clarity. Replace the anxiety loops and compulsive checks
            with a system designed for self-confrontation, environmental mastery, and sustained focus.
          </p>
        </div>
      </section>

      {/* ── Three Pillars ──────────────────────────────────────── */}
      <section className="px-6 py-28 max-w-7xl mx-auto">
        {/* Section header */}
        <div className="flex items-center gap-6 mb-4">
          <h2 className="text-3xl md:text-4xl font-bold whitespace-nowrap">The Three Pillars</h2>
          <div className="flex-1 h-px bg-stone-800/60" />
        </div>
        <p className="text-slate-400 text-lg mb-16 max-w-2xl">
          A linear progression through confrontation, construction, and ascension. Each phase builds
          on the last &mdash; there are no shortcuts.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="bg-stone-900/40 backdrop-blur-md border border-stone-800/50 p-10 rounded-2xl hover:bg-stone-800/60 transition-all duration-500">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center mb-6">
              <Icon name="visibility" className="text-teal-400 text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">The Reckoning</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Radical acceptance of your current digital footprint. We strip away the vanity metrics
              to reveal the raw impact of hyper-connectivity on your focus.
            </p>
            <div className="border-t border-stone-800/50 pt-4">
              <span className="text-stone-500 text-xs font-semibold tracking-widest uppercase">Phase 01</span>
            </div>
          </div>

          {/* Pillar 2 (offset) */}
          <div className="bg-stone-900/40 backdrop-blur-md border border-stone-800/50 p-10 rounded-2xl hover:bg-stone-800/60 transition-all duration-500 md:translate-y-8">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center mb-6">
              <Icon name="architecture" className="text-teal-400 text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">The Architecture</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Reconstructing your environment with intentional barriers. We design custom digital
              sanctuaries that prevent setbacks before they happen.
            </p>
            <div className="border-t border-stone-800/50 pt-4">
              <span className="text-stone-500 text-xs font-semibold tracking-widest uppercase">Phase 02</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="bg-stone-900/40 backdrop-blur-md border border-stone-800/50 p-10 rounded-2xl hover:bg-stone-800/60 transition-all duration-500">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center mb-6">
              <Icon name="keyboard_double_arrow_up" className="text-teal-400 text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">The Ascent</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Sustained deep work mastery. Integrating feedback loops to maintain a state of peak
              performance without the burnout cycle.
            </p>
            <div className="border-t border-stone-800/50 pt-4">
              <span className="text-stone-500 text-xs font-semibold tracking-widest uppercase">Phase 03</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Real-time Awareness ────────────────────────────────── */}
      <section className="px-6 py-28 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — Neural Stream card */}
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
                    Neural Stream
                  </span>
                  <span className="text-slate-300 text-sm font-medium">Feedback Activity</span>
                </div>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                </span>
              </div>

              {/* Progress bars */}
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Icon name="neurology" className="text-teal-400 text-base" />
                      <span className="text-slate-400 text-xs">Cognitive Load</span>
                    </div>
                    <span className="text-teal-400 text-xs font-bold">78%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-stone-800 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: '78%', background: 'linear-gradient(to right, #2dd4bf, #0d9488)' }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Icon name="monitor_heart" className="text-teal-400 text-base" />
                      <span className="text-slate-400 text-xs">Stress Response</span>
                    </div>
                    <span className="text-teal-400 text-xs font-bold">42%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-stone-800 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: '42%', background: 'linear-gradient(to right, #2dd4bf, #0d9488)' }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Icon name="psychology" className="text-teal-400 text-base" />
                      <span className="text-slate-400 text-xs">Self-Awareness</span>
                    </div>
                    <span className="text-teal-400 text-xs font-bold">91%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-stone-800 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: '91%', background: 'linear-gradient(to right, #2dd4bf, #0d9488)' }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom quote */}
              <div className="mt-6 pt-5 border-t border-stone-800/50">
                <p className="text-stone-500 text-xs leading-relaxed italic">
                  &ldquo;Predictive pattern identified: High likelihood of dopamine-seeking behavior
                  detected via latent biometric shift.&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* Right — Description */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Real-time Awareness</h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              Our system continuously maps your cognitive state, identifying the precursors to
              compulsive behavior before you consciously recognize them. This is not surveillance
              &mdash; it is a mirror.
            </p>

            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon name="check" className="text-teal-400 text-sm" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm mb-1">Pattern Recognition</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Machine-learned models that identify your unique behavioral signatures and trigger points.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon name="check" className="text-teal-400 text-sm" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm mb-1">Proactive Intervention</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Timely nudges and environment shifts that redirect focus before a lapse occurs.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon name="check" className="text-teal-400 text-sm" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm mb-1">Honest Accountability</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    No sugar-coating. Raw data reflected back to you with clarity and precision.
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
              Built for those who demand{' '}
              <span className="text-teal-500">absolute precision.</span>
            </h2>
          </div>
          <div>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              This is not another mindfulness app. It is a rigorous, data-driven system for people
              who are done lying to themselves. If you want comfort, look elsewhere. If you want
              transformation, enter the sanctuary.
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
              Digital accountability for the self-aware.
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
