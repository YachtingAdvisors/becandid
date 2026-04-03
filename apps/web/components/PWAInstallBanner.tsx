'use client';

import { useEffect, useState, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'pwa-banner-dismissed-at';
const INSTALLED_KEY = 'pwa-installed';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    // Don't show if already installed
    if (localStorage.getItem(INSTALLED_KEY)) return;

    // Don't show if dismissed within 30 days
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt && Date.now() - Number(dismissedAt) < THIRTY_DAYS_MS) return;

    // Only show on mobile
    const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    if (!isMobile) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
      // Trigger slide-up after mount
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimateIn(true));
      });
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Hide if app gets installed
    window.addEventListener('appinstalled', () => {
      localStorage.setItem(INSTALLED_KEY, 'true');
      setVisible(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      localStorage.setItem(INSTALLED_KEY, 'true');
    }
    setDeferredPrompt(null);
    setVisible(false);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setAnimateIn(false);
    // Wait for animation out before unmounting
    setTimeout(() => setVisible(false), 300);
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-0 inset-x-0 z-50 p-4 transition-transform duration-300 ease-out ${
        animateIn ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="max-w-lg mx-auto bg-surface-container dark:bg-surface-container rounded-2xl shadow-lg ring-1 ring-outline-variant/10 px-5 py-4 flex items-center gap-4">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-xl text-primary">install_mobile</span>
        </div>

        {/* Text */}
        <p className="font-body text-sm text-on-surface leading-snug flex-1">
          Add Be Candid to your home screen for quick access
        </p>

        {/* Install button */}
        <button
          onClick={handleInstall}
          className="shrink-0 px-5 py-2 bg-primary hover:bg-primary-dim text-on-primary font-label font-bold text-sm rounded-full transition-colors duration-200 cursor-pointer"
        >
          Install
        </button>

        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-on-surface/10 transition-colors duration-200 cursor-pointer"
          aria-label="Dismiss install banner"
        >
          <span className="material-symbols-outlined text-lg text-on-surface-variant">close</span>
        </button>
      </div>
    </div>
  );
}
