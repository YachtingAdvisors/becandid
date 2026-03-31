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
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>timeline</span>
        <div>
          <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">Activity</h1>
          <p className="text-sm text-on-surface-variant font-body">All flagged events, newest first.</p>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-label font-medium cursor-pointer transition-all duration-200 ${
            filter === 'all'
              ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
              : 'bg-surface-container text-on-surface-variant hover:bg-primary-container/30 hover:text-primary'
          }`}
        >
          All
        </button>
        {ALL_GOAL_CATEGORIES.filter(c => c !== 'custom').map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-label font-medium cursor-pointer transition-all duration-200 ${
              filter === cat
                ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                : 'bg-surface-container text-on-surface-variant hover:bg-primary-container/30 hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-sm">category</span> {GOAL_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Events list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-4 animate-pulse">
              <div className="h-5 bg-surface-container rounded w-48 mb-2" />
              <div className="h-3 bg-surface-container-low rounded w-32" />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-12 text-center">
          <span className="material-symbols-outlined text-on-surface-variant/60 text-5xl mb-4 block">target</span>
          <h3 className="font-headline text-xl font-bold text-on-surface mb-2">
            {filter === 'all' ? 'No events yet' : `No ${GOAL_LABELS[filter]} events`}
          </h3>
          <p className="text-sm text-on-surface-variant font-body">
            {filter === 'all'
              ? 'When awareness detects activity in your tracked areas, events will appear here.'
              : 'Try a different filter or keep it up!'}
          </p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 divide-y divide-outline-variant/30">
          {events.map((event) => (
            <div key={event.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container-low transition-all duration-200">
              <span className="material-symbols-outlined text-primary text-xl flex-shrink-0">monitoring</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-label font-medium text-on-surface">
                  {GOAL_LABELS[event.category] ?? event.category}
                </div>
                <div className="text-xs text-on-surface-variant font-label">
                  {event.app_name && `${event.app_name} \u00B7 `}
                  {event.platform} \u00B7 {timeAgo(event.timestamp)}
                </div>
              </div>
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${SEVERITY_STYLES[event.severity]}`}>
                {event.severity}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
