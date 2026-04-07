'use client';

import { useState, useEffect, useCallback } from 'react';
import CheckInCard from '@/components/dashboard/CheckInCard';
import { useMilestoneToasts } from '@/components/dashboard/MilestoneToast';

interface CheckIn {
  id: string;
  prompt: string;
  status: 'pending' | 'partial' | 'completed' | 'expired';
  sent_at: string;
  due_at: string | null;
  user_confirmed_at: string | null;
  user_mood: string | null;
  partner_confirmed_at: string | null;
  partner_mood: string | null;
}

interface CheckInStats {
  total: number;
  completed: number;
  partial: number;
  expired: number;
  completionRate: number;
  currentStreak: number;
}

export default function CheckInsPage() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [stats, setStats] = useState<CheckInStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'partial' | 'completed' | 'expired'>('all');
  const { ToastContainer, showMilestones } = useMilestoneToasts();

  const fetchCheckIns = useCallback(() => {
    fetch('/api/check-ins?limit=30')
      .then(r => r.json())
      .then(d => {
        setCheckIns(d.checkIns ?? []);
        setStats(d.stats ?? null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchCheckIns(); }, [fetchCheckIns]);

  function handleConfirmed(checkInId: string, newStatus: string, milestones: string[]) {
    // Optimistic update
    setCheckIns(prev => prev.map(ci =>
      ci.id === checkInId ? { ...ci, status: newStatus as any } : ci
    ));
    if (milestones.length > 0) showMilestones(milestones);
    // Refetch for accurate data
    setTimeout(fetchCheckIns, 500);
  }

  const filtered = filter === 'all'
    ? checkIns
    : checkIns.filter(ci => ci.status === filter);

  const actionNeeded = checkIns.filter(
    ci => ci.status === 'pending' || ci.status === 'partial'
  ).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <ToastContainer />

      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        <div>
          <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">Check-ins</h1>
          <p className="text-sm text-on-surface-variant font-body">
            Both you and your partner confirm each check-in for it to count.
          </p>
        </div>
      </div>

      {/* Philosophy callout */}
      <div className="bg-gradient-to-br from-primary-container/30 to-amber-50/40 rounded-2xl ring-1 ring-primary-container/30 p-5">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-primary text-xl mt-0.5 flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>self_improvement</span>
          <div>
            <p className="text-sm text-on-surface leading-relaxed font-body italic">
              &ldquo;The unexamined life is not worth living.&rdquo;
            </p>
            <p className="text-xs text-on-surface-variant font-label mt-0.5 mb-2">&mdash; Socrates</p>
            <p className="text-xs text-on-surface-variant font-body leading-relaxed">
              A check-in isn&rsquo;t a test you pass or fail &mdash; it&rsquo;s a moment of honest reflection.
              Pausing to ask <em>&ldquo;how am I really doing?&rdquo;</em> is itself the practice.
              The people who grow aren&rsquo;t the ones who never struggle; they&rsquo;re the ones who keep showing up to look.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-4 text-center hover:ring-primary/20 hover:shadow-lg hover:shadow-on-surface/[0.04] transition-all duration-200">
            <div className="text-2xl font-headline font-bold text-primary">{stats.completionRate}%</div>
            <div className="text-xs text-on-surface-variant font-label mt-0.5">Completion Rate</div>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-4 text-center hover:ring-primary/20 hover:shadow-lg hover:shadow-on-surface/[0.04] transition-all duration-200">
            <div className="text-2xl font-headline font-bold text-primary">{stats.currentStreak}</div>
            <div className="text-xs text-on-surface-variant font-label mt-0.5">Check-in Streak</div>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-4 text-center hover:ring-primary/20 hover:shadow-lg hover:shadow-on-surface/[0.04] transition-all duration-200">
            <div className="text-2xl font-headline font-bold text-on-surface">{stats.completed}</div>
            <div className="text-xs text-on-surface-variant font-label mt-0.5">Completed</div>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-4 text-center hover:ring-primary/20 hover:shadow-lg hover:shadow-on-surface/[0.04] transition-all duration-200">
            <div className={`text-2xl font-headline font-bold ${actionNeeded > 0 ? 'text-tertiary' : 'text-outline'}`}>
              {actionNeeded}
            </div>
            <div className="text-xs text-on-surface-variant font-label mt-0.5">Need Action</div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'pending', 'partial', 'completed', 'expired'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-label font-medium cursor-pointer transition-all duration-200 ${
              filter === f
                ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                : 'bg-surface-container text-on-surface-variant hover:bg-primary-container/30 hover:text-primary'
            }`}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'pending' || f === 'partial'
              ? ` (${checkIns.filter(ci => ci.status === f).length})`
              : ''}
          </button>
        ))}
      </div>

      {/* Check-in list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-6 animate-pulse">
              <div className="h-4 bg-surface-container rounded w-3/4 mb-3" />
              <div className="h-3 bg-surface-container-low rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-10 text-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-3 block">fact_check</span>
          <h3 className="font-headline font-bold text-on-surface text-lg mb-2">
            {filter === 'all' ? 'Your check-ins start here' : `No ${filter} check-ins`}
          </h3>
          <p className="text-sm text-on-surface-variant font-body max-w-md mx-auto leading-relaxed">
            {filter === 'all'
              ? 'Check-ins are short, honest moments between you and your partner. Once your partner is connected and your schedule is set, they\u2019ll appear here automatically.'
              : 'Try a different filter to see other check-ins.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(ci => (
            <CheckInCard
              key={ci.id}
              checkIn={ci as any}
              role="user"
              onConfirmed={(status, milestones) => handleConfirmed(ci.id, status, milestones)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
