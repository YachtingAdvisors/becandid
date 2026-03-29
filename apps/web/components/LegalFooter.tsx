// ============================================================
// components/LegalFooter.tsx
// ============================================================

import Link from 'next/link';

export default function LegalFooter() {
  return (
    <footer className="border-t border-outline-variant/30 bg-surface-container-lowest/80 glass-effect">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Be Candid" className="h-6 w-auto" />
          </div>

          <div className="flex items-center gap-6 text-sm font-label text-on-surface-variant">
            <Link href="/pricing" className="hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link href="/legal/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/legal/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <a href="mailto:support@becandid.io" className="hover:text-primary transition-colors">
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
