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
          <h2 className="font-headline text-2xl font-bold text-on-surface mb-3">Sent!</h2>
          <p className="text-sm text-on-surface-variant mb-8 leading-relaxed">
            Your message is on its way. These moments matter more than you know.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setSent(false); setMessage(''); }} className="px-4 py-2 text-sm font-label font-medium text-on-surface-variant border border-outline-variant rounded-full hover:bg-surface-container-low">
              Send another
            </button>
            <button onClick={() => router.push('/partner/focus')} className="px-4 py-2 bg-primary text-on-primary text-sm font-label font-bold rounded-full hover:bg-primary/90">
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
        <h1 className="font-headline text-3xl font-bold text-on-surface mb-1">💪 Send Encouragement</h1>
        <p className="text-sm font-body text-on-surface-variant">A message goes a long way. No alert required.</p>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      <div className="card p-5">
        <label className="block text-sm font-medium text-on-surface mb-3">Choose a tone</label>
        <div className="flex flex-wrap gap-2">
          {EMOJIS.map(e => (
            <button key={e} onClick={() => setEmoji(e)}
              className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                emoji === e ? 'bg-primary-container ring-2 ring-primary scale-110' : 'bg-surface-muted hover:bg-primary-container/50'
              }`}>
              {e}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <label className="block text-sm font-medium text-on-surface mb-3">Quick messages</label>
        <div className="space-y-2">
          {QUICK_MESSAGES.map(m => (
            <button key={m} onClick={() => setMessage(m)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all ${
                message === m ? 'border-primary bg-primary-container/30' : 'border-surface-border hover:border-primary/40'
              }`}>
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <label className="block text-sm font-medium text-on-surface mb-2">Or write your own</label>
        <textarea value={message} onChange={e => setMessage(e.target.value)}
          rows={3} placeholder="Say something real…"
          className="w-full px-3 py-2.5 rounded-2xl border border-surface-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary" />
      </div>

      <button onClick={handleSend} disabled={sending || !message.trim()}
        className="w-full py-3 bg-primary text-on-primary text-sm font-label font-bold uppercase tracking-wider rounded-full hover:bg-primary/90 disabled:opacity-50">
        {sending ? 'Sending…' : `Send ${emoji} Encouragement`}
      </button>
    </div>
  );
}
