import { getAllBlogPosts } from '@/content/blog/loader';

const BLOG_POSTS = getAllBlogPosts();
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import ShareButton from '@/components/ShareButton';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BLOG_POSTS.map(post => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find(p => p.slug === slug);
  if (!post) return { title: 'Not Found' };

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = BLOG_POSTS.find(p => p.slug === slug);
  if (!post) notFound();

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          description: post.description,
          datePublished: post.date,
          author: { '@type': 'Organization', name: post.author },
          publisher: {
            '@type': 'Organization',
            name: 'Be Candid',
            url: 'https://becandid.io',
          },
        }}
      />

      {/* Back link */}
      <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary font-label mb-8 transition-colors">
        <span className="material-symbols-outlined text-base">arrow_back</span>
        All articles
      </Link>

      {/* Header */}
      <header className="mb-10">
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map(tag => (
            <span key={tag} className="px-2.5 py-0.5 rounded-full bg-primary-container/30 text-primary text-[10px] font-label font-bold uppercase tracking-wider">
              {tag}
            </span>
          ))}
        </div>
        <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface mb-4">
          {post.title}
        </h1>
        <div className="flex items-center gap-3 text-sm text-on-surface-variant font-label">
          <span>{post.author}</span>
          <span>&middot;</span>
          <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          <span>&middot;</span>
          <span>{post.readTime}</span>
          <div className="ml-auto">
            <ShareButton
              url={`/blog/${post.slug}`}
              title={post.title}
              text={`${post.title} — ${post.description}`}
              size="sm"
            />
          </div>
        </div>
      </header>

      {/* Article content */}
      <article
        className="prose prose-stone max-w-none
          prose-headings:font-headline prose-headings:tracking-tight
          prose-h2:text-xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-4
          prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-3
          prose-p:font-body prose-p:text-on-surface-variant prose-p:leading-relaxed prose-p:mb-4
          prose-em:text-primary prose-em:not-italic prose-em:font-medium
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
        dangerouslySetInnerHTML={{ __html: post.content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').replace(/on\w+="[^"]*"/gi, '') }}
      />

      {/* Share footer */}
      <div className="mt-12 pt-8 border-t border-outline-variant/20 flex items-center justify-between">
        <p className="text-sm text-on-surface-variant font-body">Found this helpful? Share it.</p>
        <ShareButton
          url={`/blog/${post.slug}`}
          title={post.title}
          text={`${post.title} — ${post.description}`}
        />
      </div>

      {/* CTA */}
      <div className="mt-12 bg-primary-container/20 rounded-3xl p-8 text-center">
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
