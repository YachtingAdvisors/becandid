// ============================================================
// components/dashboard/PushPermissionBanner.tsx
//
// Dismissible banner that prompts users to enable Web Push
// notifications. Handles the full subscribe flow:
//   1. Register the service worker
//   2. Request notification permission
//   3. Subscribe to push via the Push API
//   4. Send the subscription to our backend
//
// Usage:
//   <PushPermissionBanner />
// ============================================================

'use client';

import { useCallback, useEffect, useState } from 'react';

type BannerState =
  | 'loading'     // checking support/status
  | 'prompt'      // ready to ask for permission
  | 'subscribing' // in progress
  | 'denied'      // user blocked notifications
  | 'hidden'      // already subscribed, dismissed, or unsupported
  | 'error';      // something went wrong

const DISMISS_KEY = 'becandid_push_banner_dismissed';
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '';

/**
 * Convert a base64url-encoded VAPID public key to a Uint8Array
 * for use with pushManager.subscribe().
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

export default function PushPermissionBanner() {
  const [state, setState] = useState<BannerState>('loading');

  // Check initial state on mount
  useEffect(() => {
    // Not supported
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState('hidden');
      return;
    }

    // No VAPID key configured
    if (!VAPID_PUBLIC_KEY) {
      setState('hidden');
      return;
    }

    // Previously dismissed
    if (localStorage.getItem(DISMISS_KEY) === 'true') {
      setState('hidden');
      return;
    }

    // Check current permission
    if (Notification.permission === 'denied') {
      setState('denied');
      return;
    }

    if (Notification.permission === 'granted') {
      // Check if there's an active subscription
      navigator.serviceWorker.ready
        .then((reg) => reg.pushManager.getSubscription())
        .then((sub) => {
          setState(sub ? 'hidden' : 'prompt');
        })
        .catch(() => setState('prompt'));
      return;
    }

    // permission === 'default' — not yet asked
    setState('prompt');
  }, []);

  const subscribe = useCallback(async () => {
    setState('subscribing');

    try {
      // 1. Register the service worker
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      // Wait for the service worker to be ready
      await navigator.serviceWorker.ready;

      // 2. Request permission (will prompt the browser dialog)
      const permission = await Notification.requestPermission();
      if (permission === 'denied') {
        setState('denied');
        return;
      }
      if (permission !== 'granted') {
        setState('prompt');
        return;
      }

      // 3. Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // 4. Send subscription to backend
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      });

      if (!res.ok) {
        console.error('[push] Failed to store subscription:', await res.text());
        setState('error');
        return;
      }

      setState('hidden');
    } catch (err) {
      console.error('[push] Subscribe error:', err);
      setState('error');
    }
  }, []);

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, 'true');
    setState('hidden');
  }, []);

  // ─── Render ────────────────────────────────────────────────

  if (state === 'hidden' || state === 'loading') return null;

  if (state === 'denied') {
    return (
      <div className="bg-stone-100 border-b border-stone-200 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <span className="material-symbols-outlined text-lg text-stone-500">
            notifications_off
          </span>
          <p className="text-sm text-stone-600">
            Push notifications are blocked in your browser settings.
            To enable them, update your notification preferences for this site.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-teal-50 border-b border-teal-200 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-lg text-teal-700">
            notifications_active
          </span>
          <p className="text-sm text-teal-800">
            {state === 'error'
              ? 'Something went wrong enabling notifications. Please try again.'
              : 'Enable push notifications to get real-time alerts and journal reminders.'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={subscribe}
            disabled={state === 'subscribing'}
            className="text-xs font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-60"
          >
            {state === 'subscribing' ? 'Enabling...' : 'Enable'}
          </button>
          <button
            onClick={dismiss}
            className="text-xs font-medium text-teal-600 hover:text-teal-800 rounded-lg px-2 py-1.5 transition-colors"
            aria-label="Dismiss"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      </div>
    </div>
  );
}
