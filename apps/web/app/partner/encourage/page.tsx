'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const TONE_ICONS = [
  { icon: 'fitness_center', label: 'Strength' },
  { icon: 'volunteer_activism', label: 'Gratitude' },
  { icon: 'favorite', label: 'Love' },
  { icon: 'star', label: 'Star' },
  { icon: 'local_fire_department', label: 'Fire' },
  { icon: 'sports_mma', label: 'Fist' },
  { icon: 'group', label: 'Together' },
  { icon: 'loyalty', label: 'Heart' },
  { icon: 'auto_awesome', label: 'Sparkle' },
  { icon: 'diversity_1', label: 'Rainbow' },
];

const QUICK_MESSAGES = [
  "I see you putting in the work. Keep going.",
  "Proud of you for staying committed to this.",
  "Tough days don't last -- you're tougher.",
  "I'm in your corner. Always.",
  "One day at a time. You've got this.",
  "Your honesty takes real courage.",
];

export default function EncouragePage() {
  const router = useRouter();
  const [selectedTone, setSelectedTone] = useState(0);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const currentIcon = TONE_ICONS[selectedTone].icon;

  async function handleSend() {
    if (!message.trim()) { setError('Write a message first.'); return; }
    setSending(true);
    setError('');

    const res = await fetch('/api/trust-points/earn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'partner_encouraged', note: `${currentIcon} ${message.trim()}` }),
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
        <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <span className="material-symbols-outlined text-primary text-4xl">{currentIcon}</span>
          </div>
          <h2 className="font-headline text-2xl font-bold text-on-surface mb-3">Sent!</h2>
          <p className="text-sm text-on-surface-variant mb-8 leading-relaxed">
            Your message is on its way. These moments matter more than you know.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setSent(false); setMessage(''); }} className="px-4 py-2 text-sm font-label font-medium text-on-surface-variant ring-1 ring-outline-variant rounded-full hover:bg-surface-container-low transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30">
              Send another
            </button>
            <button onClick={() => router.push('/partner/focus')} className="px-4 py-2 bg-primary text-on-primary text-sm font-label font-bold rounded-full shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-110 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30">
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
        <div className="flex items-center gap-3 mb-1">
          <span className="material-symbols-outlined text-primary text-3xl">favorite</span>
          <h1 className="font-headline text-3xl font-bold text-on-surface">Send Encouragement</h1>
        </div>
        <p className="text-sm font-body text-on-surface-variant">A message goes a long way. No alert required.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <span className="material-symbols-outlined text-lg">error</span>
          {error}
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-5">
        <label className="block text-sm font-medium text-on-surface mb-3">Choose a tone</label>
        <div className="flex flex-wrap gap-2">
          {TONE_ICONS.map((t, i) => (
            <button key={t.icon} onClick={() => setSelectedTone(i)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                selectedTone === i ? 'bg-primary-container ring-2 ring-primary scale-110' : 'bg-surface-container-low hover:bg-primary-container/50'
              }`}
              title={t.label}>
              <span className="material-symbols-outlined text-xl" style={selectedTone === i ? { fontVariationSettings: "'FILL' 1" } : undefined}>{t.icon}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-5">
        <label className="block text-sm font-medium text-on-surface mb-3">Quick messages</label>
        <div className="space-y-2">
          {QUICK_MESSAGES.map(m => (
            <button key={m} onClick={() => setMessage(m)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                message === m ? 'border-primary bg-primary-container/30' : 'border-outline-variant/30 hover:border-primary/40'
              }`}>
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-5">
        <label className="block text-sm font-medium text-on-surface mb-2">Or write your own</label>
        <textarea value={message} onChange={e => setMessage(e.target.value)}
          rows={3} placeholder="Say something real..."
          className="w-full bg-surface-container-low border-none rounded-xl py-4 px-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary" />
      </div>

      <button onClick={handleSend} disabled={sending || !message.trim()}
        className="w-full py-3 bg-primary text-on-primary text-sm font-headline font-bold uppercase tracking-wider rounded-full shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-110 disabled:opacity-50 disabled:shadow-none transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 flex items-center justify-center gap-2">
        <span className="material-symbols-outlined text-lg">{currentIcon}</span>
        {sending ? 'Sending...' : 'Send Encouragement'}
      </button>
    </div>
  );
}
