'use client';

import { useRealtimeEvents, type RealtimeEvent } from '@/lib/useRealtimeEvents';
import { GOAL_LABELS, timeAgo } from '@be-candid/shared';
import type { GoalCategory, Severity } from '@be-candid/shared';

const SEVERITY_STYLES: Record<Severity, string> = {
  low: 'bg-tertiary-container text-on-tertiary-container',
  medium: 'bg-tertiary-container text-on-tertiary-container',
  high: 'bg-error/10 text-error',
};

const PLATFORM_ICONS: Record<string, string> = {
  web: 'language',
  extension: 'extension',
  ios: 'phone_iphone',
  android: 'phone_android',
};

interface LiveActivityDashboardProps {
  userId: string;
}

export default function LiveActivityDashboard({ userId }: LiveActivityDashboardProps) {
  const { events, connected, lastEventAt } = useRealtimeEvents(userId);

  // Today's summary
  const today = new Date().toISOString().slice(0, 10);
  const todayEvents = events.filter((e) => e.timestamp?.startsWith(today));

  // Group by category
  const categoryStats: Record<string, { count: number; minutes: number }> = {};
  for (const e of todayEvents) {
    const cat = e.category;
    if (!categoryStats[cat]) categoryStats[cat] = { count: 0, minutes: 0 };
    categoryStats[cat].count++;
    categoryStats[cat].minutes += Math.round((e.duration_seconds || 0) / 60);
  }

  const totalMinutes = Object.values(categoryStats).reduce((s, c) => s + c.minutes, 0);

  return (
    <div className="space-y-6">
      {/* Header with connection status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-headline text-lg font-bold text-on-surface">Live Activity</h3>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-error'}`} />
            <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider">
              {connected ? 'Connected' : 'Reconnecting'}
            </span>
          </div>
        </div>
        <span className="font-label text-xs text-on-surface-variant">
          {lastEventAt ? `Last event: ${timeAgo(lastEventAt)}` : 'No events yet'}
        </span>
      </div>

      {/* Today's summary pills */}
      {Object.keys(categoryStats).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(categoryStats).map(([cat, stat]) => (
            <span
              key={cat}
              className="px-3 py-1.5 rounded-full bg-primary/[0.08] text-primary font-label text-xs font-medium"
            >
              {GOAL_LABELS[cat as GoalCategory] || cat}: {stat.count} {stat.minutes > 0 ? `(${stat.minutes} min)` : ''}
            </span>
          ))}
          <span className="px-3 py-1.5 rounded-full bg-surface-container text-on-surface-variant font-label text-xs font-medium">
            Total: {todayEvents.length} events{totalMinutes > 0 ? `, ${totalMinutes} min` : ''}
          </span>
        </div>
      )}

      {/* Event stream */}
      <div className="max-h-[500px] overflow-y-auto space-y-2">
        {events.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4 block">timeline</span>
            <p className="font-headline text-base font-bold text-on-surface-variant/60">No activity recorded yet</p>
            <p className="font-body text-sm text-on-surface-variant/40 mt-1">
              Events from the browser extension, PWA, or manual logs will appear here in real-time.
            </p>
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-3 px-4 py-3 bg-surface-container-low/50 rounded-xl ring-1 ring-outline-variant/5 motion-safe:animate-fade-up"
            >
              {/* Time */}
              <span className="font-label text-xs text-on-surface-variant w-16 shrink-0">
                {timeAgo(event.timestamp)}
              </span>

              {/* Platform icon */}
              <span className="material-symbols-outlined text-on-surface-variant/50 text-base w-5 text-center shrink-0">
                {PLATFORM_ICONS[event.platform] || 'devices'}
              </span>

              {/* Category + app name */}
              <div className="flex-1 min-w-0">
                <span className="font-label text-sm font-medium text-on-surface">
                  {GOAL_LABELS[event.category as GoalCategory] || event.category}
                </span>
                {event.app_name && (
                  <span className="font-body text-xs text-on-surface-variant ml-2">
                    {event.app_name}
                  </span>
                )}
              </div>

              {/* Duration badge */}
              {event.duration_seconds && event.duration_seconds > 0 && (
                <span className="font-label text-[10px] font-semibold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full shrink-0">
                  {Math.round(event.duration_seconds / 60)} min
                </span>
              )}

              {/* Severity badge */}
              <span className={`font-label text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${SEVERITY_STYLES[event.severity as Severity] || ''}`}>
                {event.severity}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
