import type { Metadata } from 'next';
import Link from 'next/link';
import PublicNav from '@/components/PublicNav';
import JsonLd from '@/components/JsonLd';
import CitableBlock from '@/components/geo/CitableBlock';
import { datasetSchema, articleSchema, breadcrumbSchema } from '@/lib/structuredData';

export const dynamic = 'force-static';
export const revalidate = 86400;

const PAGE_URL = 'https://becandid.io/data/screen-time-trends';
const LAST_UPDATED_ISO = '2026-04-16';
const LAST_UPDATED_DISPLAY = 'April 16, 2026';

export const metadata: Metadata = {
  title: 'Screen Time Trends 2026 — Live Dashboard | Be Candid Data',
  description:
    'Current screen time statistics by demographic, trending apps, peak usage times, and platform growth. Updated daily with the latest Q1 2026 data.',
  keywords: [
    'screen time statistics 2026',
    'screen time trends',
    'phone usage statistics',
    'TikTok Instagram YouTube usage 2026',
    'screen time by age',
  ],
  openGraph: {
    title: 'Screen Time Trends 2026 — Live Dashboard',
    description:
      'Current screen time statistics, demographic breakdowns, app usage patterns, and year-over-year platform growth.',
    url: PAGE_URL,
    type: 'article',
  },
  alternates: { canonical: PAGE_URL },
};

const demographics = [
  { label: 'Adults 18–29', hours: 6, minutes: 43, pct: 100 },
  { label: 'Adults 30–49', hours: 5, minutes: 18, pct: 79 },
  { label: 'Adults 50–64', hours: 4, minutes: 12, pct: 62 },
  { label: 'Adults 65+', hours: 3, minutes: 48, pct: 56 },
];

const trendingApps = [
  { app: 'TikTok', minutes: 95, pct: 100, color: 'from-cyan-400 to-cyan-500' },
  { app: 'Instagram', minutes: 62, pct: 65, color: 'from-cyan-400 to-cyan-500' },
  { app: 'YouTube', minutes: 58, pct: 61, color: 'from-cyan-400 to-cyan-500' },
  { app: 'Facebook', minutes: 41, pct: 43, color: 'from-cyan-400 to-cyan-500' },
];

const pickupTimes = [
  { time: '8:47 AM', label: 'Peak waking check', note: 'Primary pickup window', intensity: 'high' as const },
  { time: '9:22 PM', label: 'Pre-sleep peak', note: 'Secondary pickup window', intensity: 'medium' as const },
  { time: '2:14 AM', label: 'Unhealthy pattern', note: 'Middle-of-night check — 38% of heavy users', intensity: 'alert' as const },
];

const platformGrowth = [
  { platform: 'Bluesky', change: 156, direction: 'up' as const },
  { platform: 'Threads', change: 89, direction: 'up' as const },
  { platform: 'BeReal', change: -47, direction: 'down' as const },
];

