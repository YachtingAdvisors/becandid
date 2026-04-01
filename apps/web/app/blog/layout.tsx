import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: {
    default: 'Blog',
    template: '%s | Be Candid Blog',
  },
  description: 'Articles on digital wellness, screen time accountability, and building healthier relationships with technology.',
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-background/70 backdrop-blur-md border-b border-outline-variant/10">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-6 h-16">
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Be Candid" className="h-9 w-auto" />
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/blog" className="font-label text-sm text-on-surface-variant hover:text-primary transition-colors">
              Blog
            </Link>
            <Link href="/pricing" className="font-label text-sm text-on-surface-variant hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link
              href="/auth/signup"
              className="px-4 py-2 rounded-full bg-primary text-on-primary text-sm font-label font-bold hover:brightness-110 transition-all"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {children}
    </div>
  );
}
