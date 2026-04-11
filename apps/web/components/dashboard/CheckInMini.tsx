'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface MiniCheckIn {
  id: string;
  status: 'pending' | 'partial' | 'completed' | 'expired';
  user_confirmed_at: string | null;
  partner_confirmed_at: string | null;
  due_at: string | null;
}

export default function CheckInMini() {
  const [checkIns, setCheckIns] = useState<MiniCheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/check-ins?limit=5')
      .then(r => r.json())
      .then(d => setCheckIns(d.checkIns ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-surface-container-lowest rounded-2xl p-5 animate-pulse">
        <div className="h-12 bg-surface-container-low rounded-xl" />
      </div>
    );
  }

  const actionNeeded = checkIns.filter(
    ci => (ci.status === 'pending' || ci.status === 'partial') && !ci.user_confirmed_at
  );

  const recentCompleted = checkIns.filter(ci => ci.status === 'completed').length;

  if (checkIns.length === 0) return null;

  // Progress calculation for the bar
  const totalCheckIns = checkIns.length;
  const completedCount = checkIns.filter(ci => ci.status === 'completed').length;
  const completionPct = totalCheckIns > 0 ? Math.round((completedCount / totalCheckIns) * 100) : 0;

  return (
    <Link href="/dashboard/checkins" className="group bg-surface-container-lowest rounded-2xl p-5 hover:bg-surface-container transition-colors duration-300 block">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-headline text-sm font-semibold text-on-surface tracking-tight">Check-ins</h3>
        <span className="text-xs text-primary font-medium group-hover:translate-x-0.5 transition-transform duration-300">View all &rarr;</span>
      </div>

      {actionNeeded.length > 0 ? (
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-tertiary-container flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-on-tertiary-container text-lg">checklist</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-on-surface font-body">
              {actionNeeded.length} check-in{actionNeeded.length !== 1 ? 's' : ''} need your response
            </div>
            <div className="text-xs text-on-surface-variant mt-0.5 font-body">
              {actionNeeded[0]?.status === 'partial'
                ? 'Your partner already confirmed — your turn!'
                : 'Both sides still need to confirm'}
            </div>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse flex-shrink-0" />
        </div>
      ) : (
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-tertiary-container flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-on-tertiary-container text-lg">check_circle</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-on-surface font-body">All caught up</div>
            <div className="text-xs text-on-surface-variant mt-0.5 font-body">
              {recentCompleted} completed recently
            </div>
          </div>
        </div>
      )}

      {/* Progress bar + status dots */}
      <div className="mt-4 pt-3 border-t border-outline-variant/5">
        {/* Completion progress */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-body text-on-surface-variant uppercase tracking-wider">Completion</span>
          <span className="text-[10px] font-body text-on-surface-variant tabular-nums font-semibold">{completionPct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-surface-container-low overflow-hidden mb-3">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
            style={{ width: `${completionPct}%` }}
          />
        </div>

        {/* Mini status dots */}
        <div className="flex gap-1">
          {checkIns.slice(0, 10).map(ci => (
            <div
              key={ci.id}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                ci.status === 'completed' ? 'bg-emerald-400'
                : ci.status === 'partial' ? 'bg-amber-400'
                : ci.status === 'expired' ? 'bg-red-300'
                : 'bg-surface-container-low'
              }`}
              title={ci.status}
            />
          ))}
        </div>
      </div>
    </Link>
  );
}
