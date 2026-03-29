import Link from 'next/link';

const FEATURES = [
  {
    icon: 'chat_bubble',
    title: 'AI Conversation Guides',
    desc: 'Empathetic prompts and real-time guidance to facilitate difficult but necessary digital discussions.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDK75pW4vwBoIKZKqRfXv5nNixz53H86_XDRAM5lFE_qLDRDA_0EaBcExFNNcW2diDMzW7oHfniK5vT0VoDh8ORn6nDCr0bAoTYjdXoKn1JXHixWNHCN-flYfPlrnxYxeG5Q-eArpggt6kseUMEvlK-J3dB7Rfp0Tns9F2koKnKe904q18HbSiSBZrD9zSh5xQev-Mj2Rmdv4u19VE3ebdtEcecyMf1yeEMgGXxigV2uEAzs-KrJzjcwbLwiRFVLZnLuTzU2HNOJQcX',
    alt: 'Glowing geometric nodes connected by light strands representing AI dialogue',
  },
  {
    icon: 'menu_book',
    title: 'Stringer Journal',
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
    desc: 'Advanced sentiment analysis to identify potential distress signals and offer immediate supportive resources.',
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

const PILLARS = [
  {
    icon: 'water_drop',
    title: 'Trace the Tributaries',
    desc: 'Your patterns don\u2019t come from nowhere. Identify the family dynamics, attachment wounds, and emotional currents that shape who you are online and off.',
  },
  {
    icon: 'favorite',
    title: 'Name the Longing',
    desc: 'Beneath every pattern is an unmet need \u2014 for connection, significance, or rest. The Stringer Journal helps you name it so you can meet it with integrity.',
  },
  {
    icon: 'explore',
    title: 'Follow the Roadmap',
    desc: 'With clarity about your story and desires, build concrete steps toward congruence \u2014 where the person you are online is the person you are.',
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Define who you want to be',
    desc: 'Choose the areas where you want alignment \u2014 from screen time to social media, and everything in between.',
  },
  {
    num: '02',
    title: 'Invite a trusted partner',
    desc: 'A friend, spouse, mentor, or coach. They get clarity and AI-generated conversation guides. Or go solo \u2014 your call.',
  },
  {
    num: '03',
    title: 'Build digital integrity',
    desc: 'Track alignment streaks, journal with Stringer prompts, and have conversations that build congruence between your screen time and your real life.',
  },
];

function MaterialIcon({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>;
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Header (sticky, glass) ─────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/80 glass-effect border-b border-outline-variant/30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Be Candid" className="h-8 w-auto" />
          </Link>

          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-6">
              <a href="#pillars" className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">
                Features
              </a>
              <Link href="/pricing" className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">
                Pricing
              </Link>
              <a href="#download" className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">
                Download
              </a>
              <a href="#cta" className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">
                About
              </a>
              <Link href="/families" className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">
                Families
              </Link>
            </div>
            <Link href="/auth/signup" className="btn-primary text-sm py-2 px-5">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section
        className="relative pt-32 pb-24 px-6 overflow-hidden"
        style={{
          background: 'linear-gradient(165deg, #226779 0%, #a4e4f8 100%)',
        }}
      >
        <div className="max-w-4xl mx-auto text-center stagger relative z-10">
          <h1 className="font-headline font-extrabold text-5xl sm:text-6xl lg:text-7xl text-on-primary leading-[1.08] mb-6">
            Accountability for every
            <br />
            stage of life
          </h1>

          <p className="text-lg sm:text-xl text-on-primary/80 leading-relaxed max-w-2xl mx-auto mb-10">
            The most confident, inspiring and attractive people are those whose screen time
            and face time matches the person they want to be across their lifetime.
          </p>

          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-surface-container-lowest text-primary text-base font-semibold rounded-full hover:bg-surface-container-low transition-colors"
          >
            Become Who You Want to Be
          </Link>

          <p className="mt-5 text-sm text-on-primary/60">
            No credit card required &middot; Free forever plan available
          </p>
        </div>
      </section>

      {/* ── Credibility Bar ───────────────────────────────── */}
      <section className="py-6 border-b border-outline-variant/20">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-center text-sm text-on-surface-variant">
            Designed with neurologists and licensed mental health counselors to help you understand yourself, not restrict yourself
          </p>
        </div>
      </section>

      {/* ── For Adults & Families ──────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Adults Card */}
          <div className="card p-8">
            <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center mb-4">
              <MaterialIcon name="self_improvement" className="text-primary text-2xl" />
            </div>
            <h3 className="font-headline font-bold text-xl text-on-surface mb-2">For Adults</h3>
            <p className="text-sm text-on-surface-variant mb-4">Self-directed accountability with AI-powered conversation guides, partner support, and the Stringer therapeutic framework.</p>
            <Link href="/auth/signup" className="text-primary font-label font-bold text-sm uppercase tracking-wider hover:underline">Get Started &rarr;</Link>
          </div>
          {/* Families Card */}
          <div className="card p-8 bg-secondary-container/30">
            <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center mb-4">
              <MaterialIcon name="family_restroom" className="text-on-secondary-container text-2xl" />
            </div>
            <h3 className="font-headline font-bold text-xl text-on-surface mb-2">For Teens &amp; Families</h3>
            <p className="text-sm text-on-surface-variant mb-4">Parent-managed content filtering, screen time controls, real-time alerts, and age-appropriate guidance &mdash; accountability without surveillance.</p>
            <Link href="/families" className="text-primary font-label font-bold text-sm uppercase tracking-wider hover:underline">Learn More &rarr;</Link>
          </div>
        </div>
      </section>

      {/* ── 3-Pillar Section (Stringer Framework) ─────────── */}
      <section id="pillars" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center font-label text-xs font-semibold text-primary uppercase tracking-widest mb-3">
            Built on Jay Stringer&apos;s Framework
          </p>
          <h2 className="font-headline font-extrabold text-3xl sm:text-4xl text-on-surface text-center mb-4">
            Understand yourself, align your life
          </h2>
          <p className="text-center text-on-surface-variant mb-16 max-w-lg mx-auto">
            Congruence builds confidence. Be Candid helps you understand the story
            beneath your patterns so your digital life matches who you really are.
          </p>

          <div className="grid sm:grid-cols-3 gap-6">
            {PILLARS.map((p) => (
              <div key={p.title} className="card p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary-container flex items-center justify-center mx-auto mb-5">
                  <MaterialIcon name={p.icon} className="text-primary text-3xl" />
                </div>
                <h3 className="font-headline font-bold text-lg text-on-surface mb-2">{p.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid (bento) ─────────────────────────── */}
      <section className="py-24 px-6 bg-surface-container-low">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-headline font-extrabold text-3xl sm:text-4xl text-on-surface text-center mb-4">
            Everything you need for digital integrity
          </h2>
          <p className="text-center text-on-surface-variant mb-16 max-w-lg mx-auto">
            Awareness, journaling, conversation guides, and alignment tracking &mdash; all in one place.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="group bg-surface-container-lowest rounded-xl p-6 transition-all duration-300 hover:bg-surface-container-low">
                <div className="aspect-video mb-6 overflow-hidden rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={f.image}
                    alt={f.alt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex items-start gap-4 mb-3">
                  <MaterialIcon name={f.icon} className="text-primary text-2xl" />
                  <h3 className="font-headline font-bold text-xl text-on-surface">{f.title}</h3>
                </div>
                <p className="font-body text-on-surface-variant leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-headline font-extrabold text-3xl sm:text-4xl text-on-surface text-center mb-4">
            How it works
          </h2>
          <p className="text-center text-on-surface-variant mb-16 max-w-lg mx-auto">
            Three steps to align your screen time with who you want to be.
          </p>

          <div className="grid sm:grid-cols-3 gap-8">
            {STEPS.map((step) => (
              <div key={step.num} className="text-center sm:text-left">
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-primary-container text-on-primary-container font-label text-sm font-bold mb-4">
                  {step.num}
                </div>
                <h3 className="font-headline font-bold text-lg text-on-surface mb-2">{step.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Download Section ─────────────────────────────── */}
      <section id="download" className="py-24 px-6 bg-surface-container-low">
        <div className="max-w-5xl mx-auto">
          <p className="text-center font-label text-xs font-semibold text-primary uppercase tracking-widest mb-3">
            Available Everywhere
          </p>
          <h2 className="font-headline font-extrabold text-3xl sm:text-4xl text-on-surface text-center mb-4">
            Download Be Candid
          </h2>
          <p className="text-center text-on-surface-variant mb-16 max-w-lg mx-auto">
            Native apps for mobile and desktop. Your data syncs seamlessly across all devices, end-to-end encrypted.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* iOS */}
            <div className="card p-8 text-center flex flex-col items-center gap-4 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center">
                <MaterialIcon name="phone_iphone" className="text-primary text-3xl" />
              </div>
              <div>
                <h3 className="font-headline font-bold text-lg text-on-surface">iPhone &amp; iPad</h3>
                <p className="text-sm text-on-surface-variant mt-1">iOS 16+ required</p>
              </div>
              <a
                href="https://apps.apple.com/app/be-candid"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-6 bg-primary text-on-primary rounded-full font-label font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity text-center"
              >
                App Store
              </a>
              <p className="text-xs text-on-surface-variant">Includes Screen Time awareness</p>
            </div>

            {/* Android */}
            <div className="card p-8 text-center flex flex-col items-center gap-4 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 rounded-2xl bg-secondary-container flex items-center justify-center">
                <MaterialIcon name="phone_android" className="text-on-secondary-container text-3xl" />
              </div>
              <div>
                <h3 className="font-headline font-bold text-lg text-on-surface">Android</h3>
                <p className="text-sm text-on-surface-variant mt-1">Android 10+ required</p>
              </div>
              <a
                href="https://play.google.com/store/apps/details?id=io.becandid.app"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-6 bg-primary text-on-primary rounded-full font-label font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity text-center"
              >
                Google Play
              </a>
              <p className="text-xs text-on-surface-variant">Includes UsageStats awareness</p>
            </div>

            {/* Web App */}
            <div className="card p-8 text-center flex flex-col items-center gap-4 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 rounded-2xl bg-tertiary-container flex items-center justify-center">
                <MaterialIcon name="language" className="text-on-tertiary-container text-3xl" />
              </div>
              <div>
                <h3 className="font-headline font-bold text-lg text-on-surface">Web App</h3>
                <p className="text-sm text-on-surface-variant mt-1">Chrome, Safari, Firefox, Edge</p>
              </div>
              <Link
                href="/auth/signup"
                className="w-full py-3 px-6 bg-primary text-on-primary rounded-full font-label font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity text-center"
              >
                Open in Browser
              </Link>
              <p className="text-xs text-on-surface-variant">No download required &mdash; works instantly</p>
            </div>
          </div>

          {/* Desktop Section */}
          <div className="card p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-primary-container/50 flex items-center justify-center flex-shrink-0">
                <MaterialIcon name="laptop_mac" className="text-primary text-2xl" />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="font-headline font-bold text-xl text-on-surface">Desktop Apps</h3>
                <p className="text-sm text-on-surface-variant mt-1">
                  Full dashboard experience with background awareness. Coming soon for macOS, Windows, and Linux.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center justify-center gap-3 py-3 px-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 opacity-60 cursor-default">
                <MaterialIcon name="desktop_mac" className="text-on-surface-variant text-xl" />
                <div className="text-left">
                  <p className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Coming Soon</p>
                  <p className="font-headline font-bold text-on-surface">macOS</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3 py-3 px-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 opacity-60 cursor-default">
                <MaterialIcon name="desktop_windows" className="text-on-surface-variant text-xl" />
                <div className="text-left">
                  <p className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Coming Soon</p>
                  <p className="font-headline font-bold text-on-surface">Windows</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3 py-3 px-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 opacity-60 cursor-default">
                <MaterialIcon name="terminal" className="text-on-surface-variant text-xl" />
                <div className="text-left">
                  <p className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Coming Soon</p>
                  <p className="font-headline font-bold text-on-surface">Linux</p>
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-on-surface-variant mt-4">
              Desktop apps are currently in beta. <Link href="/auth/signup" className="text-primary hover:underline">Sign up</Link> to get early access.
            </p>
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────── */}
      <section
        id="cta"
        className="py-24 px-6"
        style={{
          background: 'linear-gradient(165deg, #0e5b6c 0%, #226779 100%)',
        }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-headline font-extrabold text-3xl sm:text-4xl text-on-primary mb-4">
            Become who you want to be
          </h2>
          <p className="text-on-primary/70 mb-8 max-w-md mx-auto">
            Free to start. No credit card required. Takes 3 minutes to set up.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-surface-container-lowest text-primary text-base font-semibold rounded-full hover:bg-surface-container-low transition-colors"
          >
            Create Your Account
          </Link>
          <p className="mt-6 text-sm text-on-primary/50">
            Your data is encrypted end-to-end. We never see your content.
          </p>
        </div>
      </section>
    </div>
  );
}
