'use client';

// ============================================================
// PartnerRealtimeProvider — Client wrapper that resolves the
// monitored user ID and renders toast notifications for
// real-time partner events (alerts, check-ins, focus updates).
// ============================================================

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { usePartnerRealtime, type PartnerRealtimeEvent } from '@/hooks/usePartnerRealtime';

interface ToastItem {
  id: string;
  event: PartnerRealtimeEvent;
  entering: boolean;
  exiting: boolean;
}

const MAX_VISIBLE = 3;
const AUTO_DISMISS_MS = 5000;

const EVENT_DISPLAY: Record<
  PartnerRealtimeEvent['type'],
  { icon: string; label: string; href: string; iconColor: string; iconBg: string }
> = {
  alert: {
    icon: 'warning',
    label: 'New flag detected',
    href: '/partner/focus',
    iconColor: 'text-red-600 dark:text-red-400',
    iconBg: 'bg-red-100 dark:bg-red-900/40',
  },
  check_in: {
    icon: 'check_circle',
    label: 'Check-in update',
    href: '/partner/checkins',
    iconColor: 'text-teal-600 dark:text-teal-400',
    iconBg: 'bg-teal-100 dark:bg-teal-900/40',
  },
  focus_segment: {
    icon: 'center_focus_strong',
    label: 'Focus update',
    href: '/partner/focus',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
  },
};

function describeEvent(event: PartnerRealtimeEvent): string {
  const p = event.payload;
  switch (event.type) {
    case 'alert': {
      const cat = (p.category ?? 'activity').replace(/_/g, ' ');
      return `${(p.severity ?? 'medium')} severity — ${cat}`;
    }
    case 'check_in':
      return p.status === 'completed'
        ? 'Check-in completed'
        : p.user_mood
          ? `Mood: ${p.user_mood}`
          : 'New check-in activity';
    case 'focus_segment': {
      const seg = p.segment ?? 'segment';
      const st = p.status ?? 'focused';
      return `${seg.charAt(0).toUpperCase() + seg.slice(1)}: ${st}`;
    }
    default:
      return 'New activity';
  }
}

export default function PartnerRealtimeProvider() {
  const [monitoredUserId, setMonitoredUserId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const processedRef = useRef(new Set<string>());
  const router = useRouter();

  // Resolve the monitored user ID from the partnership
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      const userId = data.user?.id;
      if (!userId) return;

      const { data: partnership } = await supabase
        .from('partners')
        .select('user_id')
        .eq('partner_user_id', userId)
        .eq('status', 'active')
        .maybeSingle();

      if (partnership?.user_id) {
        setMonitoredUserId(partnership.user_id);
      }
    });
  }, []);

  const { events } = usePartnerRealtime(monitoredUserId);

  // Convert events to toasts
  useEffect(() => {
    if (events.length === 0) return;
    const latest = events[0];
    const key = `${latest.type}:${latest.timestamp}:${JSON.stringify(latest.payload?.id ?? '')}`;
    if (processedRef.current.has(key)) return;
    processedRef.current.add(key);

    if (processedRef.current.size > 200) {
      const entries = Array.from(processedRef.current);
      entries.slice(0, 100).forEach((k) => processedRef.current.delete(k));
    }

    const toastId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    setToasts((prev) => {
      const next = [{ id: toastId, event: latest, entering: true, exiting: false }, ...prev];
      return next.length > MAX_VISIBLE ? next.slice(0, MAX_VISIBLE) : next;
    });

    setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === toastId ? { ...t, entering: false } : t)));
    }, 300);

    setTimeout(() => dismissToast(toastId), AUTO_DISMISS_MS);
  }, [events]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const handleClick = useCallback(
    (toast: ToastItem) => {
      const display = EVENT_DISPLAY[toast.event.type];
      dismissToast(toast.id);
      router.push(display.href);
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
        const display = EVENT_DISPLAY[toast.event.type];

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
                className={`w-9 h-9 rounded-xl ${display.iconBg} flex items-center justify-center flex-shrink-0`}
              >
                <span
                  className={`material-symbols-outlined text-lg ${display.iconColor}`}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {display.icon}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-headline text-sm font-bold text-on-surface leading-snug">
                  {display.label}
                </p>
                <p className="font-body text-xs text-on-surface-variant mt-0.5 line-clamp-2">
                  {describeEvent(toast.event)}
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
