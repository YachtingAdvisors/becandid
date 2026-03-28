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

export default function PartnerCheckInsPage() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [monitoredName, setMonitoredName] = useState('Your partner');
  const { ToastContainer, showMilestones } = useMilestoneToasts();

  const fetchCheckIns = useCallback(() => {
    fetch('/api/check-ins?role=partner&limit=30')
      .then(r => r.json())
      .then(d => setCheckIns(d.checkIns ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));

    // Get partner's name
    fetch('/api/partner/focus')
      .then(r => r.json())
      .then(d => { if (d.monitoredUserName) setMonitoredName(d.monitoredUserName); })
      .catch(() => {});
  }, []);

  useEffect(() => { fetchCheckIns(); }, [fetchCheckIns]);

  function handleConfirmed(checkInId: string, newStatus: string, milestones: string[]) {
    setCheckIns(prev => prev.map(ci =>
      ci.id === checkInId ? { ...ci, status: newStatus as any } : ci
    ));
    if (milestones.length > 0) showMilestones(milestones);
    setTimeout(fetchCheckIns, 500);
  }

  const actionNeeded = checkIns.filter(
    ci => (ci.status === 'pending' || ci.status === 'partial') && !ci.partner_confirmed_at
  ).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <ToastContainer />

      <div>
        <h1 className="font-display text-3xl font-semibold text-ink mb-1">
          {monitoredName}'s Check-ins
        </h1>
        <p className="text-sm text-ink-muted">
          Confirm your side of each check-in. Both of you need to respond for it to count.
        </p>
      </div>

      {/* Action needed banner */}
      {actionNeeded > 0 && (
        <div className="card p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📋</span>
            <div>
              <div className="text-sm font-semibold text-ink">
                {actionNeeded} check-in{actionNeeded !== 1 ? 's' : ''} waiting for your confirmation
              </div>
              <p className="text-xs text-ink-muted mt-0.5">
                Your response matters — it shows {monitoredName} you're engaged.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Check-in list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : checkIns.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="font-display text-xl font-semibold text-ink mb-2">No check-ins yet</h3>
          <p className="text-sm text-ink-muted">
            When {monitoredName} has check-ins scheduled, they'll appear here for your confirmation.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {checkIns.map(ci => (
            <CheckInCard
              key={ci.id}
              checkIn={ci as any}
              role="partner"
              partnerName={monitoredName}
              onConfirmed={(status, milestones) => handleConfirmed(ci.id, status, milestones)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
