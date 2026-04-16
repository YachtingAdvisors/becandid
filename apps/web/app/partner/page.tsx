'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import ConversationStarters from '@/components/dashboard/ConversationStarters';
import PartnerOnboardingBanner from '@/components/partner/OnboardingBanner';
import MaterialIcon from '@/components/ui/MaterialIcon';

interface PartnerOverview {
  monitoredUserId: string;
  monitoredUserName: string;
  balance: number;
  streak: { streakDays: number };
  pendingCheckIns: number;
  pendingConversations: number;
  /* New fields for enhancements */
  checkInCompletionRate: number;
  avgConversationRating: number;
  totalConversations: number;
  streakWhenJoined: number;
}

const ENCOURAGEMENT_TEMPLATES = [
  { emoji: 'favorite', text: "I'm proud of you for showing up today." },
  { emoji: 'handshake', text: "I'm here. Whatever you need." },
  { emoji: 'diamond', text: 'Your honesty takes real courage.' },
  { emoji: 'sunny', text: "One day at a time. You're doing it." },
  { emoji: 'visibility', text: "I see the person you're becoming." },
  { emoji: 'heart_check', text: "You don't have to be perfect. Just honest." },
];

export default function PartnerIndexPage() {
  const [data, setData] = useState<PartnerOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingIdx, setSendingIdx] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sendEncouragement = useCallback(async (idx: number) => {
    if (sendingIdx !== null) return;
    setSendingIdx(idx);
    try {
      const res = await fetch('/api/reach-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: ENCOURAGEMENT_TEMPLATES[idx].text }),
      });
      if (res.ok) {
        setToast('Message sent!');
        setTimeout(() => setToast(null), 3000);
      } else {
        setToast('Failed to send. Try again.');
        setTimeout(() => setToast(null), 3000);
      }
    } catch {
      setToast('Failed to send. Try again.');
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSendingIdx(null);
    }
  }, [sendingIdx]);

  useEffect(() => {
    Promise.all([
      fetch('/api/partner/focus').then(r => r.json()),
      fetch('/api/check-ins?role=partner&limit=100').then(r => r.json()),
      fetch('/api/partner/alerts?limit=100').then(r => r.json()),
      fetch('/api/conversations?role=partner&limit=100').then(r => r.json()).catch(() => ({ conversations: [] })),
    ])
      .then(([focus, checkIns, alerts, convos]) => {
        const allCheckIns = checkIns.checkIns ?? [];
        const pendingCheckIns = allCheckIns
          .filter((ci: any) => (ci.status === 'pending' || ci.status === 'partial') && !ci.partner_confirmed_at)
          .length;
        const completedCheckIns = allCheckIns.filter((ci: any) => ci.status === 'completed').length;
        const checkInCompletionRate = allCheckIns.length > 0
          ? Math.round((completedCheckIns / allCheckIns.length) * 100)
          : 0;

        const allConvos = convos.conversations ?? [];
        const pendingConversations = (alerts.alerts ?? [])
          .filter((a: any) => !a.conversations?.[0]?.completed_at)
          .length;

        const ratings = allConvos
          .map((c: any) => c.rating ?? c.partner_rating)
          .filter((r: any) => typeof r === 'number');
        const avgConversationRating = ratings.length > 0
          ? Math.round((ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length) * 10) / 10
          : 0;

        setData({
          monitoredUserId: focus.monitoredUserId,
          monitoredUserName: focus.monitoredUserName ?? 'Your partner',
          balance: focus.balance ?? 0,
          streak: focus.streak ?? { streakDays: 0 },
          pendingCheckIns,
          pendingConversations,
          checkInCompletionRate,
          avgConversationRating,
          totalConversations: allConvos.length,
          streakWhenJoined: focus.streakWhenJoined ?? 0,
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

      {/* Onboarding banner for new partners */}
      <PartnerOnboardingBanner />

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
          <div className="text-xs text-on-surface-variant mt-0.5">Reputation Points</div>
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

      {/* ── Conversation Starters ─────────────────────── */}
      {data.monitoredUserId && <ConversationStarters monitoredUserId={data.monitoredUserId} />}

      {/* ── Relationship Health Meter ────────────────── */}
      {(() => {
        const healthScore = Math.round(
          data.checkInCompletionRate * 0.5 +
          (data.avgConversationRating / 5) * 100 * 0.3 +
          (data.totalConversations > 0 ? 100 : 0) * 0.2
        );
        const clampedScore = Math.min(100, Math.max(0, healthScore));
        const color = clampedScore < 40 ? 'red' : clampedScore < 70 ? 'amber' : 'emerald';
        const colorMap = {
          red: { bar: 'bg-red-500', text: 'text-red-600', bg: 'from-red-50 to-red-100/50', label: 'Needs Attention' },
          amber: { bar: 'bg-amber-500', text: 'text-amber-600', bg: 'from-amber-50 to-orange-50/50', label: 'Growing' },
          emerald: { bar: 'bg-emerald-500', text: 'text-emerald-600', bg: 'from-emerald-50 to-teal-50/50', label: 'Thriving' },
        };
        const c = colorMap[color];
        return (
          <div className={`bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-5 bg-gradient-to-br ${c.bg}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1", color: color === 'red' ? '#dc2626' : color === 'amber' ? '#d97706' : '#059669' }}>monitor_heart</span>
                <span className="font-headline text-sm font-bold text-on-surface">Relationship Health</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-2xl font-headline font-bold ${c.text}`}>{clampedScore}</span>
                <span className={`text-[10px] font-label font-medium ${c.text} uppercase`}>{c.label}</span>
              </div>
            </div>
            <div className="h-3 bg-surface-container-low rounded-full overflow-hidden">
              <div
                className={`h-full ${c.bar} rounded-full transition-all duration-700`}
                style={{ width: `${clampedScore}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-on-surface-variant font-label">
              <span>Check-ins: {data.checkInCompletionRate}%</span>
              <span>Avg rating: {data.avgConversationRating > 0 ? `${data.avgConversationRating}/5` : 'N/A'}</span>
              <span>{data.totalConversations} conversation{data.totalConversations !== 1 ? 's' : ''}</span>
            </div>
          </div>
        );
      })()}

      {/* ── Your Impact ──────────────────────────────── */}
      <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-5">
        <div className="flex items-center gap-2 mb-3">
          <MaterialIcon name="volunteer_activism" filled className="text-primary text-lg" />
          <span className="font-headline text-sm font-bold text-on-surface">Your Impact</span>
        </div>
        <div className="space-y-2.5">
          <div className="flex items-start gap-2.5 text-sm font-body text-on-surface">
            <MaterialIcon name="trending_up" filled className="text-emerald-500 text-base mt-0.5" />
            <span>{data.monitoredUserName}&apos;s streak grew from {data.streakWhenJoined} to {data.streak.streakDays} since you joined</span>
          </div>
          <div className="flex items-start gap-2.5 text-sm font-body text-on-surface">
            <MaterialIcon name="forum" filled className="text-primary text-base mt-0.5" />
            <span>You&apos;ve completed {data.totalConversations} conversation{data.totalConversations !== 1 ? 's' : ''} together</span>
          </div>
          {data.avgConversationRating > 0 && (
            <div className="flex items-start gap-2.5 text-sm font-body text-on-surface">
              <MaterialIcon name="star" filled className="text-amber-500 text-base mt-0.5" />
              <span>Average conversation rating: {data.avgConversationRating}/5</span>
            </div>
          )}
        </div>
      </div>

      {/* Partner Guide CTA */}
      <Link
        href="/partner/training"
        className="flex items-center gap-3 bg-surface-container-lowest rounded-2xl ring-1 ring-primary/20 p-4 hover:ring-primary/40 hover:shadow-lg transition-all duration-300 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-primary text-xl">school</span>
        </div>
        <div className="flex-1 min-w-0">
          <span className="font-headline text-sm font-bold text-on-surface">
            New to accountability? Read our Partner Guide
          </span>
          <span className="text-primary ml-1 group-hover:ml-2 transition-all duration-200">&rarr;</span>
        </div>
      </Link>

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

      {/* ── Send Encouragement ───────────────────────── */}
      <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-5">
        <div className="flex items-center gap-2 mb-3">
          <MaterialIcon name="send" filled className="text-primary text-lg" />
          <span className="font-headline text-sm font-bold text-on-surface">Send Encouragement</span>
        </div>
        <p className="text-xs text-on-surface-variant font-body mb-4">Tap a message to send it to {data.monitoredUserName} right now.</p>
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {ENCOURAGEMENT_TEMPLATES.map((tmpl, idx) => (
            <button
              key={idx}
              onClick={() => sendEncouragement(idx)}
              disabled={sendingIdx !== null}
              className={`flex-shrink-0 w-52 p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                sendingIdx === idx
                  ? 'bg-primary/10 border-primary/30 scale-95'
                  : 'bg-surface-container-low border-outline-variant/30 hover:border-primary/30 hover:shadow-md hover:scale-[1.02]'
              }`}
              style={{ scrollSnapAlign: 'start' }}
            >
              <MaterialIcon name={tmpl.emoji} filled className="text-primary text-xl mb-2 block" />
              <p className="text-sm font-body text-on-surface leading-relaxed">&ldquo;{tmpl.text}&rdquo;</p>
              {sendingIdx === idx && (
                <span className="text-[10px] font-label text-primary mt-2 block">Sending...</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-inverse-surface text-inverse-on-surface rounded-full shadow-xl font-label text-sm font-medium animate-fade-up flex items-center gap-2">
          <MaterialIcon name={toast.includes('Failed') ? 'error' : 'check_circle'} filled className="text-base" />
          {toast}
        </div>
      )}
    </div>
  );
}
