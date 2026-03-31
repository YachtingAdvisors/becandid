// ============================================================
// components/LegalFooter.tsx
// ============================================================

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function LegalFooter() {
  // All pages now have their own footer — this component is deprecated.
  // Keeping the component to avoid breaking the layout import.
  return null;

  // eslint-disable-next-line no-unreachable
  const pathname = usePathname();

  return (
    <footer className="ring-1 ring-outline-variant/5 bg-surface-container-lowest/80 glass-effect">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Be Candid" className="h-8 w-auto" />
          </div>

          <div className="flex items-center gap-6 text-sm font-label text-on-surface-variant">
            <Link href="/pricing" className="hover:text-primary transition-colors duration-200 cursor-pointer">
              Pricing
            </Link>
            <Link href="/legal/privacy" className="hover:text-primary transition-colors duration-200 cursor-pointer">
              Privacy Policy
            </Link>
            <Link href="/legal/terms" className="hover:text-primary transition-colors duration-200 cursor-pointer">
              Terms of Service
            </Link>
            <a href="mailto:support@becandid.io" className="hover:text-primary transition-colors duration-200 cursor-pointer">
              Contact
            </a>
          </div>

          <p className="text-xs text-on-surface-variant">
            &copy; {new Date().getFullYear()} Be Candid. All rights reserved.
          </p>
        </div>

        <p className="text-center text-[10px] text-on-surface-variant/60 mt-4">
          Be Candid is not a substitute for professional therapy or crisis intervention.
          If you are in crisis, call or text 988.
        </p>
      </div>
    </footer>
  );
}
