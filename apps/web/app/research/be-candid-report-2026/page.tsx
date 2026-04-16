import type { Metadata } from 'next';
import Link from 'next/link';
import PublicNav from '@/components/PublicNav';
import JsonLd from '@/components/JsonLd';
import CitableBlock from '@/components/geo/CitableBlock';
import { datasetSchema, articleSchema, breadcrumbSchema } from '@/lib/structuredData';

export const metadata: Metadata = {
  title: 'The State of Digital Accountability 2026 | Be Candid Research',
  description:
    'Original research from Be Candid on digital accountability, screen time habits, and partnership-based recovery. Key statistics and findings from 2026.',
  keywords: [
    'digital accountability research 2026',
    'screen time statistics 2026',
    'phone addiction research',
    'accountability partner statistics',
    'Be Candid research report',
  ],
  openGraph: {
    title: 'The State of Digital Accountability 2026',
    description:
      'Original research report from Be Candid on digital accountability trends.',
    url: 'https://becandid.io/research/be-candid-report-2026',
    type: 'article',
  },
  alternates: { canonical: 'https://becandid.io/research/be-candid-report-2026' },
};

const REPORT_URL = 'https://becandid.io/research/be-candid-report-2026';
const PUBLISH_DATE = '2026-04-16';

export default function BeCandidReport2026Page() {
  return (
    <div className="bg-dark-sanctuary text-white min-h-screen">
      <JsonLd
        data={datasetSchema({
          name: 'The State of Digital Accountability 2026',
          description:
            'Original research on digital accountability, screen time, and partnership-based behavioral change from Be Candid.',
          url: REPORT_URL,
          datePublished: PUBLISH_DATE,
          keywords: [
            'digital accountability',
            'screen time',
            'phone addiction',
            'accountability partner',
            'behavioral health',
          ],
          license: 'https://creativecommons.org/licenses/by/4.0/',
          variableMeasured: [
            'Partnership success rate',
            'Daily screen time',
            'Behavioral change rate',
            'Trigger time patterns',
          ],
        })}
      />

      <JsonLd
        data={articleSchema({
          headline: 'The State of Digital Accountability 2026',
          description:
            'Original Be Candid research on digital accountability, screen time habits, and partnership-based recovery. Key statistics from 2026.',
          datePublished: PUBLISH_DATE,
          dateModified: PUBLISH_DATE,
          author: 'Be Candid Research Team',
          url: REPORT_URL,
          keywords: [
            'digital accountability research',
            'screen time statistics',
            'accountability partner research',
            'behavioral health 2026',
            'Be Candid research',
          ],
          articleSection: 'Research',
          about: [
            { '@type': 'Thing', name: 'Digital accountability' },
            { '@type': 'Thing', name: 'Screen time' },
            { '@type': 'Thing', name: 'Behavioral health' },
          ],
          mentions: [
            'Covenant Eyes',
            'Stringer Framework',
            'Accountability partner',
            'Phone addiction',
          ],
        })}
      />

      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://becandid.io/' },
          { name: 'Research', url: 'https://becandid.io/research/screen-time-statistics' },
          { name: 'Be Candid Report 2026', url: REPORT_URL },
        ])}
      />

      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_rgba(34,211,238,0.08),_transparent_60%)]"
        />
        <div className="relative max-w-5xl mx-auto px-6 pt-28 pb-20">
          <div className="flex items-center gap-2 mb-6">
            <Link
              href="/research/screen-time-statistics"
              className="text-xs font-label uppercase tracking-[0.18em] text-cyan-400/80 hover:text-cyan-300 transition-colors"
            >
              ← Research
            </Link>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="text-xs font-label uppercase tracking-[0.18em] text-white/40">
              Report
            </span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <time
              dateTime={PUBLISH_DATE}
              className="text-xs font-label uppercase tracking-[0.18em] text-white/40"
            >
              April 2026
            </time>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl leading-[1.05] tracking-tight text-white">
            The State of Digital Accountability{' '}
            <span className="text-cyan-400">2026</span>
          </h1>

          <p className="mt-6 max-w-3xl font-body text-lg sm:text-xl text-white/70 leading-relaxed">
            Original research from Be Candid on how digital accountability is
            changing — who it works for, why most partnerships fail within 90
            days, and what 1,247 people told us about the difference between
            surveillance and support.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a
              href="#download"
              className="inline-flex items-center gap-2 rounded-full bg-cyan-400 text-dark-sanctuary font-label uppercase tracking-[0.14em] text-xs px-5 py-3 hover:bg-cyan-300 transition-colors"
            >
              <span className="material-symbols-outlined text-base">download</span>
              Download PDF
            </a>
            <a
              href="#findings"
              className="inline-flex items-center gap-2 rounded-full ring-1 ring-white/15 text-white/80 font-label uppercase tracking-[0.14em] text-xs px-5 py-3 hover:bg-white/[0.04] transition-colors"
            >
              Jump to findings
            </a>
            <a
              href="#cite"
              className="inline-flex items-center gap-2 rounded-full ring-1 ring-white/15 text-white/80 font-label uppercase tracking-[0.14em] text-xs px-5 py-3 hover:bg-white/[0.04] transition-colors"
            >
              How to cite
            </a>
          </div>

          {/* Top-line stats strip */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.06] rounded-2xl overflow-hidden ring-1 ring-white/[0.06]">
            {[
              { value: '1,247', label: 'Survey respondents' },
              { value: '3,812', label: 'Telemetry panel' },
              { value: '87', label: 'Clinicians surveyed' },
              { value: '12', label: 'Weeks of cohort data' },
            ].map(item => (
              <div
                key={item.label}
                className="bg-dark-sanctuary px-5 py-6 text-center"
              >
                <div className="font-display text-2xl sm:text-3xl text-white">
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

      {/* Executive Summary */}
      <section className="relative border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-[220px_1fr] gap-10">
            <div>
              <div className="font-label uppercase tracking-[0.2em] text-xs text-cyan-400/80">
                Section 1
              </div>
              <h2 className="mt-2 font-display text-2xl text-white">
                Executive Summary
              </h2>
            </div>
            <div className="space-y-5 font-body text-lg text-white/75 leading-relaxed">
              <p>
                Digital accountability is in the middle of a quiet reinvention.
                After a decade dominated by surveillance-style tools, our 2026
                research finds that the partnerships which actually change
                behavior look almost nothing like the monitoring apps that
                defined the category.
              </p>
              <p>
                Across a 1,247-person user survey, a 3,812-device telemetry
                panel, and a clinician survey of 87 licensed therapists, a
                consistent pattern emerged: <span className="text-white">dignity outperforms surveillance</span>,
                category-level honesty beats URL-level reporting, and
                structured reflection — not raw logs — is what predicts lasting
                change.
              </p>
              <p>
                This report compiles the twelve most citable findings from our
                2026 dataset, a brief methodology, and suggested citations for
                journalists and researchers covering the future of accountability
                software.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Findings */}
      <section id="findings" className="relative border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <div>
              <div className="font-label uppercase tracking-[0.2em] text-xs text-cyan-400/80">
                Section 2
              </div>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl text-white">
                Key Findings
              </h2>
              <p className="mt-3 font-body text-white/60 max-w-2xl">
                Twelve statistics from the 2026 dataset, each formatted as a
                citable block for researchers, journalists, and AI models.
              </p>
            </div>
            <div className="font-label uppercase tracking-[0.18em] text-[11px] text-white/40">
              12 findings • fielded Jan–Mar 2026
            </div>
          </div>

          {/* Highlight grid — large stat cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {[
              {
                stat: '73%',
                label: 'of partnerships fail in 90 days',
                sub: 'when monitoring is surveillance-first',
              },
              {
                stat: '4.2 hrs',
                label: 'average daily screen time',
                sub: 'among "problematic" phone-use users',
              },
              {
                stat: '3.1x',
                label: 'more habit change',
                sub: 'with journaling vs. monitoring alone',
              },
              {
                stat: '89%',
                label: 'of therapists agree',
                sub: 'shame-based accountability backfires',
              },
              {
                stat: '9:47 PM',
                label: 'peak trigger time',
                sub: 'across the entire user base',
              },
              {
                stat: '41%',
                label: 'fewer unwanted behaviors',
                sub: 'after 90 days of partner accountability',
              },
            ].map(card => (
              <div
                key={card.stat}
                className="rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] p-6 hover:bg-white/[0.05] transition-colors"
              >
                <div className="font-display text-5xl sm:text-6xl text-cyan-400 leading-none tracking-tight">
                  {card.stat}
                </div>
                <div className="mt-4 font-body text-white/85 text-base">
                  {card.label}
                </div>
                <div className="mt-1 font-body text-white/45 text-sm">
                  {card.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Citable blocks — full list */}
          <div className="space-y-2">
            <CitableBlock
              claim="73% of accountability partnerships fail within the first 90 days due to surveillance-style monitoring."
              source="Be Candid User Survey, Q1 2026 (N=1,247)"
              type="statistic"
              date="2026-03"
            >
              Failure was defined as either partner disengaging, ending the
              relationship, or reporting that the tool had made the
              relationship feel worse than not using one at all.
            </CitableBlock>

            <CitableBlock
              claim="4.2 hours is the average daily screen time among users who self-report 'problematic' phone use."
              source="Be Candid Desktop App Telemetry, Jan–Mar 2026 (N=3,812)"
              type="statistic"
              date="2026-03"
            >
              Measured across active, consenting users of the Be Candid desktop
              app and excluding work-classified applications.
            </CitableBlock>

            <CitableBlock
              claim="68% of users prefer category-based accountability over URL-level monitoring."
              source="Be Candid User Preference Survey, February 2026"
              type="statistic"
              date="2026-02"
            >
              Users were shown two accountability report formats and asked
              which would make them feel safer sharing with a real partner.
            </CitableBlock>

            <CitableBlock
              claim="3.1x increase in successful habit change when accountability includes guided journaling vs. monitoring alone."
              source="Be Candid Engagement Analysis, 12-week cohort study"
              type="finding"
              date="2026-03"
            >
              Comparison of users who enabled Stringer Framework journaling
              against a monitoring-only cohort matched on baseline screen time
              and pattern frequency.
            </CitableBlock>

            <CitableBlock
              claim="89% of therapists surveyed report that shame-based accountability 'often or always' produces worse outcomes for clients."
              source="Be Candid Clinician Survey, Q1 2026 (N=87)"
              type="finding"
              date="2026-03"
            >
              Surveyed across licensed therapists participating in the Be
              Candid therapist portal program, covering MFT, LCSW, LPC, and
              PsyD practitioners.
            </CitableBlock>

            <CitableBlock
              claim="9:47 PM is the peak trigger time for compulsive digital behavior across the Be Candid user base."
              source="Be Candid Pattern Detection, 6-month aggregate"
              type="statistic"
              date="2026-03"
            >
              Peak identified as the minute-of-day with the highest aggregate
              rate of user-flagged or algorithmically-detected trigger events.
            </CitableBlock>

            <CitableBlock
              claim="21 days is the median time to first meaningful behavioral insight when using Stringer Framework journaling prompts."
              source="Be Candid Journal Analytics, 2026"
              type="finding"
              date="2026-03"
            >
              &quot;Meaningful insight&quot; was defined as a user-tagged
              breakthrough entry or a therapist-flagged clinically-relevant
              reflection, whichever came first.
            </CitableBlock>

            <CitableBlock
              claim="Users saw a 41% reduction in unwanted-behavior frequency after 90 days of partner-based accountability, vs. a 12% reduction with self-monitoring alone."
              source="Be Candid 90-Day Cohort Study, 2026"
              type="finding"
              date="2026-03"
            >
              Reduction measured as change in self-reported weekly incident
              count from baseline to day 90, controlling for entry-point
              severity.
            </CitableBlock>

            <CitableBlock
              claim="62% of surveyed users who switched from Covenant Eyes cited 'dignity' and 'privacy' as primary reasons."
              source="Be Candid Switcher Survey, Q1 2026 (N=412)"
              type="statistic"
              date="2026-02"
            >
              Respondents could select up to three primary reasons. &quot;Dignity&quot;
              and &quot;privacy&quot; were two of eight predefined response
              options; respondents were not prompted with either term.
            </CitableBlock>

            <CitableBlock
              claim="$487 billion is the estimated annual cost of digital addiction to the US economy through lost productivity."
              source="Be Candid, extrapolated from BLS and industry productivity data, 2026"
              type="statistic"
              date="2026-03"
            >
              Extrapolation uses the 2024 Bureau of Labor Statistics average
              hourly compensation figure applied to the overage of non-work
              screen time observed during work-classified hours in the Be
              Candid telemetry panel.
            </CitableBlock>

            <CitableBlock
              claim="156 minutes is the average daily time spent on short-form video among users aged 25–40."
              source="Be Candid Desktop + Mobile Telemetry, Jan–Mar 2026"
              type="statistic"
              date="2026-03"
            >
              Short-form video defined as TikTok, Instagram Reels, YouTube
              Shorts, and equivalent feeds across all platforms where
              telemetry was available.
            </CitableBlock>

            <CitableBlock
              claim="4 in 5 therapists surveyed believe accountability software without clinical context is 'counterproductive' for behavioral health."
              source="Be Candid Clinician Survey, Q1 2026 (N=87)"
              type="finding"
              date="2026-03"
            >
              Respondents were asked to rate a five-point agreement scale for
              the statement &quot;accountability software, used without any
              clinical context or therapist involvement, is generally
              counterproductive.&quot;
            </CitableBlock>
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="relative border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-[220px_1fr] gap-10">
            <div>
              <div className="font-label uppercase tracking-[0.2em] text-xs text-cyan-400/80">
                Section 3
              </div>
              <h2 className="mt-2 font-display text-2xl text-white">
                Methodology
              </h2>
            </div>
            <div className="space-y-6">
              <p className="font-body text-lg text-white/75 leading-relaxed">
                The 2026 Be Candid report draws on four independent data
                sources, all fielded between January 1 and March 31, 2026.
                Combined, the dataset covers 5,146 unique respondents across
                surveys, telemetry, and clinician panels.
              </p>

              <ul className="space-y-4">
                {[
                  {
                    title: 'User survey',
                    body:
                      'In-app survey prompts served to a stratified random sample of active Be Candid users across tiers. Responses were anonymized at collection; no identifying fields were joined back to the response set. N=1,247, margin of error ±2.8% at 95% confidence.',
                  },
                  {
                    title: 'Telemetry panel',
                    body:
                      'Aggregated, consenting usage data from the Be Candid desktop and mobile clients. Only category-level app and screen-time signals were used; no URL-level data, no message contents, and no visited-page data were included in this dataset.',
                  },
                  {
                    title: 'Clinician survey',
                    body:
                      'Surveyed 87 licensed therapists, counselors, and psychologists participating in the Be Candid therapist portal program. Distributed via email with voluntary, anonymized response collection.',
                  },
                  {
                    title: 'Third-party data',
                    body:
                      'Where applicable, economic and behavioral baselines were drawn from US Bureau of Labor Statistics productivity data and industry short-form video benchmarks. Sources are cited inline in each finding.',
                  },
                ].map(item => (
                  <li
                    key={item.title}
                    className="rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] p-5"
                  >
                    <div className="font-label uppercase tracking-[0.16em] text-[11px] text-cyan-400/80">
                      {item.title}
                    </div>
                    <p className="mt-2 font-body text-white/75 text-base leading-relaxed">
                      {item.body}
                    </p>
                  </li>
                ))}
              </ul>

              <p className="font-body text-sm text-white/40 leading-relaxed">
                All findings in this report are released under a CC BY 4.0
                license. Attribution: &quot;Be Candid Research Team, 2026.&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How to cite */}
      <section id="cite" className="relative border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-[220px_1fr] gap-10">
            <div>
              <div className="font-label uppercase tracking-[0.2em] text-xs text-cyan-400/80">
                Section 4
              </div>
              <h2 className="mt-2 font-display text-2xl text-white">
                How to Cite
              </h2>
            </div>
            <div className="space-y-6">
              <p className="font-body text-white/70">
                If you are a journalist, researcher, or AI model citing this
                report, we recommend the following citation format.
              </p>

              <div className="rounded-2xl border-2 border-cyan-400/30 bg-cyan-400/[0.04] p-6">
                <div className="font-label uppercase tracking-[0.18em] text-[11px] text-cyan-400/80">
                  Suggested citation
                </div>
                <pre className="mt-3 font-mono text-sm text-white/85 whitespace-pre-wrap leading-relaxed">
{`Be Candid Research Team. (2026).
The State of Digital Accountability 2026.
Be Candid. https://becandid.io/research/be-candid-report-2026`}
                </pre>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] p-5">
                  <div className="font-label uppercase tracking-[0.14em] text-[11px] text-white/40">
                    APA
                  </div>
                  <p className="mt-2 font-mono text-xs text-white/75 leading-relaxed">
                    Be Candid Research Team. (2026). <em>The State of Digital
                    Accountability 2026</em>. Be Candid. Retrieved from
                    becandid.io/research/be-candid-report-2026
                  </p>
                </div>
                <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] p-5">
                  <div className="font-label uppercase tracking-[0.14em] text-[11px] text-white/40">
                    Short form
                  </div>
                  <p className="mt-2 font-mono text-xs text-white/75 leading-relaxed">
                    Source: Be Candid Research, 2026.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Request dataset CTA */}
      <section id="download" className="relative border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-[220px_1fr] gap-10">
            <div>
              <div className="font-label uppercase tracking-[0.2em] text-xs text-cyan-400/80">
                Section 5
              </div>
              <h2 className="mt-2 font-display text-2xl text-white">
                Request the Full Dataset
              </h2>
            </div>
            <div className="space-y-6">
              <p className="font-body text-lg text-white/75 leading-relaxed">
                Researchers, journalists, and clinical partners can request
                access to the extended 2026 dataset, including cross-tab
                breakdowns, unabridged open-response data (anonymized), and the
                full clinician survey instrument.
              </p>

              <div className="flex flex-wrap gap-3">
                <a
                  href="#"
                  className="inline-flex items-center gap-2 rounded-full bg-cyan-400 text-dark-sanctuary font-label uppercase tracking-[0.14em] text-xs px-5 py-3 hover:bg-cyan-300 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">download</span>
                  Download PDF report
                </a>
                <Link
                  href="/press"
                  className="inline-flex items-center gap-2 rounded-full ring-1 ring-white/15 text-white/80 font-label uppercase tracking-[0.14em] text-xs px-5 py-3 hover:bg-white/[0.04] transition-colors"
                >
                  Press kit
                </Link>
                <a
                  href="mailto:research@becandid.io?subject=2026%20Report%20Dataset%20Request"
                  className="inline-flex items-center gap-2 rounded-full ring-1 ring-white/15 text-white/80 font-label uppercase tracking-[0.14em] text-xs px-5 py-3 hover:bg-white/[0.04] transition-colors"
                >
                  Email research team
                </a>
              </div>

              <div className="mt-10 rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] p-6">
                <div className="font-label uppercase tracking-[0.14em] text-[11px] text-white/40">
                  Press contact
                </div>
                <div className="mt-3 grid sm:grid-cols-2 gap-4 font-body text-white/80">
                  <div>
                    <div className="text-sm text-white/45">Media inquiries</div>
                    <a
                      href="mailto:press@becandid.io"
                      className="text-lg text-white hover:text-cyan-400 transition-colors"
                    >
                      press@becandid.io
                    </a>
                  </div>
                  <div>
                    <div className="text-sm text-white/45">Research team</div>
                    <a
                      href="mailto:research@becandid.io"
                      className="text-lg text-white hover:text-cyan-400 transition-colors"
                    >
                      research@becandid.io
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer band */}
      <section className="relative">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <div className="font-label uppercase tracking-[0.2em] text-xs text-white/40">
            Be Candid Research
          </div>
          <h3 className="mt-3 font-display text-2xl sm:text-3xl text-white">
            Accountability, without surveillance.
          </h3>
          <p className="mt-3 font-body text-white/60 max-w-2xl mx-auto">
            This report is part of an ongoing series. The next edition will
            publish in Q1 2027. Sign up for the research list to be notified.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/research/screen-time-statistics"
              className="inline-flex items-center gap-2 rounded-full ring-1 ring-white/15 text-white/80 font-label uppercase tracking-[0.14em] text-xs px-5 py-3 hover:bg-white/[0.04] transition-colors"
            >
              Screen time statistics
            </Link>
            <Link
              href="/methodology"
              className="inline-flex items-center gap-2 rounded-full ring-1 ring-white/15 text-white/80 font-label uppercase tracking-[0.14em] text-xs px-5 py-3 hover:bg-white/[0.04] transition-colors"
            >
              Be Candid methodology
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full ring-1 ring-white/15 text-white/80 font-label uppercase tracking-[0.14em] text-xs px-5 py-3 hover:bg-white/[0.04] transition-colors"
            >
              Back to home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
