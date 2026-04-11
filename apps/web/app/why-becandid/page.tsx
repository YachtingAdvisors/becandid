import type { Metadata } from 'next';
import Link from 'next/link';
import PublicNav from '@/components/PublicNav';

export const metadata: Metadata = {
  title: 'Why Be Candid — Accountability Without Surveillance',
  description:
    'Compare Be Candid to Covenant Eyes, Ever Accountable, and Bark. No VPN, no browsing logs. Lightweight DNS detection plus small encrypted screenshots shared only with your partner. 25 rival categories, therapist portal, conversation guides.',
  openGraph: {
    title: 'Why Be Candid — Accountability Without Surveillance',
    description:
      'No VPN. No browsing history. Lightweight detection with small, encrypted screenshots shared only with your partner. Accountability that respects your dignity, your battery, and your privacy.',
    images: [{ url: '/api/og', width: 1200, height: 630 }],
  },
};

/* ── Rival categories with emojis ─────────────────────────────── */

const RIVAL_CATEGORIES = [
  { emoji: '🔞', label: 'Pornography' },
  { emoji: '💬', label: 'Sexting' },
  { emoji: '📱', label: 'Social Media' },
  { emoji: '📺', label: 'Binge Watching' },
  { emoji: '🛒', label: 'Impulse Shopping' },
  { emoji: '📰', label: 'Doomscrolling' },
  { emoji: '🍷', label: 'Alcohol & Drugs' },
  { emoji: '🚬', label: 'Vaping & Tobacco' },
  { emoji: '⚠️', label: 'Eating Disorders' },
  { emoji: '🪞', label: 'Body Checking' },
  { emoji: '🎰', label: 'Gambling' },
  { emoji: '🏈', label: 'Sports Betting' },
  { emoji: '📈', label: 'Day Trading' },
  { emoji: '💔', label: 'Dating Apps' },
  { emoji: '💭', label: 'Emotional Affairs' },
  { emoji: '🎮', label: 'Gaming' },
  { emoji: '😤', label: 'Rage Content' },
  { emoji: '🗣️', label: 'Gossip & Drama' },
  { emoji: '🚪', label: 'Isolation' },
  { emoji: '🤖', label: 'AI Relationships' },
  { emoji: '💼', label: 'Overworking' },
  { emoji: '🌙', label: 'Sleep Avoidance' },
  { emoji: '🩹', label: 'Self-Harm Recovery' },
  { emoji: '⏳', label: 'Procrastination' },
  { emoji: '⚙️', label: 'Custom' },
];

/* ── VPN pain points ──────────────────────────────────────────── */

const VPN_PAIN_POINTS = [
  {
    icon: 'battery_alert',
    title: 'Battery Drain',
    desc: 'VPN processes every packet 24/7 -- expect 10-25% battery loss daily.',
  },
  {
    icon: 'speed',
    title: 'Speed Reduction',
    desc: 'All traffic goes through an extra hop. Streaming buffers. Pages load slower.',
  },
  {
    icon: 'wifi_off',
    title: 'Connection Drops',
    desc: 'VPN reconnects constantly, breaking video calls, banking apps, and downloads.',
  },
  {
    icon: 'business',
    title: 'Work Conflicts',
    desc: "Can't run alongside your company VPN. Choose between accountability and your job.",
  },
  {
    icon: 'phone_iphone',
    title: 'iOS Issues',
    desc: 'Apple restricts VPN apps aggressively, causing frequent disconnects and crashes.',
  },
  {
    icon: 'block',
    title: 'App Breakage',
    desc: 'TLS inspection breaks banking, healthcare, and enterprise apps that pin certificates.',
  },
];

/* ── Comparison table data ────────────────────────────────────── */

interface ComparisonRow {
  feature: string;
  beCandid: string;
  covenantEyes: string;
  everAccountable: string;
  bark: string;
}

