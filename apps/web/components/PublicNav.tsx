'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function PublicNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* ── Scroll-aware backdrop ───────────────────────────────── */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    handleScroll(); // initialise on mount
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ── Lock body scroll when mobile menu is open ───────────── */
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  /* ── Escape key closes mobile menu ───────────────────────── */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) setMenuOpen(false);
    },
    [menuOpen],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const links = [
    { href: '/', label: 'Sanctuary' },
    { href: '/methodology', label: 'Methodology' },
    { href: '/assessment', label: 'Assessment' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/blog', label: 'Blog' },
    { href: '/download', label: 'Download' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* ── Top navigation bar ───────────────────────────────── */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/[0.03] backdrop-blur-xl border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.15)]'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="flex justify-between items-center px-6 md:px-8 py-4 max-w-7xl mx-auto">
          {/* ── Logo ──────────────────────────────────────────── */}
          <Link
            href="/"
            className="flex items-center gap-2 transition-transform duration-300 hover:scale-105"
          >
            <Image
              src="/logo.png"
              alt="Be Candid"
              width={120}
              height={36}
              className="h-9 w-auto brightness-[10]"
              priority
            />
          </Link>

          {/* ── Desktop links ─────────────────────────────────── */}
          <div className="hidden md:flex items-center space-x-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-sm font-body transition-colors duration-200 py-1 ${
                  isActive(link.href)
                    ? 'text-cyan-400 font-bold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {link.label}

                {/* Active indicator dot + underline */}
                <span
                  className={`absolute -bottom-1 left-1/2 -translate-x-1/2 transition-all duration-300 ${
                    isActive(link.href)
                      ? 'w-full h-[2px] bg-gradient-to-r from-cyan-400/0 via-cyan-400 to-cyan-400/0 opacity-100'
                      : 'w-0 h-[2px] bg-cyan-400 opacity-0'
                  }`}
                />
                <span
                  className={`absolute -bottom-2.5 left-1/2 -translate-x-1/2 transition-all duration-300 ${
                    isActive(link.href)
                      ? 'w-1 h-1 rounded-full bg-cyan-400 opacity-100 shadow-[0_0_6px_rgba(34,211,238,0.6)]'
                      : 'w-0 h-0 rounded-full bg-cyan-400 opacity-0'
                  }`}
                />
              </Link>
            ))}
          </div>

          {/* ── Right side actions ────────────────────────────── */}
          <div className="flex items-center gap-3">
            <Link
              href="/auth/signin"
              className="hidden sm:block text-sm text-stone-400 hover:text-stone-200 transition-colors duration-200 font-body"
            >
              Log in
            </Link>

            {/* CTA button with gradient + glow */}
            <Link
              href="/auth/signup"
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-primary to-primary-container text-white text-sm font-label font-bold transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:brightness-110 hover:scale-[1.03] active:scale-[0.98]"
            >
              Get Started
            </Link>

            {/* Hamburger with aria-expanded */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="md:hidden p-2 text-stone-400 hover:text-white transition-colors duration-200 cursor-pointer"
            >
              <span className="material-symbols-outlined text-2xl">
                {menuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile full-screen overlay menu ──────────────────── */}
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-in panel */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-stone-950/95 backdrop-blur-xl border-l border-white/[0.06] shadow-2xl transition-transform duration-500 ease-out md:hidden ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Close button inside the panel */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <Image
            src="/logo.png"
            alt="Be Candid"
            width={96}
            height={28}
            className="h-7 w-auto brightness-[10]"
          />
          <button
            onClick={() => setMenuOpen(false)}
            className="p-2 text-stone-400 hover:text-white transition-colors duration-200 cursor-pointer"
            aria-label="Close navigation menu"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Links */}
        <nav className="px-6 py-6 space-y-1 overflow-y-auto max-h-[calc(100dvh-80px)]">
          {links.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 py-3.5 px-3 rounded-xl text-base font-body transition-all duration-300 ${
                isActive(link.href)
                  ? 'text-cyan-400 font-bold bg-white/[0.04]'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-white/[0.03]'
              }`}
              style={{
                transitionDelay: menuOpen ? `${i * 50}ms` : '0ms',
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? 'translateX(0)' : 'translateX(20px)',
              }}
            >
              {isActive(link.href) && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.6)]" />
              )}
              {link.label}
            </Link>
          ))}

          <div className="border-t border-white/[0.06] my-4" />

          <Link
            href="/auth/signin"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 py-3.5 px-3 rounded-xl text-base text-stone-400 hover:text-stone-200 hover:bg-white/[0.03] font-body transition-all duration-300"
            style={{
              transitionDelay: menuOpen ? `${links.length * 50}ms` : '0ms',
              opacity: menuOpen ? 1 : 0,
              transform: menuOpen ? 'translateX(0)' : 'translateX(20px)',
            }}
          >
            Log in
          </Link>

          <Link
            href="/auth/signup"
            onClick={() => setMenuOpen(false)}
            className="block text-center mt-4 px-5 py-3 rounded-full bg-gradient-to-r from-primary to-primary-container text-white text-sm font-label font-bold transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:brightness-110"
            style={{
              transitionDelay: menuOpen ? `${(links.length + 1) * 50}ms` : '0ms',
              opacity: menuOpen ? 1 : 0,
              transform: menuOpen ? 'translateX(0)' : 'translateX(20px)',
            }}
          >
            Get Started
          </Link>
        </nav>
      </div>
    </>
  );
}
