'use client';

import { useState, useEffect } from 'react';
import { GOAL_LABELS, getCategoryEmoji, timeAgo, type GoalCategory, type Severity } from '@be-candid/shared';
import { useMilestoneToasts } from '@/components/dashboard/MilestoneToast';
import Link from 'next/link';

interface PartnerData {
  id: string;
  partner_name: string;
  partner_email: string;
  partner_phone: string | null;
  status: 'pending' | 'active' | 'declined';
  invited_at: string;
  accepted_at: string | null;
}

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
  const [partner, setPartner] = useState<PartnerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reinviting, setReinviting] = useState(false);
  const { ToastContainer, showMilestones } = useMilestoneToasts();

  useEffect(() => {
    // Fetch partner info + alerts + profile in parallel
    Promise.all([
      fetch('/api/partners').then(r => r.json()).catch(() => ({})),
      fetch('/api/alerts?limit=30').then(r => r.json()).catch(() => ({})),
    ]).then(([partnerData, alertsData]) => {
      setPartner(partnerData.partner ?? null);
      setAlerts(alertsData.alerts ?? []);
    }).finally(() => setLoading(false));
  }, []);

  async function handleReinvite() {
    if (!partner) return;
    setReinviting(true);
    await fetch('/api/partners/reinvite', { method: 'POST' }).catch(() => {});
    setReinviting(false);
  }

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
          <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">Partner Conversations</h1>
          <p className="text-sm text-on-surface-variant font-body">Your accountability partner, conversation guides, and conversation history.</p>
        </div>
      </div>

      {/* Philosophy callout */}
      <div className="bg-gradient-to-br from-amber-50/60 to-primary-container/20 rounded-2xl ring-1 ring-amber-200/30 p-5">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-amber-700 text-xl mt-0.5 flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>local_library</span>
          <div>
            <p className="text-sm text-on-surface leading-relaxed font-body italic">
              &ldquo;If we are not heedful of the way the Spirit of God works in us, we will become spiritual hypocrites. We see where other folks are failing, and we turn our discernment into the gibe of criticism instead of into intercession on their behalf.&rdquo;
            </p>
            <p className="text-xs text-on-surface-variant font-label mt-1.5 mb-2">&mdash; Oswald Chambers, <span className="italic">My Utmost for His Highest</span></p>
            <p className="text-xs text-on-surface-variant font-body leading-relaxed">
              Accountability isn&rsquo;t about catching someone in a fall, it&rsquo;s about standing beside them in prayer so they don&rsquo;t have to get up alone. Lead with your own honesty before asking for theirs.
            </p>
          </div>
        </div>
      </div>

      {/* Partner card */}
      {partner ? (
        <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-primary font-headline font-bold text-lg flex-shrink-0">
              {partner.partner_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-headline text-base font-bold text-on-surface">{partner.partner_name}</h3>
              <p className="text-xs text-on-surface-variant font-body truncate">{partner.partner_email}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-[10px] font-label font-bold uppercase tracking-wider ${
              partner.status === 'active'
                ? 'bg-primary-container text-primary'
                : partner.status === 'pending'
                  ? 'bg-tertiary-container text-on-tertiary-container'
                  : 'bg-error/10 text-error'
            }`}>
              {partner.status}
            </div>
          </div>
          {partner.status === 'pending' && (
            <div className="mt-3 flex items-center gap-3">
              <p className="text-xs text-on-surface-variant font-body flex-1">
                {partner.partner_name} hasn&apos;t accepted yet.
              </p>
              <button onClick={handleReinvite} disabled={reinviting}
                className="px-4 py-1.5 text-xs font-label font-semibold text-primary border border-primary-container rounded-full hover:bg-primary-container/20 cursor-pointer disabled:opacity-50 transition-all duration-200">
                {reinviting ? 'Sending\u2026' : 'Resend Invite'}
              </button>
            </div>
          )}
          {partner.status === 'active' && (
            <div className="mt-3 flex gap-2">
              <Link href="/partner/focus"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-label font-medium text-primary bg-primary-container/20 rounded-full hover:bg-primary-container/40 cursor-pointer transition-all duration-200">
                <span className="material-symbols-outlined text-sm">center_focus_strong</span> Their Focus
              </Link>
              <Link href="/partner/checkins"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-label font-medium text-primary bg-primary-container/20 rounded-full hover:bg-primary-container/40 cursor-pointer transition-all duration-200">
                <span className="material-symbols-outlined text-sm">check_circle</span> Check-ins
              </Link>
            </div>
          )}
        </div>
      ) : !loading ? (
        <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-6 text-center">
          <span className="material-symbols-outlined text-on-surface-variant/40 text-3xl mb-2 block">handshake</span>
          <h3 className="font-headline text-base font-bold text-on-surface mb-1">No partner yet</h3>
          <p className="text-xs text-on-surface-variant font-body mb-3">Invite someone you trust for accountability.</p>
          <Link href="/onboarding?step=partner"
            className="inline-flex px-5 py-2 bg-primary text-on-primary text-xs font-label font-semibold rounded-full cursor-pointer hover:brightness-110 shadow-lg shadow-primary/20 transition-all duration-200">
            Invite a Partner
          </Link>
        </div>
      ) : null}

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
                    {GOAL_LABELS[(alert.events?.category ?? 'unknown') as GoalCategory] ?? 'Alert'}
                  </div>
                  <div className="text-xs text-on-surface-variant font-label">{timeAgo(alert.sent_at)}</div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${SEVERITY_STYLES[(alert.events?.severity ?? 'low') as Severity]}`}>
                  {alert.events?.severity ?? 'low'}
                </span>
              </div>

              {alert.ai_guide_user && (
                <div className="mb-3 px-3 py-2 rounded-2xl bg-primary-container/30 border border-primary-container text-xs text-primary font-body">
                  Conversation guide available &mdash; <Link href={`/conversation/${alert.id}`} className="font-label font-semibold underline cursor-pointer hover:text-primary/80 transition-colors duration-200">view full guide</Link>
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
                <div key={alert.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container-low cursor-pointer transition-all duration-200">
                  <span className="material-symbols-outlined text-on-surface-variant text-lg">flag</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-label font-medium text-on-surface">
                      {GOAL_LABELS[(alert.events?.category ?? 'unknown') as GoalCategory] ?? 'Alert'}
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
          <span className="material-symbols-outlined text-on-surface-variant/60 text-5xl mb-4 block">forum</span>
          <h3 className="font-headline text-xl font-bold text-on-surface mb-2">No conversations yet</h3>
          <p className="text-sm text-on-surface-variant font-body">When alerts are triggered, your conversation guides will appear here.</p>
        </div>
      )}
    </div>
  );
}
