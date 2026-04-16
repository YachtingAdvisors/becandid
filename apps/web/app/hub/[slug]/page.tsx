import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import PublicNav from '@/components/PublicNav';
import JsonLd from '@/components/JsonLd';
import { HUBS, getHub } from '@/content/hubs';
import { getAllBlogPosts } from '@/content/blog/loader';
import { getArticleImages } from '@/content/blog/images';
import {
  collectionPageSchema,
  breadcrumbSchema,
} from '@/lib/structuredData';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return HUBS.map(hub => ({ slug: hub.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const hub = getHub(slug);
  if (!hub) {
    return {
      title: 'Hub Not Found | Be Candid',
    };
  }
  return {
    title: `${hub.title} | Be Candid`,
    description: hub.description,
    keywords: hub.keywords,
    alternates: {
      canonical: `https://becandid.io/hub/${hub.slug}`,
    },
    openGraph: {
      title: `${hub.title} | Be Candid`,
      description: hub.description,
      url: `https://becandid.io/hub/${hub.slug}`,
      type: 'website',
      images: [{ url: hub.heroImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title: hub.title,
      description: hub.description,
      images: [hub.heroImage],
    },
  };
}

export default async function HubPage({ params }: Props) {
  const { slug } = await params;
  const hub = getHub(slug);
  if (!hub) notFound();

  const allPosts = getAllBlogPosts();
  const postMap = new Map(allPosts.map(p => [p.slug, p]));

  // Build sections with resolved posts (filter missing gracefully)
  const resolvedSections = hub.sections.map(section => ({
    ...section,
    posts: section.articleSlugs
      .map(s => postMap.get(s))
      .filter((p): p is NonNullable<typeof p> => Boolean(p)),
  }));

  // Collect all resolved posts for collection schema
  const allHubPosts = resolvedSections.flatMap(s => s.posts);
  const collectionItems = allHubPosts.map(p => ({
    name: p.title,
    url: `https://becandid.io/blog/${p.slug}`,
    description: p.description,
  }));

  const introParagraphs = hub.intro.split('\n\n').filter(p => p.trim());

  return (
    <main className="min-h-screen bg-dark-sanctuary text-white">
      <PublicNav />

      <JsonLd
        data={collectionPageSchema({
          name: hub.title,
          description: hub.description,
          url: `https://becandid.io/hub/${hub.slug}`,
          items: collectionItems,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://becandid.io' },
          { name: 'Hubs', url: 'https://becandid.io/hub' },
          { name: hub.title, url: `https://becandid.io/hub/${hub.slug}` },
        ])}
      />

      {/* Hero */}
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={hub.heroImage}
            alt={hub.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-dark-sanctuary/70 via-dark-sanctuary/85 to-dark-sanctuary" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 pt-32 md:pt-40 pb-20 md:pb-28">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white font-label transition-colors group mb-8"
          >
            <span className="material-symbols-outlined text-base group-hover:-translate-x-0.5 transition-transform">
              arrow_back
            </span>
            Back to blog
          </Link>

          <div className="font-label text-xs text-cyan-400/80 uppercase tracking-[0.2em] mb-4">
            Resource Hub
          </div>
          <h1 className="font-headline text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.05] mb-5">
            {hub.title}
          </h1>
          <p className="font-body text-lg md:text-xl text-cyan-200/90 leading-relaxed max-w-3xl">
            {hub.tagline}
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="max-w-3xl mx-auto px-6 -mt-6 md:-mt-10 mb-16 md:mb-20 relative">
        <div className="bg-white/[0.04] rounded-3xl ring-1 ring-white/[0.08] p-8 md:p-10 backdrop-blur-sm">
          {introParagraphs.map((para, i) => (
            <p
              key={i}
              className="font-body text-white/80 text-base md:text-lg leading-relaxed mb-4 last:mb-0"
            >
              {para}
            </p>
          ))}
        </div>
      </section>

      {/* Sections */}
      <div className="max-w-6xl mx-auto px-6 pb-20 space-y-20 md:space-y-24">
        {resolvedSections.map((section, sIdx) => (
          <section key={sIdx} aria-labelledby={`section-${sIdx}`}>
            <div className="border-l-2 border-cyan-400/60 pl-5 mb-8 md:mb-10">
              <h2
                id={`section-${sIdx}`}
                className="font-headline text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-2"
              >
                {section.title}
              </h2>
              <p className="font-body text-white/60 text-base md:text-lg leading-relaxed max-w-2xl">
                {section.description}
              </p>
            </div>

            {section.posts.length === 0 ? (
              <p className="font-body text-white/40 text-sm italic">
                More resources coming soon.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {section.posts.map(post => {
                  const { hero } = getArticleImages(post.slug);
                  const imageUrl = post.image ?? hero.url;
                  const imageAlt = hero.alt ?? post.title;
                  return (
                    <Link
                      key={post.slug}
                      href={`/blog/${post.slug}`}
                      className="group flex flex-col bg-white/[0.03] rounded-2xl ring-1 ring-white/10 overflow-hidden hover:ring-cyan-400/40 hover:bg-white/[0.05] transition-all"
                    >
                      <div className="aspect-[16/9] overflow-hidden bg-white/5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageUrl}
                          alt={imageAlt}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-5 md:p-6 flex flex-col flex-1">
                        <h3 className="font-headline text-lg md:text-xl font-bold text-white leading-snug mb-2 group-hover:text-cyan-200 transition-colors">
                          {post.title}
                        </h3>
                        <p className="font-body text-sm text-white/60 leading-relaxed mb-4 line-clamp-3 flex-1">
                          {post.description}
                        </p>
                        <div className="flex items-center justify-between gap-3 mt-auto">
                          <span className="font-label text-xs text-white/40 uppercase tracking-wider">
                            {post.readTime}
                          </span>
                          <div className="flex flex-wrap gap-1.5 justify-end">
                            {post.tags.slice(0, 2).map(tag => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-300 text-[10px] font-label font-medium ring-1 ring-cyan-400/20"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Bottom CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-24 md:pb-32">
        <div className="bg-gradient-to-br from-cyan-500/10 via-teal-500/5 to-transparent rounded-3xl ring-1 ring-cyan-400/20 p-8 md:p-12 text-center">
          <h2 className="font-headline text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-3">
            Ready to try dignity-based accountability?
          </h2>
          <p className="font-body text-white/70 text-base md:text-lg leading-relaxed mb-7 max-w-2xl mx-auto">
            Be Candid is the accountability app built on partnership, not
            surveillance. Pattern-based insights, no screenshots, no shame.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-label font-bold hover:brightness-110 transition-all shadow-lg shadow-primary/20"
            >
              Get started free
              <span className="material-symbols-outlined text-base">
                arrow_forward
              </span>
            </Link>
            <Link
              href="/assessment"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/[0.06] ring-1 ring-white/10 text-white font-label font-bold hover:bg-white/[0.1] transition-all"
            >
              Take the assessment
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
