'use client';

import { useState } from 'react';
import { useToast } from '@/components/ToastProvider';

const FEEDBACK_TYPES = [
  { key: 'idea', label: 'I have an idea', icon: 'lightbulb' },
  { key: 'need', label: 'I need this feature', icon: 'add_circle' },
  { key: 'bug', label: 'Something is broken', icon: 'bug_report' },
  { key: 'story', label: 'Share my story', icon: 'favorite' },
  { key: 'question', label: 'I have a question', icon: 'help' },
  { key: 'other', label: 'Something else', icon: 'chat' },
];

export default function BuildWithUs() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

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
      setTimeout(() => { setSent(false); setOpen(false); setType(''); setMessage(''); }, 4000);
    } catch {
      // silent fail — email fallback below
    }
    setSending(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-primary text-on-primary shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all font-label font-bold text-xs"
        aria-label="Build with us"
      >
        <span className="material-symbols-outlined text-lg">construction</span>
        Build With Us
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-surface-container-lowest rounded-3xl border border-outline-variant shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-outline-variant/30 bg-gradient-to-r from-primary/5 to-tertiary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg text-primary">construction</span>
            <h3 className="font-headline text-sm font-bold text-on-surface">Build With Us</h3>
          </div>
          <button onClick={() => setOpen(false)} className="text-on-surface-variant hover:text-on-surface" aria-label="Close">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
        <p className="text-[10px] text-on-surface-variant font-body mt-1 leading-relaxed">
          This app is built with the needs of our community at the forefront. Your voice shapes what we build next.
        </p>
      </div>

      {sent ? (
        <div className="px-4 py-8 text-center">
          <span className="material-symbols-outlined text-3xl text-emerald-600 mb-2 block" style={{ fontVariationSettings: "'FILL' 1" }}>volunteer_activism</span>
          <p className="text-sm font-body text-on-surface font-medium">Thank you for building with us.</p>
          <p className="text-xs text-on-surface-variant mt-1">Your input directly shapes what we work on next.</p>
        </div>
      ) : (
        <div className="p-4 space-y-3">
          {/* Feedback type */}
          <div className="grid grid-cols-2 gap-1.5">
            {FEEDBACK_TYPES.map((t) => (
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
            placeholder={
              type === 'idea' ? "What would make Be Candid better for you?" :
              type === 'need' ? "What feature would help your journey?" :
              type === 'bug' ? "What went wrong? We'll fix it." :
              type === 'story' ? "Your story matters. Share what you're comfortable with." :
              type === 'question' ? "What would you like to know?" :
              "Tell us what's on your mind..."
            }
            rows={3}
            className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/30 text-sm font-body text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />

          {/* Actions */}
          <div className="flex items-center justify-between">
            <a
              href="mailto:shawn@becandid.io?subject=Build%20With%20Us"
              className="text-xs text-on-surface-variant hover:text-primary font-label transition-colors"
            >
              Or email Shawn directly
            </a>
            <button
              onClick={handleSubmit}
              disabled={!type || !message.trim() || sending}
              className="btn-primary text-xs py-1.5 px-4 disabled:opacity-50"
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>

          <p className="text-[9px] text-on-surface-variant/60 font-body text-center">
            Every feature in this app was shaped by people like you.
          </p>
        </div>
      )}
    </div>
  );
}
