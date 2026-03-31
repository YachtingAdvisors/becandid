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
  low: 'bg-tertiary-container text-on-tertiary-container',
  medium: 'bg-tertiary-container text-on-tertiary-container',
  high: 'bg-error/10 text-error',
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

      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>forum</span>
        <div>
          <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">Conversations</h1>
          <p className="text-sm text-on-surface-variant font-body">Alerts, AI guides, and accountability conversations.</p>
        </div>
      </div>

      {/* Pending conversations */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-headline text-sm font-bold text-on-surface-variant uppercase tracking-widest">Needs Conversation ({pending.length})</h2>
          {pending.map(alert => (
            <div key={alert.id} className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-6">
              <div className="flex items-center gap-4 mb-3">
                <span className="material-symbols-outlined text-primary text-xl">flag</span>
                <div className="flex-1">
                  <div className="text-sm font-label font-medium text-on-surface">
                    {GOAL_LABELS[alert.events?.category as GoalCategory] ?? 'Alert'}
                  </div>
                  <div className="text-xs text-on-surface-variant font-label">{timeAgo(alert.sent_at)}</div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${SEVERITY_STYLES[alert.events?.severity as Severity ?? 'medium']}`}>
                  {alert.events?.severity}
                </span>
              </div>

              {alert.ai_guide_user && (
                <div className="mb-3 px-3 py-2 rounded-2xl bg-primary-container/30 border border-primary-container text-xs text-primary font-body">
                  AI conversation guide available &mdash; <Link href={`/conversation/${alert.id}`} className="font-label font-semibold underline">view full guide</Link>
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={() => markComplete(alert.id, 'positive')}
                  className="flex-1 py-2 min-h-[44px] text-xs font-label font-medium rounded-full bg-primary-container/30 text-primary border border-primary-container hover:bg-primary-container/50 cursor-pointer transition-all duration-200 inline-flex items-center justify-center gap-1 hover:shadow-lg hover:shadow-primary/10">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>sentiment_satisfied</span> Positive
                </button>
                <button onClick={() => markComplete(alert.id, 'neutral')}
                  className="flex-1 py-2 min-h-[44px] text-xs font-label font-medium rounded-full bg-surface-container text-on-surface-variant border border-outline-variant hover:bg-surface-container-low cursor-pointer transition-all duration-200 inline-flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-sm">sentiment_neutral</span> Neutral
                </button>
                <button onClick={() => markComplete(alert.id, 'difficult')}
                  className="flex-1 py-2 min-h-[44px] text-xs font-label font-medium rounded-full bg-error/5 text-error border border-error/20 hover:bg-error/10 cursor-pointer transition-all duration-200 inline-flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-sm">fitness_center</span> Difficult
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-headline text-sm font-bold text-on-surface-variant uppercase tracking-widest">Completed ({completed.length})</h2>
          <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 divide-y divide-outline-variant/30">
            {completed.map(alert => {
              const conv = alert.conversations[0];
              const OUTCOME_STYLE: Record<string, string> = {
                positive: 'bg-primary-container/30 text-primary',
                neutral: 'bg-surface-container text-on-surface-variant',
                difficult: 'bg-error/5 text-error',
              };
              return (
                <div key={alert.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container-low">
                  <span className="material-symbols-outlined text-on-surface-variant text-lg">flag</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-label font-medium text-on-surface">
                      {GOAL_LABELS[alert.events?.category as GoalCategory] ?? 'Alert'}
                    </div>
                    <div className="text-xs text-on-surface-variant font-label">{timeAgo(alert.sent_at)}</div>
                  </div>
                  {conv?.outcome && (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${OUTCOME_STYLE[conv.outcome] ?? ''}`}>
                      {conv.outcome}
                    </span>
                  )}
                  <span className="material-symbols-outlined text-on-surface-variant text-lg">chevron_right</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {alerts.length === 0 && !loading && (
        <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-12 text-center">
          <span className="material-symbols-outlined text-on-surface-variant text-4xl mb-4 block">forum</span>
          <h3 className="font-headline text-xl font-bold text-on-surface mb-2">No conversations yet</h3>
          <p className="text-sm text-on-surface-variant font-body">When alerts are triggered, your conversation guides will appear here.</p>
        </div>
      )}
    </div>
  );
}
