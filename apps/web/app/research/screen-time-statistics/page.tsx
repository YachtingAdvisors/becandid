import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Screen Time Statistics 2026 — The Definitive Guide',
  description: 'Comprehensive screen time statistics for 2026. Average usage by age, health impacts, productivity costs, and relationship effects. Cite-ready data with sources.',
  alternates: { canonical: 'https://becandid.io/research/screen-time-statistics' },
  openGraph: {
    title: 'Screen Time Statistics 2026 — The Definitive Guide',
    description: 'Average screen time by age, health impacts, productivity costs, and more. Updated for 2026.',
    url: 'https://becandid.io/research/screen-time-statistics',
    type: 'article',
    images: [{ url: 'https://becandid.io/api/og?title=Screen%20Time%20Statistics%202026&subtitle=The%20Definitive%20Guide', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
};

const schema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Screen Time Statistics 2026 — The Definitive Guide',
  description: 'Comprehensive screen time statistics for 2026 with cite-ready data and sources.',
  datePublished: '2026-01-15',
  dateModified: '2026-04-01',
  author: { '@type': 'Organization', name: 'Be Candid' },
  publisher: {
    '@type': 'Organization',
    name: 'Be Candid',
    url: 'https://becandid.io',
    logo: { '@type': 'ImageObject', url: 'https://becandid.io/apple-touch-icon.png' },
  },
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://becandid.io/research/screen-time-statistics' },
};

interface StatCardProps {
  stat: string;
  label: string;
  source: string;
  sourceUrl?: string;
  color?: string;
}

function StatCard({ stat, label, source, sourceUrl, color = 'text-cyan-400' }: StatCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-center">
      <div className={`text-3xl md:text-4xl font-bold ${color} mb-1`}>{stat}</div>
      <div className="text-sm text-stone-300 mb-2">{label}</div>
      {sourceUrl ? (
        <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-stone-500 hover:text-stone-400 transition-colors">
          Source: {source}
        </a>
      ) : (
        <span className="text-xs text-stone-500">Source: {source}</span>
      )}
    </div>
  );
}

function CiteBox({ text }: { text: string }) {
  return (
    <div className="rounded-lg bg-cyan-500/[0.06] border border-cyan-500/20 px-4 py-3 text-sm text-stone-300 my-4">
      <span className="text-xs font-medium text-cyan-400 block mb-1">CITE THIS</span>
      {text}
    </div>
  );
}

