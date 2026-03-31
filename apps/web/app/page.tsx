'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

/* ─── Feature data ───────────────────────────────────────────── */
const FEATURES = [
  {
    icon: 'chat_bubble',
    title: 'Conversation Guides & Ice Breakers',
    desc: 'Evidence-based prompts designed by neurologists and therapists for difficult but necessary digital discussions.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDK75pW4vwBoIKZKqRfXv5nNixz53H86_XDRAM5lFE_qLDRDA_0EaBcExFNNcW2diDMzW7oHfniK5vT0VoDh8ORn6nDCr0bAoTYjdXoKn1JXHixWNHCN-flYfPlrnxYxeG5Q-eArpggt6kseUMEvlK-J3dB7Rfp0Tns9F2koKnKe904q18HbSiSBZrD9zSh5xQev-Mj2Rmdv4u19VE3ebdtEcecyMf1yeEMgGXxigV2uEAzs-KrJzjcwbLwiRFVLZnLuTzU2HNOJQcX',
    alt: 'Glowing geometric nodes connected by light strands representing AI dialogue',
  },
  {
    icon: 'menu_book',
    title: 'Candid Journal',
    desc: 'A private space for reflective record-keeping, helping you track personal growth and interaction history.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfBxh_yzZ7uwgR50MZXnPl8QPW_ME7nN1lPEv_cD822RK8u7V3Of9E95ABemZ6rqV6rm8XlZxJ4wKTkxhiTM_BdCz20_ph4pMvKdJ0nnZ_vWe9SHbw_9L3pktumG67jQ9bcna8kWc8qkdjUObqfyMIRuBTqz8PcOF2YENphyR5zUA8P06cp0atPabHodQTd4U_R_CrPA0NsRlNWahv_-vNun8lbKvIeKrXMWssZuRwXhSxhjkg5EYMZoF14po0DPIq5w_QpV0AJlk5',
    alt: 'Minimalist digital journal on a tablet with morning sunlight',
  },
  {
    icon: 'handshake',
    title: 'Partner Awareness',
    desc: 'Shared insights that foster mutual trust without compromising individual privacy or autonomy.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9z0_qFFcxPTynziBimlO4ZPOQFzK7CzCSyVCv0kNcrKCiAJBxSC5E1phNCkDn9xtVrExQQ87WeZIoheVpMKoAWKh41dsihbIIjOeUaFB8wHt5T--RFXDxFiuZTZO1vz6lISFQaOI04Tym26Ju5v_M3Car6glHvDiYJzZrxsZSfLbsTS8n4qUTvbU1Um6VgboqhHrYBMFUVZrJuwLBTCI0mDrRwx3eM2jkUnm56VUa29YoY5hiWJ-tcB-E4cNfJ-CTTJIPBiHFvTnT',
    alt: 'Two intersecting circles in teal and blue symbolizing mutual understanding',
  },
  {
    icon: 'emergency_home',
    title: 'Crisis Detection',
    desc: 'Advanced sentiment analysis to identify distress signals and offer immediate supportive resources.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2PCBqh0r0XvbXJDoIEsvChMXbblBdWZXVmPnPx8vluAlIIDucgY3v30rMZfGzihOLd5Ia0--KQVA4mZVnXJD-77rO0isDR-vo4892fqZvxWQgm7uSZq9OhnYDnxtgTqiCNcuPpT6Py4FSd930P4VzXmFVT1QixXQxljEZ4m50_VBnJ1Oh7jgkg9h-R962WCiwhhqBP58uSLVH1IcJ2hKPaiEAer8GxO6AKpqR1hzUhFxE9ah4094WMrEQ1KslZWYovr7C_kdy07eD',
    alt: 'Calm wave pattern in warm amber tones representing gentle monitoring',
  },
  {
    icon: 'encrypted',
    title: 'End-to-End Encryption',
    desc: 'State-of-the-art security ensuring your most vulnerable moments stay strictly between you and your trusted circle.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_SmlA10dM0e2T2J0UiwgngHZsGaBJ4JuqCNZAMl1QG4NU9v7tdmC3VWKFAAgak_lSpbNYxCSYrvDlzgYvrmimwqt6xA3UityznZhg10haskT1rixoScFsfQlyOxUPSy4fdt2iwV5XzUl3aCzdGUJ8rHfFoly-qoTP62_ZTq7p6uIvSVJhgSMv1mYaAxBej4h_RoU7Zw7LVBfQJ8TMInGYqDcbbHd0MWedNtXiT--RHCjXowUWZwHMl-8etkYyMXnymYrHzoXbOK3x',
    alt: 'Glass lock icon floating above shimmering data particles in teal and cyan',
  },
  {
    icon: 'center_focus_strong',
    title: 'Alignment Tracking',
    desc: 'Monitor how your digital habits align with your core values and long-term wellness goals.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5Ys--kStjkPby9Zzm20_PmXM5uVfGTfSuggs9r3WJvReEscj7W60sLEU-bUDtF0AeqbE_btr3fg9RPmicpxh6qiQDyEz9kbkYiONgY96ZqIF0rZzvv8n6COzpeCPg7_kjrqpK7j3jkkolkA5PkecMAoDZ2zWxG-K47MB8kCTYKEVOWCWAZ27E-IKn6Qa76TU-IwTauc8Vmc8t8kt1CVrPbj6lj7BcLktihlUai5twB3UU1E20Azu2iAHz59zoPDPhHCQV_js88LSX',
    alt: 'Data visualization showing harmonic balance representing life-tech alignment',
  },
  {
    icon: 'filter_list',
    title: 'AI Content Filtering',
    desc: 'Smart filters that shield you from toxic environments while highlighting positive, growth-oriented content.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwFXB-FLuFEzJSGvNSOMO371jUsqU4or47dt12RQUpFyGKy0QYOYry8Y8HDlzk5QZ67tgUAlb-B-d19tir4g-nQ8QL0YgqMU_Prwnu0TABcEXoLJzVSBziYz3qoolNAD6Y618dCgmPAfcj9r_yUuXtYbEKV-2f0zOq_YLPiwbTA4liYmq9KZqjL29E__6ceJEJiW-KUMZC0sNZ-qY2P0HeyFgrtebqakuqHa9UQTP1wb_29AmK24CSjQSB7l_J5O6Bc1DpMOAVtinG',
    alt: 'Semi-transparent prism filtering light into a clear beam',
  },
  {
    icon: 'timer',
    title: 'Screen Time Controls',
    desc: 'Intuitive limits that encourage conscious consumption rather than restrictive digital deprivation.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8r5F8dD28slCIYA2s9aKRnx0uApEyC-ppD8DLNUx2-X5FfNFQcdM8OKJUWui0FekVLb68kQfkT-1cwWb0gQV7j7ByCGkWlauhEnJpptHOuNCkSzngOUHFwqnGARySp03UjnzsxG7kMKD62daIP6dBtMNhegwofC7BfwigGdnW2DFs-PBFldta7m6qgayt5m2637au0Hs2oan7RWWi4Gr6M-_qVeB_u4D_pAQFDTMnkNLFI1oxFD0Xqz0DYl8ItG1JsYZqGUPlfwDc',
    alt: 'Zen garden sand pattern with minimalist clock silhouette',
  },
  {
    icon: 'shield',
    title: 'Guardian Dashboard',
    desc: 'A centralized command center for administrators to oversee safety settings and review collective wellness trends.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfpF--KFSH1cy_6OBg93bKMc1gd14EqwcEEog-t6MRUe8QhOI5SPIUcmoh6l1T6YUBUy4LKdEeuUZrslDB416pE39KXKFVf2lk7_dwje-3Rv7l-EbjKvvro96ASsDf7LTpYNVX3p_gipILTXxWXcR0angm8imcdY9CnP4SZ1neORKJH138yUFYcWIghaEtDYvDyGYr3ELkonIOhGIJ7I2ey1L0cMlqigWN9Kql3bpW-K7ZRT_mIP8RyLiwzFBz7-uetTG33SpOnXgB',
    alt: 'Clean structured command center interface with soft glow',
  },
];

