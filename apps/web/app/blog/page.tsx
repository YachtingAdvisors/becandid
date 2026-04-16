export const revalidate = 3600; // revalidate every hour

import { getAllBlogPosts, getSeoPublishedPosts } from '@/content/blog/loader';
import { getArticleImages } from '@/content/blog/images';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog — Digital Wellness Insights',
  description:
    'Science-backed articles on breaking phone addiction, building accountability, screen time management, and aligning your digital life with your values.',
  alternates: {
    canonical: 'https://becandid.io/blog',
  },
  openGraph: {
    title: 'Blog — Digital Wellness Insights | Be Candid',
    description:
      'Science-backed articles on breaking phone addiction, building accountability, and healthier relationships with technology.',
    url: 'https://becandid.io/blog',
    type: 'website',
  },
};

export default async function BlogIndexPage() {
  const staticPosts = getAllBlogPosts();
  const seoPosts = await getSeoPublishedPosts();
  // Merge, dedupe by slug, sort newest first
  const slugs = new Set(staticPosts.map(p => p.slug));
  const allPosts = [...staticPosts, ...seoPosts.filter(p => !slugs.has(p.slug))]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const BLOG_POSTS = allPosts;
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: 'Be Candid Blog',
          description: 'Articles on digital wellness, screen time accountability, and healthier relationships with technology.',
          url: 'https://becandid.io/blog',
        }}
      />

      <div className="mb-12">
        <p className="font-label text-xs text-primary uppercase tracking-widest mb-2">Blog</p>
        <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight text-slate-100 mb-3">
          Digital Wellness Insights
        </h1>
        <p className="font-body text-slate-400 text-lg max-w-2xl">
          Science-backed articles on breaking phone addiction, building accountability, and aligning your digital life with your values.
        </p>
      </div>

      <div className="grid gap-6">
        {BLOG_POSTS.map(post => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group bg-white/[0.03] backdrop-blur-sm rounded-2xl ring-1 ring-white/10 overflow-hidden hover:ring-1 hover:ring-cyan-400/20 hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-300"
          >
            {/* Hero image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getArticleImages(post.slug).hero.url}
              alt={getArticleImages(post.slug).hero.alt}
              width={800}
              height={400}
              loading="lazy"
              className="w-full h-48 sm:h-56 object-cover group-hover:scale-[1.02] transition-transform duration-500"
            />
            <div className="p-6">
              <div className="flex flex-wrap gap-2 mb-3">
                {post.tags.map(tag => (
                  <span key={tag} className="px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[10px] font-label font-bold uppercase tracking-wider">
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="font-headline text-xl font-bold text-white group-hover:text-cyan-400 transition-colors mb-2">
                {post.title}
              </h2>
              <p className="font-body text-sm text-white/80 leading-relaxed mb-3">
                {post.description}
              </p>
              <div className="flex items-center gap-3 text-xs text-white/50 font-label">
                <span>{post.author}</span>
                <span>&middot;</span>
                <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                <span>&middot;</span>
                <span>{post.readTime}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-16 bg-white/[0.03] backdrop-blur-sm rounded-3xl ring-1 ring-white/10 p-8 text-center relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-cyan-400/40 before:to-transparent">
        <h2 className="font-headline text-xl font-bold text-slate-100 mb-2">
          Ready to align your digital life?
        </h2>
        <p className="font-body text-sm text-slate-400 mb-5 max-w-md mx-auto">
          Be Candid helps you build awareness and accountability — no shame, no surveillance.
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
  );
}
