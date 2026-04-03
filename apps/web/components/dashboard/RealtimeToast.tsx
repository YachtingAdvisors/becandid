'use client';

// ============================================================
// RealtimeToast — Floating toast notifications for live events
//
// Renders up to 3 stacked toasts that auto-dismiss after 5s.
// Different visual styles per event type. Clicking navigates
// to the relevant page.
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useRealtimeAlerts, type RealtimeEvent } from '@/hooks/useRealtimeSubscription';

interface ToastItem {
  id: string;
  event: RealtimeEvent;
  entering: boolean;
  exiting: boolean;
}

const MAX_VISIBLE = 3;
const AUTO_DISMISS_MS = 5000;

// ── Event type display config ───────────────────────────────

interface EventConfig {
  icon: string;
  label: string;
  description: (payload: Record<string, any>) => string;
  href: string;
  colors: {
    bg: string;
    border: string;
    icon: string;
    iconBg: string;
  };
}

const EVENT_CONFIGS: Record<RealtimeEvent['type'], EventConfig> = {
  alert: {
    icon: 'warning',
    label: 'New flag detected',
    description: (p) => {
      const severity = p.severity ?? 'medium';
      const category = (p.category ?? 'activity').replace(/_/g, ' ');
      return `${severity.charAt(0).toUpperCase() + severity.slice(1)} severity — ${category}`;
    },
    href: '/dashboard/activity',
    colors: {
      bg: 'bg-red-50 dark:bg-red-950/30',
      border: 'border-red-200 dark:border-red-800/40',
      icon: 'text-red-600 dark:text-red-400',
      iconBg: 'bg-red-100 dark:bg-red-900/40',
    },
  },
  check_in: {
    icon: 'check_circle',
    label: 'New check-in',
    description: (p) => {
      if (p.user_mood) return `Mood: ${p.user_mood}`;
      if (p.status) return `Status: ${p.status}`;
      return 'A check-in is waiting for you';
    },
    href: '/dashboard/checkins',
    colors: {
      bg: 'bg-teal-50 dark:bg-teal-950/30',
      border: 'border-teal-200 dark:border-teal-800/40',
      icon: 'text-teal-600 dark:text-teal-400',
      iconBg: 'bg-teal-100 dark:bg-teal-900/40',
    },
  },
  nudge: {
    icon: 'psychology',
    label: 'Nudge received',
    description: (p) => p.message ?? p.content ?? 'You received a nudge',
    href: '/dashboard',
    colors: {
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-200 dark:border-amber-800/40',
      icon: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    },
  },
  milestone: {
    icon: 'emoji_events',
    label: 'Milestone unlocked',
    description: (p) => p.name ?? p.title ?? 'You reached a new milestone!',
    href: '/dashboard/progress',
    colors: {
      bg: 'bg-amber-50 dark:bg-yellow-950/30',
      border: 'border-yellow-300 dark:border-yellow-700/40',
      icon: 'text-yellow-600 dark:text-yellow-400',
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/40',
    },
  },
  focus_segment: {
    icon: 'center_focus_strong',
    label: 'Focus update',
    description: (p) => {
      const segment = p.segment ?? 'segment';
      const status = p.status ?? 'focused';
      return `${segment.charAt(0).toUpperCase() + segment.slice(1)}: ${status}`;
    },
    href: '/dashboard/focus',
    colors: {
      bg: (undefined as any), // dynamically set below
      border: '',
      icon: '',
      iconBg: '',
    },
  },
};

function getFocusColors(status: string) {
  if (status === 'distracted') {
    return {
      bg: 'bg-red-50 dark:bg-red-950/30',
      border: 'border-red-200 dark:border-red-800/40',
      icon: 'text-red-600 dark:text-red-400',
      iconBg: 'bg-red-100 dark:bg-red-900/40',
    };
  }
  return {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800/40',
    icon: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
  };
}

function getColorsForEvent(event: RealtimeEvent) {
  if (event.type === 'focus_segment') {
    return getFocusColors(event.payload?.status ?? 'focused');
  }
  return EVENT_CONFIGS[event.type].colors;
}

// ── Component ───────────────────────────────────────────────

export default function RealtimeToast({ userId }: { userId: string }) {
  const { events } = useRealtimeAlerts(userId);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const processedRef = useRef(new Set<string>());
  const router = useRouter();

  // When new events arrive, create toast items
  useEffect(() => {
    if (events.length === 0) return;

    const latest = events[0];
    // Build a stable key from event properties
    const eventKey = `${latest.type}:${latest.timestamp}:${JSON.stringify(latest.payload?.id ?? '')}`;

    if (processedRef.current.has(eventKey)) return;
    processedRef.current.add(eventKey);

    // Prune old keys to avoid memory leak
    if (processedRef.current.size > 200) {
      const entries = Array.from(processedRef.current);
      entries.slice(0, 100).forEach((k) => processedRef.current.delete(k));
    }

    const toastId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    setToasts((prev) => {
      const next = [{ id: toastId, event: latest, entering: true, exiting: false }, ...prev];
      // Cap at MAX_VISIBLE, mark excess for removal
      if (next.length > MAX_VISIBLE) {
        return next.slice(0, MAX_VISIBLE);
      }
      return next;
    });

    // Remove "entering" state after animation
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === toastId ? { ...t, entering: false } : t)),
      );
    }, 300);

    // Auto-dismiss after timeout
    setTimeout(() => {
      dismissToast(toastId);
    }, AUTO_DISMISS_MS);
  }, [events]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
    );
    // Remove after exit animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const handleClick = useCallback(
    (toast: ToastItem) => {
      const config = EVENT_CONFIGS[toast.event.type];
      dismissToast(toast.id);
      router.push(config.href);
    },
    [router, dismissToast],
  );

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-2 max-sm:right-2 max-sm:left-2 max-sm:bottom-20"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const config = EVENT_CONFIGS[toast.event.type];
        const colors = getColorsForEvent(toast.event);

        return (
          <button
            key={toast.id}
            onClick={() => handleClick(toast)}
            className={[
              'w-80 max-sm:w-full p-4 rounded-2xl shadow-lg border cursor-pointer',
              'bg-surface-container-lowest dark:bg-surface-container-lowest',
              'border-outline-variant',
              'transition-all duration-300 ease-out',
              'hover:shadow-xl hover:scale-[1.01]',
              'focus:outline-none focus:ring-2 focus:ring-primary/30',
              'text-left',
              toast.entering
                ? 'translate-y-4 opacity-0'
                : toast.exiting
                  ? 'translate-y-2 opacity-0 scale-95'
                  : 'translate-y-0 opacity-100',
            ].join(' ')}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-9 h-9 rounded-xl ${colors.iconBg} flex items-center justify-center flex-shrink-0`}
              >
                <span
                  className={`material-symbols-outlined text-lg ${colors.icon}`}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {config.icon}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-headline text-sm font-bold text-on-surface leading-snug">
                  {config.label}
                </p>
                <p className="font-body text-xs text-on-surface-variant mt-0.5 line-clamp-2">
                  {config.description(toast.event.payload)}
                </p>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant/40 text-base flex-shrink-0 mt-0.5">
                close
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
