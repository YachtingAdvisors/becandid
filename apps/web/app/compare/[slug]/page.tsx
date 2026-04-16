import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import PublicNav from '@/components/PublicNav';
import JsonLd from '@/components/JsonLd';

interface ComparisonFeature {
  feature: string;
  becandid: string;
  competitor: string;
}

interface ComparisonData {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  competitorDescription: string;
  idealFor: string;
  competitorIdealFor: string;
  features: ComparisonFeature[];
  becandidAdvantages: string[];
  competitorAdvantages: string[];
  verdict: string;
}

const COMPARISONS: Record<string, ComparisonData> = {
  'covenant-eyes': {
    name: 'Covenant Eyes',
    slug: 'covenant-eyes',
    tagline: 'Accountability, not surveillance',
    description: 'Be Candid uses AI-powered behavioral pattern recognition and guided journaling instead of raw screenshot monitoring. Your accountability partner sees insights and patterns — not your browsing history.',
    competitorDescription: 'Covenant Eyes is a screen accountability tool that takes periodic screenshots of your activity and sends them to an accountability partner for review.',
    idealFor: 'People who want to understand and change their behavioral patterns through self-awareness, journaling, and consent-based sharing.',
    competitorIdealFor: 'People who prefer direct monitoring with screenshot-based accountability and don\'t mind their partner seeing raw screen captures.',
    features: [
      { feature: 'Monitoring Approach', becandid: 'AI pattern recognition — detects behavioral trends', competitor: 'Periodic screenshots sent to partner' },
      { feature: 'Privacy Model', becandid: 'Consent-based: you choose what to share', competitor: 'All screenshots visible to accountability partner' },
      { feature: 'Journaling', becandid: 'Built-in guided journal with mood tracking', competitor: 'Not included' },
      { feature: 'Therapist Integration', becandid: 'Full therapist portal with session prep AI', competitor: 'Not available' },
      { feature: 'Conversation Guides', becandid: 'Evidence-based prompts for difficult conversations', competitor: 'Not included' },
      { feature: 'Encryption', becandid: '256-bit encryption, HIPAA-ready', competitor: 'Standard encryption' },
      { feature: 'Streak & Reputation System', becandid: 'Gamified progress tracking with milestones', competitor: 'Basic usage reports' },
      { feature: 'Mobile App', becandid: 'iOS & Android + Desktop', competitor: 'iOS & Android + Desktop' },
      { feature: 'Pricing', becandid: 'Free tier available, Pro from $7.99/mo', competitor: 'From $16.99/mo' },
    ],
    becandidAdvantages: [
      'Privacy-first: partners see patterns and insights, not raw screenshots',
      'Built-in journaling and mood tracking for self-reflection',
      'Therapist portal with AI-powered session prep',
      'Gamified accountability with streaks and reputation points',
      'Free tier available — no upfront commitment',
    ],
    competitorAdvantages: [
      'Longer track record — established in 2000',
      'Direct screenshot monitoring for maximum transparency',
      'Strong faith-based community and resources',
    ],
    verdict: 'Choose Be Candid if you want accountability that helps you understand your patterns and grow, with privacy controls and therapist support. Choose Covenant Eyes if you specifically want screenshot-based monitoring where your partner sees exactly what\'s on your screen.',
  },
  'ever-accountable': {
    name: 'Ever Accountable',
    slug: 'ever-accountable',
    tagline: 'Deeper insights, not just reports',
    description: 'Be Candid goes beyond activity reports with AI-powered pattern recognition, guided journaling, and a complete behavioral health toolkit. Your growth is tracked, not just your browsing.',
    competitorDescription: 'Ever Accountable monitors internet activity and sends filtered reports to an accountability partner, categorizing content by risk level.',
    idealFor: 'People who want a holistic approach to behavioral change — combining awareness, journaling, mood tracking, and professional support.',
    competitorIdealFor: 'People who want straightforward internet accountability reports with minimal complexity.',
    features: [
      { feature: 'Monitoring Approach', becandid: 'AI behavioral pattern recognition', competitor: 'Internet activity monitoring with risk categorization' },
      { feature: 'Reports', becandid: 'Pattern insights, mood trends, behavioral analysis', competitor: 'Filtered activity reports by risk level' },
      { feature: 'Journaling', becandid: 'Guided journal with triggers, tributaries, and longings', competitor: 'Not included' },
      { feature: 'Therapist Portal', becandid: 'Full portal with granular consent controls', competitor: 'Not available' },
      { feature: 'Partner Features', becandid: 'Partner invite, consent toggles, conversation guides', competitor: 'Basic accountability partner access' },
      { feature: 'Gamification', becandid: 'Streaks, reputation points, milestone badges', competitor: 'Not included' },
      { feature: 'Conversation Guides', becandid: 'AI-powered prompts for accountability conversations', competitor: 'Not included' },
      { feature: 'Pricing', becandid: 'Free tier, Pro $7.99/mo, Therapy $19.99/mo', competitor: 'From $7.99/mo' },
    ],
    becandidAdvantages: [
      'Complete behavioral health toolkit beyond just monitoring',
      'Guided journaling helps process triggers and emotions',
      'Therapist integration with HIPAA-ready audit logging',
      'Gamified accountability keeps you engaged long-term',
      'Consent-based sharing — you control what your partner sees',
    ],
    competitorAdvantages: [
      'Simpler setup — focused purely on internet monitoring',
      'Competitive base pricing',
      'Straightforward risk-level categorization',
    ],
    verdict: 'Choose Be Candid if you want to understand the why behind your habits and have tools for genuine behavioral change. Choose Ever Accountable if you want simple internet monitoring reports without the additional features.',
  },
  bark: {
    name: 'Bark',
    slug: 'bark',
    tagline: 'Built for adults, not just kids',
    description: 'Be Candid is designed for adults and couples seeking voluntary accountability. Unlike parental monitoring tools, it\'s built on consent, self-awareness, and mutual growth.',
    competitorDescription: 'Bark is a parental monitoring tool that scans children\'s texts, emails, and social media for concerning content and sends alerts to parents.',
    idealFor: 'Adults and couples who want consent-based digital accountability with journaling, therapist support, and behavioral insights.',
    competitorIdealFor: 'Parents who want to monitor their children\'s online activity and receive alerts about potentially harmful content.',
    features: [
      { feature: 'Target Audience', becandid: 'Adults & couples (voluntary)', competitor: 'Parents monitoring children' },
      { feature: 'Consent Model', becandid: 'User installs and configures their own monitoring', competitor: 'Parent installs on child\'s device' },
      { feature: 'Monitoring Approach', becandid: 'AI behavioral patterns with self-reflection tools', competitor: 'Content scanning for concerning material' },
      { feature: 'Alerts', becandid: 'Self-awareness nudges and pattern insights', competitor: 'Parent alerts for risky content' },
      { feature: 'Journaling', becandid: 'Built-in guided journal', competitor: 'Not included' },
      { feature: 'Therapist Integration', becandid: 'Full therapist portal with session prep', competitor: 'Not available' },
      { feature: 'Conversation Guides', becandid: 'Evidence-based prompts for adult conversations', competitor: 'Conversation starters for parents & kids' },
      { feature: 'Pricing', becandid: 'Free tier available', competitor: 'From $5/mo (Bark Jr) to $14/mo' },
    ],
    becandidAdvantages: [
      'Designed for adult voluntary accountability — not surveillance',
      'Consent-based: you choose to be accountable, not monitored',
      'Journaling, mood tracking, and behavioral pattern analysis',
      'Therapist integration for professional support',
      'Partner features built for adult relationships',
    ],
    competitorAdvantages: [
      'Purpose-built for child safety monitoring',
      'Scans texts, emails, and 30+ social platforms',
      'Location tracking and screen time management',
      'Lower starting price point',
    ],
    verdict: 'These are fundamentally different tools. Be Candid is for adults who voluntarily want accountability and behavioral change tools. Bark is for parents who need to monitor their children\'s online safety. If you\'re an adult looking for accountability, Be Candid is the right choice.',
  },
};

