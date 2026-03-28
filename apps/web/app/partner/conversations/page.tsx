'use client';

import { useState, useEffect } from 'react';
import { GOAL_LABELS, getCategoryEmoji, timeAgo, type GoalCategory, type Severity } from '@be-candid/shared';
import Link from 'next/link';

interface AlertRow {
  id: string;
  sent_at: string;
  ai_guide_partner: string | null;
  events: { category: GoalCategory; severity: Severity; timestamp: string } | null;
  conversations: Array<{ completed_at: string | null; outcome: string | null }>;
}

const OUTCOME_STYLES: Record<string, string> = {
  positive:  'bg-emerald-50 text-emerald-700',
  neutral:   'bg-gray-50 text-gray-600',
  difficult: 'bg-red-50 text-red-700',
};

export default function PartnerConversationsPage() {
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [monitoredName, setMonitoredName] = useState('Your partner');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch via partner focus endpoint to get the monitored user's alerts
    fetch('/api/partner/focus')
      .then(r => r.json())
      .then(d => {
        if (d.monitoredUserName) setMonitoredName(d.monitoredUserName);
      })
      .catch(() => {});

    // For alerts, we need to get them from the partner perspective
    // The alerts API filters by user_id, so we fetch via a partner-specific endpoint
    fetch('/api/partner/alerts')
      .then(r => r.json())
      .then(d => setAlerts(d.alerts ?? []))
      .catch(() => setAlerts([]))
      .finally(() => setLoading(false));
  }, []);

  const pending = alerts.filter(a => !a.conversations?.[0]?.completed_at);
  const completed = alerts.filter(a => a.conversations?.[0]?.completed_at);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink mb-1">
          {monitoredName}'s Conversations
        </h1>
        <p className="text-sm text-ink-muted">
          View alerts and conversation history. Use the guides to have better conversations.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-48 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-32" />
            </div>
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-4">💬</div>
          <h3 className="font-display text-xl font-semibold text-ink mb-2">No alerts yet</h3>
          <p className="text-sm text-ink-muted">
            When {monitoredName} triggers an alert, conversation guides will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Pending */}
          {pending.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                Needs Conversation ({pending.length})
              </h2>
              {pending.map(a => (
                <div key={a.id} className="card p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xl">{getCategoryEmoji(a.events?.category as GoalCategory)}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-ink">
                        {GOAL_LABELS[a.events?.category as GoalCategory] ?? 'Alert'}
                      </div>
                      <div className="text-xs text-ink-muted">{timeAgo(a.sent_at)}</div>
                    </div>
                  </div>
                  {a.ai_guide_partner && (
                    <Link href={`/conversation/${a.id}`}
                      className="block w-full py-2.5 text-center text-sm font-medium bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors">
                      View Your Conversation Guide →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                Completed ({completed.length})
              </h2>
              <div className="card divide-y divide-surface-border/50">
                {completed.map(a => {
                  const conv = a.conversations[0];
                  return (
                    <div key={a.id} className="flex items-center gap-3 px-4 py-3">
                      <span className="text-lg">{getCategoryEmoji(a.events?.category as GoalCategory)}</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-ink">
                          {GOAL_LABELS[a.events?.category as GoalCategory] ?? 'Alert'}
                        </div>
                        <div className="text-xs text-ink-muted">{timeAgo(a.sent_at)}</div>
                      </div>
                      {conv?.outcome && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${OUTCOME_STYLES[conv.outcome] ?? ''}`}>
                          {conv.outcome}
                        </span>
                      )}
                      <Link href={`/conversation/${a.id}`} className="text-xs text-brand-600 font-medium hover:underline">
                        Guide
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
