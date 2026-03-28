'use client';

import { useState, useEffect } from 'react';
import { GOAL_LABELS, getCategoryEmoji, timeAgo, type GoalCategory, type Severity } from '@be-candid/shared';
import { useMilestoneToasts } from '@/components/dashboard/MilestoneToast';
import Link from 'next/link';

interface AlertRow {
  id: string;
  sent_at: string;
  ai_guide_user: string | null;
  events: { category: GoalCategory; severity: Severity; platform: string; timestamp: string } | null;
  conversations: Array<{ id: string; completed_at: string | null; outcome: string | null; notes: string | null }>;
}

const SEVERITY_STYLES: Record<Severity, string> = {
  low: 'bg-amber-100 text-amber-800',
  medium: 'bg-orange-100 text-orange-800',
  high: 'bg-red-100 text-red-800',
};

export default function ConversationsPage() {
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { ToastContainer, showMilestones } = useMilestoneToasts();

  useEffect(() => {
    fetch('/api/conversations')
      .then(r => r.json())
      .then(d => {
        // Restructure - get alerts with their conversations
        fetch('/api/conversations?limit=30')
          .then(r2 => r2.json())
          .then(d2 => setAlerts(d2.alerts ?? d2.conversations ?? []))
          .catch(() => setAlerts([]));
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    // Actually just fetch alerts directly
    fetch('/api/alerts?limit=30')
      .then(r => r.json())
      .then(d => setAlerts(d.alerts ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function markComplete(alertId: string, outcome: 'positive' | 'neutral' | 'difficult') {
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alertId, outcome }),
    });

    if (res.ok) {
      const data = await res.json();
      setAlerts(prev => prev.map(a =>
        a.id === alertId
          ? { ...a, conversations: [{ id: data.conversationId, completed_at: new Date().toISOString(), outcome, notes: null }] }
          : a
      ));
      if (data.milestonesUnlocked?.length > 0) showMilestones(data.milestonesUnlocked);
    }
  }

  const pending = alerts.filter(a => !a.conversations?.[0]?.completed_at);
  const completed = alerts.filter(a => a.conversations?.[0]?.completed_at);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <ToastContainer />

      <div>
        <h1 className="font-display text-3xl font-semibold text-ink mb-1">Conversations</h1>
        <p className="text-sm text-ink-muted">Alerts, AI guides, and accountability conversations.</p>
      </div>

      {/* Pending conversations */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display text-sm font-semibold text-ink uppercase tracking-wider">Needs Conversation ({pending.length})</h2>
          {pending.map(alert => (
            <div key={alert.id} className="card p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl">{getCategoryEmoji(alert.events?.category as GoalCategory)}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-ink">
                    {GOAL_LABELS[alert.events?.category as GoalCategory] ?? 'Alert'}
                  </div>
                  <div className="text-xs text-ink-muted">{timeAgo(alert.sent_at)}</div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${SEVERITY_STYLES[alert.events?.severity as Severity ?? 'medium']}`}>
                  {alert.events?.severity}
                </span>
              </div>

              {alert.ai_guide_user && (
                <div className="mb-3 px-3 py-2 rounded-xl bg-brand-50 border border-brand-200 text-xs text-brand-700">
                  AI conversation guide available — <Link href={`/conversation/${alert.id}`} className="font-semibold underline">view full guide</Link>
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={() => markComplete(alert.id, 'positive')}
                  className="flex-1 py-2 text-xs font-medium rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors">
                  ✅ Positive
                </button>
                <button onClick={() => markComplete(alert.id, 'neutral')}
                  className="flex-1 py-2 text-xs font-medium rounded-xl bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 transition-colors">
                  😐 Neutral
                </button>
                <button onClick={() => markComplete(alert.id, 'difficult')}
                  className="flex-1 py-2 text-xs font-medium rounded-xl bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors">
                  💪 Difficult
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display text-sm font-semibold text-ink uppercase tracking-wider">Completed ({completed.length})</h2>
          <div className="card divide-y divide-surface-border/50">
            {completed.map(alert => {
              const conv = alert.conversations[0];
              const OUTCOME_STYLE: Record<string, string> = {
                positive: 'bg-emerald-50 text-emerald-700',
                neutral: 'bg-gray-50 text-gray-600',
                difficult: 'bg-red-50 text-red-700',
              };
              return (
                <div key={alert.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-lg">{getCategoryEmoji(alert.events?.category as GoalCategory)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-ink">
                      {GOAL_LABELS[alert.events?.category as GoalCategory] ?? 'Alert'}
                    </div>
                    <div className="text-xs text-ink-muted">{timeAgo(alert.sent_at)}</div>
                  </div>
                  {conv?.outcome && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${OUTCOME_STYLE[conv.outcome] ?? ''}`}>
                      {conv.outcome}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {alerts.length === 0 && !loading && (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-4">💬</div>
          <h3 className="font-display text-xl font-semibold text-ink mb-2">No conversations yet</h3>
          <p className="text-sm text-ink-muted">When alerts are triggered, your conversation guides will appear here.</p>
        </div>
      )}
    </div>
  );
}
