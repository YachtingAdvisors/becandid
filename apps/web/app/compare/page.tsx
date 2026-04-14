import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import PublicNav from '@/components/PublicNav';

export const metadata: Metadata = {
  title: 'Compare Accountability Apps — Be Candid vs Competitors',
  description:
    'See how Be Candid compares to Covenant Eyes, Ever Accountable, Bark, and other accountability apps. No VPN, no surveillance, no screenshots — just real accountability.',
  alternates: { canonical: 'https://becandid.io/compare' },
  openGraph: {
    title: 'Compare Accountability Apps | Be Candid',
    description: 'Side-by-side comparison of Be Candid vs Covenant Eyes, Ever Accountable, Bark, and more.',
    url: 'https://becandid.io/compare',
    type: 'website',
  },
};

const COMPARISONS = [
  {
    competitor: 'Covenant Eyes',
    slug: '/why-becandid',
    tagline: 'No VPN. No screenshots. No surveillance.',
    problems: ['Requires always-on VPN that drains battery', 'Screenshots capture sensitive content', 'Filter-based approach treats symptoms, not causes'],
    icon: 'shield',
  },
  {
    competitor: 'Ever Accountable',
    slug: '/why-becandid',
    tagline: 'Accountability without the surveillance model.',
    problems: ['Screenshot monitoring creates shame', 'Limited to web filtering', 'No therapist integration'],
    icon: 'visibility',
  },
  {
    competitor: 'Bark',
    slug: '/why-becandid',
    tagline: 'Built for adults, not just parental controls.',
    problems: ['Designed for child monitoring', 'No accountability partner system', 'No conversation guides for growth'],
    icon: 'family_restroom',
  },
];

const BLOG_POSTS = [
  { title: 'Why Covenant Eyes Fails as Accountability Software', slug: '/blog/why-covenant-eyes-fails-accountability-software-truth' },
  { title: 'Covenant Eyes Alternatives That Actually Work', slug: '/blog/covenant-eyes-alternatives' },
  { title: 'Why Porn Blockers Don\'t Work', slug: '/blog/why-porn-blockers-dont-work' },
  { title: 'Best Christian Accountability Apps 2026', slug: '/blog/best-christian-accountability-apps-2026' },
  { title: 'Should Christians Use Accountability Apps?', slug: '/blog/should-christians-use-accountability-apps' },
];

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-dark-sanctuary">
      <PublicNav />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Compare Accountability Apps',
          description: 'Side-by-side comparison of Be Candid vs Covenant Eyes, Ever Accountable, Bark, and other accountability apps.',
          url: 'https://becandid.io/compare',
        }}
      />

      <main className="max-w-4xl mx-auto px-6 py-24">
        {/* Hero */}
        <div className="text-center mb-16">
          <p className="font-label text-xs text-primary uppercase tracking-widest mb-2">Compare</p>
          <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight text-slate-100 mb-4">
            How Be Candid Compares
          </h1>
          <p className="font-body text-lg text-slate-400 max-w-2xl mx-auto">
            Most accountability apps rely on surveillance — VPNs, screenshots, and filters.
            Be Candid takes a different approach: awareness, conversation, and genuine connection.
          </p>
        </div>

        {/* Comparison cards */}
        <div className="grid gap-6 mb-16">
          {COMPARISONS.map(c => (
            <Link
              key={c.competitor}
              href={c.slug}
              className="group bg-white/[0.03] backdrop-blur-sm rounded-2xl ring-1 ring-white/10 p-6 hover:ring-cyan-400/20 hover:shadow-lg hover:shadow-cyan-500/5 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-xl">{c.icon}</span>
                </div>
                <div className="flex-1">
                  <h2 className="font-headline text-lg font-bold text-slate-100 group-hover:text-cyan-400 transition-colors mb-1">
                    Be Candid vs {c.competitor}
                  </h2>
                  <p className="text-sm text-slate-400 font-body mb-3">{c.tagline}</p>
                  <ul className="space-y-1">
                    {c.problems.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-stone-400 font-body">
                        <span className="material-symbols-outlined text-red-400/60 text-sm mt-0.5">close</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 inline-flex items-center gap-1 text-xs text-cyan-400 font-label font-bold">
                    See full comparison
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Related articles */}
        <div className="mb-16">
          <h2 className="font-headline text-xl font-bold text-slate-100 mb-6">Related articles</h2>
          <div className="grid gap-3">
            {BLOG_POSTS.map(post => (
              <Link
                key={post.slug}
                href={post.slug}
                className="group flex items-center gap-3 bg-white/[0.03] rounded-xl ring-1 ring-white/10 p-4 hover:ring-cyan-400/20 transition-all"
              >
                <span className="material-symbols-outlined text-cyan-400/60 text-lg group-hover:text-cyan-400 transition-colors">article</span>
                <span className="font-headline text-sm font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">
                  {post.title}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-white/[0.03] backdrop-blur-sm rounded-3xl ring-1 ring-white/10 p-8 text-center relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-cyan-400/40 before:to-transparent">
          <h2 className="font-headline text-xl font-bold text-slate-100 mb-2">
            Ready to try real accountability?
          </h2>
          <p className="font-body text-sm text-slate-400 mb-5 max-w-md mx-auto">
            No VPN. No screenshots. No surveillance. Just awareness and genuine connection.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-label font-bold hover:brightness-110 transition-all shadow-lg shadow-primary/20"
          >
            Start Free Trial
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
