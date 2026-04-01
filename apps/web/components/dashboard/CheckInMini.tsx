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

  return (
    <Link href="/dashboard/checkins" className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-4 hover:shadow-md transition-shadow block">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-headline text-sm font-semibold text-on-surface">Check-ins</h3>
        <span className="text-xs text-primary font-medium">View all →</span>
      </div>

      {actionNeeded.length > 0 ? (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-lg flex-shrink-0">
            <span className="material-symbols-outlined">checklist</span>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-on-surface">
              {actionNeeded.length} check-in{actionNeeded.length !== 1 ? 's' : ''} need your response
            </div>
            <div className="text-xs text-on-surface-variant mt-0.5">
              {actionNeeded[0]?.status === 'partial'
                ? 'Your partner already confirmed — your turn!'
                : 'Both sides still need to confirm'}
            </div>
          </div>
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-lg flex-shrink-0">
            <span className="material-symbols-outlined">check_circle</span>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-on-surface">All caught up</div>
            <div className="text-xs text-on-surface-variant mt-0.5">
              {recentCompleted} completed recently
            </div>
          </div>
        </div>
      )}

      {/* Mini status dots */}
      <div className="flex gap-1 mt-3">
        {checkIns.slice(0, 10).map(ci => (
          <div
            key={ci.id}
            className={`h-1.5 flex-1 rounded-full ${
              ci.status === 'completed' ? 'bg-emerald-400'
              : ci.status === 'partial' ? 'bg-amber-400'
              : ci.status === 'expired' ? 'bg-red-300'
              : 'bg-surface-container'
            }`}
            title={ci.status}
          />
        ))}
      </div>
    </Link>
  );
}
