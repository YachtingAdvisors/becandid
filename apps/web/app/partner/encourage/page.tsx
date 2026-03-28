'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const EMOJIS = ['💪', '🙏', '❤️', '🌟', '🔥', '👊', '🫂', '💙', '✨', '🌈'];

const QUICK_MESSAGES = [
  "I see you putting in the work. Keep going.",
  "Proud of you for staying committed to this.",
  "Tough days don't last — you're tougher.",
  "I'm in your corner. Always.",
  "One day at a time. You've got this.",
  "Your honesty takes real courage.",
];

export default function EncouragePage() {
  const router = useRouter();
  const [emoji, setEmoji] = useState('💪');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSend() {
    if (!message.trim()) { setError('Write a message first.'); return; }
    setSending(true);
    setError('');

    const res = await fetch('/api/trust-points/earn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'partner_encouraged', note: `${emoji} ${message.trim()}` }),
    });

    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? 'Failed to send.');
      setSending(false);
      return;
    }

    setSent(true);
    setSending(false);
  }

  if (sent) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="card p-10 text-center">
          <div className="text-5xl mb-5">{emoji}</div>
          <h2 className="font-display text-2xl font-semibold text-ink mb-3">Sent!</h2>
          <p className="text-sm text-ink-muted mb-8 leading-relaxed">
            Your message is on its way. These moments matter more than you know.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setSent(false); setMessage(''); }} className="px-4 py-2 text-sm font-medium text-ink-muted border border-surface-border rounded-xl hover:bg-surface-muted">
              Send another
            </button>
            <button onClick={() => router.push('/partner/focus')} className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-xl hover:bg-brand-700">
              Back to overview
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink mb-1">Send Encouragement</h1>
        <p className="text-sm text-ink-muted">A message goes a long way. No alert required.</p>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      <div className="card p-5">
        <label className="block text-sm font-medium text-ink mb-3">Choose a tone</label>
        <div className="flex flex-wrap gap-2">
          {EMOJIS.map(e => (
            <button key={e} onClick={() => setEmoji(e)}
              className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                emoji === e ? 'bg-brand-100 ring-2 ring-brand-400 scale-110' : 'bg-surface-muted hover:bg-brand-50'
              }`}>
              {e}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <label className="block text-sm font-medium text-ink mb-3">Quick messages</label>
        <div className="space-y-2">
          {QUICK_MESSAGES.map(m => (
            <button key={m} onClick={() => setMessage(m)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all ${
                message === m ? 'border-brand-500 bg-brand-50' : 'border-surface-border hover:border-brand-200'
              }`}>
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <label className="block text-sm font-medium text-ink mb-2">Or write your own</label>
        <textarea value={message} onChange={e => setMessage(e.target.value)}
          rows={3} placeholder="Say something real…"
          className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500" />
      </div>

      <button onClick={handleSend} disabled={sending || !message.trim()}
        className="w-full py-3 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-50">
        {sending ? 'Sending…' : `Send ${emoji} Encouragement`}
      </button>
    </div>
  );
}
