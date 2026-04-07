'use client';

// ============================================================
// IdleTimeout — Session idle timeout with warning modal
//
// Tracks user activity and signs out after 32 minutes of
// inactivity (30 min idle + 2 min warning grace period).
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

const IDLE_MS = 30 * 60 * 1000;       // 30 minutes
const WARNING_MS = 2 * 60 * 1000;     // 2 minutes grace
const DEBOUNCE_MS = 30 * 1000;        // Check activity every 30s

const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'] as const;

export default function IdleTimeout() {
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(120); // seconds remaining

  const lastActivityRef = useRef(Date.now());
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const debounceRef = useRef<number>(0);

  const clearAllTimers = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  }, []);

  const signOut = useCallback(async () => {
    clearAllTimers();
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
    } catch {
      // Best effort
    }
    router.push('/auth/signin?reason=idle');
  }, [clearAllTimers, router]);

  const startWarningCountdown = useCallback(() => {
    setShowWarning(true);
    setCountdown(120);

    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    warningTimerRef.current = setTimeout(() => {
      signOut();
    }, WARNING_MS);
  }, [signOut]);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    clearAllTimers();
    setShowWarning(false);

    idleTimerRef.current = setTimeout(() => {
      startWarningCountdown();
    }, IDLE_MS);
  }, [clearAllTimers, startWarningCountdown]);

  // Debounced activity handler
  const handleActivity = useCallback(() => {
    const now = Date.now();
    if (now - debounceRef.current < DEBOUNCE_MS) return;
    debounceRef.current = now;
    lastActivityRef.current = now;

    // Only reset timer if warning is not showing
    // If warning is showing, activity is handled by the "Stay Signed In" button
    if (!showWarning) {
      resetTimer();
    }
  }, [showWarning, resetTimer]);

  // Set up event listeners and initial timer
  useEffect(() => {
    resetTimer();

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, handleActivity, { passive: true });
    }

    return () => {
      clearAllTimers();
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, handleActivity);
      }
    };
  }, [handleActivity, resetTimer, clearAllTimers]);

  function handleStaySignedIn() {
    resetTimer();
  }

  if (!showWarning) return null;

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="idle-timeout-title"
      onKeyDown={(e) => { if (e.key === 'Escape') handleStaySignedIn(); }}
    >
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-warning/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-warning text-[28px]">schedule</span>
          </div>
        </div>

        {/* Content */}
        <h2 id="idle-timeout-title" className="text-xl font-headline font-bold text-on-surface text-center mb-2">
          Session Expiring
        </h2>
        <p className="text-sm font-body text-on-surface-variant text-center mb-6">
          Your session will expire in{' '}
          <span className="font-semibold text-on-surface tabular-nums">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>{' '}
          due to inactivity.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleStaySignedIn}
            autoFocus
            className="w-full py-3 bg-primary text-on-primary text-sm font-headline font-bold rounded-full hover:brightness-110 cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-primary/30"
          >
            Stay Signed In
          </button>
          <button
            onClick={signOut}
            className="w-full py-3 bg-transparent text-on-surface-variant text-sm font-label font-medium rounded-full border border-outline-variant hover:bg-surface-container cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-primary/30"
          >
            Sign Out Now
          </button>
        </div>
      </div>
    </div>
  );
}
