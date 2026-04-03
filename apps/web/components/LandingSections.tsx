'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/* ─── Animated Counter Hook ──────────────────────────────────── */
function useCountUp(end: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) setStarted(true);
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * end));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, end, duration]);

  return { count, ref };
}

/* ─── Social Proof Counter Bar ───────────────────────────────── */
const STATS = [
  { end: 50000, label: 'journal entries', prefix: '', suffix: '+' },
  { end: 1000000, label: 'focused hours', prefix: '', suffix: '+' },
  { end: 48, label: 'avg conversation rating', prefix: '', suffix: '', display: '4.8' },
];

function StatItem({ end, label, prefix, suffix, display }: {
  end: number; label: string; prefix: string; suffix: string; display?: string;
}) {
  const { count, ref } = useCountUp(end);

  const formatNumber = (n: number) => {
    if (display) {
      // For the rating, animate from 0.0 to 4.8
      const ratio = n / end;
      return (ratio * 4.8).toFixed(1);
    }
    if (n >= 1000000) return `${(n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1)}M`;
    if (n >= 1000) return `${Math.round(n / 1000)}K`;
    return n.toLocaleString();
  };

  return (
    <div ref={ref} className="text-center px-4">
      <p className="font-headline text-3xl sm:text-4xl font-black text-white">
        {prefix}{formatNumber(count)}{display ? '\u2605' : suffix}
      </p>
      <p className="font-label text-xs text-stone-400 uppercase tracking-widest mt-1">{label}</p>
    </div>
  );
}

