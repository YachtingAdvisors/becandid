import Link from 'next/link';

const FEATURES = [
  {
    icon: '🎯',
    title: 'Morning & Evening Focus Tracking',
    desc: 'Every day splits into two segments. Stay focused, earn trust points, and watch your streak grow.',
  },
  {
    icon: '🤖',
    title: 'AI Conversation Guides',
    desc: 'When a flag fires, Claude generates personalized guides for both you and your partner — grounded in Motivational Interviewing.',
  },
  {
    icon: '📋',
    title: 'Dual-Confirmed Check-ins',
    desc: 'Both you and your partner confirm each check-in. Set your own frequency — from daily to every two weeks.',
  },
  {
    icon: '🏅',
    title: 'Trust Points & Milestones',
    desc: 'Earn points for focused segments, completed conversations, and check-ins. Unlock badges as you grow.',
  },
  {
    icon: '⚠️',
    title: 'Vulnerability Windows',
    desc: 'Pre-schedule your risky times. Get proactive nudges and partner alerts before you need them.',
  },
  {
    icon: '📓',
    title: 'Growth Journal',
    desc: 'See your progress over time — mood trends, morning vs evening performance, and milestones on a timeline.',
  },
];

const RIVALS = [
  { emoji: '🔒', label: 'Sexual Content' },
  { emoji: '📱', label: 'Social Media & News' },
  { emoji: '🪞', label: 'Eating Disorders' },
  { emoji: '🍷', label: 'Substances' },
  { emoji: '💰', label: 'Gambling & Trading' },
  { emoji: '💔', label: 'Dating Apps' },
  { emoji: '🎮', label: 'Gaming' },
  { emoji: '😤', label: 'Rage Content' },
];

const COMMITMENTS = [
  { icon: '👁', text: 'You always know monitoring is on' },
  { icon: '🔒', text: 'URLs are never stored — only hashed' },
  { icon: '⏸', text: 'Pause or stop anytime' },
  { icon: '🧠', text: 'Zero shame, by design' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-surface-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">C</span>
            </div>
            <span className="font-display text-lg text-ink">Be Candid</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/signin" className="text-sm font-medium text-ink-muted hover:text-ink transition-colors">
              Sign In
            </Link>
            <Link href="/auth/signup" className="btn-primary text-sm py-2">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center stagger">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
            Accountability that heals
          </div>

          <h1 className="font-display text-5xl sm:text-6xl text-ink leading-[1.1] mb-6">
            Beat your rivals.
            <br />
            <span className="text-brand-600">Together.</span>
          </h1>

          <p className="text-lg text-ink-muted leading-relaxed max-w-xl mx-auto mb-10">
            Be Candid monitors your screen activity, alerts your accountability partner,
            and generates AI-powered conversation guides that prepare you both for an
            honest, shame-free conversation.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link href="/auth/signup" className="btn-primary px-8 py-3.5 text-base">
              Start Free →
            </Link>
            <a href="#how-it-works" className="btn-ghost px-6 py-3.5 text-base">
              How it works
            </a>
          </div>
        </div>
      </section>

      {/* ── Rivals Strip ────────────────────────────────────── */}
      <section className="py-12 bg-white border-y border-surface-border">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-center text-xs font-semibold text-ink-muted uppercase tracking-widest mb-6">
            Choose your rivals
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {RIVALS.map(r => (
              <div key={r.label} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-muted border border-surface-border text-sm font-medium text-ink">
                <span>{r.emoji}</span> {r.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl text-ink text-center mb-4">How it works</h2>
          <p className="text-center text-ink-muted mb-16 max-w-lg mx-auto">
            Three steps. No surveillance. No shame.
          </p>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { num: '01', title: 'Choose your rivals', desc: 'Pick the categories you want accountability for — from porn to doomscrolling to eating disorders. Select one or many.' },
              { num: '02', title: 'Invite a partner', desc: 'A friend, spouse, mentor, or coach. They get alerts and AI-generated conversation guides when a flag fires.' },
              { num: '03', title: 'Grow together', desc: 'Track focus streaks, earn trust points, unlock milestones, and have honest conversations that actually lead somewhere.' },
            ].map(step => (
              <div key={step.num} className="text-center sm:text-left">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-brand-100 text-brand-700 font-display text-sm font-bold mb-4">
                  {step.num}
                </div>
                <h3 className="font-display text-lg text-ink mb-2">{step.title}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl text-ink text-center mb-16">What you get</h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="card p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-display text-base text-ink mb-2">{f.title}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Transparency ────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl text-ink mb-4">Radical transparency</h2>
          <p className="text-ink-muted mb-12 max-w-lg mx-auto">
            Be Candid is not a surveillance tool. You control everything.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {COMMITMENTS.map(c => (
              <div key={c.text} className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-white border border-surface-border text-left">
                <span className="text-xl flex-shrink-0">{c.icon}</span>
                <span className="text-sm font-medium text-ink">{c.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-gradient-to-br from-brand-600 to-brand-800">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl text-white mb-4">Ready to be candid?</h2>
          <p className="text-brand-200 mb-8 max-w-md mx-auto">
            Free to start. No credit card. Takes 3 minutes to set up.
          </p>
          <Link href="/auth/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-700 text-base font-semibold rounded-xl hover:bg-brand-50 transition-colors">
            Create Your Account →
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="py-8 px-6 bg-white border-t border-surface-border">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-brand-600 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">C</span>
            </div>
            <span className="text-sm text-ink-muted">Be Candid</span>
          </div>
          <div className="text-xs text-ink-muted">
            Accountability that heals.
          </div>
        </div>
      </footer>
    </div>
  );
}