const TRUST_STATS = [
  { value: '50K+', label: 'Active Users' },
  { value: '4.9', label: 'App Rating' },
  { value: '92%', label: 'Report Growth' },
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

/* ─── Main page ──────────────────────────────────────────────── */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-surface text-on-surface overflow-x-hidden">
      {/* ── Floating Nav ───────────────────────────────────── */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border-b border-outline-variant/10'
            : 'bg-transparent'
        }`}
      >
        <nav className="flex justify-between items-center px-6 lg:px-12 py-4 max-w-screen-2xl mx-auto">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Be Candid" className="h-12 w-auto object-contain" />
          </Link>

          <div className="hidden md:flex items-center gap-1 font-body text-sm">
            {[
              { label: 'Features', href: '#features' },
              { label: 'How It Works', href: '#journey' },
              { label: 'Download', href: '/download', isLink: true },
              { label: 'Families', href: '/families', isLink: true },
              { label: 'Pricing', href: '/pricing', isLink: true },
            ].map((item) => {
              const cls = 'px-4 py-2 rounded-full text-on-surface/70 hover:text-on-surface hover:bg-surface-container-low transition-all duration-200 cursor-pointer';
              return item.isLink ? (
                <Link key={item.label} href={item.href} className={cls}>{item.label}</Link>
              ) : (
                <a key={item.label} href={item.href} className={cls}>{item.label}</a>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/auth/signin"
              className="px-5 py-2.5 text-sm font-medium text-on-surface/70 hover:text-on-surface rounded-full hover:bg-surface-container-low transition-all duration-200 cursor-pointer"
            >
              Log in
            </Link>
            <Link
              href="/auth/signup"
              className="px-6 py-2.5 bg-primary text-on-primary rounded-full font-label text-sm font-semibold shadow-sm hover:shadow-md hover:brightness-110 active:scale-[0.97] transition-all duration-200 cursor-pointer"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-on-surface text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </nav>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-surface/95 backdrop-blur-xl border-t border-outline-variant/10 px-6 pb-6 pt-2">
            <div className="space-y-1">
              {[
                { label: 'Features', href: '#features' },
                { label: 'How It Works', href: '#journey' },
                { label: 'Download', href: '/download' },
                { label: 'Families', href: '/families' },
                { label: 'Pricing', href: '/pricing' },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl font-body text-base text-on-surface hover:bg-surface-container-low transition-all duration-200"
                >
                  {item.label}
                </a>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-outline-variant/10 flex flex-col gap-3">
              <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-center text-on-surface font-label text-sm font-semibold rounded-xl hover:bg-surface-container-low transition-all duration-200 cursor-pointer">
                Log in
              </Link>
              <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-center bg-primary text-on-primary rounded-full font-label text-sm font-semibold shadow-lg shadow-primary/20 hover:brightness-110 transition-all duration-200 cursor-pointer">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* ── Hero Section ─────────────────────────────────── */}
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 px-6 lg:px-12 max-w-screen-2xl mx-auto min-h-[90vh] flex flex-col justify-center">
          {/* Subtle background gradient */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-20 -right-40 w-[600px] h-[600px] bg-primary/[0.04] rounded-full blur-[120px]" />
            <div className="absolute -bottom-20 -left-40 w-[500px] h-[500px] bg-primary-container/[0.08] rounded-full blur-[100px]" />
          </div>

          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center relative z-10">
            <div className="space-y-8 max-w-xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-primary/[0.08] border border-primary/15 rounded-full">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse-dot" />
                <span className="font-label text-xs font-semibold uppercase tracking-widest text-primary">Clinically Informed</span>
              </div>

              {/* Headline */}
              <h1 className="font-headline text-[2.75rem] sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-extrabold text-on-surface tracking-tight leading-[1.08]">
                Recovery starts with{' '}
                <span className="text-primary">radical honesty.</span>
              </h1>

              {/* Sub */}
              <p className="font-body text-lg lg:text-xl text-on-surface-variant leading-relaxed max-w-md">
                An accountability app that combines screen monitoring, guided journaling, and AI-driven insights to help you break free from unwanted habits &mdash; for good.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/auth/signup"
                  className="group px-8 py-4 bg-primary text-on-primary rounded-full font-label font-bold text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:brightness-110 active:scale-[0.97] transition-all duration-200 cursor-pointer inline-flex items-center gap-2"
                >
                  Start Free Trial
                  <MaterialIcon name="arrow_forward" className="text-lg group-hover:translate-x-0.5 transition-transform duration-200" />
                </Link>
                <a
                  href="#journey"
                  className="px-8 py-4 rounded-full font-label font-bold text-base text-on-surface/70 hover:text-on-surface hover:bg-surface-container transition-all duration-200 cursor-pointer inline-flex items-center gap-2"
                >
                  <MaterialIcon name="play_circle" className="text-xl text-primary" filled />
                  How It Works
                </a>
              </div>

              {/* Micro-trust */}
              <div className="flex items-center gap-3 pt-2 text-on-surface-variant/60">
                <MaterialIcon name="verified_user" className="text-base text-primary/50" filled />
                <span className="font-body text-sm">Free 14-day trial &middot; No credit card required</span>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative hidden lg:block">
              <div className="absolute -inset-8 bg-gradient-to-br from-primary/[0.06] via-transparent to-primary-container/[0.08] blur-3xl rounded-full" />
              <div className="relative bg-surface-container-lowest rounded-3xl p-3 shadow-2xl shadow-on-surface/[0.08] ring-1 ring-outline-variant/10 transform rotate-1 hover:rotate-0 transition-transform duration-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBDhdaLlgxHIo_EQEqTmR12ZxXVjLjZzQR32EdMhoa_Wx7_3glU1nTRHm1c7XAWnFGGPLDLoqo8o-VvOMXB56KxDMWa054TdLlpsZsPPAGJhDElxPH8IYampDAz8ajs9SDk_IwFhdWISX-YRczgAUd6JegtfDruOhiPwoIaYjmDhVLDw8_GbAwE8PW5s2ci5wvWPSmnbu34eIOizHnoY2DJF7DCsL_pt-JSFBs1rj0Qw7_96_k7nUMFbrBYJHX52XfyKK4DnTy6Jp6"
                  alt="Be Candid dashboard showing integrity score and journaling prompts"
                  className="w-full h-auto rounded-2xl object-cover"
                />
              </div>

              {/* Floating stat */}
              <div className="absolute -bottom-6 -left-6 bg-surface-container-lowest p-5 rounded-2xl shadow-xl shadow-on-surface/[0.06] ring-1 ring-outline-variant/10 max-w-[200px]">
                <MaterialIcon name="insights" className="text-primary text-2xl mb-2" filled />
                <p className="font-headline text-2xl font-bold text-on-surface">+84%</p>
                <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mt-0.5">Integrity Growth</p>
              </div>

              {/* Floating badge top-right */}
              <div className="absolute -top-4 -right-4 bg-surface-container-lowest px-4 py-3 rounded-2xl shadow-xl shadow-on-surface/[0.06] ring-1 ring-outline-variant/10 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <MaterialIcon name="check" className="text-green-600 text-base" />
                </div>
                <div>
                  <p className="font-label text-xs font-semibold text-on-surface">256-bit</p>
                  <p className="font-label text-[10px] text-on-surface-variant">Encrypted</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Trust Strip ──────────────────────────────────── */}
        <section className="border-y border-outline-variant/10 bg-surface-container-low/50">
          <div className="max-w-screen-xl mx-auto px-6 py-8 flex flex-wrap justify-center gap-x-16 gap-y-6">
            {TRUST_STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-headline text-2xl font-bold text-on-surface">{s.value}</p>
                <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features Bento ───────────────────────────────── */}
        <section id="features" className="py-24 lg:py-32 px-6">
          <div className="max-w-screen-xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="font-label text-xs font-semibold uppercase tracking-[0.25em] text-primary">Features</span>
              <h2 className="font-headline font-extrabold text-3xl sm:text-4xl lg:text-[2.75rem] text-on-surface mt-4 tracking-tight">
                Everything you need for digital integrity
              </h2>
              <p className="text-on-surface-variant mt-4 text-lg leading-relaxed">
                Awareness, journaling, conversation guides, and alignment tracking &mdash; all in one place.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="group relative bg-surface-container-lowest rounded-2xl overflow-hidden ring-1 ring-outline-variant/10 hover:ring-primary/20 hover:shadow-lg hover:shadow-on-surface/[0.04] transition-all duration-300 cursor-pointer"
                >
                  {/* Image */}
                  <div className="aspect-[16/10] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={f.image}
                      alt={f.alt}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-2.5">
                      <div className="w-9 h-9 rounded-xl bg-primary/[0.08] flex items-center justify-center shrink-0">
                        <MaterialIcon name={f.icon} className="text-primary text-lg" />
                      </div>
                      <h3 className="font-headline font-bold text-base text-on-surface leading-snug">{f.title}</h3>
                    </div>
                    <p className="font-body text-on-surface-variant leading-relaxed text-sm">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── The Journey to Integrity ─────────────────────── */}
        <section id="journey" className="py-24 lg:py-32 px-6 bg-surface-container-low/50">
          <div className="max-w-screen-xl mx-auto">
            <div className="text-center mb-20">
              <span className="font-label text-xs font-semibold uppercase tracking-[0.25em] text-primary">The Process</span>
              <h2 className="font-headline text-3xl sm:text-4xl lg:text-[2.75rem] font-bold mt-4 tracking-tight">
                The Journey to Integrity
              </h2>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 relative">
              {/* Connecting line (desktop) */}
              <div className="absolute top-12 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-transparent via-outline-variant/25 to-transparent hidden lg:block" />

              {[
                {
                  num: 1,
                  icon: 'self_improvement',
                  title: 'Define who you want to be',
                  desc: 'Articulate your values and vision for a resilient life using our guided introspection tools.',
                },
                {
                  num: 2,
                  icon: 'group',
                  title: 'Invite a trusted partner',
                  desc: 'Choose a companion for your journey\u2014someone who understands your goals and provides support.',
                },
                {
                  num: 3,
                  icon: 'trending_up',
                  title: 'Build digital integrity',
                  desc: 'Consistent daily actions and honest reporting forge a path toward lasting personal growth.',
                },
              ].map((step) => (
                <div key={step.num} className="relative text-center lg:text-left">
                  {/* Step number */}
                  <div className="w-14 h-14 rounded-2xl bg-primary text-on-primary flex items-center justify-center relative z-10 shadow-lg shadow-primary/20 mx-auto lg:mx-0 mb-6">
                    <MaterialIcon name={step.icon} className="text-2xl" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 justify-center lg:justify-start">
                      <span className="font-label text-xs font-semibold text-primary/60 uppercase tracking-widest">Step {step.num}</span>
                    </div>
                    <h3 className="font-headline text-xl font-bold text-on-surface">{step.title}</h3>
                    <p className="font-body text-on-surface-variant leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Download / Growth on the Go ─────────────────── */}
        <section id="download" className="py-24 lg:py-32 px-6">
          <div className="max-w-screen-xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 order-2 lg:order-1">
              <span className="font-label text-xs font-semibold uppercase tracking-[0.25em] text-primary">Install Anywhere</span>
              <h2 className="font-headline text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-tight">
                Growth on the go
              </h2>
              <p className="font-body text-lg text-on-surface-variant leading-relaxed max-w-md">
                Sync your journey across all devices. Your sanctuary is always within reach, whether you&apos;re at your desk or in the world.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                {[
                  { icon: 'phone_iphone', label: 'iPhone & iPad', sub: 'Install on', href: '/download' },
                  { icon: 'phone_android', label: 'Android', sub: 'Install on', href: '/download' },
                  { icon: 'language', label: 'Web App', sub: 'Access the', href: '/auth/signup', light: true },
                ].map((btn) => (
                  <Link
                    key={btn.label}
                    href={btn.href}
                    className={`px-6 py-3.5 rounded-xl flex items-center gap-3 transition-all duration-200 cursor-pointer ${
                      btn.light
                        ? 'bg-surface-container ring-1 ring-outline-variant/15 text-on-surface hover:bg-surface-container-high'
                        : 'bg-on-surface text-surface hover:opacity-90'
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

              <p className="font-body text-sm text-on-surface-variant/60 flex items-center gap-2">
                <MaterialIcon name="info" className="text-base" />
                Installs as a Progressive Web App &mdash; no app store needed.
              </p>
            </div>

            <div className="order-1 lg:order-2 relative">
              <div className="absolute -inset-8 bg-gradient-to-tr from-primary/[0.04] to-primary-container/[0.06] blur-3xl rounded-full" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAo-SYobDlsUK6Jtkhk6AOOLEAwVNupQmSLEPlK8FuQIe6s2NVffDH_R4IbPyToq3JBb_q1CbH2MuJevxCbYMBD03TcBYONX7kOxkb1R4RSBnS07LOFuReuhJ0QXbvHMm9TYaQh0gQEOzNkvBNo9bxfHdGr3BnFynKwkIqWRXSD6AZTKTymbgvo9xYIablHUGDjYReLJ_TGzLgV9aLZI0FhD1y6mjoVmKqYrAocN7xNumX62L_1dhIR5Wu5kHe_TboeF2sqIoh3kROT"
                alt="Laptop and smartphone showing synchronized Be Candid integrity progress"
                className="w-full h-auto relative z-10"
              />
            </div>
          </div>
        </section>

        {/* ── Testimonial / Social Proof ───────────────────── */}
        <section className="py-20 px-6 bg-surface-container-low/50">
          <div className="max-w-3xl mx-auto text-center">
            <MaterialIcon name="format_quote" className="text-4xl text-primary/30 mb-4" />
            <blockquote className="font-body text-xl lg:text-2xl text-on-surface leading-relaxed italic">
              &ldquo;Be Candid gave me the framework I needed to have honest conversations with my partner about our digital lives. The journal alone was transformative.&rdquo;
            </blockquote>
            <div className="mt-6 flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MaterialIcon name="person" className="text-primary text-lg" />
              </div>
              <div className="text-left">
                <p className="font-label text-sm font-semibold text-on-surface">Sarah M.</p>
                <p className="font-label text-xs text-on-surface-variant">Using Be Candid for 8 months</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Final CTA ───────────────────────────────────── */}
        <section id="cta" className="py-24 lg:py-32 px-6">
          <div className="max-w-screen-lg mx-auto relative">
            {/* Background card */}
            <div className="bg-gradient-to-br from-primary via-primary-dim to-[#0a4d5c] rounded-[2rem] lg:rounded-[2.5rem] px-8 py-16 sm:p-16 lg:p-20 text-center relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-72 h-72 bg-white/[0.06] rounded-full blur-[80px] -translate-x-1/3 -translate-y-1/3" />
                <div className="absolute bottom-0 right-0 w-72 h-72 bg-primary-container/[0.08] rounded-full blur-[80px] translate-x-1/3 translate-y-1/3" />
                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
              </div>

              <div className="relative z-10 space-y-8">
                <h2 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-extrabold text-on-primary tracking-tight">
                  Become who you<br className="hidden sm:block" /> want to be
                </h2>
                <p className="font-body text-lg text-on-primary/75 max-w-lg mx-auto leading-relaxed">
                  Join thousands building a life of integrity and transparency. Start your 14-day free trial today.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href="/auth/signup"
                    className="group px-10 py-4 bg-surface-container-lowest text-primary rounded-full font-label font-bold text-base shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer inline-flex items-center gap-2"
                  >
                    Create Your Account
                    <MaterialIcon name="arrow_forward" className="text-lg group-hover:translate-x-0.5 transition-transform duration-200" />
                  </Link>
                </div>
                <p className="font-body text-sm text-on-primary/50">
                  No credit card required &middot; Cancel anytime
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ──────────────────────────────────────── */}
        <footer className="border-t border-outline-variant/10 bg-surface">
          <div className="max-w-screen-xl mx-auto px-6 py-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
              {/* Brand */}
              <div className="col-span-2 lg:col-span-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="Be Candid" className="h-10 w-auto mb-4" />
                <p className="font-body text-sm text-on-surface-variant leading-relaxed max-w-xs">
                  A digital sanctuary for integrity, growth, and honest living.
                </p>
              </div>

              {/* Product */}
              <div>
                <h4 className="font-label text-xs font-semibold uppercase tracking-widest text-on-surface mb-4">Product</h4>
                <ul className="space-y-2.5">
                  {['Features', 'Download', 'Pricing', 'Families'].map((item) => (
                    <li key={item}>
                      <Link href={item === 'Features' ? '#features' : `/${item.toLowerCase()}`} className="font-body text-sm text-on-surface-variant hover:text-primary transition-colors duration-200">
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h4 className="font-label text-xs font-semibold uppercase tracking-widest text-on-surface mb-4">Legal</h4>
                <ul className="space-y-2.5">
                  {[
                    { label: 'Privacy Policy', href: '/legal/privacy' },
                    { label: 'Terms of Service', href: '/legal/terms' },
                    { label: 'Cookie Policy', href: '/legal/cookies' },
                  ].map((item) => (
                    <li key={item.label}>
                      <Link href={item.href} className="font-body text-sm text-on-surface-variant hover:text-primary transition-colors duration-200">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h4 className="font-label text-xs font-semibold uppercase tracking-widest text-on-surface mb-4">Resources</h4>
                <ul className="space-y-2.5">
                  {[
                    { label: 'Crisis Help (988)', href: 'tel:988' },
                    { label: 'How It Works', href: '#journey' },
                    { label: 'Contact', href: 'mailto:support@becandid.io' },
                  ].map((item) => (
                    <li key={item.label}>
                      <a href={item.href} className="font-body text-sm text-on-surface-variant hover:text-primary transition-colors duration-200">
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-12 pt-6 border-t border-outline-variant/10 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="font-body text-xs text-on-surface-variant/60">
                &copy; {new Date().getFullYear()} Be Candid. All rights reserved.
              </p>
              <p className="font-body text-[10px] text-on-surface-variant/40 text-center sm:text-right max-w-sm">
                Be Candid is not a substitute for professional therapy or crisis intervention. If you are in crisis, call or text 988.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