export function SocialProofCounter() {
  const { ref } = useCountUp(0); // just for the intersection trigger on headline
  return (
    <section className="py-16 lg:py-20 px-6 bg-white/[0.02]">
      <div ref={ref} className="max-w-screen-xl mx-auto text-center">
        <p className="font-body text-lg text-stone-400 mb-10">
          Join <span className="text-cyan-400 font-bold">2,000+</span> people aligning their digital lives
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12 lg:gap-16">
          {STATS.map((s) => (
            <StatItem key={s.label} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonial Carousel ───────────────────────────────────── */
const TESTIMONIALS = [
  { text: 'The journal prompts changed everything. I finally understand why.', name: 'Marcus', age: 28, stars: 5 },
  { text: 'My partner and I are closer than we\'ve been in years.', name: 'Sarah', age: 34, stars: 5 },
  { text: 'I tried everything. This is the first app that doesn\'t feel like surveillance.', name: 'David', age: 41, stars: 5 },
  { text: 'The weekly reflections blow my mind every Monday.', name: 'Priya', age: 26, stars: 5 },
  { text: 'Dark mode is fire. Finally an app that gets me.', name: 'Josh', age: 22, stars: 4 },
];

export function TestimonialCarousel() {
  return (
    <section className="py-20 lg:py-28 px-6 border-t border-white/5">
      <div className="max-w-screen-xl mx-auto">
        <div className="text-center mb-12">
          <span className="font-label text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">Testimonials</span>
          <h2 className="font-headline text-3xl sm:text-4xl font-bold mt-4 tracking-tight text-white">
            What people are saying
          </h2>
          <p className="font-body text-stone-500 text-sm mt-3 italic">Placeholder testimonials for illustration purposes</p>
        </div>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-0">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="glass-card rounded-2xl p-6 min-w-[280px] sm:min-w-[320px] lg:min-w-0 snap-center flex flex-col"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`material-symbols-outlined text-lg ${
                      i < t.stars ? 'text-amber-400' : 'text-stone-700'
                    }`}
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                ))}
              </div>

              <p className="font-body text-stone-300 leading-relaxed flex-1">
                &ldquo;{t.text}&rdquo;
              </p>

              <p className="font-label text-sm text-stone-500 mt-4">
                &mdash; {t.name}, {t.age}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Comparison Table ───────────────────────────────────────── */
type Support = 'yes' | 'no' | 'partial';

interface ComparisonRow {
  feature: string;
  description: string;
  beCandid: Support;
  covenantEyes: Support;
  bark: Support;
  qustodio: Support;
}

const COMPARISON_DATA: ComparisonRow[] = [
  { feature: 'Partner-based (not surveillance)', description: 'Accountability through trust, not monitoring screenshots', beCandid: 'yes', covenantEyes: 'no', bark: 'no', qustodio: 'no' },
  { feature: 'Journal / self-reflection', description: 'Private guided journaling to understand underlying patterns', beCandid: 'yes', covenantEyes: 'no', bark: 'no', qustodio: 'no' },
  { feature: 'Conversation guides', description: 'Evidence-based prompts for difficult discussions', beCandid: 'yes', covenantEyes: 'no', bark: 'no', qustodio: 'no' },
  { feature: 'Therapist portal', description: 'Read-only access for therapists with your consent', beCandid: 'yes', covenantEyes: 'no', bark: 'no', qustodio: 'no' },
  { feature: 'Privacy-first (no screenshots)', description: 'Categories and timing only -- never URLs or content', beCandid: 'yes', covenantEyes: 'no', bark: 'partial', qustodio: 'no' },
  { feature: 'Free tier', description: 'Core features available at no cost', beCandid: 'yes', covenantEyes: 'no', bark: 'partial', qustodio: 'partial' },
  { feature: 'Dark mode', description: 'Full dark theme support', beCandid: 'yes', covenantEyes: 'no', bark: 'no', qustodio: 'no' },
];

function SupportIcon({ value }: { value: Support }) {
  if (value === 'yes') {
    return (
      <span className="material-symbols-outlined text-xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
        check_circle
      </span>
    );
  }
  if (value === 'partial') {
    return (
      <span className="material-symbols-outlined text-xl text-stone-500" style={{ fontVariationSettings: "'FILL' 1" }}>
        check_circle
      </span>
    );
  }
  return (
    <span className="material-symbols-outlined text-xl text-stone-700">
      cancel
    </span>
  );
}

export function ComparisonTable() {
  return (
    <section className="py-20 lg:py-28 px-6 border-t border-white/5">
      <div className="max-w-screen-xl mx-auto">
        <div className="text-center mb-12">
          <span className="font-label text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">Comparison</span>
          <h2 className="font-headline text-3xl sm:text-4xl font-bold mt-4 tracking-tight text-white">
            Why Be Candid?
          </h2>
        </div>

        {/* Desktop table */}
        <div className="hidden lg:block">
          <div className="glass-card rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left font-label text-sm font-semibold text-stone-400 uppercase tracking-wider px-6 py-4">Feature</th>
                  <th className="text-center font-label text-sm font-bold text-cyan-400 uppercase tracking-wider px-4 py-4">Be Candid</th>
                  <th className="text-center font-label text-sm font-semibold text-stone-500 uppercase tracking-wider px-4 py-4">Covenant Eyes</th>
                  <th className="text-center font-label text-sm font-semibold text-stone-500 uppercase tracking-wider px-4 py-4">Bark</th>
                  <th className="text-center font-label text-sm font-semibold text-stone-500 uppercase tracking-wider px-4 py-4">Qustodio</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_DATA.map((row, i) => (
                  <tr key={row.feature} className={i < COMPARISON_DATA.length - 1 ? 'border-b border-white/5' : ''}>
                    <td className="px-6 py-4 font-body text-sm text-stone-300">{row.feature}</td>
                    <td className="px-4 py-4 text-center"><SupportIcon value={row.beCandid} /></td>
                    <td className="px-4 py-4 text-center"><SupportIcon value={row.covenantEyes} /></td>
                    <td className="px-4 py-4 text-center"><SupportIcon value={row.bark} /></td>
                    <td className="px-4 py-4 text-center"><SupportIcon value={row.qustodio} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile: just Be Candid column with descriptions */}
        <div className="lg:hidden space-y-3">
          {COMPARISON_DATA.map((row) => (
            <div key={row.feature} className="glass-card rounded-xl px-5 py-4 flex items-start gap-4">
              <SupportIcon value={row.beCandid} />
              <div>
                <p className="font-headline text-sm font-bold text-white">{row.feature}</p>
                <p className="font-body text-xs text-stone-400 mt-0.5">{row.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ Accordion ──────────────────────────────────────────── */
const FAQ_ITEMS = [
  {
    q: 'Can my partner see what websites I visit?',
    a: 'No. They see categories and timing, never URLs or content. Your specific browsing activity stays private.',
  },
  {
    q: 'Is this like Covenant Eyes?',
    a: 'We\'re accountability, not surveillance. No screenshots, no browsing logs. Be Candid is built on trust and self-reflection, not monitoring.',
  },
  {
    q: 'What is the Stringer framework?',
    a: 'Based on Jay Stringer\'s research, we help you understand why -- not just track what. The framework identifies emotional and relational patterns that drive unwanted behaviors.',
  },
  {
    q: 'Is my journal private?',
    a: 'Encrypted end-to-end. Not even we can read it. Your reflections are yours alone unless you choose to share insights with a therapist.',
  },
  {
    q: 'How much does it cost?',
    a: 'Free tier includes 1 partner and core features. Pro is $9.99/mo and unlocks unlimited partners, advanced analytics, and therapist portal access.',
  },
  {
    q: 'Is there a therapist portal?',
    a: 'Yes. Therapists get read-only access to consented data. You control exactly what is shared and can revoke access at any time.',
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [a]);

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer group"
        aria-expanded={open}
      >
        <span className="font-headline text-sm sm:text-base font-bold text-white pr-4">{q}</span>
        <span
          className={`material-symbols-outlined text-xl text-stone-400 group-hover:text-cyan-400 transition-transform duration-300 shrink-0 ${
            open ? 'rotate-180' : ''
          }`}
        >
          expand_more
        </span>
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: open ? `${height}px` : '0px' }}
      >
        <div ref={contentRef} className="px-6 pb-5">
          <p className="font-body text-sm text-stone-400 leading-relaxed">{a}</p>
        </div>
      </div>
    </div>
  );
}

export function FAQAccordion() {
  return (
    <section className="py-20 lg:py-28 px-6 border-t border-white/5">
      <div className="max-w-screen-md mx-auto">
        <div className="text-center mb-12">
          <span className="font-label text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">FAQ</span>
          <h2 className="font-headline text-3xl sm:text-4xl font-bold mt-4 tracking-tight text-white">
            Common questions
          </h2>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item) => (
            <FAQItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </div>
    </section>
  );
}
