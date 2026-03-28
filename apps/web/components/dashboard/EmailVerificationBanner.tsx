// ============================================================
// components/dashboard/EmailVerificationBanner.tsx
//
// Sticky banner shown to users who haven't verified their
// email. Sits above the main content, below the nav.
//
// Usage in dashboard layout:
//   const user = await supabase.auth.getUser();
//   {!user.email_confirmed_at && <EmailVerificationBanner email={user.email} />}
// ============================================================

'use client';

import { useState } from 'react';

export default function EmailVerificationBanner({ email }: { email: string }) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const resend = async () => {
    setSending(true);
    try {
      await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch (e) { console.error(e); }
    setSending(false);
  };

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-lg">📧</span>
          <p className="text-sm text-amber-800">
            {sent
              ? `Verification email sent to ${email}. Check your inbox.`
              : `Please verify your email (${email}) to unlock all features.`
            }
          </p>
        </div>
        {!sent && (
          <button
            onClick={resend}
            disabled={sending}
            className="text-xs font-medium text-amber-700 hover:text-amber-900 border border-amber-300 rounded-lg px-3 py-1.5 bg-white hover:bg-amber-50 transition-colors shrink-0"
          >
            {sending ? 'Sending…' : 'Resend email'}
          </button>
        )}
      </div>
    </div>
  );
}