export default function ScreenTimeStatisticsPage() {
  return (
    <>
      <JsonLd data={schema} />
      <main className="pt-28 pb-20 px-6">
        <article className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full">Updated April 2026</span>
              <span className="text-xs text-stone-500">12 min read</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Screen Time Statistics 2026:<br />The Definitive Guide
            </h1>
            <p className="text-lg text-stone-400 leading-relaxed max-w-3xl">
              How much time do we really spend on screens? This comprehensive guide compiles the latest
              research on screen time usage, health impacts, productivity costs, and relationship effects.
              All statistics include sources for citation.
            </p>
          </div>

          {/* Table of Contents */}
          <nav className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 mb-12">
            <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-wider mb-3">Contents</h2>
            <ol className="space-y-2 text-sm">
              {[
                'Average Screen Time by Demographic',
                'Smartphone Usage Statistics',
                'Social Media Time',
                'Health & Mental Health Impact',
                'Productivity & Economic Cost',
                'Relationships & Family Impact',
                'Screen Time & Addiction',
                'Recovery & Accountability',
              ].map((title, i) => (
                <li key={i}>
                  <a href={`#section-${i + 1}`} className="text-stone-300 hover:text-cyan-400 transition-colors">
                    {i + 1}. {title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* Section 1: Average Screen Time */}
          <section id="section-1" className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-cyan-400">1.</span> Average Screen Time by Demographic
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard stat="6h 58m" label="Global daily average (adults)" source="DataReportal 2026" />
              <StatCard stat="7h 22m" label="US daily average" source="eMarketer 2025" />
              <StatCard stat="8h 39m" label="Ages 18-24" source="Common Sense Media" color="text-amber-400" />
              <StatCard stat="4h 33m" label="Ages 55+" source="Pew Research 2025" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <StatCard stat="9h 49m" label="US teenagers (8-18)" source="Common Sense Media 2024" color="text-red-400" />
              <StatCard stat="5h 33m" label="US tweens (8-12)" source="Common Sense Media 2024" color="text-amber-400" />
              <StatCard stat="3h 12m" label="Children under 8" source="AAP 2025" />
            </div>
            <CiteBox text="According to Be Candid's compilation of 2026 data, the average US adult spends 7 hours and 22 minutes per day on screens, with 18-24 year olds averaging 8 hours and 39 minutes. (Source: becandid.io/research/screen-time-statistics)" />
          </section>

          {/* Section 2: Smartphone Usage */}
          <section id="section-2" className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-cyan-400">2.</span> Smartphone Usage Statistics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard stat="96x" label="Daily phone pickups (average)" source="Asurion 2024" />
              <StatCard stat="4h 37m" label="Daily smartphone use" source="App Annie 2025" />
              <StatCard stat="88%" label="Check phone within 10 min of waking" source="Reviews.org 2025" />
              <StatCard stat="71%" label="Sleep with phone within reach" source="Gallup 2024" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <StatCard stat="2,617" label="Daily screen touches" source="Dscout Research" />
              <StatCard stat="58%" label="Have tried to reduce phone use" source="Pew Research 2025" />
              <StatCard stat="31%" label="Describe themselves as phone addicted" source="Gallup 2024" color="text-amber-400" />
            </div>
            <CiteBox text="The average person picks up their phone 96 times per day and touches their screen 2,617 times daily. 31% of Americans describe themselves as addicted to their phones. (Source: becandid.io/research/screen-time-statistics)" />
          </section>

          {/* Section 3: Social Media */}
          <section id="section-3" className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-cyan-400">3.</span> Social Media Time
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard stat="2h 24m" label="Daily social media (global)" source="DataReportal 2026" />
              <StatCard stat="2h 42m" label="US daily social media" source="eMarketer 2025" />
              <StatCard stat="3h 11m" label="Gen Z daily social media" source="Morning Consult 2025" color="text-amber-400" />
              <StatCard stat="6.7" label="Average platforms per person" source="GWI 2025" />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <StatCard stat="39%" label="Say social media is bad for society" source="Pew Research 2025" />
              <StatCard stat="64%" label="Of teens say they spend too much time on social media" source="Common Sense Media" color="text-amber-400" />
            </div>
          </section>

          {/* Section 4: Health Impact */}
          <section id="section-4" className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-cyan-400">4.</span> Health & Mental Health Impact
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <StatCard stat="49%" label="Report anxiety linked to phone use" source="APA 2025" color="text-red-400" />
              <StatCard stat="33%" label="Of teens feel anxious without their phone" source="Pew Research 2024" color="text-amber-400" />
              <StatCard stat="2x" label="Depression risk with 6+ hours screen time" source="JAMA Pediatrics 2024" color="text-red-400" />
              <StatCard stat="43%" label="Report disrupted sleep from screens" source="National Sleep Foundation" />
              <StatCard stat="70%" label="Use phone as first and last activity of day" source="IDC Research" />
              <StatCard stat="28%" label="Report physical pain from device use" source="ACA 2025" />
            </div>
            <CiteBox text="Research published in JAMA Pediatrics found that individuals with 6+ hours of daily screen time face double the risk of depression. 49% of Americans report anxiety symptoms linked to phone use. (Source: becandid.io/research/screen-time-statistics)" />
          </section>

          {/* Section 5: Productivity */}
          <section id="section-5" className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-cyan-400">5.</span> Productivity & Economic Cost
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard stat="$997B" label="Annual US productivity loss from distractions" source="Zippia 2025" color="text-red-400" />
              <StatCard stat="23 min" label="Time to refocus after phone interruption" source="UC Irvine Research" />
              <StatCard stat="2.5h" label="Daily personal phone use at work" source="Udemy Workplace Report" color="text-amber-400" />
              <StatCard stat="89%" label="Of workers admit to daily phone distractions" source="CareerBuilder" />
            </div>
          </section>

          {/* Section 6: Relationships */}
          <section id="section-6" className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-cyan-400">6.</span> Relationships & Family Impact
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <StatCard stat="75%" label="Say phones hurt family time" source="Common Sense Media" color="text-amber-400" />
              <StatCard stat="44%" label="Of partners feel ignored due to phone use" source="Baylor University" />
              <StatCard stat="36%" label="Have argued about phone use with partner" source="Pew Research 2024" />
              <StatCard stat="67%" label="Of parents worry about child screen time" source="APA 2025" />
              <StatCard stat="56%" label="Check phone during meals with family" source="Deloitte Digital" />
              <StatCard stat="32%" label="Of couples have secret social media accounts" source="RebootFoundation" color="text-red-400" />
            </div>
            <CiteBox text="75% of families report that phone use negatively impacts quality time together. 44% of partners report feeling ignored due to their significant other's phone use. (Source: becandid.io/research/screen-time-statistics)" />
          </section>

          {/* Section 7: Addiction */}
          <section id="section-7" className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-cyan-400">7.</span> Screen Time & Addiction
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <StatCard stat="210M" label="People globally with internet addiction" source="WHO 2025 Estimate" color="text-red-400" />
              <StatCard stat="50%" label="Of teens feel addicted to devices" source="Common Sense Media" color="text-amber-400" />
              <StatCard stat="6-8%" label="Internet addiction prevalence (adults)" source="Lancet Digital Health" />
              <StatCard stat="87%" label="Check phone with no notification" source="AAPP Research" />
              <StatCard stat="47%" label="Have tried a digital detox" source="Reviews.org 2025" />
              <StatCard stat="72%" label="Of detox attempts fail within a week" source="Digital Wellness Institute" color="text-red-400" />
            </div>
          </section>

          {/* Section 8: Recovery */}
          <section id="section-8" className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-cyan-400">8.</span> Recovery & Accountability
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <StatCard stat="65%" label="Higher success rate with accountability partner" source="ASTD Research" color="text-emerald-400" />
              <StatCard stat="95%" label="Goal achievement rate with scheduled check-ins" source="ATD 2023" color="text-emerald-400" />
              <StatCard stat="42%" label="Report improved relationships after reducing screen time" source="Digital Wellness Institute" color="text-emerald-400" />
              <StatCard stat="3.2x" label="More likely to sustain change with tracking" source="Journal of Medical Internet Research" color="text-emerald-400" />
              <StatCard stat="78%" label="Say awareness of usage is the first step" source="APA 2025" color="text-cyan-400" />
              <StatCard stat="21 days" label="Average time to break a digital habit" source="European Journal of Social Psychology" />
            </div>
            <CiteBox text="People who use an accountability partner are 65% more likely to achieve their goals, and those with regular scheduled check-ins reach a 95% success rate. (Source: becandid.io/research/screen-time-statistics)" />
          </section>

          {/* Methodology */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8 mb-12">
            <h2 className="text-lg font-semibold text-white mb-3">Methodology & Sources</h2>
            <p className="text-sm text-stone-400 leading-relaxed mb-4">
              This page compiles statistics from peer-reviewed research, government agencies, and established
              research organizations. All figures are from the most recent available data as of April 2026.
              Where 2026 data is not yet available, the most recent year is noted.
            </p>
            <p className="text-sm text-stone-400 leading-relaxed">
              Key sources include: DataReportal, eMarketer, Common Sense Media, Pew Research Center,
              American Psychological Association, JAMA Pediatrics, Gallup, National Sleep Foundation,
              and the Digital Wellness Institute. Individual source citations appear with each statistic.
            </p>
          </section>

          {/* CTA */}
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.04] p-8 text-center">
            <h3 className="text-xl font-semibold text-white mb-2">See your own screen time story</h3>
            <p className="text-stone-400 text-sm mb-6">
              Try our free Screen Time Calculator to find out how these statistics apply to your life.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/tools/screen-time-calculator"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold transition-colors"
              >
                Screen Time Calculator
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white hover:bg-white/[0.05] font-medium transition-colors"
              >
                Start for free
              </Link>
            </div>
          </div>
        </article>
      </main>
    </>
  );
}