const COMPARISON_ROWS: ComparisonRow[] = [
  {
    feature: 'VPN required',
    beCandid: 'No',
    covenantEyes: 'Yes',
    everAccountable: 'Yes',
    bark: 'No',
  },
  {
    feature: 'Battery impact',
    beCandid: 'Minimal',
    covenantEyes: 'Heavy',
    everAccountable: 'Heavy',
    bark: 'Moderate',
  },
  {
    feature: 'Constant screenshots',
    beCandid: 'No',
    covenantEyes: 'Yes',
    everAccountable: 'Yes',
    bark: 'No',
  },
  {
    feature: 'Periodic encrypted screenshots',
    beCandid: 'Yes',
    covenantEyes: 'No',
    everAccountable: 'No',
    bark: 'No',
  },
  {
    feature: 'Browsing history logged',
    beCandid: 'No',
    covenantEyes: 'Yes',
    everAccountable: 'Yes',
    bark: 'No',
  },
  {
    feature: 'Conversation guides',
    beCandid: 'Yes',
    covenantEyes: 'No',
    everAccountable: 'No',
    bark: 'No',
  },
  {
    feature: 'Therapist portal',
    beCandid: 'Yes',
    covenantEyes: 'No',
    everAccountable: 'No',
    bark: 'No',
  },
  {
    feature: '25 rival categories',
    beCandid: 'Yes',
    covenantEyes: 'No',
    everAccountable: 'No',
    bark: 'Partial',
  },
  {
    feature: 'Dark mode',
    beCandid: 'Yes',
    covenantEyes: 'No',
    everAccountable: 'No',
    bark: 'Yes',
  },
  {
    feature: 'Group accountability',
    beCandid: 'Yes',
    covenantEyes: 'No',
    everAccountable: 'No',
    bark: 'No',
  },
  {
    feature: 'Journaling framework',
    beCandid: 'Yes',
    covenantEyes: 'No',
    everAccountable: 'No',
    bark: 'No',
  },
  {
    feature: 'Free tier',
    beCandid: 'Yes',
    covenantEyes: 'No',
    everAccountable: 'No',
    bark: 'Yes',
  },
  {
    feature: 'Price',
    beCandid: '$9.99/mo',
    covenantEyes: '$16.99/mo',
    everAccountable: '$6.99/mo',
    bark: '$14/mo',
  },
];

/* ── Placeholder testimonials ─────────────────────────────────── */

const TESTIMONIALS = [
  {
    quote:
      'I tried Covenant Eyes for two years. The VPN killed my battery and my wife saw every URL I visited. Be Candid gives her the insight she needs without the surveillance.',
    author: 'Marcus T.',
    role: 'Pro user, 8-month streak',
    placeholder: true,
  },
  {
    quote:
      'As a therapist, I finally have a tool I can recommend without ethical concerns. My clients stay accountable without feeling watched.',
    author: 'Dr. Sarah K.',
    role: 'Licensed therapist, 12 clients on Be Candid',
    placeholder: true,
  },
  {
    quote:
      'The conversation guides changed everything. We went from fighting about screen time to actually talking about what was going on underneath.',
    author: 'Jamie & Alex R.',
    role: 'Couple, 5-month streak',
    placeholder: true,
  },
];

/* ── Helper: render check/cross for table cells ───────────────── */

function CellValue({ value }: { value: string }) {
  if (value === 'Yes') {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
          check_circle
        </span>
        Yes
      </span>
    );
  }
  if (value === 'No') {
    return (
      <span className="inline-flex items-center gap-1 text-stone-500 font-medium">
        <span className="material-symbols-outlined text-lg">cancel</span>
        No
      </span>
    );
  }
  if (value === 'Partial') {
    return (
      <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
        <span className="material-symbols-outlined text-lg">remove_circle</span>
        Partial
      </span>
    );
  }
  return <span className="text-stone-300 font-medium">{value}</span>;
}

