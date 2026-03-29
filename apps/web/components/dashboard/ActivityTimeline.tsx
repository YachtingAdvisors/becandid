'use client';

import { useState, useEffect } from 'react';

interface TimelineEvent {
  id: string;
  timestamp: string;
  category: string;
  severity: 'low' | 'medium' | 'high';
  app_name: string | null;
  duration_seconds: number | null;
  blocked: boolean;
  flagged: boolean;
}

const CATEGORY_EMOJI: Record<string, string> = {
  sexual_content: '\uD83D\uDEAB',
  social_media: '\uD83D\uDCF1',
  gambling: '\uD83C\uDFB0',
  substances: '\uD83C\uDF78',
  gaming: '\uD83C\uDFAE',
  violence: '\u2694\uFE0F',
  other: '\uD83D\uDCCB',
};

const SEVERITY_STYLES: Record<string, string> = {
  low: 'bg-primary-container text-primary',
  medium: 'bg-tertiary-container text-on-tertiary-container',
  high: 'bg-error/10 text-error',
};

type FilterTab = 'all' | 'flagged' | 'blocked';

function formatDuration(seconds: number | null): string {
  if (!seconds) return '';
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface ActivityTimelineProps {
  events?: TimelineEvent[];
}

export default function ActivityTimeline({ events: propEvents }: ActivityTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>(propEvents ?? []);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [loading, setLoading] = useState(!propEvents);

  useEffect(() => {
    if (propEvents) return;
    setLoading(true);
    fetch('/api/events')
      .then((r) => r.json())
      .then((data) => setEvents(data.events ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [propEvents]);

  const filtered = events.filter((e) => {
    if (filter === 'flagged') return e.flagged;
    if (filter === 'blocked') return e.blocked;
    return true;
  });

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'flagged', label: 'Flagged' },
    { key: 'blocked', label: 'Blocked' },
  ];

  return (
    <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant overflow-hidden">
      <div className="px-5 py-4 border-b border-outline-variant flex items-center justify-between">
        <h3 className="font-headline text-sm font-bold text-on-surface">Activity Timeline</h3>
        <div className="flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-3 py-1 rounded-full text-xs font-label font-medium transition-colors ${
                filter === t.key
                  ? 'bg-primary text-on-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="px-5 py-10 text-center text-sm text-on-surface-variant font-body">
            Loading activity...
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-on-surface-variant font-body">
            No activity recorded yet
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/50">
            {filtered.map((event) => (
              <div key={event.id} className="flex items-center gap-3 px-5 py-3.5">
                <span className="text-xl flex-shrink-0">
                  {CATEGORY_EMOJI[event.category] ?? '\uD83D\uDCCB'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-on-surface font-body truncate">
                      {event.app_name ?? event.category}
                    </span>
                    {event.duration_seconds ? (
                      <span className="text-xs text-on-surface-variant font-label">
                        {formatDuration(event.duration_seconds)}
                      </span>
                    ) : null}
                  </div>
                  <div className="text-xs text-on-surface-variant font-label">
                    {timeAgo(event.timestamp)}
                  </div>
                </div>
                <span
                  className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-label font-semibold ${SEVERITY_STYLES[event.severity] ?? ''}`}
                >
                  {event.severity}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
