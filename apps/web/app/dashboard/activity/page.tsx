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
  low: 'bg-tertiary-container text-on-tertiary-container',
  medium: 'bg-tertiary-container text-on-tertiary-container',
  high: 'bg-error/10 text-error',
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
        <h1 className="font-headline text-3xl font-bold text-on-surface mb-1">Activity Feed</h1>
        <p className="text-sm text-on-surface-variant font-body">All flagged events, newest first.</p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-label font-medium transition-colors ${
            filter === 'all'
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container text-on-surface-variant hover:bg-primary-container/30 hover:text-primary'
          }`}
        >
          All
        </button>
        {ALL_GOAL_CATEGORIES.filter(c => c !== 'custom').map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-label font-medium transition-colors ${
              filter === cat
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container text-on-surface-variant hover:bg-primary-container/30 hover:text-primary'
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
            <div key={i} className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-4 animate-pulse">
              <div className="h-5 bg-surface-container rounded w-48 mb-2" />
              <div className="h-3 bg-surface-container-low rounded w-32" />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-12 text-center">
          <div className="text-4xl mb-4">{'\uD83C\uDFAF'}</div>
          <h3 className="font-headline text-xl font-bold text-on-surface mb-2">
            {filter === 'all' ? 'No events yet' : `No ${GOAL_LABELS[filter]} events`}
          </h3>
          <p className="text-sm text-on-surface-variant font-body">
            {filter === 'all'
              ? 'When monitoring detects activity in your tracked areas, events will appear here.'
              : 'Try a different filter or keep it up!'}
          </p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant divide-y divide-outline-variant/50">
          {events.map((event) => (
            <div key={event.id} className="flex items-center gap-3 px-5 py-3.5">
              <span className="text-xl flex-shrink-0">
                {getCategoryEmoji(event.category)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-label font-medium text-on-surface">
                  {GOAL_LABELS[event.category] ?? event.category}
                </div>
                <div className="text-xs text-on-surface-variant font-label">
                  {event.app_name && `${event.app_name} \u00B7 `}
                  {event.platform} \u00B7 {timeAgo(event.timestamp)}
                </div>
              </div>
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-label font-semibold ${SEVERITY_STYLES[event.severity]}`}>
                {event.severity}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
