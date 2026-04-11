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
      <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-4 animate-pulse">
        <div className="h-12 bg-surface-container-low rounded" />
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
    <Link href="/dashboard/checkins" className="group relative bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-5 hover:ring-primary/25 hover:shadow-lg hover:shadow-primary/[0.06] transition-all duration-300 block">
      {/* Subtle top accent line */}
      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-center justify-between mb-3">
        <h3 className="font-headline text-sm font-semibold text-on-surface tracking-tight">Check-ins</h3>
        <span className="text-xs text-primary font-medium group-hover:translate-x-0.5 transition-transform duration-300">View all &rarr;</span>
      </div>

      {actionNeeded.length > 0 ? (
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-800/20 flex items-center justify-center flex-shrink-0 ring-1 ring-amber-200/50 dark:ring-amber-700/30">
            <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-lg">checklist</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-on-surface">
              {actionNeeded.length} check-in{actionNeeded.length !== 1 ? 's' : ''} need your response
            </div>
            <div className="text-xs text-on-surface-variant/70 mt-0.5">
              {actionNeeded[0]?.status === 'partial'
                ? 'Your partner already confirmed — your turn!'
                : 'Both sides still need to confirm'}
            </div>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0 ring-4 ring-amber-400/20" />
        </div>
      ) : (
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/20 flex items-center justify-center flex-shrink-0 ring-1 ring-emerald-200/50 dark:ring-emerald-700/30">
            <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-lg">check_circle</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-on-surface">All caught up</div>
            <div className="text-xs text-on-surface-variant/70 mt-0.5">
              {recentCompleted} completed recently
            </div>
          </div>
        </div>
      )}

      {/* Progress bar + status dots */}
      <div className="mt-4 pt-3 border-t border-outline-variant/10">
        {/* Completion progress */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-label text-on-surface-variant/60 uppercase tracking-wider">Completion</span>
          <span className="text-[10px] font-label text-on-surface-variant/70 tabular-nums font-semibold">{completionPct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-surface-container overflow-hidden mb-3">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary-container transition-all duration-700 ease-out"
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
                : 'bg-surface-container'
              }`}
              title={ci.status}
            />
          ))}
        </div>
      </div>
    </Link>
  );
}