const SLUGS = Object.keys(COMPARISONS);

export function generateStaticParams() {
  return SLUGS.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const data = COMPARISONS[params.slug];
  if (!data) return {};

  const title = `Be Candid vs ${data.name} — Honest Comparison (2026)`;
  const description = `Compare Be Candid and ${data.name} side by side. Features, pricing, privacy, and who each tool is best for.`;

  return {
    title,
    description,
    alternates: { canonical: `https://becandid.io/compare/${data.slug}` },
    openGraph: {
      title,
      description,
      url: `https://becandid.io/compare/${data.slug}`,
      type: 'article',
      images: [{ url: `https://becandid.io/api/og?title=Be%20Candid%20vs%20${encodeURIComponent(data.name)}&subtitle=Honest%20Comparison%202026`, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default function ComparisonPage({ params }: { params: { slug: string } }) {
  const data = COMPARISONS[params.slug];
  if (!data) notFound();

  const otherComparisons = SLUGS.filter((s) => s !== params.slug);

  return (
    <div className="min-h-screen bg-dark-sanctuary">
      <PublicNav />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: `Be Candid vs ${data.name} — Honest Comparison`,
          description: data.description,
          datePublished: '2026-01-20',
          dateModified: '2026-04-01',
          author: { '@type': 'Organization', name: 'Be Candid' },
          publisher: { '@type': 'Organization', name: 'Be Candid', url: 'https://becandid.io' },
          mainEntityOfPage: { '@type': 'WebPage', '@id': `https://becandid.io/compare/${data.slug}` },
        }}
      />
      <main className="pt-28 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-stone-500 mb-6">
            <Link href="/compare" className="hover:text-stone-300 transition-colors">Compare</Link>
            <span>/</span>
            <span className="text-stone-300">vs {data.name}</span>
          </div>

          {/* Hero */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Be Candid vs {data.name}
          </h1>
          <p className="text-lg text-stone-400 mb-2">{data.tagline}</p>
          <p className="text-sm text-stone-500 mb-10">Updated April 2026 &middot; Honest, side-by-side comparison</p>

          {/* Overview Cards */}
          <div className="grid md:grid-cols-2 gap-4 mb-12">
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.04] p-6">
              <div className="text-xs font-medium text-cyan-400 mb-2">BE CANDID</div>
              <p className="text-sm text-stone-300 leading-relaxed mb-3">{data.description}</p>
              <p className="text-xs text-stone-500"><strong className="text-stone-400">Best for:</strong> {data.idealFor}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="text-xs font-medium text-stone-400 mb-2">{data.name.toUpperCase()}</div>
              <p className="text-sm text-stone-300 leading-relaxed mb-3">{data.competitorDescription}</p>
              <p className="text-xs text-stone-500"><strong className="text-stone-400">Best for:</strong> {data.competitorIdealFor}</p>
            </div>
          </div>

          {/* Feature Comparison Table */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden mb-12">
            <div className="grid grid-cols-3 gap-0 text-sm">
              <div className="px-4 py-3 bg-white/[0.04] font-semibold text-stone-400 border-b border-white/10">Feature</div>
              <div className="px-4 py-3 bg-cyan-500/[0.06] font-semibold text-cyan-400 border-b border-white/10">Be Candid</div>
              <div className="px-4 py-3 bg-white/[0.04] font-semibold text-stone-400 border-b border-white/10">{data.name}</div>
              {data.features.map((f, i) => (
                <>
                  <div key={`f-${i}`} className="px-4 py-3 text-stone-300 border-b border-white/5 text-xs font-medium">{f.feature}</div>
                  <div key={`b-${i}`} className="px-4 py-3 text-stone-300 border-b border-white/5 text-xs bg-cyan-500/[0.02]">{f.becandid}</div>
                  <div key={`c-${i}`} className="px-4 py-3 text-stone-400 border-b border-white/5 text-xs">{f.competitor}</div>
                </>
              ))}
            </div>
          </div>

          {/* Pros for each */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Why choose Be Candid</h3>
              <ul className="space-y-2">
                {data.becandidAdvantages.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-stone-300">
                    <span className="text-cyan-400 mt-0.5 material-symbols-outlined text-base shrink-0">check_circle</span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Why choose {data.name}</h3>
              <ul className="space-y-2">
                {data.competitorAdvantages.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-stone-300">
                    <span className="text-stone-500 mt-0.5 material-symbols-outlined text-base shrink-0">check_circle</span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Verdict */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8 mb-12">
            <h3 className="text-lg font-semibold text-white mb-3">The Verdict</h3>
            <p className="text-sm text-stone-400 leading-relaxed">{data.verdict}</p>
          </div>

          {/* CTA */}
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.04] p-8 text-center mb-12">
            <h3 className="text-xl font-semibold text-white mb-2">Ready to try Be Candid?</h3>
            <p className="text-stone-400 text-sm mb-6">
              Free 21-day trial. No credit card required.
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold transition-colors"
            >
              Start free trial
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>

          {/* Other comparisons */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Other comparisons</h3>
            <div className="flex flex-wrap gap-3">
              {otherComparisons.map((slug) => (
                <Link
                  key={slug}
                  href={`/compare/${slug}`}
                  className="px-4 py-2 rounded-lg border border-white/10 text-sm text-stone-300 hover:text-white hover:border-cyan-500/30 transition-colors"
                >
                  Be Candid vs {COMPARISONS[slug].name}
                </Link>
              ))}
              <Link
                href="/compare"
                className="px-4 py-2 rounded-lg border border-white/10 text-sm text-stone-400 hover:text-stone-300 transition-colors"
              >
                View all comparisons
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
