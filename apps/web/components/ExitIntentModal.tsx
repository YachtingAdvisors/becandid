'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

const SEEN_KEY = 'bc_exit_intent_seen';
const ARM_DELAY_MS = 5_000;
const MOBILE_FALLBACK_MS = 45_000;
const EXCLUDED_PREFIXES = ['/admin', '/dashboard', '/auth'];

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function track(event: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', event, { source: 'exit-intent', ...params });
  }
}

export default function ExitIntentModal() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const armedRef = useRef(false);

  const excluded = EXCLUDED_PREFIXES.some(p => pathname?.startsWith(p));

  useEffect(() => {
    if (excluded) return;
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(SEEN_KEY)) return;

    let armTimer: ReturnType<typeof setTimeout> | null = null;
    let mobileTimer: ReturnType<typeof setTimeout> | null = null;

    const show = () => {
      if (armedRef.current) return;
      armedRef.current = true;
      setOpen(true);
      track('exit_intent_shown');
    };

    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) show();
    };

    armTimer = setTimeout(() => {
      const isFinePointer = window.matchMedia('(pointer: fine)').matches;
      if (isFinePointer) {
        document.documentElement.addEventListener('mouseleave', onMouseLeave);
      } else {
        mobileTimer = setTimeout(show, MOBILE_FALLBACK_MS);
      }
    }, ARM_DELAY_MS);

    return () => {
      if (armTimer) clearTimeout(armTimer);
      if (mobileTimer) clearTimeout(mobileTimer);
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [excluded, pathname]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') dismiss(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function markSeen() {
    try { localStorage.setItem(SEEN_KEY, '1'); } catch {}
  }

  function dismiss() {
    setOpen(false);
    markSeen();
    track('exit_intent_dismissed');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'exit-intent' }),
      });
      if (res.ok) {
        setState('success');
        markSeen();
        track('exit_intent_subscribed');
      } else {
        setState('error');
      }
    } catch {
      setState('error');
    }
  }

  if (excluded || !open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm motion-safe:animate-[fadeIn_0.2s_ease]"
        onClick={dismiss}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="exit-intent-title"
        className="relative z-10 w-full max-w-md bg-surface-container-lowest rounded-3xl shadow-2xl ring-1 ring-outline-variant/10 p-7 sm:p-9 motion-safe:animate-fade-up"
      >
        <button
          onClick={dismiss}
          aria-label="Close"
          className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container-low cursor-pointer transition-colors focus:ring-2 focus:ring-primary/30 focus:outline-none"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {state === 'success' ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <span
                className="material-symbols-outlined text-emerald-500 text-3xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
            </div>
            <h2 id="exit-intent-title" className="font-headline text-xl font-extrabold text-on-surface tracking-tight mb-2">
              You&apos;re on the list.
            </h2>
            <p className="font-body text-sm text-on-surface-variant leading-relaxed mb-6">
              We&apos;ll email you the moment Be Candid leaves beta — with your launch-day discount included.
            </p>
            <button
              onClick={() => setOpen(false)}
              className="w-full py-3 bg-primary text-on-primary rounded-full font-label font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-110 active:scale-[0.98] cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-primary/30 focus:outline-none"
            >
              Got it
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-5">
              <div className="w-14 h-14 rounded-full bg-primary-container/40 flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-primary text-2xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  mail
                </span>
              </div>
            </div>

            <h2 id="exit-intent-title" className="font-headline text-2xl font-extrabold text-on-surface tracking-tight text-center mb-3">
              Wait — be the first to know.
            </h2>
            <p className="font-body text-sm text-on-surface-variant leading-relaxed text-center mb-6 max-w-sm mx-auto">
              Be Candid is in beta. Leave your email and we&apos;ll let you know the moment we launch — plus a launch-day discount on your first subscription.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={state === 'loading'}
                className="w-full bg-surface-container-low/60 border border-outline-variant/20 rounded-full px-5 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={state === 'loading' || !email}
                className="w-full py-3.5 bg-primary text-on-primary rounded-full font-label font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-110 active:scale-[0.98] cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:ring-2 focus:ring-primary/30 focus:outline-none"
              >
                {state === 'loading' ? 'Saving...' : 'Notify me at launch'}
              </button>
            </form>

            {state === 'error' && (
              <p className="text-xs text-red-500 font-body mt-3 text-center">
                Something went wrong. Please try again.
              </p>
            )}

            <button
              onClick={dismiss}
              className="w-full mt-3 py-2 text-on-surface-variant/60 hover:text-on-surface font-label text-xs cursor-pointer transition-colors duration-200 focus:ring-2 focus:ring-primary/30 focus:outline-none rounded-full"
            >
              No thanks
            </button>

            <p className="text-[11px] text-on-surface-variant/50 font-body text-center mt-4">
              No spam. Unsubscribe anytime.
            </p>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
