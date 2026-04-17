import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import { faqSchema, breadcrumbSchema } from '@/lib/structuredData';

export const metadata: Metadata = {
  title: 'Free Digital Wellness Tools — Be Candid',
  description: 'Free tools to understand your screen habits, test your accountability readiness, and check how digital life affects your relationships.',
  keywords: ['free digital wellness tools', 'screen time calculator', 'accountability quiz', 'relationship health check', 'embeddable wellness tools'],
  alternates: { canonical: 'https://becandid.io/tools' },
  openGraph: {
    title: 'Free Digital Wellness Tools — Be Candid',
    description: 'Free tools to understand your screen habits, test your accountability readiness, and check how digital life affects your relationships.',
    url: 'https://becandid.io/tools',
    type: 'website',
    images: [{ url: 'https://becandid.io/api/og?title=Free%20Digital%20Wellness%20Tools&subtitle=Know%20yourself.%20Change%20your%20habits.', width: 1200, height: 630 }],
  },
};

const tools = [
  {
    title: 'Screen Time Calculator',
    description: 'Find out how many years of your life you\'ll spend staring at screens — and what you could do with that time instead.',
    href: '/tools/screen-time-calculator',
    icon: '📱',
    tag: 'Most Popular',
  },
  {
    title: 'Accountability Readiness Quiz',
    description: 'Are you ready for real accountability? 8 questions that reveal whether you\'re prepared to make lasting change.',
    href: '/tools/accountability-quiz',
    icon: '🎯',
    tag: 'Quick Quiz',
  },
  {
    title: 'Relationship Health Check',
    description: 'How are your digital habits affecting your closest relationships? A quick check across trust, communication, and boundaries.',
    href: '/tools/relationship-health',
    icon: '💛',
    tag: 'For Couples',
  },
  {
    title: 'Phone Addiction Severity Assessment',
    description: 'A 10-question validated-style assessment measuring compulsive phone use. Get your severity score and a personalized next step.',
    href: '/tools/phone-addiction-severity',
    icon: '📊',
    tag: 'Assessment',
  },
  {
    title: 'Couple\'s Digital Trust Calculator',
    description: '12 questions for couples to measure digital trust. Score, percentile, and the areas most worth focusing on first.',
    href: '/tools/digital-trust-calculator',
    icon: '🤝',
    tag: 'For Couples',
  },
  {
    title: 'Digital Shadow Self Discovery',
    description: 'Which shadow pattern runs your scroll? Find your archetype — Numb-er, Performer, Escaper, or Controller — in 8 questions.',
    href: '/tools/digital-shadow-self',
    icon: '🪞',
    tag: 'Stringer Framework',
  },
];

const faqItems = [
  { q: 'Are these tools free?', a: 'Yes, all tools are completely free to use. No account required.' },
  { q: 'Can I embed these tools on my website?', a: 'Absolutely. Each tool includes an embed code you can copy and paste into any website or blog.' },
  { q: 'Is my data saved?', a: 'No. All calculations happen in your browser. We don\'t store any of your answers or results.' },
  { q: 'Can I share my results?', a: 'Yes. Each tool generates a unique shareable link with your results, complete with a preview image for social media.' },
];

export default function ToolsIndexPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: 'Home', url: 'https://becandid.io' }, { name: 'Tools', url: 'https://becandid.io/tools' }])} />
      <JsonLd data={faqSchema(faqItems)} />
      <main className="pt-28 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Free Digital Wellness Tools
            </h1>
            <p className="text-lg text-stone-400 max-w-2xl mx-auto">
              Know yourself. Understand your habits. Share what you discover.
              All tools are free, private, and embeddable.
            </p>
          </div>

          {/* Tool Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group block rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.06] hover:border-cyan-500/30 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{tool.icon}</span>
                  <span className="text-xs font-medium text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full">
                    {tool.tag}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                  {tool.title}
                </h2>
                <p className="text-sm text-stone-400 leading-relaxed">
                  {tool.description}
                </p>
                <div className="mt-4 text-sm font-medium text-cyan-400 flex items-center gap-1">
                  Try it free
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </div>
              </Link>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4 max-w-2xl mx-auto">
              {faqItems.map((item) => (
                <details key={item.q} className="group rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
                  <summary className="px-6 py-4 cursor-pointer text-white font-medium flex items-center justify-between">
                    {item.q}
                    <span className="material-symbols-outlined text-stone-500 group-open:rotate-180 transition-transform">
                      expand_more
                    </span>
                  </summary>
                  <div className="px-6 pb-4 text-stone-400 text-sm leading-relaxed">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>

          {/* Embed CTA */}
          <div className="mt-16 text-center rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.04] p-8">
            <h3 className="text-xl font-semibold text-white mb-2">Run a wellness blog or therapy practice?</h3>
            <p className="text-stone-400 text-sm mb-4">
              Embed any of these tools on your site for free. Each tool includes a copy-paste embed code.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
