'use client';

import { useState } from 'react';

const ISSUE_TYPES = [
  { key: 'bug', label: 'Something is broken', icon: 'bug_report' },
  { key: 'feature', label: 'Feature request', icon: 'lightbulb' },
  { key: 'account', label: 'Account issue', icon: 'person' },
  { key: 'billing', label: 'Billing problem', icon: 'payment' },
  { key: 'privacy', label: 'Privacy concern', icon: 'lock' },
  { key: 'other', label: 'Something else', icon: 'help' },
];

export default function ReportIssue() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!type || !message.trim()) return;
    setSending(true);
    try {
      await fetch('/api/support/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, message: message.trim() }),
      });
      setSent(true);
      setTimeout(() => { setSent(false); setOpen(false); setType(''); setMessage(''); }, 3000);
    } catch {
      // silent fail — email fallback below
    }
    setSending(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-primary text-on-primary shadow-lg shadow-primary/20 flex items-center justify-center hover:brightness-110 active:scale-95 transition-all"
        aria-label="Report an issue"
      >
        <span className="material-symbols-outlined text-xl">feedback</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-surface-container-lowest rounded-3xl border border-outline-variant shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/30">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-lg text-primary">feedback</span>
          <h3 className="font-headline text-sm font-bold text-on-surface">Report an Issue</h3>
        </div>
        <button onClick={() => setOpen(false)} className="text-on-surface-variant hover:text-on-surface" aria-label="Close">
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      {sent ? (
        <div className="px-4 py-8 text-center">
          <span className="material-symbols-outlined text-3xl text-emerald-600 mb-2 block" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <p className="text-sm font-body text-on-surface font-medium">Thanks! We&apos;ll look into it.</p>
          <p className="text-xs text-on-surface-variant mt-1">You&apos;ll hear back at your email.</p>
        </div>
      ) : (
        <div className="p-4 space-y-3">
          {/* Issue type */}
          <div className="grid grid-cols-2 gap-1.5">
            {ISSUE_TYPES.map((t) => (
              <button
                key={t.key}
                onClick={() => setType(t.key)}
                className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-label font-medium transition-all ${
                  type === t.key
                    ? 'bg-primary/10 text-primary ring-1 ring-primary/30'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          {/* Message */}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what happened..."
            rows={3}
            className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/30 text-sm font-body text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />

          {/* Actions */}
          <div className="flex items-center justify-between">
            <a
              href="mailto:support@becandid.io"
              className="text-xs text-on-surface-variant hover:text-primary font-label transition-colors"
            >
              Or email us directly
            </a>
            <button
              onClick={handleSubmit}
              disabled={!type || !message.trim() || sending}
              className="btn-primary text-xs py-1.5 px-4 disabled:opacity-50"
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
