import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { GOAL_LABELS, getCategoryEmoji, timeAgo } from '@be-candid/shared';
import type { GoalCategory, Severity } from '@be-candid/shared';
import { Suspense } from 'react';
import FocusBoardMini from '@/components/dashboard/FocusBoardMini';
import CheckInMini from '@/components/dashboard/CheckInMini';
import NudgeBanner from '@/components/dashboard/NudgeBanner';
import RelationshipMini from '@/components/dashboard/RelationshipMini';
import SpouseImpactAwareness from '@/components/dashboard/SpouseImpactAwareness';
import Link from 'next/link';

const SEVERITY_STYLES: Record<Severity, string> = {
  low: 'bg-amber-100 text-amber-800',
  medium: 'bg-orange-100 text-orange-800',
  high: 'bg-red-100 text-red-800',
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

  return (
    <div className="max-w-4xl mx-auto space-y-6 stagger">
      {/* ── Header ──────────────────────────────────────────── */}
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink mb-1">
          Hey {profile?.name?.split(' ')[0] ?? 'there'} 👋
        </h1>
        <p className="text-sm text-ink-muted">
          Here's your focus overview.
        </p>
      </div>

      {/* ── Nudges ──────────────────────────────────────────── */}
      <NudgeBanner />

      {/* ── Focus Board Mini ────────────────────────────────── */}
      <FocusBoardMini />

      {/* ── Check-in Status ─────────────────────────────────── */}
      <CheckInMini />

      {/* ── Relationship Level ────────────────────────────────── */}
      <Suspense fallback={null}>
        <RelationshipMini />
      </Suspense>

      {/* ── Spouse Impact Awareness ───────────────────────────── */}
      <Suspense fallback={null}>
        <SpouseImpactAwareness />
      </Suspense>

      {/* ── Quick Stats Row ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card px-4 py-3 text-center">
          <div className="text-2xl font-display font-bold text-ink">
            {(profile?.goals ?? []).length}
          </div>
          <div className="text-xs text-ink-muted mt-0.5">Rivals Tracked</div>
        </div>

        <div className="card px-4 py-3 text-center">
          <div className="text-2xl font-display font-bold text-ink">
            {partner ? '✓' : '—'}
          </div>
          <div className="text-xs text-ink-muted mt-0.5">
            {partner ? partner.partner_name : 'No partner'}
          </div>
        </div>

        <div className="card px-4 py-3 text-center">
          <div className={`text-2xl font-display font-bold ${pendingConversations > 0 ? 'text-orange-500' : 'text-emerald-600'}`}>
            {pendingConversations}
          </div>
          <div className="text-xs text-ink-muted mt-0.5">Pending Convos</div>
        </div>

        <div className="card px-4 py-3 text-center">
          <div className={`text-2xl font-display font-bold ${profile?.monitoring_enabled ? 'text-emerald-600' : 'text-gray-400'}`}>
            {profile?.monitoring_enabled ? 'ON' : 'OFF'}
          </div>
          <div className="text-xs text-ink-muted mt-0.5">Monitoring</div>
        </div>
      </div>

      {/* ── Your Rivals ─────────────────────────────────────── */}
      {(profile?.goals ?? []).length > 0 && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-sm font-semibold text-ink">Your Rivals</h3>
            <Link href="/dashboard/settings" className="text-xs text-brand-600 font-medium hover:underline">
              Edit
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {(profile?.goals ?? []).map((g: string) => (
              <span key={g} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-xs font-medium text-brand-700">
                {getCategoryEmoji(g as GoalCategory)} {GOAL_LABELS[g as GoalCategory] ?? g}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Recent Events ───────────────────────────────────── */}
      <div className="card">
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
          <h3 className="font-display text-sm font-semibold text-ink">Recent Events</h3>
          <Link href="/dashboard/activity" className="text-xs text-brand-600 font-medium hover:underline">
            View all
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-ink-muted">
            No events yet. Stay focused! 🎯
          </div>
        ) : (
          <div className="divide-y divide-surface-border/50">
            {events.map((event: any) => (
              <div key={event.id} className="flex items-center gap-3 px-4 py-3">
                <span className="text-xl flex-shrink-0">
                  {getCategoryEmoji(event.category as GoalCategory)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-ink">
                    {GOAL_LABELS[event.category as GoalCategory] ?? event.category}
                  </div>
                  <div className="text-xs text-ink-muted">
                    {event.app_name && `${event.app_name} · `}
                    {event.platform === 'android' ? '📱' : event.platform === 'ios' ? '📱' : '💻'} {event.platform} · {timeAgo(event.timestamp)}
                  </div>
                </div>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${SEVERITY_STYLES[event.severity as Severity]}`}>
                  {event.severity}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Pending Conversations ───────────────────────────── */}
      {pendingConversations > 0 && (
        <div className="card p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
          <div className="flex items-center gap-4">
            <div className="text-3xl">💬</div>
            <div className="flex-1">
              <h3 className="font-display text-sm font-semibold text-ink mb-0.5">
                {pendingConversations} conversation{pendingConversations !== 1 ? 's' : ''} waiting
              </h3>
              <p className="text-xs text-ink-muted">
                Complete your accountability conversations to earn trust points and keep your streak alive.
              </p>
            </div>
            <Link
              href="/dashboard/conversations"
              className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-xl hover:bg-orange-700 transition-colors flex-shrink-0"
            >
              View
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
