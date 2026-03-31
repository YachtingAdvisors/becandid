'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/#features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/download', label: 'Download' },
  { href: '/families', label: 'Families' },
];

export default function PublicNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href.startsWith('/#')) return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-xl">
      <nav className="flex justify-between items-center px-6 lg:px-12 py-5 max-w-screen-2xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Be Candid" className="h-12 w-auto object-contain" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-10 font-body text-base tracking-tight">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors duration-300 cursor-pointer ${
                isActive(link.href)
                  ? 'text-primary font-semibold'
                  : 'text-on-surface opacity-80 hover:text-primary'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop auth buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/auth/signin" className="text-on-surface opacity-80 hover:text-primary transition-colors duration-300 font-label text-sm font-semibold cursor-pointer">
            Log in
          </Link>
          <Link href="/auth/signup" className="px-8 py-3 bg-primary text-on-primary rounded-full font-label text-sm font-semibold tracking-wide shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-110 active:scale-95 transition-all duration-200 cursor-pointer">
            Get Started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-container transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined text-on-surface text-2xl">
            {open ? 'close' : 'menu'}
          </span>
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-surface/95 backdrop-blur-xl border-t border-outline-variant/10 px-6 pb-6 pt-2">
          <div className="space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`block px-4 py-3 rounded-xl font-body text-base transition-all duration-200 ${
                  isActive(link.href)
                    ? 'bg-primary-container/30 text-primary font-semibold'
                    : 'text-on-surface hover:bg-surface-container-low'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-outline-variant/10 flex flex-col gap-3">
            <Link
              href="/auth/signin"
              onClick={() => setOpen(false)}
              className="px-4 py-3 text-center text-on-surface font-label text-sm font-semibold rounded-xl hover:bg-surface-container-low transition-all duration-200 cursor-pointer"
            >
              Log in
            </Link>
            <Link
              href="/auth/signup"
              onClick={() => setOpen(false)}
              className="px-4 py-3 text-center bg-primary text-on-primary rounded-full font-label text-sm font-semibold shadow-lg shadow-primary/20 hover:brightness-110 transition-all duration-200 cursor-pointer"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
