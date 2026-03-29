// ============================================================
// components/LegalFooter.tsx
//
// Add to your root layout or landing page footer.
// Links to privacy policy, terms of service, and contact.
// ============================================================

import Link from 'next/link';

export default function LegalFooter() {
  return (
    <footer className="border-t border-surface-border bg-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-brand flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">C</span>
            </div>
            <span className="text-sm font-display font-medium text-ink">Be Candid</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-ink-muted">
            <Link href="/pricing" className="hover:text-ink transition-colors">
              Pricing
            </Link>
            <Link href="/legal/privacy" className="hover:text-ink transition-colors">
              Privacy Policy
            </Link>
            <Link href="/legal/terms" className="hover:text-ink transition-colors">
              Terms of Service
            </Link>
            <a href="mailto:support@becandid.io" className="hover:text-ink transition-colors">
              Contact
            </a>
          </div>

          <p className="text-xs text-ink-muted">
            &copy; {new Date().getFullYear()} Be Candid. All rights reserved.
          </p>
        </div>

        <p className="text-center text-[10px] text-ink-muted/60 mt-4">
          Be Candid is not a substitute for professional therapy or crisis intervention.
          If you are in crisis, call or text 988.
        </p>
      </div>
    </footer>
  );
}
