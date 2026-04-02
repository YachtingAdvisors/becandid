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
    <div className="bg-dark-sanctuary min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-stone-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-6 h-16">
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Be Candid" className="h-9 w-auto brightness-[10]" />
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/blog" className="font-label text-sm text-stone-400 hover:text-stone-200 transition-colors">
              Blog
            </Link>
            <Link href="/pricing" className="font-label text-sm text-stone-400 hover:text-stone-200 transition-colors">
              Pricing
            </Link>
            <Link
              href="/auth/signup"
              className="px-4 py-2 rounded-full bg-gradient-to-r from-primary to-primary-container text-on-primary text-sm font-label font-bold hover:brightness-110 transition-all"
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
