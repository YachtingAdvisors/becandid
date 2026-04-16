import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import PublicNav from '@/components/PublicNav';
import JsonLd from '@/components/JsonLd';
import { PERSONAS, getPersona } from '@/content/personas';
import { getAllBlogPosts } from '@/content/blog/loader';
import {
  articleSchema,
  breadcrumbSchema,
  faqSchema,
} from '@/lib/structuredData';

interface Props {
  params: Promise<{ persona: string }>;
}

export async function generateStaticParams() {
  return PERSONAS.map(p => ({ persona: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { persona: slug } = await params;
  const persona = getPersona(slug);
  if (!persona) {
    return { title: 'Persona Not Found | Be Candid' };
  }
  const title = `Accountability for ${persona.name} | Be Candid`;
  const description = `${persona.tagline} Purpose-built digital accountability for ${persona.name.toLowerCase()} — dignity-first, research-backed, no surveillance.`;
  const keywords = [
    `accountability for ${persona.name.toLowerCase()}`,
    `${persona.name.toLowerCase()} digital wellness`,
    `${persona.name.toLowerCase()} screen time`,
    `${persona.name.toLowerCase()} accountability app`,
    'Be Candid',
    'Stringer Framework',
    'digital accountability',
  ];
  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `https://becandid.io/accountability-for/${persona.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://becandid.io/accountability-for/${persona.slug}`,
      type: 'article',
      images: [{ url: persona.heroImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [persona.heroImage],
    },
  };
}

export default async function PersonaPage({ params }: Props) {
  const { persona: slug } = await params;
  const persona = getPersona(slug);
  if (!persona) notFound();

  const allPosts = getAllBlogPosts();
  const relatedPosts = persona.relatedBlogSlugs
    .map(s => allPosts.find(p => p.slug === s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const pageUrl = `https://becandid.io/accountability-for/${persona.slug}`;

  return (
    <main className="min-h-screen bg-dark-sanctuary text-white">
      <PublicNav />

      <JsonLd
        data={articleSchema({
          headline: `Accountability for ${persona.name}`,
          description: persona.tagline,
          datePublished: '2026-04-16',
          author: 'Be Candid Team',
          url: pageUrl,
          image: persona.heroImage,
          keywords: [
            `accountability for ${persona.name.toLowerCase()}`,
            'digital accountability',
            'Stringer Framework',
            'Be Candid',
          ],
          articleSection: 'Use Cases',
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://becandid.io' },
          { name: 'Accountability For', url: 'https://becandid.io/accountability-for' },
          { name: persona.name, url: pageUrl },
        ])}
      />
      <JsonLd data={faqSchema(persona.faqs)} />

      {/* Hero */}
      <section className="relative overflow-hidden pt-24 md:pt-28 pb-16">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${persona.heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-dark-sanctuary/60 via-dark-sanctuary/80 to-dark-sanctuary" />
        <div className="relative max-w-5xl mx-auto px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white font-label transition-colors group mb-6"
          >
            <span className="material-symbols-outlined text-base group-hover:-translate-x-0.5 transition-transform">
              arrow_back
            </span>
            Back to Be Candid
          </Link>
          <div className="font-label text-xs text-cyan-400/80 uppercase tracking-wider mb-3">
            Accountability For
          </div>
          <h1 className="font-headline text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight mb-4">
            Be Candid for {persona.name}
          </h1>
          <p className="font-body text-lg md:text-xl text-white/80 leading-relaxed max-w-3xl mb-8">
            {persona.tagline}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 text-dark-sanctuary font-label font-bold hover:brightness-110 transition-all shadow-lg shadow-cyan-500/20"
            >
              Start free
              <span className="material-symbols-outlined text-base">
                arrow_forward
              </span>
            </Link>
            <Link
              href="/methodology"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/[0.06] text-white ring-1 ring-white/[0.1] font-label font-bold hover:bg-white/[0.1] transition-all"
            >
              See our methodology
            </Link>
          </div>
        </div>
      </section>

      {/* Why Be Candid for [Persona] — intro strip */}
      <section className="max-w-4xl mx-auto px-6 -mt-4 mb-16">
        <div className="bg-white/[0.03] rounded-3xl ring-1 ring-white/[0.08] p-8 md:p-10">
          <h2 className="font-headline text-2xl md:text-3xl font-bold text-white mb-4">
            Why Be Candid for {persona.name}
          </h2>
          <p className="font-body text-white/80 text-base md:text-lg leading-relaxed">
            {persona.name} face a specific shape of digital compulsion that generic
            accountability apps miss. Be Candid was designed around real clinical
            research and real human dignity — not a 1998 surveillance playbook.
            Below, the challenges we{"'"}ve heard most often from {persona.name.toLowerCase()} who
            use Be Candid, and the specific ways the product responds.
          </p>
        </div>
      </section>

      {/* Challenges */}
      <section className="max-w-4xl mx-auto px-6 mb-16">
        <h2 className="font-headline text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined text-cyan-400/70 text-3xl">
            report
          </span>
          The challenges {persona.name.toLowerCase()} face
        </h2>
        <ul className="space-y-4">
          {persona.challenges.map((c, i) => (
            <li
              key={i}
              className="bg-white/[0.03] rounded-2xl ring-1 ring-white/[0.06] p-5 md:p-6 flex gap-4"
            >
              <span className="shrink-0 w-8 h-8 rounded-full bg-cyan-400/10 ring-1 ring-cyan-400/30 flex items-center justify-center text-cyan-300 font-bold text-sm">
                {i + 1}
              </span>
              <p className="font-body text-white/80 text-base leading-relaxed">
                {c}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* How Be Candid Helps */}
      <section className="max-w-4xl mx-auto px-6 mb-16">
        <h2 className="font-headline text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined text-teal-400/70 text-3xl">
            lightbulb
          </span>
          How Be Candid helps
        </h2>
        <ul className="space-y-4">
          {persona.howBeCandidHelps.map((h, i) => (
            <li
              key={i}
              className="bg-gradient-to-br from-cyan-400/[0.04] to-teal-400/[0.04] rounded-2xl ring-1 ring-cyan-400/[0.12] p-5 md:p-6 flex gap-4"
            >
              <span className="shrink-0 w-8 h-8 rounded-full bg-teal-400/15 ring-1 ring-teal-400/30 flex items-center justify-center text-teal-300">
                <span className="material-symbols-outlined text-lg">check</span>
              </span>
              <p className="font-body text-white/85 text-base leading-relaxed">
                {h}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Key features grid */}
      <section className="max-w-5xl mx-auto px-6 mb-16">
        <h2 className="font-headline text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined text-cyan-400/70 text-3xl">
            auto_awesome
          </span>
          Key features for {persona.name.toLowerCase()}
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {persona.relevantFeatures.map((f, i) => (
            <div
              key={i}
              className="bg-white/[0.03] rounded-2xl ring-1 ring-white/[0.06] p-5 hover:bg-white/[0.05] transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-cyan-400/70 text-2xl">
                  verified
                </span>
                <p className="font-body text-white/85 text-base leading-relaxed font-medium">
                  {f}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial */}
      {persona.testimonial && (
        <section className="max-w-4xl mx-auto px-6 mb-16">
          <blockquote className="bg-gradient-to-br from-cyan-500/[0.08] to-teal-500/[0.08] rounded-3xl ring-1 ring-cyan-400/[0.15] p-8 md:p-12">
            <span className="material-symbols-outlined text-cyan-400/40 text-5xl block mb-3">
              format_quote
            </span>
            <p className="font-body text-white/90 text-lg md:text-xl leading-relaxed italic mb-6">
              {persona.testimonial.quote}
            </p>
            <footer className="font-label text-sm">
              <div className="text-white font-semibold">
                {persona.testimonial.name}
              </div>
              <div className="text-white/50">{persona.testimonial.role}</div>
            </footer>
          </blockquote>
        </section>
      )}

      {/* Related articles */}
      {relatedPosts.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 mb-16">
          <h2 className="font-headline text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-cyan-400/70 text-3xl">
              auto_stories
            </span>
            Related reading
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {relatedPosts.map(post => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group bg-white/[0.03] rounded-2xl ring-1 ring-white/[0.06] p-6 hover:bg-white/[0.06] hover:ring-cyan-400/30 transition-all"
              >
                <div className="font-label text-xs text-cyan-400/70 uppercase tracking-wider mb-2">
                  {post.readTime}
                </div>
                <h3 className="font-headline text-lg font-bold text-white mb-2 leading-snug group-hover:text-cyan-200 transition-colors">
                  {post.title}
                </h3>
                <p className="font-body text-white/60 text-sm leading-relaxed line-clamp-3">
                  {post.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-6 mb-16">
        <h2 className="font-headline text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined text-cyan-400/70 text-3xl">
            help
          </span>
          Frequently asked questions
        </h2>
        <div className="space-y-3">
          {persona.faqs.map((faq, i) => (
            <details
              key={i}
              className="group bg-white/[0.03] rounded-2xl ring-1 ring-white/[0.06] p-5 md:p-6 open:bg-white/[0.05] open:ring-cyan-400/20"
            >
              <summary className="flex items-start justify-between gap-4 cursor-pointer list-none">
                <h3 className="font-headline text-base md:text-lg font-bold text-white leading-snug">
                  {faq.q}
                </h3>
                <span className="shrink-0 material-symbols-outlined text-cyan-400/70 group-open:rotate-180 transition-transform">
                  expand_more
                </span>
              </summary>
              <p className="font-body text-white/80 text-base leading-relaxed mt-4">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="bg-gradient-to-br from-cyan-500/15 to-teal-500/15 rounded-3xl ring-1 ring-cyan-400/20 p-10 md:p-14 text-center">
          <h2 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-3">
            Ready to start?
          </h2>
          <p className="font-body text-white/80 text-lg leading-relaxed max-w-xl mx-auto mb-8">
            Be Candid is free to start. No surveillance, no exposure, no shame — just
            the kind of accountability that actually works for {persona.name.toLowerCase()}.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 text-dark-sanctuary font-label font-bold text-base hover:brightness-110 transition-all shadow-lg shadow-cyan-500/20"
            >
              Create free account
              <span className="material-symbols-outlined text-base">
                arrow_forward
              </span>
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white/[0.08] text-white ring-1 ring-white/[0.12] font-label font-bold text-base hover:bg-white/[0.12] transition-all"
            >
              See pricing
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
