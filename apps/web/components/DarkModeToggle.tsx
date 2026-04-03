'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

const ICONS: Record<Theme, string> = {
  light: 'light_mode',
  dark: 'dark_mode',
  system: 'contrast',
};

const LABELS: Record<Theme, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

const CYCLE: Theme[] = ['light', 'dark', 'system'];

function applyTheme(theme: Theme) {
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  document.documentElement.classList.toggle('dark', isDark);
}

export default function DarkModeToggle() {
  const [theme, setTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  // Initialise from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    const initial = stored && CYCLE.includes(stored) ? stored : 'system';
    setTheme(initial);
    applyTheme(initial);
    setMounted(true);

    // Listen for system preference changes when in 'system' mode
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const current = (localStorage.getItem('theme') as Theme) || 'system';
      if (current === 'system') applyTheme('system');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const cycle = () => {
    const idx = CYCLE.indexOf(theme);
    const next = CYCLE[(idx + 1) % CYCLE.length];
    setTheme(next);
    localStorage.setItem('theme', next);
    applyTheme(next);
  };

  if (!mounted) return null;

  return (
    <button
      type="button"
      onClick={cycle}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-label font-medium
                 text-on-surface-variant bg-surface-container hover:bg-surface-container-high
                 dark:bg-surface-container-high dark:hover:bg-surface-container-highest
                 transition-colors ring-1 ring-outline-variant/20"
      title={`Theme: ${LABELS[theme]}`}
      aria-label={`Switch theme (current: ${LABELS[theme]})`}
    >
      <span className="material-symbols-outlined text-base">{ICONS[theme]}</span>
      <span className="hidden sm:inline">{LABELS[theme]}</span>
    </button>
  );
}