/* ── Highlight cell for Be Candid column ──────────────────────── */

function BeCandidCell({ value }: { value: string }) {
  const isPositive = value === 'Yes' || value === 'No';
  // "Yes" for features is good, "No" for VPN/screenshots/history is also good
  return (
    <td className="px-4 py-3.5 bg-primary/5 border-x border-primary/10">
      <CellValue value={value} />
    </td>
  );
}

/* ── Page ─────────────────────────────────────────────────────── */

export default function WhyBeCandidPage() {
  return (
    <>
      <PublicNav />

      <main className="min-h-screen bg-stone-950 text-stone-100 pt-24">
        {/* ─── Hero ────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          {/* Subtle gradient orb */}
          <div
            className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full opacity-20"
            style={{
              background:
                'radial-gradient(ellipse at center, var(--color-primary) 0%, transparent 70%)',
            }}
          />

          <div className="relative max-w-4xl mx-auto px-6 py-24 md:py-36 text-center">
            <p className="text-sm font-label tracking-widest uppercase text-primary mb-4 opacity-80">
              A Different Kind of Accountability
            </p>
            <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
              Why Be Candid?
            </h1>
            <p className="text-lg sm:text-xl text-stone-400 max-w-2xl mx-auto leading-relaxed font-body">
              Accountability that respects your dignity, your battery, and your
              privacy.
            </p>
          </div>
        </section>

        {/* ─── Section 1: No VPN Required ─────────────────── */}
        <section className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="text-center mb-16">
            <span className="material-symbols-outlined text-5xl text-primary mb-4 block">
              vpn_lock
            </span>
            <h2 className="font-headline text-3xl sm:text-4xl font-bold mb-4">
              No VPN Required
            </h2>
            <p className="text-stone-400 max-w-2xl mx-auto text-lg font-body leading-relaxed">
              Most accountability apps route{' '}
              <span className="text-stone-200 font-semibold">ALL</span> your
              internet traffic through a VPN. This causes real problems:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {VPN_PAIN_POINTS.map((point) => (
              <div
                key={point.icon}
                className="group relative rounded-2xl border border-white/5 bg-stone-900/60 p-6 hover:border-red-500/20 hover:bg-stone-900/80 transition-all duration-300"
              >
                <span className="material-symbols-outlined text-3xl text-red-400/80 mb-3 block group-hover:text-red-400 transition-colors">
                  {point.icon}
                </span>
                <h3 className="font-headline text-lg font-bold mb-2 text-stone-200">
                  {point.title}
                </h3>
                <p className="text-sm text-stone-400 leading-relaxed font-body">
                  {point.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-14 rounded-2xl border border-primary/20 bg-primary/5 p-8 md:p-10">
            <div className="flex items-start gap-4">
              <span
                className="material-symbols-outlined text-4xl text-primary shrink-0 mt-1"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                shield
              </span>
              <div>
                <h3 className="font-headline text-xl font-bold mb-2 text-stone-100">
                  Be Candid&apos;s Lightweight Approach
                </h3>
                <p className="text-stone-400 font-body leading-relaxed mb-4">
                  Instead of routing all traffic through a VPN tunnel, Be Candid
                  uses DNS queries for domain awareness plus small periodic
                  screenshots for accountability. No full VPN. No speed hit. No
                  battery drain.
                </p>
                <ul className="space-y-2 text-stone-400 font-body text-sm leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-base mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    DNS-level monitoring detects which domains and apps you access -- without touching your actual traffic
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-base mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    Periodic screenshots are small, encrypted, and only shared with your accountability partner -- never stored on our servers long-term
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-base mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    Your partner sees the category and timing of a flag -- never the full URL, never raw browsing history
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Section 2: Comparison Table ────────────────── */}
        <section className="bg-stone-900/40 py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
              <h2 className="font-headline text-3xl sm:text-4xl font-bold mb-4">
                How We Compare
              </h2>
              <p className="text-stone-400 max-w-xl mx-auto font-body">
                A fair, honest comparison. We built what we wished existed.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/5">
              <table className="w-full min-w-[700px] text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-stone-900/80">
                    <th className="text-left px-4 py-4 font-label font-semibold text-stone-400 uppercase tracking-wider text-xs">
                      Feature
                    </th>
                    <th className="px-4 py-4 font-label font-bold text-primary uppercase tracking-wider text-xs bg-primary/5 border-x border-primary/10">
                      Be Candid
                    </th>
                    <th className="px-4 py-4 font-label font-semibold text-stone-400 uppercase tracking-wider text-xs">
                      Covenant Eyes
                    </th>
                    <th className="px-4 py-4 font-label font-semibold text-stone-400 uppercase tracking-wider text-xs">
                      Ever Accountable
                    </th>
                    <th className="px-4 py-4 font-label font-semibold text-stone-400 uppercase tracking-wider text-xs">
                      Bark
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, i) => (
                    <tr
                      key={row.feature}
                      className={`border-b border-white/5 ${
                        i % 2 === 0 ? 'bg-stone-950/40' : 'bg-stone-950/20'
                      }`}
                    >
                      <td className="px-4 py-3.5 font-body font-medium text-stone-300">
                        {row.feature}
                      </td>
                      <BeCandidCell value={row.beCandid} />
                      <td className="px-4 py-3.5">
                        <CellValue value={row.covenantEyes} />
                      </td>
                      <td className="px-4 py-3.5">
                        <CellValue value={row.everAccountable} />
                      </td>
                      <td className="px-4 py-3.5">
                        <CellValue value={row.bark} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ─── Section 3: Accountability, Not Surveillance ── */}
        <section className="max-w-5xl mx-auto px-6 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="material-symbols-outlined text-5xl text-primary mb-4 block">
                visibility_off
              </span>
              <h2 className="font-headline text-3xl sm:text-4xl font-bold mb-6 leading-tight">
                Accountability,
                <br />
                Not Surveillance
              </h2>
              <div className="space-y-5 text-stone-400 font-body leading-relaxed">
                <p>
                  Covenant Eyes captures screenshots of your screen every few
                  seconds and logs every URL. Your partner sees your actual
                  browsing in full detail. That is surveillance.
                </p>
                <p>
                  Be Candid takes a different approach. We use{' '}
                  <span className="text-stone-200 font-semibold">small periodic screenshots</span>{' '}
                  that are encrypted and shared only with your accountability
                  partner -- plus DNS-based domain awareness for flagging. Your
                  partner sees the{' '}
                  <span className="text-stone-200 font-semibold">category, timing, and context</span>{' '}
                  without raw URLs or a constant stream of screen captures.
                </p>
                <p className="text-stone-300 font-medium italic border-l-2 border-primary/40 pl-4">
                  Because accountability is about honesty, not surveillance.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* What they see vs what we show */}
              <div className="rounded-2xl border border-red-500/10 bg-red-500/5 p-6">
                <p className="font-label text-xs uppercase tracking-wider text-red-400/80 mb-3 font-semibold">
                  What Covenant Eyes shows your partner
                </p>
                <div className="space-y-2 text-sm text-stone-400 font-body">
                  <p className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-red-400/60">screenshot_monitor</span>
                    Screenshot of your browser tab
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-red-400/60">link</span>
                    Full URL: https://www.example.com/page/...
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-red-400/60">schedule</span>
                    11:32 PM -- 11:47 PM (duration)
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
                <p className="font-label text-xs uppercase tracking-wider text-primary/80 mb-3 font-semibold">
                  What Be Candid shows your partner
                </p>
                <div className="space-y-2 text-sm text-stone-400 font-body">
                  <p className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-primary/60">category</span>
                    Category: Pornography
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-primary/60">schedule</span>
                    Flagged at 11:32 PM
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-primary/60">photo_camera</span>
                    Small encrypted screenshot (partner only)
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-primary/60">chat</span>
                    Conversation guide unlocked
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Section 4: Built for More Than Just Porn ──── */}
        <section className="bg-stone-900/40 py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
              <h2 className="font-headline text-3xl sm:text-4xl font-bold mb-4">
                Built for More Than Just Porn
              </h2>
              <p className="text-stone-400 max-w-2xl mx-auto font-body leading-relaxed">
                Gambling. Social media. AI chatbots. Isolation. Overworking.
                Self-harm recovery. 25 categories and growing.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {RIVAL_CATEGORIES.map((cat) => (
                <div
                  key={cat.label}
                  className="flex items-center gap-3 rounded-xl border border-white/5 bg-stone-900/60 px-4 py-3 hover:border-primary/20 hover:bg-stone-900/80 transition-all duration-200"
                >
                  <span className="text-xl shrink-0" role="img" aria-label={cat.label}>
                    {cat.emoji}
                  </span>
                  <span className="text-sm font-body text-stone-300 leading-tight">
                    {cat.label}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-center mt-10 text-stone-500 text-sm font-body">
              Most accountability apps only cover pornography. We cover every
              rival your users actually face.
            </p>
          </div>
        </section>

        {/* ─── Section 5: Community Voices ────────────────── */}
        <section className="max-w-5xl mx-auto px-6 py-20 md:py-28">
          <div className="text-center mb-14">
            <h2 className="font-headline text-3xl sm:text-4xl font-bold mb-4">
              What Our Community Says
            </h2>
            <p className="text-stone-500 text-sm font-label uppercase tracking-wider">
              Placeholder testimonials -- real stories coming soon
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.author}
                className="relative rounded-2xl border border-white/5 bg-stone-900/60 p-7 flex flex-col"
              >
                {t.placeholder && (
                  <span className="absolute top-3 right-3 text-[10px] font-label uppercase tracking-wider text-stone-600 bg-stone-800 px-2 py-0.5 rounded-full">
                    Placeholder
                  </span>
                )}
                <span className="material-symbols-outlined text-primary/30 text-3xl mb-4">
                  format_quote
                </span>
                <p className="text-stone-300 font-body text-sm leading-relaxed flex-1 mb-6 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <p className="font-headline font-bold text-stone-200 text-sm">
                    {t.author}
                  </p>
                  <p className="text-stone-500 text-xs font-body mt-0.5">
                    {t.role}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/donate"
              className="inline-flex items-center gap-2 text-primary hover:text-primary-container transition-colors font-label text-sm font-semibold"
            >
              <span className="material-symbols-outlined text-lg">volunteer_activism</span>
              Build With Us
            </Link>
          </div>
        </section>

        {/* ─── Section 6: CTA ─────────────────────────────── */}
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              background:
                'radial-gradient(ellipse at bottom center, var(--color-primary) 0%, transparent 60%)',
            }}
          />

          <div className="relative max-w-3xl mx-auto px-6 py-24 md:py-32 text-center">
            <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
              Try Be Candid Free
            </h2>
            <p className="text-stone-400 text-lg font-body mb-10 max-w-xl mx-auto leading-relaxed">
              No credit card. No VPN. No surveillance. Just accountability.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/signup"
                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-primary to-primary-dim text-on-primary font-label font-bold text-base hover:brightness-110 transition-all shadow-lg shadow-primary/25"
              >
                Get Started Free
              </Link>
              <Link
                href="/pricing"
                className="px-8 py-3.5 rounded-full border border-white/10 text-stone-300 font-label font-semibold text-base hover:border-white/20 hover:text-white transition-all"
              >
                See Pricing
              </Link>
            </div>

            <p className="mt-8 text-stone-600 text-xs font-body">
              Free tier includes 1 partner, 3 conversation guides/month, and
              core tracking across 16 categories.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
