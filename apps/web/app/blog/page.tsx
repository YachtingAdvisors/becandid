import { BLOG_POSTS } from '@/content/blog/posts';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';

export default function BlogIndexPage() {
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
        <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface mb-3">
          Digital Wellness Insights
        </h1>
        <p className="font-body text-on-surface-variant text-lg max-w-2xl">
          Science-backed articles on breaking phone addiction, building accountability, and aligning your digital life with your values.
        </p>
      </div>

      <div className="grid gap-6">
        {BLOG_POSTS.map(post => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-6 hover:ring-primary/20 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags.map(tag => (
                <span key={tag} className="px-2.5 py-0.5 rounded-full bg-primary-container/30 text-primary text-[10px] font-label font-bold uppercase tracking-wider">
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="font-headline text-xl font-bold text-on-surface group-hover:text-primary transition-colors mb-2">
              {post.title}
            </h2>
            <p className="font-body text-sm text-on-surface-variant leading-relaxed mb-3">
              {post.description}
            </p>
            <div className="flex items-center gap-3 text-xs text-on-surface-variant font-label">
              <span>{post.author}</span>
              <span>&middot;</span>
              <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span>&middot;</span>
              <span>{post.readTime}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-16 bg-primary-container/20 rounded-3xl p-8 text-center">
        <h2 className="font-headline text-xl font-bold text-on-surface mb-2">
          Ready to align your digital life?
        </h2>
        <p className="font-body text-sm text-on-surface-variant mb-5 max-w-md mx-auto">
          Be Candid helps you build awareness and accountability — no shame, no surveillance.
        </p>
        <Link
          href="/auth/signup"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-on-primary font-label font-bold hover:brightness-110 transition-all shadow-lg shadow-primary/20"
        >
          Start Free Trial
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </Link>
      </div>
    </main>
  );
}
