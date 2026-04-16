import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import PublicNav from '@/components/PublicNav';
import JsonLd from '@/components/JsonLd';
import AnimateOnScroll from '@/components/ui/AnimateOnScroll';
import { organizationSchema } from '@/lib/structuredData';

export const dynamic = 'force-dynamic';

/* ─── SEO Metadata ──────────────────────────────────────────── */
export const metadata: Metadata = {
  title: 'About Be Candid | Accountability App for Digital Wellness',
  description:
    'Be Candid is an accountability app grounded in Jay Stringer\u2019s research. Built by people who understand unwanted digital habits, it helps you align your digital life with your values through self-understanding \u2014 not surveillance.',
  keywords: [
    'accountability app',
    'digital wellness',
    'unwanted habits',
    'behavioral patterns',
    'Stringer framework',
    'accountability partner',
    'screen time accountability',
    'digital integrity',
    'Jay Stringer',
    'Unwanted book',
  ],
  openGraph: {
    title: 'About Be Candid | Accountability Through Self-Understanding',
    description:
      'Built by people who understand the struggle. Be Candid brings clinical-grade behavioral insight tools to anyone seeking alignment between who they are online and who they want to be.',
    url: 'https://becandid.io/about',
    siteName: 'Be Candid',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: 'https://becandid.io/og-about.png',
        width: 1200,
        height: 630,
        alt: 'About Be Candid \u2014 Accountability through self-understanding',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Be Candid | Accountability Through Self-Understanding',
    description:
      'Built by people who understand the struggle. Clinical-grade behavioral insight tools for digital wellness.',
    images: ['https://becandid.io/og-about.png'],
  },
  alternates: {
    canonical: 'https://becandid.io/about',
  },
};

/* ─── Reusable icon component ───────────────────────────────── */
function MaterialIcon({
  name,
  className = '',
  filled = false,
}: {
  name: string;
  className?: string;
  filled?: boolean;
}) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}

/* ─── Data ──────────────────────────────────────────────────── */

const DIFFERENTIATORS = [
  {
    icon: 'handshake',
    color: 'bg-cyan-500/20 text-cyan-400',
    title: 'Accountability, not surveillance',
    desc: 'Partners see categories and timing, never URLs or content. Trust is built through transparency, not monitoring.',
  },
  {
    icon: 'clinical_notes',
    color: 'bg-emerald-500/20 text-emerald-400',
    title: 'Clinically informed',
    desc: 'Built with psychiatrists and licensed therapists who specialize in compulsive and unwanted behavior patterns.',
  },
  {
    icon: 'forum',
    color: 'bg-amber-500/20 text-amber-400',
    title: 'Data-driven conversation guides',
    desc: 'Evidence-based prompts that turn raw behavioral data into meaningful, difficult-but-necessary conversations.',
  },
  {
    icon: 'lock',
    color: 'bg-primary/20 text-primary',
    title: 'Privacy by design',
    desc: 'End-to-end encryption and zero-knowledge architecture. We can\u2019t see your data \u2014 and we built it that way on purpose.',
  },
];

const STATS = [
  { value: '16', label: 'Rival categories tracked', icon: 'category' },
  { value: '24', label: 'Behavioral patterns identified', icon: 'pattern' },
  { value: '8', label: 'Shadow-to-growth transformations', icon: 'conversion_path' },
  { value: '3', label: 'Stringer framework pillars', icon: 'account_tree' },
];

const VALUES = [
  {
    icon: 'visibility',
    title: 'Radical honesty over performance',
    desc: 'We\u2019d rather you be real than impressive. Growth starts where pretending stops.',
  },
  {
    icon: 'psychology_alt',
    title: 'Curiosity over judgment',
    desc: 'Every unwanted behavior has a story. We help you ask why before you ask how to stop.',
  },
  {
    icon: 'trending_up',
    title: 'Growth over perfection',
    desc: 'Progress isn\u2019t linear, and setbacks aren\u2019t failures. We celebrate the direction, not the distance.',
  },
  {
    icon: 'group',
    title: 'Partnership over monitoring',
    desc: 'Accountability is a relationship, not a surveillance system. Partners walk beside you, not above you.',
  },
  {
    icon: 'shield',
    title: 'Privacy as a right, not a feature',
    desc: 'Your most vulnerable data deserves the highest protection. Zero-knowledge isn\u2019t a selling point \u2014 it\u2019s a moral obligation.',
  },
];

