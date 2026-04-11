import Link from 'next/link';
import Image from 'next/image';
import PublicNav from '@/components/PublicNav';
import JsonLd from '@/components/JsonLd';
import { HeroPlayer } from './HeroPlayerClient';
import { SocialProofCounter, TestimonialCarousel, ComparisonTable, FAQAccordion } from '@/components/LandingSections';
import { softwareAppSchema, organizationSchema, faqSchema } from '@/lib/structuredData';
import { FAQ_ITEMS } from '@/lib/faqData';
import AnimateOnScroll from '@/components/ui/AnimateOnScroll';

/* ─── Feature data ───────────────────────────────────────────── */
const FEATURES = [
  {
    icon: 'chat_bubble',
    title: 'Conversation Guides & Ice Breakers',
    desc: 'Evidence-based prompts designed by neurologists and therapists for difficult but necessary digital discussions.',
    image: '/images/features/conversation-guides.webp',
    alt: 'Glowing geometric nodes connected by light strands representing guided conversation',
  },
  {
    icon: 'menu_book',
    title: 'Candid Journal',
    desc: 'A private space for reflective record-keeping, helping you track personal growth and interaction history.',
    image: '/images/features/candid-journal.webp',
    alt: 'Minimalist digital journal on a tablet with morning sunlight',
  },
  {
    icon: 'handshake',
    title: 'Partner Awareness',
    desc: 'Shared insights that foster mutual trust without compromising individual privacy or autonomy.',
    image: '/images/features/partner-awareness.webp',
    alt: 'Two intersecting circles in teal and blue symbolizing mutual understanding',
  },
  {
    icon: 'emergency_home',
    title: 'Crisis Detection',
    desc: 'Advanced sentiment analysis to identify distress signals and offer immediate supportive resources.',
    image: '/images/features/crisis-detection.webp',
    alt: 'Calm wave pattern in warm amber tones representing gentle monitoring',
  },
  {
    icon: 'encrypted',
    title: 'End-to-End Encryption',
    desc: 'State-of-the-art security ensuring your most vulnerable moments stay strictly between you and your trusted circle.',
    image: '/images/features/encryption.webp',
    alt: 'Glass lock icon floating above shimmering data particles in teal and cyan',
  },
  {
    icon: 'center_focus_strong',
    title: 'Alignment Tracking',
    desc: 'Monitor how your digital habits align with your core values and long-term wellness goals.',
    image: '/images/features/alignment-tracking.webp',
    alt: 'Data visualization showing harmonic balance representing life-tech alignment',
  },
  {
    icon: 'lightbulb',
    title: 'Content Illumination',
    desc: 'Digital tools that shine a light on your content habits, bringing awareness to the patterns and trends that lead to moments of struggle — so you can see clearly and choose differently.',
    image: '/images/features/content-filtering.webp',
    alt: 'Light illuminating content patterns for greater self-awareness',
  },
  {
    icon: 'timer',
    title: 'Screen Time Controls',
    desc: 'Intuitive limits that encourage conscious consumption rather than restrictive digital deprivation.',
    image: '/images/features/screen-time.webp',
    alt: 'Zen garden sand pattern with minimalist clock silhouette',
  },
  {
    icon: 'psychology',
    title: 'Therapist Dashboard',
    desc: 'A clinical-grade portal for therapists to gather in-patient level behavioral data while their clients live their normal lives — no lab setting required.',
    image: '/images/features/guardian-dashboard.webp',
    alt: 'Therapist dashboard interface showing client behavioral insights',
  },
];

const TRUST_STATS = [
  { value: '+84%', label: 'Integrity Growth' },
  { value: '+71%', label: 'Partner Trust' },
  { value: '3.2x', label: 'Deeper Conversations' },
  { value: 'HIPAA', label: 'Compliant' },
];

/* ─── Reusable icon component ────────────────────────────────── */
function MaterialIcon({ name, className = '', filled = false }: { name: string; className?: string; filled?: boolean }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
    >
      {name}
    </span>
  );
}

