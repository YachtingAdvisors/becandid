import sanitizeHtml from 'sanitize-html';
import { getAllBlogPosts, getSeoPublishedPosts } from '@/content/blog/loader';
import { getArticleImages } from '@/content/blog/images';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import ShareButton from '@/components/ShareButton';
import BlogEmailCapture from '@/components/BlogEmailCapture';
import { articleSchema, breadcrumbSchema, faqSchema } from '@/lib/structuredData';
import { extractMentions, deriveSection, computeWordCount, extractAboutTopics } from '@/lib/geo/articleEnrichment';
import { extractFaqs } from '@/lib/geo/extractFaqs';

async function getAllPosts() {
  const staticPosts = getAllBlogPosts();
  const seoPosts = await getSeoPublishedPosts();
  const slugs = new Set(staticPosts.map(p => p.slug));
  return [...staticPosts, ...seoPosts.filter(p => !slugs.has(p.slug))];
}

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return getAllBlogPosts().map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const allPosts = await getAllPosts();
  const post = allPosts.find(p => p.slug === slug);
  if (!post) return {};
  const images = getArticleImages(slug);
  return {
    title: post.title,
    description: post.description,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      url: `https://becandid.io/blog/${post.slug}`,
      images: [{ url: images.hero.url, width: 1200, height: 630, alt: images.hero.alt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [images.hero.url],
    },
    alternates: { canonical: `https://becandid.io/blog/${post.slug}` },
  };
}

function getRelatedPosts(
  currentSlug: string,
  currentTags: string[],
  allPosts: { slug: string; title: string; readTime: string; tags: string[]; description: string }[]
) {
  return allPosts
    .filter(p => p.slug !== currentSlug && p.tags.some(t => currentTags.includes(t)))
    .slice(0, 5);
}

