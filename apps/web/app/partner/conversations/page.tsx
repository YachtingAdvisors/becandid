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

const CATEGORY_ICONS: Record<string, string> = {
  gambling: 'casino',
  alcohol: 'local_bar',
  drugs: 'medication',
  smoking: 'smoking_rooms',
  porn: 'visibility_off',
  social_media: 'phone_android',
  gaming: 'sports_esports',
  shopping: 'shopping_cart',
  self_harm: 'healing',
};

const OUTCOME_STYLES: Record<string, string> = {
  positive:  'bg-emerald-50 text-emerald-700',
  neutral:   'bg-gray-50 text-gray-600',
  difficult: 'bg-red-50 text-red-700',
};

function getCategoryIcon(category?: GoalCategory): string {
  if (!category) return 'notification_important';
  return CATEGORY_ICONS[category] ?? 'notification_important';
}

export default function PartnerConversationsPage() {
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [monitoredName, setMonitoredName] = useState('Your partner');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/partner/focus')
      .then(r => r.json())
      .then(d => {
        if (d.monitoredUserName) setMonitoredName(d.monitoredUserName);
      })
      .catch(() => {});

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
        <div className="flex items-center gap-3 mb-1">
          <span className="material-symbols-outlined text-primary text-3xl">forum</span>
          <h1 className="font-headline text-3xl font-bold text-on-surface">
            {monitoredName}'s Conversations
          </h1>
        </div>
        <p className="text-sm font-body text-on-surface-variant">
          View alerts and conversation history. Use the guides to have better conversations.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-5 animate-pulse">
              <div className="h-4 bg-surface-container-low rounded-xl w-48 mb-2" />
              <div className="h-3 bg-surface-container-low rounded-xl w-32" />
            </div>
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-primary text-3xl">forum</span>
          </div>
          <h3 className="font-headline text-xl font-bold text-on-surface mb-2">No alerts yet</h3>
          <p className="text-sm text-on-surface-variant">
            When {monitoredName} triggers an alert, conversation guides will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Pending */}
          {pending.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-on-surface-muted uppercase tracking-wider">
                Needs Conversation ({pending.length})
              </h2>
              {pending.map(a => (
                <div key={a.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-xl">{getCategoryIcon(a.events?.category as GoalCategory)}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-on-surface">
                        {GOAL_LABELS[a.events?.category as GoalCategory] ?? 'Alert'}
                      </div>
                      <div className="text-xs text-on-surface-variant">{timeAgo(a.sent_at)}</div>
                    </div>
                  </div>
                  {a.ai_guide_partner && (
                    <Link href={`/conversation/${a.id}`}
                      className="flex items-center justify-center gap-2 w-full py-2.5 text-center text-sm font-label font-bold bg-primary text-on-primary rounded-full hover:bg-primary/90 transition-colors">
                      <span className="material-symbols-outlined text-lg">menu_book</span>
                      View Your Conversation Guide
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-on-surface-muted uppercase tracking-wider">
                Completed ({completed.length})
              </h2>
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 divide-y divide-surface-border/50">
                {completed.map(a => {
                  const conv = a.conversations[0];
                  return (
                    <div key={a.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container-low transition-colors mx-1">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-lg">{getCategoryIcon(a.events?.category as GoalCategory)}</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-on-surface">
                          {GOAL_LABELS[a.events?.category as GoalCategory] ?? 'Alert'}
                        </div>
                        <div className="text-xs text-on-surface-variant">{timeAgo(a.sent_at)}</div>
                      </div>
                      {conv?.outcome && (
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${OUTCOME_STYLES[conv.outcome] ?? ''}`}>
                          {conv.outcome}
                        </span>
                      )}
                      <Link href={`/conversation/${a.id}`} className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">menu_book</span>
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