/* ─── Page ──────────────────────────────────────────────────── */
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-dark-sanctuary text-white overflow-x-hidden">
      {/* JSON-LD Structured Data */}
      <JsonLd data={organizationSchema()} />

      <PublicNav />

      <main>
        {/* ── Hero ────────────────────────────────────────── */}
        <section className="pt-32 pb-20 lg:pt-44 lg:pb-28 px-6">
          <div className="max-w-screen-xl mx-auto">
            <AnimateOnScroll className="max-w-3xl mx-auto text-center" animation="fade-in-up">
              <span className="font-label text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
                Our Story
              </span>

              <h1 className="font-headline font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white mt-6 tracking-tight leading-[1.1]">
                Built by people who understand the struggle
              </h1>

              <p className="font-body text-lg sm:text-xl text-stone-400 mt-8 leading-relaxed max-w-2xl mx-auto">
                Be Candid was created by people who have personally experienced unwanted digital habits and know the shame cycle intimately. This isn&rsquo;t an app built by outsiders looking in &mdash; it&rsquo;s built by people who&rsquo;ve walked the same road and refused to stay silent about it.
              </p>
            </AnimateOnScroll>
          </div>
        </section>

        {/* ── Mission ─────────────────────────────────────── */}
        <section className="py-20 lg:py-28 px-6 border-t border-white/5" aria-labelledby="mission-heading">
          <div className="max-w-screen-xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <AnimateOnScroll animation="fade-in-up">
              <div>
                <span className="font-label text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
                  Mission
                </span>
                <h2
                  id="mission-heading"
                  className="font-headline font-extrabold text-3xl sm:text-4xl lg:text-[2.75rem] text-white mt-4 tracking-tight"
                >
                  Self-understanding, not surveillance
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 via-primary to-emerald-400 rounded-full mt-4" />
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll animation="fade-in-up" delay={200}>
              <div className="space-y-6">
                <p className="font-body text-lg text-stone-300 leading-relaxed">
                  Be Candid exists to bring <strong className="text-white font-semibold">clinical-grade behavioral insight tools</strong> to anyone seeking alignment between who they are online and who they want to be.
                </p>
                <p className="font-body text-lg text-stone-400 leading-relaxed">
                  Not through surveillance. Not through shame. Not through white-knuckling willpower. Through <em className="text-cyan-400 not-italic font-semibold">self-understanding</em> &mdash; the kind that names the patterns, traces them to their roots, and builds a path forward that actually lasts.
                </p>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* ── The Stringer Framework ──────────────────────── */}
        <section className="py-20 lg:py-28 px-6 border-t border-white/5" aria-labelledby="framework-heading">
          <div className="max-w-screen-xl mx-auto">
            <AnimateOnScroll className="text-center max-w-3xl mx-auto" animation="fade-in-up">
              <span className="font-label text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
                The Science
              </span>
              <h2
                id="framework-heading"
                className="font-headline font-extrabold text-3xl sm:text-4xl lg:text-[2.75rem] text-white mt-4 tracking-tight"
              >
                Grounded in the Stringer Framework
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-emerald-400 via-primary to-cyan-400 rounded-full mx-auto mt-4" />
              <p className="font-body text-lg text-stone-400 mt-6 leading-relaxed">
                Be Candid is built on the research of <strong className="text-white font-semibold">Jay Stringer</strong>, whose landmark study of nearly <strong className="text-white font-semibold">4,000 people</strong> revealed that every unwanted behavior has a story.
              </p>
            </AnimateOnScroll>

            <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
              {[
                {
                  icon: 'water',
                  title: 'Tributaries',
                  desc: 'The upstream influences \u2014 family dynamics, past experiences, and emotional patterns \u2014 that feed into unwanted behavior.',
                  color: 'bg-cyan-500/20 text-cyan-400',
                },
                {
                  icon: 'favorite',
                  title: 'Unmet Longings',
                  desc: 'The core human needs \u2014 for attention, connection, validation, and purpose \u2014 that unwanted behavior tries to fulfill.',
                  color: 'bg-amber-500/20 text-amber-400',
                },
                {
                  icon: 'route',
                  title: 'A Roadmap Forward',
                  desc: 'When you understand the why, you can build a personalized path to lasting change \u2014 not just behavioral suppression.',
                  color: 'bg-emerald-500/20 text-emerald-400',
                },
              ].map((pillar, i) => (
                <AnimateOnScroll key={pillar.title} animation="fade-in-scale" delay={i * 150}>
                  <article className="glass-card glass-card-hover rounded-2xl p-7 h-full text-center">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto ${pillar.color}`}
                    >
                      <MaterialIcon name={pillar.icon} className="text-2xl" filled />
                    </div>
                    <h3 className="font-headline font-bold text-lg text-white mt-5">{pillar.title}</h3>
                    <p className="font-body text-sm text-stone-400 leading-relaxed mt-3">{pillar.desc}</p>
                  </article>
                </AnimateOnScroll>
              ))}
            </div>

            <AnimateOnScroll className="text-center mt-12" animation="fade-in-up" delay={300}>
              <p className="font-body text-stone-500 text-sm italic max-w-lg mx-auto">
                Based on research from <cite className="not-italic font-semibold text-stone-400">Unwanted: How Sexual Brokenness Reveals Our Way to Healing</cite> by Jay Stringer, M.Div., LMHC.
              </p>
            </AnimateOnScroll>
          </div>
        </section>

        {/* ── What Makes Us Different ─────────────────────── */}
        <section className="py-20 lg:py-28 px-6 border-t border-white/5" aria-labelledby="different-heading">
          <div className="max-w-screen-xl mx-auto">
            <AnimateOnScroll className="text-center max-w-2xl mx-auto mb-16" animation="fade-in-up">
              <span className="font-label text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
                Our Approach
              </span>
              <h2
                id="different-heading"
                className="font-headline font-extrabold text-3xl sm:text-4xl lg:text-[2.75rem] text-white mt-4 tracking-tight"
              >
                What makes us different
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 via-primary to-emerald-400 rounded-full mx-auto mt-4" />
            </AnimateOnScroll>

            <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {DIFFERENTIATORS.map((d, i) => (
                <AnimateOnScroll key={d.title} animation="fade-in-scale" delay={i * 120}>
                  <article className="glass-card glass-card-hover rounded-2xl p-7 h-full">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${d.color}`}>
                      <MaterialIcon name={d.icon} className="text-xl" filled />
                    </div>
                    <h3 className="font-headline font-bold text-lg text-white mt-5">{d.title}</h3>
                    <p className="font-body text-sm text-stone-400 leading-relaxed mt-3">{d.desc}</p>
                  </article>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* ── By the Numbers ──────────────────────────────── */}
        <section className="py-20 lg:py-28 px-6 border-t border-white/5" aria-labelledby="stats-heading">
          <div className="max-w-screen-xl mx-auto text-center">
            <AnimateOnScroll animation="fade-in-up">
              <span className="font-label text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
                By the Numbers
              </span>
              <h2
                id="stats-heading"
                className="font-headline font-extrabold text-3xl sm:text-4xl lg:text-[2.75rem] text-white mt-4 tracking-tight"
              >
                Built with depth, not shortcuts
              </h2>
            </AnimateOnScroll>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-14 max-w-4xl mx-auto">
              {STATS.map((s, i) => (
                <AnimateOnScroll key={s.label} animation="fade-in-scale" delay={i * 120}>
                  <div className="glass-card rounded-2xl px-6 py-8">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                      <MaterialIcon name={s.icon} className="text-lg text-primary" />
                    </div>
                    <p className="font-headline text-4xl lg:text-5xl font-black text-white text-glow">
                      {s.value}
                    </p>
                    <p className="font-label text-xs text-stone-500 uppercase tracking-widest mt-3">
                      {s.label}
                    </p>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* ── Values ──────────────────────────────────────── */}
        <section className="py-20 lg:py-28 px-6 border-t border-white/5" aria-labelledby="values-heading">
          <div className="max-w-screen-xl mx-auto">
            <AnimateOnScroll className="text-center max-w-2xl mx-auto mb-16" animation="fade-in-up">
              <span className="font-label text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
                What We Believe
              </span>
              <h2
                id="values-heading"
                className="font-headline font-extrabold text-3xl sm:text-4xl lg:text-[2.75rem] text-white mt-4 tracking-tight"
              >
                Our values
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-emerald-400 via-primary to-cyan-400 rounded-full mx-auto mt-4" />
            </AnimateOnScroll>

            <div className="space-y-4 max-w-3xl mx-auto">
              {VALUES.map((v, i) => (
                <AnimateOnScroll key={v.title} animation="fade-in-up" delay={i * 100}>
                  <article className="glass-card glass-card-hover rounded-2xl p-6 flex items-start gap-5">
                    <div className="w-11 h-11 rounded-xl bg-white/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                      <MaterialIcon name={v.icon} className="text-lg text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-base text-white">{v.title}</h3>
                      <p className="font-body text-sm text-stone-400 leading-relaxed mt-1.5">{v.desc}</p>
                    </div>
                  </article>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────── */}
        <section className="py-24 lg:py-32 px-6" aria-labelledby="cta-heading">
          <AnimateOnScroll className="max-w-screen-lg mx-auto relative" animation="fade-in-scale">
            <div className="bg-gradient-to-br from-primary via-primary to-primary-container rounded-[2rem] lg:rounded-[2.5rem] px-8 py-16 sm:p-16 lg:p-20 text-center relative overflow-hidden">
              {/* Decorative overlay */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                <div className="absolute -top-1/2 -right-1/4 w-[120%] h-[200%] bg-white/[0.04] rotate-12 transform origin-center" />
                <div
                  className="absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                  }}
                />
              </div>

              <div className="relative z-10 space-y-8">
                <h2
                  id="cta-heading"
                  className="font-headline text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight"
                >
                  Start your journey
                </h2>
                <p className="font-body text-lg text-white/70 max-w-lg mx-auto leading-relaxed">
                  You don&rsquo;t need to have it all figured out. You just need to be honest about where you are &mdash; and willing to take the first step.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href="/auth/signup"
                    className="group px-10 py-4 bg-white text-primary rounded-full font-label font-bold text-base shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer inline-flex items-center gap-2"
                  >
                    Begin Your Journey
                    <MaterialIcon
                      name="arrow_forward"
                      className="text-lg group-hover:translate-x-0.5 transition-transform duration-200"
                    />
                  </Link>
                </div>
                <p className="font-body text-sm text-white/50">
                  No credit card required &middot; Cancel anytime
                </p>
              </div>
            </div>
          </AnimateOnScroll>
        </section>

        {/* ── Footer ──────────────────────────────────────── */}
        <footer className="border-t border-white/5 bg-stone-950">
          <div className="max-w-screen-xl mx-auto px-6 py-12">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
              {/* Brand */}
              <div className="col-span-2 lg:col-span-2">
                <Image src="/logo.png" alt="Be Candid" width={120} height={40} className="h-10 w-auto mb-4 brightness-[10]" />
                <p className="font-body text-sm text-stone-500 leading-relaxed max-w-xs">
                  A digital sanctuary for integrity, growth, and honest living.
                </p>
              </div>

              {/* Product */}
              <div>
                <h4 className="font-label text-xs font-semibold uppercase tracking-widest text-stone-400 mb-4">
                  Product
                </h4>
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
                      <Link
                        href={item.href}
                        className="font-body text-sm text-stone-500 hover:text-cyan-400 transition-colors duration-200"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h4 className="font-label text-xs font-semibold uppercase tracking-widest text-stone-400 mb-4">
                  Legal
                </h4>
                <ul className="space-y-2.5">
                  {[
                    { label: 'Privacy Policy', href: '/legal/privacy' },
                    { label: 'Terms of Service', href: '/legal/terms' },
                  ].map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="font-body text-sm text-stone-500 hover:text-cyan-400 transition-colors duration-200"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company */}
              <div>
                <h4 className="font-label text-xs font-semibold uppercase tracking-widest text-stone-400 mb-4">
                  Company
                </h4>
                <ul className="space-y-2.5">
                  {[
                    { label: 'About', href: '/about' },
                    { label: 'Contact', href: 'mailto:support@becandid.io' },
                  ].map((item) => (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        className="font-body text-sm text-stone-500 hover:text-cyan-400 transition-colors duration-200"
                      >
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
                Be Candid is not a substitute for professional therapy or crisis intervention. If you are in
                crisis, call or text 988.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
