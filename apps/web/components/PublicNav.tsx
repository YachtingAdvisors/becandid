'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function PublicNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: '/', label: 'Sanctuary' },
    { href: '/methodology', label: 'Methodology' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/therapists', label: 'Therapists' },
    { href: '/blog', label: 'Blog' },
    { href: '/download', label: 'Download' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-stone-950/80 backdrop-blur-xl border-b border-white/5">
      <div className="flex justify-between items-center px-6 md:px-8 py-4 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Be Candid" className="h-9 w-auto brightness-[10]" />
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-body transition-colors duration-200 ${
                isActive(link.href)
                  ? 'text-cyan-400 font-bold border-b-2 border-cyan-400 pb-1'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/auth/signin"
            className="hidden sm:block text-sm text-stone-400 hover:text-stone-200 transition-colors font-body"
          >
            Log in
          </Link>
          <Link
            href="/auth/signup"
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-primary to-primary-container text-white text-sm font-label font-bold hover:brightness-110 transition-all shadow-lg shadow-primary/20"
          >
            Get Started
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-2xl">
              {menuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-stone-950/95 backdrop-blur-xl border-t border-white/5 px-6 py-4 space-y-1">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block py-3 text-sm font-body transition-colors ${
                isActive(link.href) ? 'text-cyan-400 font-bold' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/auth/signin" onClick={() => setMenuOpen(false)} className="block py-3 text-sm text-stone-400 hover:text-stone-200 font-body">
            Log in
          </Link>
        </div>
      )}
    </nav>
  );
}