/* ─── Icon accent colors ─────────────────────────────────────── */
const ICON_COLORS = [
  'bg-cyan-500/20 text-cyan-400',
  'bg-emerald-500/20 text-emerald-400',
  'bg-primary/20 text-primary',
  'bg-amber-500/20 text-amber-400',
  'bg-cyan-500/20 text-cyan-400',
  'bg-emerald-500/20 text-emerald-400',
  'bg-primary/20 text-primary',
  'bg-amber-500/20 text-amber-400',
  'bg-cyan-500/20 text-cyan-400',
];

/* ─── Main page ──────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark-sanctuary text-white overflow-x-hidden">
      {/* JSON-LD Structured Data */}
      <JsonLd data={softwareAppSchema()} />
      <JsonLd data={organizationSchema()} />
      <JsonLd data={faqSchema(FAQ_ITEMS)} />

      <PublicNav />

      <main>
        {/* ── Hero Section ─────────────────────────────────── */}
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 min-h-[90vh] flex flex-col justify-center">
          {/* Decorative blur orbs — full viewport width */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-20 -right-20 w-[800px] h-[800px] rounded-full blur-[200px] animate-glow-pulse" style={{ background: 'rgba(0, 102, 122, 0.15)' }} />
            <div className="absolute -bottom-20 -left-20 w-[600px] h-[600px] rounded-full blur-[160px] animate-glow-pulse delay-500" style={{ background: 'rgba(123, 211, 237, 0.08)' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full blur-[240px] animate-glow-pulse delay-300" style={{ background: 'rgba(0, 102, 122, 0.06)' }} />
          </div>

          <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            <div className="space-y-8 max-w-xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 glass-card rounded-full">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="font-label text-xs font-semibold uppercase tracking-widest text-cyan-400">Clinically Informed</span>
              </div>

              {/* Headline */}
              <h1 className="font-headline text-[2.75rem] sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-extrabold tracking-tight leading-[1.08]">
                <span className="text-glow">Recovery starts with{' '}</span>
                <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                  radical honesty.
                </span>
              </h1>

              {/* Sub */}
              <p className="font-body text-lg lg:text-xl text-stone-400 leading-relaxed max-w-md">
                An accountability app that combines screen monitoring, guided journaling, and data-driven insights to help you break free from unwanted habits &mdash; for good.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/auth/signup"
                  className="group px-8 py-4 bg-gradient-to-r from-primary to-primary-container text-white rounded-full font-label font-bold text-base shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:brightness-110 active:scale-[0.97] transition-all duration-200 cursor-pointer inline-flex items-center gap-2"
                >
                  Begin Your Journey
                  <MaterialIcon name="arrow_forward" className="text-lg group-hover:translate-x-0.5 transition-transform duration-200" />
                </Link>
                <a
                  href="/methodology"
                  className="px-8 py-4 rounded-full font-label font-bold text-base text-stone-300 hover:text-white glass-card hover:bg-white/[0.06] transition-all duration-200 cursor-pointer inline-flex items-center gap-2"
                >
                  <MaterialIcon name="play_circle" className="text-xl text-cyan-400" filled />
                  The Methodology
                </a>
              </div>

              {/* Micro-trust */}
              <div className="flex items-center gap-3 pt-2 text-stone-500">
                <MaterialIcon name="verified_user" className="text-base text-primary/60" filled />
                <span className="font-body text-sm">Free 21-day trial &middot; No credit card required</span>
              </div>
            </div>

            {/* Hero Animated Dashboard — Mobile */}
            <div className="relative lg:hidden mt-10">
              <div className="absolute -inset-6 rounded-full blur-[80px]" style={{ background: 'radial-gradient(circle, rgba(0, 102, 122, 0.2), transparent 70%)' }} />
              <div className="relative glass-card rounded-2xl p-3 shadow-xl shadow-primary/10">
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden">
                  <HeroPlayer />
                </div>
              </div>
              {/* Mobile trust pills */}
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <div className="glass-card px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <MaterialIcon name="lock" className="text-emerald-400 text-xs" filled />
                  <span className="font-label text-[10px] font-semibold text-white">256-bit Encrypted</span>
                </div>
                <div className="glass-card px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <MaterialIcon name="health_and_safety" className="text-cyan-400 text-xs" filled />
                  <span className="font-label text-[10px] font-semibold text-white">HIPAA Compliant</span>
                </div>
                <div className="glass-card px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <MaterialIcon name="psychology" className="text-amber-400 text-xs" filled />
                  <span className="font-label text-[10px] font-semibold text-white">Clinically Studied</span>
                </div>
              </div>
            </div>

            {/* Hero Animated Dashboard — Desktop */}
            <div className="relative hidden lg:block">
              <div className="absolute -inset-12 rounded-full blur-[100px]" style={{ background: 'radial-gradient(circle, rgba(0, 102, 122, 0.25), transparent 70%)' }} />
              <div className="relative glass-card rounded-3xl p-4 transform rotate-1 hover:rotate-0 transition-transform duration-700 shadow-2xl shadow-primary/10">
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden">
                  <HeroPlayer />
                </div>
              </div>

              {/* Floating badge: 256-bit Encrypted — top-right */}
              <div className="absolute -top-5 -right-5 glass-card px-4 py-3 rounded-2xl flex items-center gap-2.5 shadow-lg shadow-black/20 z-10 animate-float">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <MaterialIcon name="lock" className="text-emerald-400 text-base" filled />
                </div>
                <div>
                  <p className="font-label text-xs font-semibold text-white">256-bit Encrypted</p>
                  <p className="font-label text-[10px] text-stone-500">Zero-knowledge architecture</p>
                </div>
              </div>

              {/* Floating badge: Stringer Framework — bottom-left */}
              <div className="absolute -bottom-3 -left-6 glass-card px-4 py-3 rounded-2xl flex items-center gap-2.5 shadow-lg shadow-black/20 z-10 animate-float-delayed">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <MaterialIcon name="psychology" className="text-amber-400 text-base" filled />
                </div>
                <div>
                  <p className="font-label text-xs font-semibold text-white">Clinically Studied</p>
                  <p className="font-label text-[10px] text-stone-500">Research-backed framework</p>
                </div>
              </div>

              {/* Floating badge: HIPAA Ready — top-left */}
              <div className="absolute top-12 -left-10 glass-card px-4 py-3 rounded-2xl flex items-center gap-2.5 shadow-lg shadow-black/20 z-10 animate-float-slow">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <MaterialIcon name="health_and_safety" className="text-cyan-400 text-base" filled />
                </div>
                <div>
                  <p className="font-label text-xs font-semibold text-white">HIPAA Compliant</p>
                  <p className="font-label text-[10px] text-stone-500">Healthcare-grade privacy</p>
                </div>
              </div>

              {/* Floating badge: Pattern Detection — bottom-right */}
              <div className="absolute -bottom-5 right-8 glass-card px-4 py-3 rounded-2xl flex items-center gap-2.5 shadow-lg shadow-black/20 z-10">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <MaterialIcon name="neurology" className="text-purple-400 text-base" filled />
                </div>
                <div>
                  <p className="font-label text-xs font-semibold text-white">Pattern Detection</p>
                  <p className="font-label text-[10px] text-stone-500">Behavioral insight engine</p>
                </div>
              </div>
            </div>
          </div>
          </div>
        </section>

        {/* ── Social Proof Counter ────────────────────────── */}
        <SocialProofCounter />

        {/* ── Precision Tools ─────────────────────────────── */}
        <section id="features" className="py-24 lg:py-32 px-6">
          <div className="max-w-screen-xl mx-auto">
            <AnimateOnScroll className="text-center max-w-2xl mx-auto mb-16" animation="fade-in-up">
              <span className="font-label text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">Features</span>
              <h2 className="font-headline font-extrabold text-3xl sm:text-4xl lg:text-[2.75rem] text-white mt-4 tracking-tight">
                Precision Tools
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 via-primary to-emerald-400 rounded-full mx-auto mt-4" />
              <p className="text-stone-400 mt-6 text-lg leading-relaxed">
                Awareness, journaling, conversation guides, and alignment tracking &mdash; all in one place.
              </p>
            </AnimateOnScroll>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map((f, i) => (
                <AnimateOnScroll
                  key={f.title}
                  animation="fade-in-scale"
                  delay={i * 100}
                  threshold={0.1}
                >
                  <div
                    className="group relative glass-card glass-card-hover rounded-2xl overflow-hidden hover:translate-y-[-8px] transition-all duration-300 cursor-pointer h-full"
                  >
                    {/* Image */}
                    <div className="aspect-[16/10] overflow-hidden relative">
                      <Image
                        src={f.image}
                        alt={f.alt}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-center gap-3 mb-2.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${ICON_COLORS[i] || 'bg-primary/20 text-primary'}`}>
                          <MaterialIcon name={f.icon} className="text-lg" />
                        </div>
                        <h3 className="font-headline font-bold text-base text-white leading-snug">{f.title}</h3>
                      </div>
                      <p className="font-body text-stone-400 leading-relaxed text-sm">{f.desc}</p>
                    </div>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* ── The Journey to Integrity ─────────────────────── */}
        <section id="journey" className="py-24 lg:py-32 px-6 border-t border-white/5">
          <div className="max-w-screen-xl mx-auto">
            <AnimateOnScroll className="text-center mb-20" animation="fade-in-up">
              <span className="font-label text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">The Process</span>
              <h2 className="font-headline text-3xl sm:text-4xl lg:text-[2.75rem] font-bold mt-4 tracking-tight text-white">
                The Journey to Integrity
              </h2>
            </AnimateOnScroll>

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Steps */}
              <div className="space-y-12">
                {[
                  {
                    num: '01',
                    title: 'The Reckoning',
                    desc: 'Audit your digital footprint with honesty. Confront the patterns that keep you stuck and face the truth about your habits.',
                  },
                  {
                    num: '02',
                    title: 'The Architecture',
                    desc: 'Build barriers and bridges with accountability partners. Design the structure that supports your transformation.',
                  },
                  {
                    num: '03',
                    title: 'The Ascent',
                    desc: 'Track progress in character points and trust. Watch your integrity score rise as you build lasting, meaningful change.',
                  },
                ].map((step, i) => (
                  <AnimateOnScroll key={step.num} animation="fade-in-up" delay={i * 200}>
                    <div className="flex gap-6 items-start">
                      <span className="text-outline font-headline text-6xl font-black leading-none shrink-0 select-none">
                        {step.num}
                      </span>
                      <div className="space-y-2 pt-1">
                        <h3 className="font-headline text-xl font-bold text-white">{step.title}</h3>
                        <p className="font-body text-stone-400 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  </AnimateOnScroll>
                ))}
              </div>

              {/* Right side image */}
              <div className="relative hidden lg:block">
                <div className="absolute -inset-4 rounded-3xl blur-[60px]" style={{ background: 'rgba(0, 102, 122, 0.1)' }} />
                <div className="relative rounded-3xl overflow-hidden aspect-[4/3]">
                  <Image
                    src="/images/features/sync-devices.webp"
                    alt="Laptop and smartphone showing synchronized Be Candid integrity progress"
                    fill
                    className="object-cover rounded-3xl"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-sanctuary via-transparent to-transparent" />
                </div>

                {/* Floating glass quote card */}
                <div className="absolute bottom-8 left-8 right-8 glass-card rounded-2xl p-6">
                  <p className="font-body text-sm text-stone-300 italic leading-relaxed">
                    {"\u201C"}Integrity is choosing courage over comfort; choosing what is right over what is fun, fast, or easy; and choosing to practice our values rather than simply professing them.{"\u201D"}
                  </p>
                  <p className="font-label text-xs text-stone-500 mt-2">{"\u2014"} Bren&#233; Brown</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats + Download CTA ────────────────────────── */}
        <section id="download" className="py-24 lg:py-32 px-6 border-t border-white/5">
          <div className="max-w-screen-xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            {/* Stats */}
            <div className="space-y-10">
              <AnimateOnScroll animation="fade-in-up">
                <div>
                  <span className="font-label text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">Proven Results</span>
                  <h2 className="font-headline text-3xl sm:text-4xl font-bold mt-4 tracking-tight text-white">
                    Trusted by thousands
                  </h2>
                </div>
              </AnimateOnScroll>
              <div className="grid grid-cols-2 gap-8">
                {TRUST_STATS.map((s, i) => (
                  <AnimateOnScroll key={s.label} animation="fade-in-scale" delay={i * 150}>
                    <div>
                      <p className="font-headline text-4xl lg:text-5xl font-black text-white text-glow">{s.value}</p>
                      <p className="font-label text-xs text-stone-500 uppercase tracking-widest mt-2">{s.label}</p>
                    </div>
                  </AnimateOnScroll>
                ))}
              </div>
              <p className="font-label text-sm text-stone-500 uppercase tracking-widest mt-6">Methodology trusted by thousands</p>
            </div>

            {/* Download card */}
            <AnimateOnScroll animation="fade-in-scale" delay={200}>
            <div className="glass-card glass-card-hover rounded-3xl p-8 lg:p-10">
              <span className="font-label text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">Install Anywhere</span>
              <h3 className="font-headline text-2xl font-bold text-white mt-3 mb-2">Growth on the go</h3>
              <p className="font-body text-stone-400 leading-relaxed mb-8">
                Sync your journey across all devices. Your sanctuary is always within reach.
              </p>

              <div className="flex flex-wrap gap-3">
                {[
                  { icon: 'phone_iphone', label: 'iPhone & iPad', sub: 'Install on', href: '/download' },
                  { icon: 'phone_android', label: 'Android', sub: 'Install on', href: '/download' },
                  { icon: 'language', label: 'Web App', sub: 'Access the', href: '/auth/signup', light: true },
                ].map((btn) => (
                  <Link
                    key={btn.label}
                    href={btn.href}
                    className={`px-5 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 cursor-pointer ${
                      btn.light
                        ? 'glass-card text-stone-300 hover:text-white hover:bg-white/[0.06]'
                        : 'bg-white/10 text-white hover:bg-white/15'
                    }`}
                  >
                    <MaterialIcon name={btn.icon} className="text-2xl" />
                    <div className="text-left">
                      <p className="text-[10px] uppercase font-label leading-none opacity-60">{btn.sub}</p>
                      <p className="text-sm font-bold font-headline leading-tight mt-0.5">{btn.label}</p>
                    </div>
                  </Link>
                ))}
              </div>

              <p className="font-body text-sm text-stone-500 flex items-center gap-2 mt-6">
                <MaterialIcon name="info" className="text-base" />
                Installs as a Progressive Web App &mdash; no app store needed.
              </p>
            </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* ── Testimonial ─────────────────────────────────── */}
        <section className="py-20 px-6 border-t border-white/5">
          <AnimateOnScroll className="max-w-3xl mx-auto" animation="fade-in-up">
            <div className="glass-card glass-card-hover rounded-3xl p-10 lg:p-14 relative overflow-hidden">
              {/* Gradient line at top */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

              <blockquote className="font-body text-xl lg:text-2xl text-stone-300 leading-relaxed">
                {"\u201C"}Integrity is choosing courage over comfort; choosing what is right over what is fun, fast, or easy; and choosing to practice our values rather than simply professing them.{"\u201D"}
              </blockquote>
              <div className="mt-8 flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/authors/1749770174i/162578._UX200_CR0,0,200,200_.jpg"
                  alt="Bren&#233; Brown"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="text-left">
                  <p className="font-label text-sm font-semibold text-white">Bren&eacute; Brown</p>
                  <p className="font-label text-xs text-stone-500">Author &amp; Researcher</p>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </section>

        {/* ── Testimonial Carousel ─────────────────────────── */}
        <TestimonialCarousel />

        {/* ── Comparison Table ────────────────────────────── */}
        <ComparisonTable />

        {/* ── FAQ Accordion ───────────────────────────────── */}
        <FAQAccordion />

        {/* ── Join the Community ─────────────────────────── */}
        <section className="py-24 lg:py-32 px-6 border-t border-white/5">
          <div className="max-w-screen-lg mx-auto text-center">
            <AnimateOnScroll animation="fade-in-down">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 glass-card rounded-full mb-6">
                <span className="w-2 h-2 rounded-full bg-[#5865F2] animate-pulse" />
                <span className="font-label text-xs font-semibold uppercase tracking-widest text-[#5865F2]">Community</span>
              </div>

              <h2 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6">
                Join the Community
              </h2>
              <p className="font-body text-lg text-stone-400 leading-relaxed max-w-2xl mx-auto mb-10">
                Be Candid is built in the open. Join our Discord to share feedback, request features, and connect with others on the same journey.
              </p>
            </AnimateOnScroll>

            <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
              <a
                href="https://discord.gg/sCkyPuqf6"
                target="_blank"
                rel="noopener noreferrer"
                className="group px-8 py-4 bg-[#5865F2] text-white rounded-full font-label font-bold text-base shadow-lg shadow-[#5865F2]/30 hover:shadow-xl hover:shadow-[#5865F2]/40 hover:brightness-110 active:scale-[0.97] transition-all duration-200 cursor-pointer inline-flex items-center gap-2.5"
              >
                <MaterialIcon name="forum" className="text-xl" />
                Join our Discord
                <MaterialIcon name="arrow_forward" className="text-lg group-hover:translate-x-0.5 transition-transform duration-200" />
              </a>
              <Link
                href="/donate"
                className="px-8 py-4 rounded-full font-label font-bold text-base text-stone-300 hover:text-white glass-card hover:bg-white/[0.06] transition-all duration-200 cursor-pointer inline-flex items-center gap-2.5"
              >
                <MaterialIcon name="volunteer_activism" className="text-xl text-emerald-400" />
                Support the Project
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <AnimateOnScroll animation="fade-in-scale" delay={0}>
                <div className="glass-card glass-card-hover rounded-2xl px-6 py-5">
                  <p className="font-headline text-2xl font-extrabold text-[#5865F2]">140+</p>
                  <p className="font-body text-xs text-stone-400 mt-1">Features built by community feedback</p>
                </div>
              </AnimateOnScroll>
              <AnimateOnScroll animation="fade-in-scale" delay={150}>
                <div className="glass-card glass-card-hover rounded-2xl px-6 py-5">
                  <p className="font-headline text-2xl font-extrabold text-emerald-400">Free</p>
                  <p className="font-body text-xs text-stone-400 mt-1">During beta &mdash; all features unlocked</p>
                </div>
              </AnimateOnScroll>
              <AnimateOnScroll animation="fade-in-scale" delay={300}>
                <div className="glass-card glass-card-hover rounded-2xl px-6 py-5">
                  <p className="font-headline text-2xl font-extrabold text-cyan-400">Open</p>
                  <p className="font-body text-xs text-stone-400 mt-1">Built in public with your input</p>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* ── Final CTA ───────────────────────────────────── */}
        <section id="cta" className="py-24 lg:py-32 px-6">
          <AnimateOnScroll className="max-w-screen-lg mx-auto relative" animation="fade-in-scale">
            <div className="bg-gradient-to-br from-primary via-primary to-primary-container rounded-[2rem] lg:rounded-[2.5rem] px-8 py-16 sm:p-16 lg:p-20 text-center relative overflow-hidden">
              {/* Decorative skewed overlay */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-1/2 -right-1/4 w-[120%] h-[200%] bg-white/[0.04] rotate-12 transform origin-center" />
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
              </div>

              <div className="relative z-10 space-y-8">
                <h2 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                  Become who you<br className="hidden sm:block" /> want to be.
                </h2>
                <p className="font-body text-lg text-white/70 max-w-lg mx-auto leading-relaxed">
                  Join thousands building a life of integrity and transparency. Start your 21-day free trial today.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href="/auth/signup"
                    className="group px-10 py-4 bg-white text-primary rounded-full font-label font-bold text-base shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer inline-flex items-center gap-2"
                  >
                    Begin Your Journey
                    <MaterialIcon name="arrow_forward" className="text-lg group-hover:translate-x-0.5 transition-transform duration-200" />
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
                    { label: 'Features', href: '#features' },
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
