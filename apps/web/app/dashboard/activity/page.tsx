'use client';

import { useState, useEffect } from 'react';
import {
  GOAL_LABELS, getCategoryEmoji, timeAgo,
  ALL_GOAL_CATEGORIES,
  type GoalCategory, type Severity,
} from '@be-candid/shared';
import LiveActivityDashboard from '@/components/dashboard/LiveActivityDashboard';
import ManualActivityLog from '@/components/dashboard/ManualActivityLog';

interface EventRow {
  id: string;
  category: GoalCategory;
  severity: Severity;
  platform: string;
  app_name?: string;
  duration_seconds?: number;
  contested?: boolean;
  timestamp: string;
}

const SEVERITY_STYLES: Record<Severity, string> = {
  low: 'bg-tertiary-container text-on-tertiary-container',
  medium: 'bg-tertiary-container text-on-tertiary-container',
  high: 'bg-error/10 text-error',
};

export default function ActivityPage() {
  const [tab, setTab] = useState<'live' | 'history'>('history');
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<GoalCategory | 'all'>('all');
  const [userId, setUserId] = useState('');
  const [showLogModal, setShowLogModal] = useState(false);

  // Fetch user ID for real-time subscription
  useEffect(() => {
    fetch('/api/auth/profile')
      .then(r => r.json())
      .then(d => { if (d.profile?.id) setUserId(d.profile.id); })
      .catch(() => {});
  }, []);

  // Fetch history events
  useEffect(() => {
    if (tab !== 'history') return;
    setLoading(true);
    const params = new URLSearchParams({ limit: '100' });
    if (filter !== 'all') params.set('category', filter);

    fetch(`/api/events?${params}`)
      .then(r => r.json())
      .then(d => setEvents(d.events ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter, tab]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>timeline</span>
          <div>
            <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">Activity</h1>
            <p className="text-sm text-on-surface-variant font-body">Monitor your digital awareness in real-time.</p>
          </div>
        </div>
        <button
          onClick={() => setShowLogModal(true)}
          className="px-4 py-2.5 bg-primary text-on-primary rounded-full font-label text-sm font-semibold cursor-pointer shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-110 transition-all duration-200 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">add_circle</span>
          Log Activity
        </button>
      </div>

      {/* Tab toggle */}
      <div className="flex gap-1 bg-surface-container-low rounded-xl p-1">
        {(['live', 'history'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 px-4 py-2.5 rounded-lg font-label text-sm font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 ${
              tab === t
                ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {t === 'live' ? 'stream' : 'history'}
            </span>
            {t === 'live' ? 'Live Feed' : 'History'}
          </button>
        ))}
      </div>

      {/* Live tab */}
      {tab === 'live' && (
        userId ? (
          <LiveActivityDashboard userId={userId} />
        ) : (
          <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4 block">timeline</span>
            <p className="font-headline text-base font-bold text-on-surface-variant/60">Loading activity feed...</p>
            <p className="font-body text-sm text-on-surface-variant/40 mt-1">If this persists, try switching to the History tab.</p>
          </div>
        )
      )}

      {/* History tab */}
      {tab === 'history' && (
        <>
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
                {GOAL_LABELS[cat]}
              </button>
            ))}
          </div>

          {/* Events list */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-4 motion-safe:animate-pulse">
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
                  ? 'Install the browser extension or log activity manually to start tracking.'
                  : 'Try a different filter or keep it up!'}
              </p>
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 divide-y divide-outline-variant/10">
              {events.map((event) => (
                <div key={event.id} className="flex items-center gap-4 px-4 py-3 hover:bg-surface-container-low/50 transition-all duration-200">
                  <span className="material-symbols-outlined text-primary text-xl flex-shrink-0">monitoring</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-label font-medium text-on-surface">
                      {GOAL_LABELS[event.category] ?? event.category}
                      {event.app_name && (
                        <span className="text-on-surface-variant font-normal"> — {event.app_name}</span>
                      )}
                    </div>
                    <div className="text-xs text-on-surface-variant font-label">
                      {event.platform}
                      {event.duration_seconds ? ` · ${Math.round(event.duration_seconds / 60)}m` : ''}
                      {' · '}{timeAgo(event.timestamp)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {event.contested ? (
                      <span className="text-[10px] font-label font-medium text-amber-600 px-2 py-0.5 rounded-full bg-amber-50 ring-1 ring-amber-200/50">Under Review</span>
                    ) : (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          const reason = prompt('Why is this flag incorrect? Describe briefly:');
                          if (!reason?.trim()) return;
                          const res = await fetch('/api/events/contest', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ event_id: event.id, reason: reason.trim() }),
                          });
                          if (res.ok) {
                            setEvents(prev => prev.map(ev => ev.id === event.id ? { ...ev, contested: true } : ev));
                          }
                        }}
                        className="text-[10px] font-label font-medium text-on-surface-variant/60 hover:text-primary px-2 py-0.5 rounded-full hover:bg-primary/5 cursor-pointer transition-colors"
                        title="Contest this flag"
                      >
                        Contest
                      </button>
                    )}
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${SEVERITY_STYLES[event.severity]}`}>
                      {event.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Manual Activity Log Modal */}
      <ManualActivityLog
        open={showLogModal}
        onClose={() => setShowLogModal(false)}
        onLogged={() => {
          setShowLogModal(false);
          if (tab === 'history') {
            // Refresh history
            setLoading(true);
            fetch('/api/events?limit=100')
              .then(r => r.json())
              .then(d => setEvents(d.events ?? []))
              .finally(() => setLoading(false));
          }
        }}
      />
    </div>
  );
}
