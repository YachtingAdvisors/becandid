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
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="card p-6"><div className="h-16 bg-gray-100 rounded" /></div>)}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card p-12 text-center">
          <div className="text-4xl mb-4">🤝</div>
          <h2 className="font-headline text-2xl font-bold text-on-surface mb-3">No Active Partnership</h2>
          <p className="text-sm font-body text-on-surface-variant mb-6">When someone invites you as their accountability partner, this is where you'll see their progress.</p>
          <Link href="/dashboard" className="btn-primary">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  const actionCount = data.pendingCheckIns + data.pendingConversations;

  return (
    <div className="max-w-3xl mx-auto space-y-6 stagger">
      <div>
        <h1 className="font-headline text-3xl font-bold text-on-surface mb-1">
          🤝 {data.monitoredUserName}'s Overview
        </h1>
        <p className="text-sm font-body text-on-surface-variant">
          You're their accountability partner. Here's how they're doing.
        </p>
      </div>

      {/* Action needed banner */}
      {actionCount > 0 && (
        <div className="card p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
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
        <div className="card px-4 py-3 text-center">
          <div className="text-2xl font-headline font-bold text-primary">{data.balance.toLocaleString()}</div>
          <div className="text-xs text-on-surface-variant mt-0.5">Trust Points</div>
        </div>
        <div className="card px-4 py-3 text-center">
          <div className="text-2xl font-headline font-bold text-emerald-600">{data.streak.streakDays}</div>
          <div className="text-xs text-on-surface-variant mt-0.5">Day Streak</div>
        </div>
        <div className="card px-4 py-3 text-center">
          <div className={`text-2xl font-headline font-bold ${actionCount > 0 ? 'text-amber-500' : 'text-emerald-600'}`}>
            {actionCount > 0 ? actionCount : '✓'}
          </div>
          <div className="text-xs text-on-surface-variant mt-0.5">{actionCount > 0 ? 'Action Needed' : 'All Clear'}</div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/partner/focus" className="card p-5 hover:shadow-md transition-shadow text-center">
          <div className="text-3xl mb-2">🎯</div>
          <div className="font-headline text-sm font-bold text-on-surface">Focus Board</div>
          <p className="text-xs text-on-surface-variant mt-1">3-week heatmap & milestones</p>
        </Link>
        <Link href="/partner/checkins" className="card p-5 hover:shadow-md transition-shadow text-center">
          <div className="text-3xl mb-2">📋</div>
          <div className="font-headline text-sm font-bold text-on-surface">Check-ins</div>
          <p className="text-xs text-on-surface-variant mt-1">
            {data.pendingCheckIns > 0 ? `${data.pendingCheckIns} waiting` : 'All caught up'}
          </p>
        </Link>
        <Link href="/partner/conversations" className="card p-5 hover:shadow-md transition-shadow text-center">
          <div className="text-3xl mb-2">💬</div>
          <div className="font-headline text-sm font-bold text-on-surface">Conversations</div>
          <p className="text-xs text-on-surface-variant mt-1">
            {data.pendingConversations > 0 ? `${data.pendingConversations} pending` : 'View history'}
          </p>
        </Link>
        <Link href="/partner/encourage" className="card p-5 hover:shadow-md transition-shadow text-center">
          <div className="text-3xl mb-2">💪</div>
          <div className="font-headline text-sm font-bold text-on-surface">Encourage</div>
          <p className="text-xs text-on-surface-variant mt-1">Send a supportive message</p>
        </Link>
      </div>
    </div>
  );
}
