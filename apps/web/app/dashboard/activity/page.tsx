'use client';

import { useState, useEffect } from 'react';
import {
  GOAL_LABELS, getCategoryEmoji, timeAgo,
  ALL_GOAL_CATEGORIES,
  type GoalCategory, type Severity,
} from '@be-candid/shared';

interface EventRow {
  id: string;
  category: GoalCategory;
  severity: Severity;
  platform: string;
  app_name?: string;
  timestamp: string;
}

const SEVERITY_STYLES: Record<Severity, string> = {
  low: 'bg-amber-100 text-amber-800',
  medium: 'bg-orange-100 text-orange-800',
  high: 'bg-red-100 text-red-800',
};

export default function ActivityPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<GoalCategory | 'all'>('all');

  useEffect(() => {
    const params = new URLSearchParams({ limit: '100' });
    if (filter !== 'all') params.set('category', filter);

    fetch(`/api/events?${params}`)
      .then(r => r.json())
      .then(d => setEvents(d.events ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  // Get unique categories from events for filter pills
  const usedCategories = [...new Set(events.map(e => e.category))];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink mb-1">Activity Feed</h1>
        <p className="text-sm text-ink-muted">All flagged events, newest first.</p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            filter === 'all'
              ? 'bg-brand-600 text-white'
              : 'bg-surface-muted text-ink-muted hover:bg-brand-100 hover:text-brand-700'
          }`}
        >
          All
        </button>
        {ALL_GOAL_CATEGORIES.filter(c => c !== 'custom').map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === cat
                ? 'bg-brand-600 text-white'
                : 'bg-surface-muted text-ink-muted hover:bg-brand-100 hover:text-brand-700'
            }`}
          >
            {getCategoryEmoji(cat)} {GOAL_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Events list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-48 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-32" />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="font-display text-xl font-semibold text-ink mb-2">
            {filter === 'all' ? 'No events yet' : `No ${GOAL_LABELS[filter]} events`}
          </h3>
          <p className="text-sm text-ink-muted">
            {filter === 'all'
              ? 'When monitoring detects activity in your tracked areas, events will appear here.'
              : 'Try a different filter or keep it up!'}
          </p>
        </div>
      ) : (
        <div className="card divide-y divide-surface-border/50">
          {events.map((event) => (
            <div key={event.id} className="flex items-center gap-3 px-4 py-3.5">
              <span className="text-xl flex-shrink-0">
                {getCategoryEmoji(event.category)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-ink">
                  {GOAL_LABELS[event.category] ?? event.category}
                </div>
                <div className="text-xs text-ink-muted">
                  {event.app_name && `${event.app_name} · `}
                  {event.platform} · {timeAgo(event.timestamp)}
                </div>
              </div>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${SEVERITY_STYLES[event.severity]}`}>
                {event.severity}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
