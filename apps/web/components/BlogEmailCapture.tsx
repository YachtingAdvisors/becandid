'use client';

import { useState } from 'react';

export default function BlogEmailCapture() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'blog' }),
      });
      if (res.ok) {
        setState('success');
        setEmail('');
      } else {
        setState('error');
      }
    } catch {
      setState('error');
    }
  }

  if (state === 'success') {
    return (
      <div className="my-10 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center">
        <span className="material-symbols-outlined text-emerald-400 text-3xl mb-2 block" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        <p className="font-headline font-bold text-slate-100 text-sm">You&apos;re in!</p>
        <p className="text-xs text-slate-400 font-body mt-1">We&apos;ll send you our best articles on digital wellness.</p>
      </div>
    );
  }

  return (
    <div className="my-10 bg-white/[0.03] backdrop-blur-sm rounded-2xl ring-1 ring-white/10 p-6 relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-cyan-400/40 before:to-transparent">
      <h3 className="font-headline text-base font-bold text-slate-100 mb-1">
        Get digital wellness insights in your inbox
      </h3>
      <p className="text-xs text-slate-400 font-body mb-4">
        Science-backed strategies for healthier screen habits. No spam, unsubscribe anytime.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-colors"
        />
        <button
          type="submit"
          disabled={state === 'loading'}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary font-label font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer shrink-0"
        >
          {state === 'loading' ? '...' : 'Subscribe'}
        </button>
      </form>
      {state === 'error' && (
        <p className="text-xs text-red-400 font-body mt-2">Something went wrong. Please try again.</p>
      )}
    </div>
  );
}
