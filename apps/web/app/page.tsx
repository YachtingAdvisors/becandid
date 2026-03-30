import Link from 'next/link';

const FEATURES = [
  {
    icon: 'chat_bubble',
    title: 'Conversation Guides and Ice Breakers',
    desc: 'Designed by neurologists and mental health therapists. Evidence-based prompts for difficult but necessary digital discussions.',
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


function MaterialIcon({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>;
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* ── TopNavBar ──────────────────────────────────────── */}
      <header className="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-xl">
        <nav className="flex justify-between items-center px-6 lg:px-12 py-6 max-w-screen-2xl mx-auto">
          <Link href="/" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Be Candid" className="w-10 h-10 object-contain" />
            <span className="text-2xl font-bold text-primary tracking-tighter">Be Candid</span>
          </Link>
          <div className="hidden md:flex items-center gap-10 font-body text-base tracking-tight">
            <a href="#features" className="text-on-surface opacity-80 hover:text-primary transition-colors duration-300">Features</a>
            <Link href="/pricing" className="text-on-surface opacity-80 hover:text-primary transition-colors duration-300">Pricing</Link>
            <Link href="/download" className="text-on-surface opacity-80 hover:text-primary transition-colors duration-300">Download</Link>
            <a href="#cta" className="text-on-surface opacity-80 hover:text-primary transition-colors duration-300">About</a>
            <Link href="/families" className="text-on-surface opacity-80 hover:text-primary transition-colors duration-300">Families</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/signin" className="text-on-surface opacity-80 hover:text-primary transition-colors duration-300 font-label text-sm font-semibold">
              Log in
            </Link>
            <Link href="/auth/signup" className="px-8 py-3 bg-primary text-on-primary rounded-full font-label text-sm font-semibold tracking-wide hover:brightness-110 active:scale-95 transition-all">
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <main className="pt-24">
        {/* ── Hero Section (two-column) ───────────────────── */}
        <section className="relative overflow-hidden px-6 lg:px-12 pt-20 pb-32 max-w-screen-2xl mx-auto min-h-[700px] flex flex-col justify-center">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 max-w-2xl">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-surface-container-low rounded-full">
                <MaterialIcon name="trending_up" className="text-primary text-lg" />
                <span className="font-label text-xs font-bold uppercase tracking-widest text-primary">Growth Curve Certified</span>
              </div>

              <h1 className="font-headline text-5xl lg:text-7xl font-extrabold text-on-surface tracking-tighter leading-[1.05]">
                Accountability for every stage of life
              </h1>

              <p className="font-body text-xl text-on-surface-variant leading-relaxed opacity-80">
                A digital sanctuary designed to foster integrity through intentional reflections, partner awareness, and AI-driven growth metrics. Build the habits that define who you truly are.
              </p>

              <div className="flex flex-wrap gap-6 pt-4">
                <Link href="/auth/signup" className="px-10 py-5 bg-primary text-on-primary rounded-full font-label font-bold text-base shadow-sm hover:brightness-110 active:scale-95 transition-all">
                  Get Started
                </Link>
                <a href="#journey" className="px-10 py-5 bg-secondary-container text-on-secondary-container rounded-lg font-label font-bold text-base hover:bg-secondary-fixed-dim active:scale-95 transition-all">
                  How it Works
                </a>
              </div>
            </div>

            <div className="relative group hidden lg:block">
              <div className="absolute -inset-4 bg-gradient-to-tr from-primary/10 to-primary-container/20 blur-3xl rounded-full" />
              <div className="relative bg-surface-container-lowest rounded-[2.5rem] p-4 shadow-2xl transform rotate-2 group-hover:rotate-0 transition-transform duration-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBDhdaLlgxHIo_EQEqTmR12ZxXVjLjZzQR32EdMhoa_Wx7_3glU1nTRHm1c7XAWnFGGPLDLoqo8o-VvOMXB56KxDMWa054TdLlpsZsPPAGJhDElxPH8IYampDAz8ajs9SDk_IwFhdWISX-YRczgAUd6JegtfDruOhiPwoIaYjmDhVLDw8_GbAwE8PW5s2ci5wvWPSmnbu34eIOizHnoY2DJF7DCsL_pt-JSFBs1rj0Qw7_96_k7nUMFbrBYJHX52XfyKK4DnTy6Jp6"
                  alt="Be Candid dashboard showing integrity score and journaling prompts"
                  className="w-full h-auto rounded-[2rem] object-cover"
                />
              </div>
              {/* Floating Stat Card */}
              <div className="absolute -bottom-10 -left-10 bg-surface-container-lowest p-8 rounded-3xl shadow-xl border border-outline-variant/15 max-w-[240px]">
                <span className="material-symbols-outlined text-primary mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
                <p className="font-headline text-3xl font-bold text-on-surface">+84%</p>
                <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mt-1">Integrity Growth</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Everything you need for digital integrity (BENTO) ── */}
        <section id="features" className="py-24 px-6 bg-surface-container-low">
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

        {/* ── The Journey to Integrity ─────────────────────── */}
        <section id="journey" className="py-32 px-6 lg:px-12 max-w-screen-2xl mx-auto overflow-hidden">
          <div className="text-center mb-24">
            <span className="font-label text-xs font-bold uppercase tracking-[0.3em] text-primary">The Process</span>
            <h2 className="font-headline text-4xl lg:text-5xl font-bold mt-4 tracking-tight">The Journey to Integrity</h2>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-outline-variant/20 hidden lg:block -translate-y-1/2" />

            <div className="grid lg:grid-cols-3 gap-16 relative">
              {[
                { num: 1, title: 'Define who you want to be', desc: 'Articulate your values and vision for a resilient life using our guided introspection tools.' },
                { num: 2, title: 'Invite a trusted partner', desc: 'Choose a companion for your journey\u2014someone who understands your goals and provides support.' },
                { num: 3, title: 'Build digital integrity', desc: 'Consistent daily actions and honest reporting forge a path toward lasting personal growth.' },
              ].map((step) => (
                <div key={step.num} className="space-y-8 bg-surface">
                  <div className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center text-2xl font-bold relative z-10 shadow-lg mx-auto lg:mx-0">
                    {step.num}
                  </div>
                  <div className="space-y-4 text-center lg:text-left">
                    <h3 className="font-headline text-2xl font-bold">{step.title}</h3>
                    <p className="font-body text-on-surface-variant leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Growth on the Go (Download) ─────────────────── */}
        <section id="download" className="bg-surface-container-high py-32 px-6 lg:px-12">
          <div className="max-w-screen-2xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8 order-2 lg:order-1">
              <h2 className="font-headline text-4xl lg:text-5xl font-extrabold tracking-tight">Growth on the go</h2>
              <p className="font-body text-xl text-on-surface-variant leading-relaxed">
                Sync your journey across all devices. Your sanctuary is always within reach, whether you&apos;re at your desk or in the world.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/download"
                  className="bg-on-surface text-surface px-8 py-4 rounded-xl flex items-center gap-3 hover:opacity-90 transition-opacity">
                  <MaterialIcon name="ios" className="text-3xl" />
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-label leading-none opacity-60">Install on</p>
                    <p className="text-lg font-bold font-headline leading-none">iPhone & iPad</p>
                  </div>
                </Link>
                <Link href="/download"
                  className="bg-on-surface text-surface px-8 py-4 rounded-xl flex items-center gap-3 hover:opacity-90 transition-opacity">
                  <MaterialIcon name="play_arrow" className="text-3xl" />
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-label leading-none opacity-60">Install on</p>
                    <p className="text-lg font-bold font-headline leading-none">Android</p>
                  </div>
                </Link>
                <Link href="/auth/signup"
                  className="bg-surface-container-highest text-on-surface px-8 py-4 rounded-xl flex items-center gap-3 border border-outline-variant/20 hover:bg-surface-variant transition-colors">
                  <MaterialIcon name="language" className="text-3xl" />
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-label leading-none opacity-60">Access the</p>
                    <p className="text-lg font-bold font-headline leading-none">Web App</p>
                  </div>
                </Link>
              </div>
              <p className="font-body text-sm text-on-surface-variant opacity-70">
                Be Candid installs as a Progressive Web App &mdash; no app store needed.
              </p>
            </div>
            <div className="order-1 lg:order-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAo-SYobDlsUK6Jtkhk6AOOLEAwVNupQmSLEPlK8FuQIe6s2NVffDH_R4IbPyToq3JBb_q1CbH2MuJevxCbYMBD03TcBYONX7kOxkb1R4RSBnS07LOFuReuhJ0QXbvHMm9TYaQh0gQEOzNkvBNo9bxfHdGr3BnFynKwkIqWRXSD6AZTKTymbgvo9xYIablHUGDjYReLJ_TGzLgV9aLZI0FhD1y6mjoVmKqYrAocN7xNumX62L_1dhIR5Wu5kHe_TboeF2sqIoh3kROT"
                alt="Laptop and smartphone showing synchronized Be Candid integrity progress"
                className="w-full h-auto"
              />
            </div>
          </div>
        </section>

        {/* ── Final CTA ───────────────────────────────────── */}
        <section id="cta" className="py-32 px-6 lg:px-12">
          <div className="max-w-screen-xl mx-auto bg-gradient-to-br from-primary to-primary-dim rounded-[3rem] p-16 lg:p-24 text-center space-y-10 relative overflow-hidden">
            {/* Decorative blurred circles */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-container rounded-full blur-[100px] translate-x-1/2 translate-y-1/2" />
            </div>

            <h2 className="font-headline text-4xl lg:text-6xl font-extrabold text-on-primary tracking-tighter relative z-10">
              Become who you want to be
            </h2>
            <p className="font-body text-xl text-on-primary/80 max-w-2xl mx-auto relative z-10">
              Join thousands of others building a life of integrity and transparency. Start your 14-day free trial today.
            </p>
            <div className="relative z-10">
              <Link href="/auth/signup" className="px-12 py-6 bg-surface-container-lowest text-primary rounded-full font-label font-bold text-lg shadow-xl hover:scale-105 active:scale-95 transition-all inline-block">
                Create Your Account
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
