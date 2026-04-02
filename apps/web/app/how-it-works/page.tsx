/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How It Works — The Integrity Index',
  description:
    'Understand how Be Candid transforms screen activity and daily reflections into a quantified accountability score. Your Integrity Index measures what matters.',
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
export default function HowItWorksPage() {
  return (
    <div className="bg-dark-sanctuary min-h-screen text-slate-100 overflow-x-hidden">

      {/* ── Navigation ──────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 bg-stone-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
          <Link href="/">
            <img src="/logo.png" alt="Be Candid" className="h-9 w-auto brightness-[10]" />
          </Link>
          <div className="hidden md:flex items-center space-x-10">
            <Link href="/#features" className="text-stone-400 hover:text-stone-200 transition-colors text-sm">
              Sanctuary
            </Link>
            <Link
              href="/how-it-works"
              className="text-cyan-400 font-bold border-b-2 border-cyan-400 pb-1 text-sm"
            >
              Methodology
            </Link>
            <Link href="/pricing" className="text-stone-400 hover:text-stone-200 transition-colors text-sm">
              Pricing
            </Link>
            <Link href="/therapists" className="text-stone-400 hover:text-stone-200 transition-colors text-sm">
              Therapists
            </Link>
          </div>
          <Link
            href="/auth/signup"
            className="bg-gradient-to-r from-primary to-primary-container text-white px-6 py-2.5 rounded-full font-semibold text-sm"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-24 px-6 max-w-7xl mx-auto">
        {/* Decorative teal orb */}
        <div
          className="absolute -top-20 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.12) 0%, transparent 70%)' }}
        />

        <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
          {/* Left */}
          <div>
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase text-teal-400 mb-8"
              style={{ background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.2)' }}
            >
              <Icon name="shield" className="text-base" />
              Quantified Accountability
            </div>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
              Measure What{' '}
              <span
                style={{
                  background: 'linear-gradient(to right, #2dd4bf, #0d9488)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Matters
              </span>
              .
            </h1>

            <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-lg">
              The Integrity Index distills your screen behaviour and daily reflections into a single,
              honest number. No vanity metrics &mdash; just clarity on whether your digital life
              matches the person you want to be.
            </p>

            <Link
              href="#bento"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-8 py-3.5 rounded-full font-semibold text-sm hover:brightness-110 transition"
            >
              Explore Your Index
              <Icon name="arrow_downward" className="text-base" />
            </Link>
          </div>

          {/* Right — glass panel with score */}
          <div className="relative flex justify-center">
            <div
              className="relative rounded-3xl overflow-hidden w-full max-w-md aspect-square"
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                boxShadow: '0 0 20px rgba(20, 184, 166, 0.15)',
              }}
            >
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5Ys--kStjkPby9Zzm20_PmXM5uVfGTfSuggs9r3WJvReEscj7W60sLEU-bUDtF0AeqbE_btr3fg9RPmicpxh6qiQDyEz9kbkYiONgY96ZqIF0rZzvv8n6COzpeCPg7_kjrqpK7j3jkkolkA5PkecMAoDZ2zWxG-K47MB8kCTYKEVOWCWAZ27E-IKn6Qa76TU-IwTauc8Vmc8t8kt1CVrPbj6lj7BcLktihlUai5twB3UU1E20Azu2iAHz59zoPDPhHCQV_js88LSX"
                alt="Abstract data visualization representing alignment tracking"
                className="w-full h-full object-cover opacity-40"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-slate-500 text-sm font-medium tracking-widest uppercase mb-2">
                  Integrity Index
                </span>
                <span
                  className="text-8xl font-black tracking-tight text-glow"
                  style={{
                    background: 'linear-gradient(to bottom, #2dd4bf, #0d9488)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  88.4
                </span>
                <span className="text-slate-500 text-xs tracking-wider mt-1 uppercase">
                  Strong Alignment
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bento Grid ──────────────────────────────────────────── */}
      <section id="bento" className="px-6 pb-28 max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-4 auto-rows-[180px]">
          {/* Productivity Gain — 4 cols */}
          <div
            className="col-span-12 md:col-span-4 rounded-2xl p-6 flex flex-col justify-between"
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs font-medium tracking-wider uppercase">
                Productivity Gain
              </span>
              <Icon name="trending_up" className="text-teal-400 text-xl" />
            </div>
            <div>
              <span
                className="text-4xl font-black"
                style={{
                  background: 'linear-gradient(to right, #2dd4bf, #0d9488)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                +84%
              </span>
              <div className="mt-3 w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: '84%', background: 'linear-gradient(to right, #2dd4bf, #0d9488)' }}
                />
              </div>
            </div>
          </div>

          {/* Deep Work Circles — 5 cols */}
          <div
            className="col-span-12 md:col-span-5 rounded-2xl p-6 flex flex-col items-center justify-center relative"
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            {/* Concentric circles */}
            <div className="relative w-28 h-28">
              <div
                className="absolute inset-0 rounded-full"
                style={{ border: '2px solid rgba(20,184,166,0.15)' }}
              />
              <div
                className="absolute inset-3 rounded-full"
                style={{ border: '2px solid rgba(20,184,166,0.3)' }}
              />
              <div
                className="absolute inset-6 rounded-full"
                style={{ border: '2px solid rgba(20,184,166,0.5)' }}
              />
              <div
                className="absolute inset-9 rounded-full bg-teal-500/20 flex items-center justify-center"
                style={{ border: '2px solid rgba(20,184,166,0.7)' }}
              >
                <Icon name="self_improvement" className="text-teal-400 text-lg" />
              </div>
            </div>
            <div
              className="mt-4 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase text-teal-400"
              style={{ background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.2)' }}
            >
              4.5 Hours Avg
            </div>
            <span className="text-slate-500 text-xs mt-2 tracking-wider uppercase">
              Deep Work Sessions
            </span>
          </div>

          {/* Morning Clarity — 3 cols, top half */}
          <div
            className="col-span-6 md:col-span-3 rounded-2xl p-5 flex flex-col justify-between"
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <span className="text-slate-500 text-[10px] font-medium tracking-wider uppercase">
              Morning Clarity
            </span>
            <div>
              <span
                className="text-4xl font-black"
                style={{
                  background: 'linear-gradient(to right, #2dd4bf, #0d9488)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                92%
              </span>
              <div className="flex gap-1 mt-3">
                {[90, 88, 95, 92, 87, 94, 92].map((v, i) => (
                  <div key={i} className="flex-1 rounded-sm overflow-hidden bg-slate-800 h-6">
                    <div
                      className="w-full rounded-sm"
                      style={{
                        height: `${v}%`,
                        background: 'linear-gradient(to top, #0d9488, #2dd4bf)',
                        marginTop: `${100 - v}%`,
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reflection Debt — 3 cols, bottom half (appears next in flow on md+) */}
          <div
            className="col-span-6 md:col-span-3 rounded-2xl p-5 flex flex-col justify-between"
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <span className="text-slate-500 text-[10px] font-medium tracking-wider uppercase">
              Reflection Debt
            </span>
            <div>
              <span className="text-5xl font-black text-red-500">02</span>
              <p className="text-slate-500 text-[10px] mt-2 leading-snug">
                Sessions requiring closure
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── The Clarity Metric ──────────────────────────────────── */}
      <section className="px-6 pb-32 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">The Clarity Metric</h2>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left — metric breakdowns */}
          <div className="space-y-8">
            {/* Screen Monitoring */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                  <Icon name="visibility" className="text-teal-400 text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100">Screen Monitoring</h3>
                  <span className="text-teal-400 text-xs font-bold">40% of Index</span>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Passive analysis of app usage, browsing patterns, and screen-time rhythms. The system
                learns your productive baseline and measures deviation &mdash; no content is stored,
                only behavioural metadata.
              </p>
            </div>

            {/* Journal Reflection */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                  <Icon name="edit_note" className="text-teal-400 text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100">Journal Reflection</h3>
                  <span className="text-teal-400 text-xs font-bold">60% of Index</span>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Self-reported alignment through guided prompts. Your honesty, consistency, and
                emotional depth are scored by on-device AI to ensure the Index reflects genuine
                self-awareness, not just activity.
              </p>
            </div>

            {/* Total alignment bar */}
            <div
              className="rounded-xl p-4 flex items-center justify-between text-xs font-bold tracking-widest uppercase"
              style={{
                background: 'rgba(20,184,166,0.08)',
                border: '1px solid rgba(20,184,166,0.2)',
              }}
            >
              <span className="text-slate-400">Total Alignment</span>
              <span className="text-teal-400">Index Score</span>
              <span
                style={{
                  background: 'linear-gradient(to right, #2dd4bf, #0d9488)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                100%
              </span>
            </div>
          </div>

          {/* Right — dashboard visualization */}
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              boxShadow: '0 0 20px rgba(20, 184, 166, 0.15)',
            }}
          >
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfpF--KFSH1cy_6OBg93bKMc1gd14EqwcEEog-t6MRUe8QhOI5SPIUcmoh6l1T6YUBUy4LKdEeuUZrslDB416pE39KXKFVf2lk7_dwje-3Rv7l-EbjKvvro96ASsDf7LTpYNVX3p_gipILTXxWXcR0angm8imcdY9CnP4SZ1neORKJH138yUFYcWIghaEtDYvDyGYr3ELkonIOhGIJ7I2ey1L0cMlqigWN9Kql3bpW-K7ZRT_mIP8RyLiwzFBz7-uetTG33SpOnXgB"
              alt="Dashboard visualization showing alignment metrics"
              className="w-full h-80 object-cover opacity-50"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to top, rgba(12,18,20,0.95) 0%, rgba(12,18,20,0.4) 50%, transparent 100%)',
              }}
            />
            <div className="absolute bottom-6 left-6 right-6">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-teal-400"
                style={{ background: 'rgba(20,184,166,0.15)', border: '1px solid rgba(20,184,166,0.3)' }}
              >
                <Icon name="check_circle" className="text-sm" />
                Perfect Alignment Detected
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="px-6 pb-32 max-w-5xl mx-auto">
        <div
          className="rounded-3xl p-12 md:p-16 text-center"
          style={{
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(20,184,166,0.15)',
            boxShadow: '0 0 40px rgba(20, 184, 166, 0.08)',
          }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to archive the noise?</h2>
          <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
            Join thousands who have found sanctuary in self-awareness. Your Integrity Index is
            waiting.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-8 py-3.5 rounded-full font-semibold text-sm hover:brightness-110 transition"
            >
              Start Free Sanctuary
            </Link>
            <Link
              href="#bento"
              className="px-8 py-3.5 rounded-full font-semibold text-sm text-slate-300 hover:text-white transition"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}
            >
              View Methodology
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 px-6 py-16">
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
              <li><Link href="/how-it-works" className="text-slate-500 hover:text-slate-300 transition-colors">How It Works</Link></li>
              <li><Link href="/pricing" className="text-slate-500 hover:text-slate-300 transition-colors">Pricing</Link></li>
              <li><Link href="/download" className="text-slate-500 hover:text-slate-300 transition-colors">Download</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-300 font-semibold text-sm mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/blog" className="text-slate-500 hover:text-slate-300 transition-colors">Blog</Link></li>
              <li><Link href="/therapists" className="text-slate-500 hover:text-slate-300 transition-colors">For Therapists</Link></li>
              <li><Link href="/families" className="text-slate-500 hover:text-slate-300 transition-colors">For Families</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-300 font-semibold text-sm mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/legal/privacy" className="text-slate-500 hover:text-slate-300 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/legal/terms" className="text-slate-500 hover:text-slate-300 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 text-center">
          <p className="text-slate-600 text-xs">
            &copy; {new Date().getFullYear()} Be Candid. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
