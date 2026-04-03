import { getAllBlogPosts } from '@/content/blog/loader';

const BLOG_POSTS = getAllBlogPosts();
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import ShareButton from '@/components/ShareButton';
import { articleSchema } from '@/lib/structuredData';

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
        data={articleSchema({
          headline: post.title,
          description: post.description,
          datePublished: post.date,
          author: post.author,
          url: `https://becandid.io/blog/${post.slug}`,
        })}
      />

      {/* Back link */}
      <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-stone-400 hover:text-cyan-400 font-label mb-8 transition-colors">
        <span className="material-symbols-outlined text-base">arrow_back</span>
        All articles
      </Link>

      {/* Header */}
      <header className="mb-10">
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map(tag => (
            <span key={tag} className="px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[10px] font-label font-bold uppercase tracking-wider">
              {tag}
            </span>
          ))}
        </div>
        <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight text-slate-100 mb-4">
          {post.title}
        </h1>
        <div className="flex items-center gap-3 text-sm text-stone-500 font-label">
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
        className="prose prose-invert max-w-none
          prose-headings:font-headline prose-headings:tracking-tight prose-headings:text-slate-100
          prose-h2:text-xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-4
          prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-3
          prose-p:font-body prose-p:text-slate-400 prose-p:leading-relaxed prose-p:mb-4
          prose-em:text-teal-400 prose-em:not-italic prose-em:font-medium
          prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline"
        dangerouslySetInnerHTML={{ __html: post.content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').replace(/on\w+="[^"]*"/gi, '') }}
      />

      {/* Share footer */}
      <div className="mt-12 pt-8 border-t border-stone-800 flex items-center justify-between">
        <p className="text-sm text-slate-400 font-body">Found this helpful? Share it.</p>
        <ShareButton
          url={`/blog/${post.slug}`}
          title={post.title}
          text={`${post.title} — ${post.description}`}
        />
      </div>

      {/* CTA */}
      <div className="mt-12 bg-white/[0.03] backdrop-blur-sm rounded-3xl ring-1 ring-white/10 p-8 text-center relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-cyan-400/40 before:to-transparent">
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
