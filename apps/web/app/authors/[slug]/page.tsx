import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import PublicNav from '@/components/PublicNav';
import JsonLd from '@/components/JsonLd';
import { AUTHORS, getAuthor } from '@/content/authors';
import { personSchema, breadcrumbSchema } from '@/lib/structuredData';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return AUTHORS.map(author => ({ slug: author.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const author = getAuthor(slug);
  if (!author) {
    return {
      title: 'Author Not Found | Be Candid',
    };
  }
  return {
    title: `${author.name} | Be Candid`,
    description: author.bio,
    alternates: {
      canonical: `https://becandid.io/authors/${author.slug}`,
    },
    openGraph: {
      title: `${author.name} | Be Candid`,
      description: author.bio,
      url: `https://becandid.io/authors/${author.slug}`,
      type: 'profile',
      ...(author.image ? { images: [{ url: author.image }] } : {}),
    },
    twitter: {
      card: 'summary',
      title: `${author.name} | Be Candid`,
      description: author.bio,
      ...(author.image ? { images: [author.image] } : {}),
    },
  };
}

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params;
  const author = getAuthor(slug);
  if (!author) notFound();

  const initials = author.name
    .split(' ')
    .map(w => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <main className="min-h-screen bg-dark-sanctuary text-white">
      <PublicNav />

      <JsonLd
        data={personSchema({
          name: author.name,
          slug: author.slug,
          jobTitle: author.jobTitle,
          description: author.bio,
          image: author.image,
          knowsAbout: author.knowsAbout,
          alumniOf: author.alumniOf,
          sameAs: author.sameAs,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://becandid.io' },
          { name: 'Authors', url: 'https://becandid.io/authors' },
          { name: author.name, url: `https://becandid.io/authors/${author.slug}` },
        ])}
      />

      {/* Back link */}
      <div className="max-w-4xl mx-auto px-6 pt-24 md:pt-28">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white font-label transition-colors group"
        >
          <span className="material-symbols-outlined text-base group-hover:-translate-x-0.5 transition-transform">
            arrow_back
          </span>
          Back to blog
        </Link>
      </div>

      {/* Header / profile card */}
      <section className="max-w-4xl mx-auto px-6 mt-8">
        <div className="bg-white/[0.03] rounded-3xl ring-1 ring-white/[0.08] p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Headshot */}
            <div className="shrink-0">
              {author.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={author.image}
                  alt={author.name}
                  className="w-28 h-28 md:w-32 md:h-32 rounded-full ring-2 ring-cyan-400/30 object-cover"
                />
              ) : (
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-full ring-2 ring-cyan-400/30 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center">
                  <span className="font-headline text-3xl font-bold text-cyan-300">
                    {initials}
                  </span>
                </div>
              )}
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0">
              <div className="font-label text-xs text-cyan-400/70 uppercase tracking-wider mb-2">
                {author.jobTitle}
              </div>
              <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight mb-2">
                {author.name}
              </h1>
              {author.credentials && (
                <p className="font-body text-sm text-white/60 mb-0">
                  {author.credentials}
                </p>
              )}
            </div>
          </div>

          {/* Long bio */}
          <div className="mt-8 border-t border-white/[0.06] pt-8">
            <h2 className="font-label text-xs text-white/40 uppercase tracking-wider mb-3">
              About
            </h2>
            <p className="font-body text-white/80 text-base md:text-lg leading-relaxed whitespace-pre-line">
              {author.longBio}
            </p>
          </div>

          {/* Knows about */}
          {author.knowsAbout?.length > 0 && (
            <div className="mt-8 border-t border-white/[0.06] pt-8">
              <h2 className="font-label text-xs text-white/40 uppercase tracking-wider mb-3">
                Knows about
              </h2>
              <div className="flex flex-wrap gap-2">
                {author.knowsAbout.map(topic => (
                  <span
                    key={topic}
                    className="px-3 py-1.5 rounded-full bg-cyan-400/10 text-cyan-300 text-sm font-label font-medium ring-1 ring-cyan-400/20"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Same as */}
          {author.sameAs && author.sameAs.length > 0 && (
            <div className="mt-8 border-t border-white/[0.06] pt-8">
              <h2 className="font-label text-xs text-white/40 uppercase tracking-wider mb-3">
                Elsewhere
              </h2>
              <ul className="flex flex-wrap gap-3">
                {author.sameAs.map(link => (
                  <li key={link}>
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-cyan-400 hover:text-cyan-300 font-label font-medium transition-colors"
                    >
                      {new URL(link).hostname.replace(/^www\./, '')}
                      <span className="material-symbols-outlined text-base">
                        open_in_new
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Articles by this author */}
      <section className="max-w-4xl mx-auto px-6 mt-10 pb-24">
        <div className="bg-white/[0.03] rounded-2xl ring-1 ring-white/[0.06] p-8">
          <h2 className="font-headline text-xl md:text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-400/60 text-2xl">
              auto_stories
            </span>
            Articles by {author.name}
          </h2>
          <p className="font-body text-white/60 text-sm leading-relaxed mb-5">
            Explore research-backed writing on digital wellness, accountability,
            and behavioral health.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-label font-bold hover:brightness-110 transition-all shadow-lg shadow-primary/20"
          >
            Browse the blog
            <span className="material-symbols-outlined text-base">
              arrow_forward
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
