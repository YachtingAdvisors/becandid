import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { GOAL_LABELS, getCategoryEmoji, timeAgo } from '@be-candid/shared';
import type { GoalCategory, Severity } from '@be-candid/shared';
import { Suspense } from 'react';
import FocusBoardMini from '@/components/dashboard/FocusBoardMini';
import CheckInMini from '@/components/dashboard/CheckInMini';
import NudgeBanner from '@/components/dashboard/NudgeBanner';
import RelationshipMini from '@/components/dashboard/RelationshipMini';
import SpouseImpactAwareness from '@/components/dashboard/SpouseImpactAwareness';
import ScreenTimeCard from '@/components/dashboard/ScreenTimeCard';
import ContentFilterStatus from '@/components/dashboard/ContentFilterStatus';
import Link from 'next/link';

const SEVERITY_STYLES: Record<Severity, string> = {
  low: 'bg-tertiary-container text-on-tertiary-container',
  medium: 'bg-tertiary-container text-on-tertiary-container',
  high: 'bg-error/10 text-error',
};

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const db = createServiceClient();

  // Parallel data fetching
  const [profileRes, eventsRes, alertsRes, partnerRes] = await Promise.all([
    db.from('users').select('name, goals, monitoring_enabled, streak_mode, created_at').eq('id', user.id).single(),
    db.from('events').select('id, category, severity, platform, app_name, timestamp').eq('user_id', user.id).order('timestamp', { ascending: false }).limit(5),
    db.from('alerts').select('id, sent_at, conversations(id, completed_at, outcome)').eq('user_id', user.id).order('sent_at', { ascending: false }).limit(5),
    db.from('partners').select('partner_name, status').eq('user_id', user.id).eq('status', 'active').maybeSingle(),
  ]);

  const profile = profileRes.data;
  const events = eventsRes.data ?? [];
  const alerts = alertsRes.data ?? [];
  const partner = partnerRes.data;

  // Stats
  const totalEvents = events.length;
  const pendingConversations = alerts.filter((a: any) => !a.conversations?.[0]?.completed_at).length;

  // Calculate streak days from created_at
  const daysSinceJoin = profile?.created_at
    ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / 86400000)
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 stagger">
      {/* -- Hero Streak Section -- */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-container p-6 sm:p-8">
        <div className="relative z-10">
          <p className="text-on-primary/70 text-sm font-label font-medium mb-1">
            Hey {profile?.name?.split(' ')[0] ?? 'there'}
          </p>
          <h1 className="font-headline text-3xl sm:text-4xl font-extrabold text-on-primary mb-2">
            {daysSinceJoin}
            <span className="text-lg font-body font-normal ml-2 text-on-primary/70">day streak</span>
          </h1>
          <p className="text-sm text-on-primary/60 font-body">
            Here&apos;s your alignment overview. Keep building congruence.
          </p>
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-on-primary/5" />
        <div className="absolute -bottom-8 -right-4 w-32 h-32 rounded-full bg-on-primary/5" />
      </div>

      {/* -- Nudges -- */}
      <NudgeBanner />

      {/* -- Today's Pulse -- */}
      <div className="space-y-3">
        <h2 className="font-headline font-bold text-on-surface text-lg">Today&apos;s Pulse</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-surface-container-low rounded-2xl px-4 py-4 text-center">
            <div className="text-2xl font-headline font-bold text-on-surface">
              {(profile?.goals ?? []).length}
            </div>
            <div className="text-xs text-on-surface-variant font-label mt-1">Rivals Tracked</div>
          </div>

          <div className="bg-surface-container-low rounded-2xl px-4 py-4 text-center">
            <div className="text-2xl font-headline font-bold text-on-surface">
              {partner ? '\u2713' : '\u2014'}
            </div>
            <div className="text-xs text-on-surface-variant font-label mt-1">
              {partner ? partner.partner_name : 'No partner'}
            </div>
          </div>

          <div className="bg-surface-container-low rounded-2xl px-4 py-4 text-center">
            <div className={`text-2xl font-headline font-bold ${pendingConversations > 0 ? 'text-tertiary' : 'text-primary'}`}>
              {pendingConversations}
            </div>
            <div className="text-xs text-on-surface-variant font-label mt-1">Pending Convos</div>
          </div>

          <div className="bg-surface-container-low rounded-2xl px-4 py-4 text-center">
            <div className={`text-2xl font-headline font-bold ${profile?.monitoring_enabled ? 'text-primary' : 'text-outline'}`}>
              {profile?.monitoring_enabled ? 'ON' : 'OFF'}
            </div>
            <div className="text-xs text-on-surface-variant font-label mt-1">Awareness</div>
          </div>
        </div>
      </div>

      {/* -- Quick Actions Bento -- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link href="/dashboard/checkins"
          className="bg-secondary-container rounded-3xl p-5 hover:shadow-md transition-all group">
          <div className="text-2xl mb-2">{'\u2713'}</div>
          <h3 className="font-headline font-bold text-on-secondary-container text-base">Quick Check-in</h3>
          <p className="text-xs text-on-secondary-container/70 font-body mt-1">Log how you&apos;re doing right now</p>
        </Link>
        <Link href="/dashboard/stringer-journal?action=write"
          className="bg-tertiary-container rounded-3xl p-5 hover:shadow-md transition-all group">
          <div className="text-2xl mb-2">{'\uD83D\uDCD3'}</div>
          <h3 className="font-headline font-bold text-on-tertiary-container text-base">I need clarity</h3>
          <p className="text-xs text-on-tertiary-container/70 font-body mt-1">Write in your Stringer Journal</p>
        </Link>
      </div>

      {/* -- Focus Board Mini -- */}
      <FocusBoardMini />

      {/* -- Check-in Status -- */}
      <CheckInMini />

      {/* -- Relationship Level -- */}
      <Suspense fallback={null}>
        <RelationshipMini />
      </Suspense>

      {/* -- Spouse Impact Awareness -- */}
      <Suspense fallback={null}>
        <SpouseImpactAwareness />
      </Suspense>

      {/* -- Screen Time & Content Filter -- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Suspense fallback={null}>
          <ScreenTimeCard />
        </Suspense>
        <Suspense fallback={null}>
          <ContentFilterStatus />
        </Suspense>
      </div>

      {/* -- Your Rivals -- */}
      {(profile?.goals ?? []).length > 0 && (
        <div className="bg-surface-container-lowest rounded-3xl p-5 border border-outline-variant">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-headline text-sm font-bold text-on-surface">Your Rivals</h3>
            <Link href="/dashboard/settings" className="text-xs text-primary font-label font-medium hover:underline">
              Edit
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {(profile?.goals ?? []).map((g: string) => (
              <span key={g} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-container/40 text-xs font-label font-medium text-primary">
                {getCategoryEmoji(g as GoalCategory)} {GOAL_LABELS[g as GoalCategory] ?? g}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* -- Recent Events -- */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant">
          <h3 className="font-headline text-sm font-bold text-on-surface">Recent Events</h3>
          <Link href="/dashboard/activity" className="text-xs text-primary font-label font-medium hover:underline">
            View all
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-on-surface-variant font-body">
            No events yet. Stay focused!
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/50">
            {events.map((event: any) => (
              <div key={event.id} className="flex items-center gap-3 px-5 py-3.5">
                <span className="text-xl flex-shrink-0">
                  {getCategoryEmoji(event.category as GoalCategory)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-on-surface font-body">
                    {GOAL_LABELS[event.category as GoalCategory] ?? event.category}
                  </div>
                  <div className="text-xs text-on-surface-variant font-label">
                    {event.app_name && `${event.app_name} \u00B7 `}
                    {event.platform} \u00B7 {timeAgo(event.timestamp)}
                  </div>
                </div>
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-label font-semibold ${SEVERITY_STYLES[event.severity as Severity]}`}>
                  {event.severity}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* -- Pending Conversations -- */}
      {pendingConversations > 0 && (
        <div className="bg-tertiary-container rounded-3xl p-5">
          <div className="flex items-center gap-4">
            <div className="text-3xl">{'\uD83D\uDCAC'}</div>
            <div className="flex-1">
              <h3 className="font-headline text-sm font-bold text-on-tertiary-container mb-0.5">
                {pendingConversations} conversation{pendingConversations !== 1 ? 's' : ''} waiting
              </h3>
              <p className="text-xs text-on-tertiary-container/70 font-body">
                Complete your accountability conversations to earn trust points and keep your streak alive.
              </p>
            </div>
            <Link
              href="/dashboard/conversations"
              className="px-4 py-2 bg-tertiary text-on-primary text-sm font-label font-medium rounded-2xl hover:opacity-90 transition-opacity flex-shrink-0"
            >
              View
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
