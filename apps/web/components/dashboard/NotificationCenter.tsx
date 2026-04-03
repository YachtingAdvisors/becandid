'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/* ── Types ───────────────────────────────────────────────── */

interface Notification {
  id: string;
  type: 'nudge' | 'partner' | 'checkin' | 'milestone' | 'streak';
  message: string;
  timestamp: string;
  read: boolean;
}

const TYPE_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  nudge:     { icon: 'psychology',    color: 'text-teal-600',  bg: 'bg-teal-50' },
  partner:   { icon: 'chat',          color: 'text-secondary', bg: 'bg-secondary-container/30' },
  checkin:   { icon: 'schedule',      color: 'text-tertiary',  bg: 'bg-tertiary-container/30' },
  milestone: { icon: 'emoji_events',  color: 'text-amber-600', bg: 'bg-amber-50' },
  streak:    { icon: 'local_fire_department', color: 'text-primary', bg: 'bg-primary/10' },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ── Component ───────────────────────────────────────────── */

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications ?? []);
        setUnreadCount(data.unreadCount ?? 0);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount and every 60 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  async function markAllRead() {
    try {
      await fetch('/api/notifications?mark_read=true');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {
      // silently fail
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => { setOpen(!open); if (!open) fetchNotifications(); }}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-container cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30"
        aria-label="Notifications"
      >
        <span className="material-symbols-outlined text-lg">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-label font-bold leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-80 max-h-[400px] bg-surface-container-lowest rounded-2xl shadow-2xl ring-1 ring-outline-variant/20 flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/20">
            <h3 className="font-headline text-sm font-bold text-on-surface">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-label font-medium text-primary hover:text-primary/80 cursor-pointer transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto">
            {loading && notifications.length === 0 && (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 px-4">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant/30 mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>
                  notifications_off
                </span>
                <p className="font-body text-sm text-on-surface-variant">You&apos;re all caught up!</p>
              </div>
            )}

            {notifications.map(notif => {
              const config = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.nudge;
              return (
                <div
                  key={notif.id}
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-surface-container/50 transition-colors ${
                    !notif.read ? 'bg-primary/[0.03]' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <span className={`material-symbols-outlined text-base ${config.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                      {config.icon}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm text-on-surface leading-snug">{notif.message}</p>
                    <p className="font-label text-[10px] text-on-surface-variant mt-0.5">{timeAgo(notif.timestamp)}</p>
                  </div>
                  {!notif.read && (
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
