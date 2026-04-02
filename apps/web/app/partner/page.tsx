'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface PartnerOverview {
  monitoredUserName: string;
  balance: number;
  streak: { streakDays: number };
  pendingCheckIns: number;
  pendingConversations: number;
}

export default function PartnerIndexPage() {
  const [data, setData] = useState<PartnerOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/partner/focus').then(r => r.json()),
      fetch('/api/check-ins?role=partner&limit=10').then(r => r.json()),
      fetch('/api/partner/alerts?limit=10').then(r => r.json()),
    ])
      .then(([focus, checkIns, alerts]) => {
        const pendingCheckIns = (checkIns.checkIns ?? [])
          .filter((ci: any) => (ci.status === 'pending' || ci.status === 'partial') && !ci.partner_confirmed_at)
          .length;
        const pendingConversations = (alerts.alerts ?? [])
          .filter((a: any) => !a.conversations?.[0]?.completed_at)
          .length;

        setData({
          monitoredUserName: focus.monitoredUserName ?? 'Your partner',
          balance: focus.balance ?? 0,
          streak: focus.streak ?? { streakDays: 0 },
          pendingCheckIns,
          pendingConversations,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-surface-container-low rounded-xl w-48" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-6"><div className="h-16 bg-surface-container-low rounded-xl" /></div>)}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-primary text-3xl">handshake</span>
          </div>
          <h2 className="font-headline text-2xl font-bold text-on-surface mb-3">No Active Partnership</h2>
          <p className="text-sm font-body text-on-surface-variant mb-6">When someone invites you as their accountability partner, this is where you'll see their progress.</p>
          <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-full font-headline font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-110 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const actionCount = data.pendingCheckIns + data.pendingConversations;

  return (
    <div className="max-w-3xl mx-auto space-y-6 stagger">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <span className="material-symbols-outlined text-primary text-3xl">handshake</span>
          <h1 className="font-headline text-3xl font-bold text-on-surface">
            {data.monitoredUserName}'s Overview
          </h1>
        </div>
        <p className="text-sm font-body text-on-surface-variant">
          You&apos;re their contender &mdash; someone willing to be candid because you care about who they&apos;ll be tomorrow, not just how they feel today.
        </p>
      </div>

      {/* Action needed banner */}
      {actionCount > 0 && (
        <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-amber-200 p-4 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-600 text-2xl">bolt</span>
            <div className="flex-1">
              <div className="text-sm font-bold text-on-surface">
                {actionCount} action{actionCount !== 1 ? 's' : ''} waiting for you
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {data.pendingCheckIns > 0 && `${data.pendingCheckIns} check-in${data.pendingCheckIns !== 1 ? 's' : ''}`}
                {data.pendingCheckIns > 0 && data.pendingConversations > 0 && ' and '}
                {data.pendingConversations > 0 && `${data.pendingConversations} conversation${data.pendingConversations !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 px-4 py-3 text-center">
          <div className="text-2xl font-headline font-bold text-primary">{data.balance.toLocaleString()}</div>
          <div className="text-xs text-on-surface-variant mt-0.5">Trust Points</div>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 px-4 py-3 text-center">
          <div className="text-2xl font-headline font-bold text-emerald-600">{data.streak.streakDays}</div>
          <div className="text-xs text-on-surface-variant mt-0.5">Day Streak</div>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 px-4 py-3 text-center">
          <div className={`text-2xl font-headline font-bold ${actionCount > 0 ? 'text-amber-500' : 'text-emerald-600'}`}>
            {actionCount > 0 ? actionCount : (
              <span className="material-symbols-outlined text-emerald-600 text-2xl">check_circle</span>
            )}
          </div>
          <div className="text-xs text-on-surface-variant mt-0.5">{actionCount > 0 ? 'Action Needed' : 'All Clear'}</div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/partner/focus" className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-5 hover:ring-primary/20 hover:shadow-lg transition-all duration-300 text-center group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-primary text-2xl">center_focus_strong</span>
          </div>
          <div className="font-headline text-sm font-bold text-on-surface">Focus Board</div>
          <p className="text-xs text-on-surface-variant mt-1">3-week heatmap & milestones</p>
        </Link>
        <Link href="/partner/checkins" className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-5 hover:ring-primary/20 hover:shadow-lg transition-all duration-300 text-center group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-primary text-2xl">check_circle</span>
          </div>
          <div className="font-headline text-sm font-bold text-on-surface">Check-ins</div>
          <p className="text-xs text-on-surface-variant mt-1">
            {data.pendingCheckIns > 0 ? `${data.pendingCheckIns} waiting` : 'All caught up'}
          </p>
        </Link>
        <Link href="/partner/conversations" className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-5 hover:ring-primary/20 hover:shadow-lg transition-all duration-300 text-center group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-primary text-2xl">forum</span>
          </div>
          <div className="font-headline text-sm font-bold text-on-surface">Conversations</div>
          <p className="text-xs text-on-surface-variant mt-1">
            {data.pendingConversations > 0 ? `${data.pendingConversations} pending` : 'View history'}
          </p>
        </Link>
        <Link href="/partner/encourage" className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-5 hover:ring-primary/20 hover:shadow-lg transition-all duration-300 text-center group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-primary text-2xl">favorite</span>
          </div>
          <div className="font-headline text-sm font-bold text-on-surface">Encourage</div>
          <p className="text-xs text-on-surface-variant mt-1">Send a supportive message</p>
        </Link>
      </div>
    </div>
  );
}
