import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import PublicNav from '@/components/PublicNav';

export const metadata: Metadata = {
  title: 'Be Candid Foundation — Free Digital Wellness for Every Student',
  description: 'We bring Be Candid to students for free through corporate sponsorships and community support. Every student deserves tools to build a life of integrity.',
  openGraph: {
    title: 'Be Candid Foundation — Free Digital Wellness for Every Student',
    description: 'Bringing clinically-informed accountability tools to students for free through sponsorships.',
    url: 'https://becandid.org',
  },
};

function Icon({ name, className = '', filled = false }: { name: string; className?: string; filled?: boolean }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
    >
      {name}
    </span>
  );
}

const IMPACT_NUMBERS = [
  { value: '1 in 3', label: 'Teens report compulsive screen use', icon: 'phone_iphone' },
  { value: '73%', label: 'Of Title I students lack digital wellness tools', icon: 'school' },
  { value: '$0', label: 'Cost to students — sponsors cover everything', icon: 'volunteer_activism' },
  { value: '24', label: 'Digital rivals our assessment identifies', icon: 'psychology_alt' },
];

const SPONSOR_TIERS = [
  {
    name: 'Seed Sponsor',
    price: '$500/yr',
    students: '50 students',
    icon: 'eco',
    color: 'from-emerald-500 to-teal-600',
    features: ['50 student licenses for 1 year', 'Logo on sponsor wall', 'Quarterly impact report', 'Tax-deductible receipt'],
  },
  {
    name: 'Growth Sponsor',
    price: '$2,500/yr',
    students: '250 students',
    icon: 'park',
    color: 'from-cyan-500 to-blue-600',
    featured: true,
    features: ['250 student licenses for 1 year', 'Featured logo placement', 'Monthly impact dashboard', 'Co-branded school launch', 'Case study participation'],
  },
  {
    name: 'Impact Partner',
    price: '$10,000/yr',
    students: '1,000+ students',
    icon: 'diamond',
    color: 'from-amber-500 to-orange-600',
    features: ['1,000+ student licenses', 'Named program sponsorship', 'Executive impact briefings', 'Press release inclusion', 'Advisory board invitation', 'Custom integration support'],
  },
];

const HOW_IT_WORKS = [
  {
    num: '01',
    title: 'Sponsors Fund',
    desc: 'Corporate sponsors, foundations, and individuals fund student licenses through annual commitments.',
    icon: 'payments',
  },
  {
    num: '02',
    title: 'Schools Partner',
    desc: 'We partner with Title I schools, counselors, and youth organizations to identify students who need support.',
    icon: 'handshake',
  },
  {
    num: '03',
    title: 'Students Access',
    desc: 'Each student gets a free Be Candid Pro account — journaling, AI coaching, accountability partners, and the full platform.',
    icon: 'lock_open',
  },
  {
    num: '04',
    title: 'Impact Reported',
    desc: 'Sponsors receive anonymized impact data: engagement rates, streak growth, and qualitative outcomes.',
    icon: 'analytics',
  },
];

const WHAT_STUDENTS_GET = [
  { icon: 'psychology', label: 'Rival Assessment', desc: 'Identify personal digital struggles through our clinically-studied behavioral test' },
  { icon: 'edit_note', label: 'Candid Journal', desc: 'Private guided journaling based on Jay Stringer\'s research framework' },
  { icon: 'smart_toy', label: 'AI Coaching', desc: 'On-demand conversation coach trained in empathetic, non-judgmental guidance' },
  { icon: 'handshake', label: 'Accountability Partners', desc: 'Peer or mentor connections with privacy-first monitoring' },
  { icon: 'center_focus_strong', label: 'Focus Board', desc: 'Daily streak tracking, momentum scoring, and milestone celebrations' },
  { icon: 'shield', label: 'Crisis Detection', desc: 'Real-time sentiment analysis with immediate access to crisis resources' },
  { icon: 'encrypted', label: 'End-to-End Encryption', desc: 'Zero-knowledge architecture — not even we can read student data' },
  { icon: 'timer', label: 'Screen Time Controls', desc: 'Conscious consumption tools that empower rather than restrict' },
];