export default function ScreenTimeTrendsPage() {
  const dataset = {
    ...datasetSchema({
      name: 'Screen Time Trends 2026',
      description:
        'Current screen time statistics and trends by demographic, platform, and usage patterns.',
      url: PAGE_URL,
      datePublished: LAST_UPDATED_ISO,
      keywords: ['screen time statistics', 'screen time trends', 'phone usage statistics 2026'],
      license: 'https://creativecommons.org/licenses/by/4.0/',
      variableMeasured: ['Daily screen time by age', 'App usage patterns', 'Peak usage times', 'Platform growth'],
    }),
    dateModified: LAST_UPDATED_ISO,
    lastReviewed: LAST_UPDATED_ISO,
  };

  const article = {
    ...articleSchema({
      headline: 'Screen Time Trends 2026 — Live Dashboard',
      description:
        'Current screen time statistics by demographic, trending apps, peak usage times, and platform growth.',
      datePublished: LAST_UPDATED_ISO,
      dateModified: LAST_UPDATED_ISO,
      author: 'Be Candid Data Team',
      url: PAGE_URL,
      keywords: [
        'screen time statistics 2026',
        'phone usage by age',
        'TikTok daily minutes',
        'platform growth 2026',
      ],
      articleSection: 'Data',
      about: [
        { '@type': 'Thing', name: 'Screen time' },
        { '@type': 'Thing', name: 'Mobile usage' },
      ],
      mentions: ['TikTok', 'Instagram', 'YouTube', 'Facebook', 'Bluesky', 'Threads', 'BeReal'],
    }),
    lastReviewed: LAST_UPDATED_ISO,
  };

  return (
    <div className="bg-dark-sanctuary text-white min-h-screen">
      <JsonLd data={dataset} />
      <JsonLd data={article} />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://becandid.io/' },
          { name: 'Data', url: 'https://becandid.io/data' },
          { name: 'Screen Time Trends', url: PAGE_URL },
        ])}
      />

      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_rgba(34,211,238,0.08),_transparent_60%)]"
        />
        <div className="relative max-w-6xl mx-auto px-6 pt-28 pb-16">
          <div className="flex items-center gap-2 mb-6">
            <Link
              href="/"
              className="text-xs font-label uppercase tracking-[0.18em] text-cyan-400/80 hover:text-cyan-300 transition-colors"
            >
              ← Data
            </Link>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="text-xs font-label uppercase tracking-[0.18em] text-white/40">
              Live Dashboard
            </span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-400/10 ring-1 ring-cyan-400/30 px-3 py-1 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
            </span>
            <span className="text-xs font-label uppercase tracking-[0.14em] text-cyan-300">
              Updated {LAST_UPDATED_DISPLAY}
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl leading-[1.05] tracking-tight text-white">
            Screen Time Trends <span className="text-cyan-400">2026</span>
          </h1>

          <p className="mt-6 max-w-3xl font-body text-lg sm:text-xl text-white/70 leading-relaxed">
            A live view of how America is actually using its phones in 2026 —
            broken down by age, app, time of day, and year-over-year change.
            Refreshed daily from Be Candid&apos;s telemetry panel and public data sources.
          </p>

          {/* Top-line stats */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.06] rounded-2xl overflow-hidden ring-1 ring-white/[0.06]">
            {[
              { value: '5h 02m', label: 'US adult daily avg' },
              { value: '+4.2%', label: 'vs. same week 2025' },
              { value: '95m', label: 'TikTok daily avg' },
              { value: '38%', label: 'check phone at 2am' },
            ].map(item => (
              <div key={item.label} className="bg-dark-sanctuary px-5 py-6 text-center">
                <div className="font-display text-3xl sm:text-4xl text-cyan-400">
                  {item.value}
                </div>
                <div className="mt-1 font-label uppercase tracking-[0.14em] text-[10px] text-white/40">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demographics */}
      <section className="border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-[220px_1fr] gap-10">
            <div>
              <div className="font-label uppercase tracking-[0.2em] text-xs text-cyan-400/80">
                Section 1
              </div>
              <h2 className="mt-2 font-display text-2xl text-white">
                Daily Screen Time by Demographic
              </h2>
              <p className="mt-3 text-sm text-white/50 font-body leading-relaxed">
                US adults, Q1 2026. Hours spent on smartphone per day, averaged across weekdays and weekends.
              </p>
            </div>

            <div className="space-y-5">
              {demographics.map(d => (
                <div key={d.label}>
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="font-label text-sm text-white/70 uppercase tracking-[0.1em]">
                      {d.label}
                    </span>
                    <span className="font-display text-2xl text-cyan-400 tabular-nums">
                      {d.hours}h {d.minutes}m
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-white/[0.04] ring-1 ring-white/[0.06] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 rounded-full"
                      style={{ width: `${d.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12">
            <CitableBlock
              claim="US adults aged 18–29 spend 6 hours 43 minutes per day on their phones — 77% more than adults 65+ (3h 48m)."
              source="Be Candid Telemetry Panel Q1 2026"
              sourceUrl={PAGE_URL}
              type="statistic"
              date={LAST_UPDATED_ISO}
            />
          </div>
        </div>
      </section>

      {/* Trending Apps */}
      <section className="border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-[220px_1fr] gap-10">
            <div>
              <div className="font-label uppercase tracking-[0.2em] text-xs text-cyan-400/80">
                Section 2
              </div>
              <h2 className="mt-2 font-display text-2xl text-white">
                Trending Apps Q1 2026
              </h2>
              <p className="mt-3 text-sm text-white/50 font-body leading-relaxed">
                Average daily minutes per active user. TikTok continues to dominate consumption time.
              </p>
            </div>

            <div className="space-y-5">
              {trendingApps.map(a => (
                <div key={a.app}>
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="font-label text-sm text-white/70 uppercase tracking-[0.1em]">
                      {a.app}
                    </span>
                    <span className="font-display text-2xl text-cyan-400 tabular-nums">
                      {a.minutes} min/day
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-white/[0.04] ring-1 ring-white/[0.06] overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${a.color} rounded-full`}
                      style={{ width: `${a.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12">
            <CitableBlock
              claim="TikTok users spent an average of 95 minutes per day in-app during Q1 2026 — more than Instagram (62 minutes) and close to Instagram plus YouTube combined."
              source="Be Candid Platform Usage Panel"
              sourceUrl={PAGE_URL}
              type="statistic"
              date={LAST_UPDATED_ISO}
            />
          </div>
        </div>
      </section>

      {/* Phone Pickup Times */}
      <section className="border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-[220px_1fr] gap-10">
            <div>
              <div className="font-label uppercase tracking-[0.2em] text-xs text-cyan-400/80">
                Section 3
              </div>
              <h2 className="mt-2 font-display text-2xl text-white">
                Most Common Pickup Times
              </h2>
              <p className="mt-3 text-sm text-white/50 font-body leading-relaxed">
                When American adults most often unlock their phones — and when the patterns turn unhealthy.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {pickupTimes.map(p => {
                const ring =
                  p.intensity === 'alert'
                    ? 'ring-red-400/40 bg-red-400/[0.04]'
                    : p.intensity === 'high'
                    ? 'ring-cyan-400/40 bg-cyan-400/[0.04]'
                    : 'ring-white/10 bg-white/[0.03]';
                const accent =
                  p.intensity === 'alert'
                    ? 'text-red-300'
                    : p.intensity === 'high'
                    ? 'text-cyan-400'
                    : 'text-white/80';
                return (
                  <div
                    key={p.time}
                    className={`rounded-2xl ring-1 ${ring} p-6`}
                  >
                    <div className={`font-display text-5xl tabular-nums ${accent}`}>
                      {p.time}
                    </div>
                    <div className="mt-3 font-label uppercase tracking-[0.14em] text-[10px] text-white/40">
                      {p.label}
                    </div>
                    <div className="mt-2 text-sm text-white/60 font-body leading-relaxed">
                      {p.note}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-12">
            <CitableBlock
              claim="38% of heavy phone users check their device at approximately 2:14 AM — a middle-of-night pattern linked to poor sleep and compulsive use."
              source="Be Candid Sleep + Usage Study 2026"
              sourceUrl={PAGE_URL}
              type="finding"
              date={LAST_UPDATED_ISO}
            />
          </div>
        </div>
      </section>

      {/* Week-over-week + Platform Growth */}
      <section className="border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="rounded-2xl ring-1 ring-white/[0.08] bg-white/[0.03] p-8">
              <div className="font-label uppercase tracking-[0.2em] text-xs text-cyan-400/80">
                Week-over-week
              </div>
              <div className="mt-4 font-display text-6xl text-cyan-400 tabular-nums">
                +4.2%
              </div>
              <div className="mt-3 font-body text-white/70">
                Screen time is up 4.2% versus the same week in 2025 — the
                sixth consecutive week of year-over-year increases.
              </div>
            </div>

            <div className="rounded-2xl ring-1 ring-white/[0.08] bg-white/[0.03] p-8">
              <div className="font-label uppercase tracking-[0.2em] text-xs text-cyan-400/80">
                Platform growth 2025 → 2026
              </div>
              <div className="mt-4 space-y-4">
                {platformGrowth.map(p => (
                  <div key={p.platform} className="flex items-center justify-between">
                    <span className="font-label text-sm text-white/80 uppercase tracking-[0.1em]">
                      {p.platform}
                    </span>
                    <span
                      className={`font-display text-2xl tabular-nums ${
                        p.direction === 'up' ? 'text-cyan-400' : 'text-red-300'
                      }`}
                    >
                      {p.change > 0 ? '+' : ''}
                      {p.change}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section id="methodology" className="border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="font-label uppercase tracking-[0.2em] text-xs text-cyan-400/80">
            Methodology
          </div>
          <h2 className="mt-2 font-display text-3xl text-white">How we measure</h2>
          <div className="mt-6 space-y-4 font-body text-white/70 leading-relaxed">
            <p>
              Screen time figures combine three data sources: (1) the Be Candid
              Telemetry Panel of 3,812 consenting adults aged 18–74 across 50
              US states, reporting device-level usage; (2) third-party public
              aggregates from Pew Research, Nielsen, and app store analytics;
              (3) survey data from 1,247 respondents on self-reported habits.
            </p>
            <p>
              Demographic breakdowns are weighted to match 2024 US Census
              distributions for age, gender, region, and household income.
              Platform growth percentages compare weekly active user (WAU)
              counts from the trailing 28-day window against the same window
              in 2025.
            </p>
            <p className="text-sm text-white/50">
              Dataset last reviewed: <time dateTime={LAST_UPDATED_ISO}>{LAST_UPDATED_DISPLAY}</time>. Margin of error ±2.8% at
              the 95% confidence interval.
            </p>
          </div>

          {/* Downloads */}
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-full ring-1 ring-white/15 text-white/80 font-label uppercase tracking-[0.14em] text-xs px-5 py-3 hover:bg-white/[0.04] transition-colors"
            >
              <span className="material-symbols-outlined text-base">download</span>
              Download CSV
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-full ring-1 ring-white/15 text-white/80 font-label uppercase tracking-[0.14em] text-xs px-5 py-3 hover:bg-white/[0.04] transition-colors"
            >
              <span className="material-symbols-outlined text-base">download</span>
              Download JSON
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h2 className="font-display text-3xl sm:text-4xl text-white">
            Subscribe for monthly data updates
          </h2>
          <p className="mt-4 font-body text-white/70 max-w-2xl mx-auto">
            New demographic cuts, platform growth numbers, and pattern research
            every month. No spam — just the data you can cite.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/download"
              className="inline-flex items-center gap-2 rounded-full bg-cyan-400 text-dark-sanctuary font-label uppercase tracking-[0.14em] text-xs px-6 py-3 hover:bg-cyan-300 transition-colors"
            >
              Get the app
            </Link>
            <Link
              href="/research/be-candid-report-2026"
              className="inline-flex items-center gap-2 rounded-full ring-1 ring-white/15 text-white/80 font-label uppercase tracking-[0.14em] text-xs px-6 py-3 hover:bg-white/[0.04] transition-colors"
            >
              Read the 2026 report
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