// Insert images into article HTML content at natural paragraph breaks
function insertInlineImages(html: string, images: { url: string; alt: string; credit?: string }[]): string {
  if (!images.length) return html;

  const paragraphs = html.split('</p>');
  if (paragraphs.length < 4) return html;

  const totalParagraphs = paragraphs.length;
  // Place first image after ~30% of content, second after ~65%
  const insertPoints = [
    Math.max(2, Math.floor(totalParagraphs * 0.3)),
    Math.max(4, Math.floor(totalParagraphs * 0.65)),
  ];

  const result = paragraphs.map((p, i) => {
    const imageIndex = insertPoints.indexOf(i);
    if (imageIndex !== -1 && images[imageIndex]) {
      const img = images[imageIndex];
      return `${p}</p>
        <figure class="article-inline-image">
          <img src="${img.url}" alt="${img.alt}" loading="lazy" />
          ${img.credit ? `<figcaption>${img.credit}</figcaption>` : ''}
        </figure>`;
    }
    return i < paragraphs.length - 1 ? `${p}</p>` : p;
  });

  return result.join('');
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const allPosts = await getAllPosts();
  const post = allPosts.find(p => p.slug === slug);
  if (!post) notFound();
  const relatedPosts = getRelatedPosts(slug, post.tags, allPosts);
  const articleImages = getArticleImages(slug);

  const sanitizedContent = sanitizeHtml(post.content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'img', 'figure', 'figcaption', 'picture', 'source', 'video', 'audio',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'details', 'summary', 'mark',
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'width', 'height', 'loading', 'decoding', 'class'],
      figure: ['class'],
      figcaption: ['class'],
      a: ['href', 'target', 'rel', 'class'],
      '*': ['class', 'id'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
  });
  const contentWithImages = insertInlineImages(sanitizedContent, articleImages.inline);

  // GEO enrichment
  const mentions = extractMentions(post.content);
  const section = deriveSection(post.tags);
  const wordCount = computeWordCount(post.content);
  const aboutTopics = extractAboutTopics(post.tags);
  const faqs = extractFaqs(post.content);

  return (
    <main className="min-h-screen">
      <JsonLd
        data={articleSchema({
          headline: post.title,
          description: post.description,
          datePublished: post.date,
          author: post.author,
          url: `https://becandid.io/blog/${post.slug}`,
          image: articleImages.hero.url,
          keywords: post.tags,
          wordCount,
          articleSection: section,
          about: aboutTopics,
          mentions,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://becandid.io' },
          { name: 'Blog', url: 'https://becandid.io/blog' },
          { name: post.title, url: `https://becandid.io/blog/${post.slug}` },
        ])}
      />
      {faqs.length >= 2 && (
        <JsonLd data={faqSchema(faqs)} />
      )}

      {/* Back link - floating */}
      <div className="max-w-4xl mx-auto px-6 pt-8">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white font-label transition-colors group">
          <span className="material-symbols-outlined text-base group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
          All articles
        </Link>
      </div>

      {/* Hero section with real image */}
      <div className="relative w-full max-w-5xl mx-auto px-6 mt-6 mb-12">
        <div className="relative rounded-3xl overflow-hidden ring-1 ring-white/10" style={{ aspectRatio: '16/7' }}>
          {/* Hero image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={articleImages.hero.url}
            alt={articleImages.hero.alt}
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
          />
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

          {/* Content overlay */}
          <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.slice(0, 3).map((tag: string) => (
                <span key={tag} className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white text-[11px] font-label font-bold uppercase tracking-wider border border-white/10">
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="font-headline text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-[1.1] max-w-3xl mb-4 drop-shadow-lg">
              {post.title}
            </h1>
            <p className="font-body text-white/70 text-base md:text-lg max-w-2xl leading-relaxed mb-5">
              {post.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-white/50 font-label">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/20">
                  <span className="material-symbols-outlined text-sm text-white/70">person</span>
                </div>
                <span className="text-white/70 font-medium">{post.author}</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
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
          </div>
        </div>
      </div>

      {/* Article content */}
      <div className="max-w-3xl mx-auto px-6 pb-20">
        <article
          className="
            prose prose-lg prose-invert max-w-none

            prose-headings:font-headline prose-headings:tracking-tight prose-headings:text-white

            prose-h2:text-[1.75rem] prose-h2:md:text-3xl prose-h2:font-extrabold
            prose-h2:mt-16 prose-h2:mb-6 prose-h2:leading-tight
            prose-h2:border-l-[3px] prose-h2:border-cyan-400/40 prose-h2:pl-5

            prose-h3:text-xl prose-h3:md:text-2xl prose-h3:font-bold
            prose-h3:mt-12 prose-h3:mb-4 prose-h3:text-white/90

            prose-p:font-body prose-p:text-white/80 prose-p:text-[1.0625rem] prose-p:md:text-lg
            prose-p:leading-[1.85] prose-p:mb-6 prose-p:tracking-[0.01em]

            prose-li:text-white/80 prose-li:text-[1.0625rem] prose-li:md:text-lg prose-li:leading-[1.85]
            prose-li:marker:text-cyan-400/50

            prose-strong:text-white prose-strong:font-bold

            prose-blockquote:text-white/70 prose-blockquote:border-cyan-400/30
            prose-blockquote:bg-white/[0.03] prose-blockquote:rounded-r-xl
            prose-blockquote:py-4 prose-blockquote:pr-6 prose-blockquote:my-8
            prose-blockquote:italic prose-blockquote:text-lg

            prose-td:text-white/80 prose-th:text-white prose-th:font-bold

            prose-hr:border-white/10 prose-hr:my-12

            prose-em:text-cyan-300 prose-em:not-italic prose-em:font-medium

            prose-a:text-cyan-400 prose-a:no-underline prose-a:font-medium
            prose-a:border-b prose-a:border-cyan-400/30
            hover:prose-a:border-cyan-400 hover:prose-a:text-cyan-300
            prose-a:transition-colors

            prose-code:text-cyan-300 prose-code:bg-white/[0.06] prose-code:px-1.5 prose-code:py-0.5
            prose-code:rounded-md prose-code:text-sm prose-code:font-normal
            prose-code:before:content-none prose-code:after:content-none

            prose-img:rounded-2xl prose-img:ring-1 prose-img:ring-white/10

            [&_figure.article-inline-image]:my-10
            [&_figure.article-inline-image]:md:my-14
            [&_figure.article-inline-image_img]:w-full
            [&_figure.article-inline-image_img]:rounded-2xl
            [&_figure.article-inline-image_img]:ring-1
            [&_figure.article-inline-image_img]:ring-white/10
            [&_figure.article-inline-image_img]:shadow-2xl
            [&_figure.article-inline-image_img]:shadow-black/30
            [&_figure.article-inline-image_figcaption]:text-center
            [&_figure.article-inline-image_figcaption]:text-white/30
            [&_figure.article-inline-image_figcaption]:text-xs
            [&_figure.article-inline-image_figcaption]:font-label
            [&_figure.article-inline-image_figcaption]:mt-3
          "
          dangerouslySetInnerHTML={{ __html: contentWithImages }}
        />

        {/* Divider */}
        <div className="flex items-center gap-4 my-14">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <span className="material-symbols-outlined text-white/10 text-lg">self_improvement</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* Share footer */}
        <div className="flex items-center justify-between bg-white/[0.03] rounded-2xl ring-1 ring-white/[0.06] p-6">
          <div>
            <p className="text-sm text-white/70 font-body font-medium mb-0.5">Found this helpful?</p>
            <p className="text-xs text-white/40 font-body">Share it with someone who might need it.</p>
          </div>
          <ShareButton
            url={`/blog/${post.slug}`}
            title={post.title}
            text={`${post.title} — ${post.description}`}
          />
        </div>

        {/* Email capture */}
        <div className="mt-10">
          <BlogEmailCapture />
        </div>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-14">
            <h2 className="font-headline text-lg font-bold text-white/90 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-cyan-400/50 text-xl">auto_stories</span>
              Keep reading
            </h2>
            <div className="grid gap-3">
              {relatedPosts.map(rp => {
                const rpImages = getArticleImages(rp.slug);
                return (
                  <Link
                    key={rp.slug}
                    href={`/blog/${rp.slug}`}
                    className="group flex items-center gap-4 bg-white/[0.03] rounded-xl ring-1 ring-white/[0.06] p-4 hover:ring-cyan-400/20 hover:bg-white/[0.05] transition-all duration-200"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={rpImages.hero.url}
                      alt={rpImages.hero.alt}
                      className="w-16 h-16 rounded-lg object-cover ring-1 ring-white/10 shrink-0"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-headline text-sm font-bold text-white/80 group-hover:text-cyan-400 transition-colors line-clamp-2">
                        {rp.title}
                      </h3>
                      <span className="text-xs text-white/30 font-label mt-1 block">{rp.readTime}</span>
                    </div>
                    <span className="material-symbols-outlined text-white/20 group-hover:text-cyan-400/50 text-lg transition-colors shrink-0">arrow_forward</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-14 bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-sm rounded-3xl ring-1 ring-white/[0.08] p-10 text-center relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-400/5 rounded-full blur-3xl" />
          <h2 className="font-headline text-2xl font-bold text-white mb-3 relative">
            Ready to align your digital life?
          </h2>
          <p className="font-body text-white/50 mb-6 max-w-md mx-auto leading-relaxed relative">
            Be Candid helps you build awareness and accountability — no shame, no surveillance.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-label font-bold hover:brightness-110 transition-all shadow-lg shadow-primary/20 relative"
          >
            Start Free Trial
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