export default function OrgPage() {
  return (
    <div className="min-h-screen bg-dark-sanctuary text-white overflow-x-hidden">
      <PublicNav />

      <main>
        {/* ── Hero ──────────────────────────────────────────── */}
        <section className="relative pt-36 pb-24 lg:pt-44 lg:pb-32 px-6">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-20 -right-20 w-[800px] h-[800px] rounded-full blur-[200px]" style={{ background: 'rgba(16, 185, 129, 0.12)' }} />
            <div className="absolute -bottom-20 -left-20 w-[600px] h-[600px] rounded-full blur-[160px]" style={{ background: 'rgba(6, 182, 212, 0.08)' }} />
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 glass-card rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-label text-xs font-semibold uppercase tracking-widest text-emerald-400">Nonprofit Initiative</span>
            </div>

            <h1 className="font-headline text-[2.75rem] sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08]">
              Every student deserves<br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                tools for integrity.
              </span>
            </h1>

            <p className="font-body text-lg lg:text-xl text-stone-400 leading-relaxed max-w-2xl mx-auto">
              We bring Be Candid&apos;s clinically-informed accountability platform to students for free — funded entirely by corporate sponsors, foundations, and community supporters.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <a
                href="mailto:shawn@becandid.io?subject=Sponsorship%20Inquiry%20—%20Be%20Candid%20Foundation"
                className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full font-label font-bold text-base shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:brightness-110 active:scale-[0.97] transition-all duration-200 inline-flex items-center gap-2"
              >
                Become a Sponsor
                <Icon name="arrow_forward" className="text-lg group-hover:translate-x-0.5 transition-transform duration-200" />
              </a>
              <a
                href="#schools"
                className="px-8 py-4 rounded-full font-label font-bold text-base text-stone-300 hover:text-white glass-card hover:bg-white/[0.06] transition-all duration-200 inline-flex items-center gap-2"
              >
                <Icon name="school" className="text-xl text-emerald-400" filled />
                I&apos;m a School
              </a>
            </div>
          </div>
        </section>

        {/* ── Impact Numbers ───────────────────────────────── */}
        <section className="px-6 pb-20">
          <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
            {IMPACT_NUMBERS.map(stat => (
              <div key={stat.label} className="glass-card rounded-2xl p-6 text-center">
                <Icon name={stat.icon} className="text-2xl text-emerald-400 mb-2 block" filled />
                <p className="font-headline text-3xl font-black text-white">{stat.value}</p>
                <p className="font-body text-xs text-stone-500 mt-1 leading-relaxed">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Mission ──────────────────────────────────────── */}
        <section id="mission" className="px-6 py-20 border-t border-white/5">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center">
              <span className="font-label text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">Our Mission</span>
              <h2 className="font-headline text-3xl sm:text-4xl font-extrabold text-white mt-4 tracking-tight">
                Digital wellness shouldn&apos;t be a privilege
              </h2>
            </div>
            <div className="space-y-5 text-stone-400 font-body text-base leading-relaxed">
              <p>
                Compulsive digital behavior doesn&apos;t discriminate by zip code — but access to help does. Students in underprivileged communities face the same struggles with pornography, social media addiction, gambling, and isolation, but without the family resources, therapy access, or school programs to address them.
              </p>
              <p>
                Be Candid was built on Jay Stringer&apos;s <em>Unwanted</em> research — a clinically-studied framework that helps people understand <strong className="text-white">why</strong>, not just track what. The Conversation Coach, the Stringer journal framework, the accountability partner system — these aren&apos;t luxury features. They&apos;re the foundation of digital wellness.
              </p>
              <p>
                Through our sponsorship program, every student receives the full Be Candid Pro experience: AI coaching, guided journaling, partner accountability, crisis detection, and end-to-end encrypted privacy. No credit card. No trial period. No ads. Just tools that work.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 text-center">
              <p className="font-body text-base text-stone-300 italic leading-relaxed">
                &ldquo;Anything that&apos;s human is mentionable, and anything that is mentionable can be more manageable.&rdquo;
              </p>
              <p className="font-label text-xs text-emerald-400 font-bold mt-3">&mdash; Fred Rogers</p>
            </div>
          </div>
        </section>

        {/* ── What Students Get ─────────────────────────────── */}
        <section className="px-6 py-20 border-t border-white/5">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <span className="font-label text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">Full Platform</span>
              <h2 className="font-headline text-3xl sm:text-4xl font-extrabold text-white mt-4 tracking-tight">
                What every sponsored student receives
              </h2>
              <p className="text-stone-400 mt-4 text-base">
                Full Be Candid Pro — the same platform used by thousands of adults. No watered-down version.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {WHAT_STUDENTS_GET.map(item => (
                <div key={item.label} className="glass-card rounded-2xl p-5 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Icon name={item.icon} className="text-emerald-400 text-lg" filled />
                  </div>
                  <h3 className="font-headline font-bold text-sm text-white">{item.label}</h3>
                  <p className="font-body text-xs text-stone-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ─────────────────────────────────── */}
        <section id="how-it-works" className="px-6 py-20 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <span className="font-label text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">The Process</span>
              <h2 className="font-headline text-3xl sm:text-4xl font-extrabold text-white mt-4 tracking-tight">
                How sponsorship works
              </h2>
            </div>
            <div className="space-y-10">
              {HOW_IT_WORKS.map(step => (
                <div key={step.num} className="flex gap-6 items-start">
                  <div className="shrink-0 flex flex-col items-center">
                    <span className="font-headline text-4xl font-black text-emerald-500/20 select-none leading-none">{step.num}</span>
                  </div>
                  <div className="glass-card rounded-2xl p-5 flex-1 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <Icon name={step.icon} className="text-emerald-400 text-xl" filled />
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-base text-white mb-1">{step.title}</h3>
                      <p className="font-body text-sm text-stone-400 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Sponsorship Tiers ─────────────────────────────── */}
        <section id="sponsors" className="px-6 py-20 border-t border-white/5">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <span className="font-label text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">Sponsor</span>
              <h2 className="font-headline text-3xl sm:text-4xl font-extrabold text-white mt-4 tracking-tight">
                Choose your impact
              </h2>
              <p className="text-stone-400 mt-4 text-base">
                $10 sponsors one student for a full year. Every tier includes impact reporting and recognition.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {SPONSOR_TIERS.map(tier => (
                <div
                  key={tier.name}
                  className={`relative glass-card rounded-3xl p-7 space-y-5 ${
                    tier.featured ? 'ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/10' : ''
                  }`}
                >
                  {tier.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald-500 rounded-full text-[10px] font-label font-bold uppercase tracking-widest text-white">
                      Most Popular
                    </div>
                  )}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tier.color} flex items-center justify-center`}>
                    <Icon name={tier.icon} className="text-white text-2xl" filled />
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-lg text-white">{tier.name}</h3>
                    <p className="font-headline text-3xl font-black text-white mt-1">{tier.price}</p>
                    <p className="font-label text-xs text-emerald-400 font-semibold mt-0.5">{tier.students}</p>
                  </div>
                  <ul className="space-y-2">
                    {tier.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm text-stone-400 font-body">
                        <Icon name="check_circle" className="text-emerald-500 text-sm mt-0.5 shrink-0" filled />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="mailto:shawn@becandid.io?subject=Sponsorship%20Inquiry%20—%20Be%20Candid%20Foundation"
                    className={`block text-center px-6 py-3 rounded-full font-label font-bold text-sm transition-all duration-200 ${
                      tier.featured
                        ? 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-500/20'
                        : 'glass-card text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    Get Started
                  </a>
                </div>
              ))}
            </div>

            {/* Individual donations */}
            <div className="mt-10 glass-card rounded-2xl p-6 text-center">
              <p className="text-sm text-stone-400 font-body">
                Not a corporation? Individual donations start at <strong className="text-white">$10</strong> and sponsor one student for a full year.
              </p>
              <Link
                href="/donate"
                className="inline-flex items-center gap-2 mt-3 text-sm font-label font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Make a personal donation
                <Icon name="arrow_forward" className="text-sm" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── For Schools ──────────────────────────────────── */}
        <section id="schools" className="px-6 py-20 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <span className="font-label text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">For Schools</span>
                <h2 className="font-headline text-3xl font-extrabold text-white tracking-tight">
                  Bring Be Candid to your campus — at no cost
                </h2>
                <div className="space-y-4 text-stone-400 font-body text-sm leading-relaxed">
                  <p>
                    If you&apos;re a school counselor, administrator, or youth organization leader, we&apos;d love to partner with you. Sponsored students receive individual accounts with full privacy protections.
                  </p>
                  <p>
                    We handle the technology. You handle the relationships. Together, we give students the tools to understand their digital habits and build lasting integrity.
                  </p>
                </div>
                <div className="space-y-3">
                  {[
                    'No cost to the school or students',
                    'HIPAA-compliant privacy protections',
                    'Counselor dashboard for aggregate insights (no individual data)',
                    'Crisis detection with 988 Suicide & Crisis Lifeline integration',
                    'Works on any device — phone, tablet, laptop',
                  ].map(item => (
                    <div key={item} className="flex items-start gap-2.5">
                      <Icon name="check_circle" className="text-emerald-400 text-sm mt-0.5 shrink-0" filled />
                      <p className="text-sm text-stone-300 font-body">{item}</p>
                    </div>
                  ))}
                </div>
                <a
                  href="mailto:shawn@becandid.io?subject=School%20Partnership%20—%20Be%20Candid%20Foundation"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full font-label font-bold text-sm shadow-lg shadow-emerald-500/20 hover:brightness-110 transition-all"
                >
                  <Icon name="email" className="text-lg" />
                  Request a School Partnership
                </a>
              </div>

              {/* Visual */}
              <div className="glass-card rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Icon name="school" className="text-emerald-400 text-lg" filled />
                  </div>
                  <div>
                    <p className="font-headline font-bold text-sm text-white">School Dashboard</p>
                    <p className="text-[10px] text-stone-500">Anonymized aggregate data only</p>
                  </div>
                </div>
                {[
                  { label: 'Active Students', value: '127', trend: '+12 this month' },
                  { label: 'Avg. Streak Length', value: '14 days', trend: '+3 from last month' },
                  { label: 'Journal Engagement', value: '68%', trend: 'Above national avg.' },
                  { label: 'Crisis Flags (auto-reported)', value: '2', trend: 'Both connected to 988' },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <span className="text-xs text-stone-400 font-label">{row.label}</span>
                    <div className="text-right">
                      <span className="text-sm font-headline font-bold text-white">{row.value}</span>
                      <span className="text-[10px] text-emerald-400 font-label block">{row.trend}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────── */}
        <section className="px-6 py-24">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 rounded-[2.5rem] px-8 py-16 sm:p-16 text-center relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-1/2 -right-1/4 w-[120%] h-[200%] bg-white/[0.04] rotate-12" />
              </div>
              <div className="relative z-10 space-y-6">
                <h2 className="font-headline text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Invest in the next generation
                </h2>
                <p className="font-body text-lg text-white/70 max-w-lg mx-auto leading-relaxed">
                  Your sponsorship gives students the tools to understand their patterns, build accountability, and develop lasting digital integrity.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <a
                    href="mailto:shawn@becandid.io?subject=Sponsorship%20Inquiry%20—%20Be%20Candid%20Foundation"
                    className="group px-10 py-4 bg-white text-emerald-700 rounded-full font-label font-bold text-base shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 inline-flex items-center gap-2"
                  >
                    Become a Sponsor
                    <Icon name="arrow_forward" className="text-lg group-hover:translate-x-0.5 transition-transform duration-200" />
                  </a>
                  <Link
                    href="/donate"
                    className="px-8 py-4 rounded-full font-label font-bold text-base text-white/80 hover:text-white border border-white/20 hover:border-white/40 transition-all duration-200 inline-flex items-center gap-2"
                  >
                    <Icon name="volunteer_activism" className="text-lg" />
                    Donate as an Individual
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ──────────────────────────────────────── */}
        <footer className="border-t border-white/5 bg-stone-950">
          <div className="max-w-5xl mx-auto px-6 py-12">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <Image src="/logo.png" alt="Be Candid" width={96} height={32} className="h-8 w-auto brightness-[10]" />
                <span className="font-label text-xs font-bold text-emerald-400 uppercase tracking-widest">.org</span>
              </div>
              <div className="flex gap-6 text-xs font-label text-stone-500">
                <Link href="/" className="hover:text-emerald-400 transition-colors">BeCandid.io</Link>
                <Link href="/legal/privacy" className="hover:text-emerald-400 transition-colors">Privacy</Link>
                <Link href="/legal/terms" className="hover:text-emerald-400 transition-colors">Terms</Link>
                <a href="mailto:shawn@becandid.io" className="hover:text-emerald-400 transition-colors">Contact</a>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="font-body text-xs text-stone-600">
                &copy; {new Date().getFullYear()} Be Candid Foundation. All rights reserved.
              </p>
              <p className="font-body text-[10px] text-stone-700 text-center sm:text-right max-w-sm">
                Be Candid is not a substitute for professional therapy. If you are in crisis, call or text 988.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
