import type { Metadata } from 'next';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your accountability command center. Track progress, view insights, and stay aligned with your goals.',
};
import { GOAL_LABELS, getCategoryEmoji, timeAgo } from '@be-candid/shared';
import type { GoalCategory, Severity } from '@be-candid/shared';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import FocusBoardMini from '@/components/dashboard/FocusBoardMini';
import CheckInMini from '@/components/dashboard/CheckInMini';
import NudgeBanner from '@/components/dashboard/NudgeBanner';
import RelationshipMini from '@/components/dashboard/RelationshipMini';
import Link from 'next/link';
import DashboardHero from '@/components/dashboard/DashboardHero';
import QuoteOfTheDay from '@/components/dashboard/QuoteOfTheDay';
import FocusChip from '@/components/dashboard/FocusChip';

const DailyChallenge = dynamic(
  () => import('@/components/dashboard/DailyChallenge'),
  { ssr: false, loading: () => <div className="skeleton-shimmer h-36 rounded-2xl" /> },
);

/* Dynamically imported heavy client components for code-splitting */
const SpouseImpactAwareness = dynamic(
  () => import('@/components/dashboard/SpouseImpactAwareness'),
  { ssr: false, loading: () => <div className="skeleton-shimmer h-32 rounded-2xl" /> },
);
const ScreenTimeCard = dynamic(
  () => import('@/components/dashboard/ScreenTimeCard'),
  { ssr: false, loading: () => <div className="skeleton-shimmer h-28 rounded-2xl" /> },
);
const ContentFilterStatus = dynamic(
  () => import('@/components/dashboard/ContentFilterStatus'),
  { ssr: false, loading: () => <div className="skeleton-shimmer h-28 rounded-2xl" /> },
);
const WalkthroughWrapper = dynamic(
  () => import('@/components/dashboard/WalkthroughWrapper'),
  { ssr: false },
);
const QuickMoodCheckin = dynamic(
  () => import('@/components/dashboard/QuickMoodCheckin'),
  { ssr: false, loading: () => <div className="skeleton-shimmer h-24 rounded-2xl" /> },
);
const GrowthJournalWidget = dynamic(
  () => import('@/components/dashboard/GrowthJournalWidget'),
  { ssr: false, loading: () => <div className="skeleton-shimmer h-32 rounded-2xl" /> },
);
const ReferralCard = dynamic(
  () => import('@/components/dashboard/ReferralCard'),
  { ssr: false, loading: () => <div className="skeleton-shimmer h-24 rounded-2xl" /> },
);

const SEVERITY_STYLES: Record<Severity, string> = {
  low: 'bg-tertiary-container text-on-tertiary-container',
  medium: 'bg-tertiary-container text-on-tertiary-container',
  high: 'bg-error/10 text-error',
};

/* ── Image URLs for dashboard cards ──────────────────────── */
const IMAGES = {
  crisis: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2PCBqh0r0XvbXJDoIEsvChMXbblBdWZXVmPnPx8vluAlIIDucgY3v30rMZfGzihOLd5Ia0--KQVA4mZVnXJD-77rO0isDR-vo4892fqZvxWQgm7uSZq9OhnYDnxtgTqiCNcuPpT6Py4FSd930P4VzXmFVT1QixXQxljEZ4m50_VBnJ1Oh7jgkg9h-R962WCiwhhqBP58uSLVH1IcJ2hKPaiEAer8GxO6AKpqR1hzUhFxE9ah4094WMrEQ1KslZWYovr7C_kdy07eD',
  guardian: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfpF--KFSH1cy_6OBg93bKMc1gd14EqwcEEog-t6MRUe8QhOI5SPIUcmoh6l1T6YUBUy4LKdEeuUZrslDB416pE39KXKFVf2lk7_dwje-3Rv7l-EbjKvvro96ASsDf7LTpYNVX3p_gipILTXxWXcR0angm8imcdY9CnP4SZ1neORKJH138yUFYcWIghaEtDYvDyGYr3ELkonIOhGIJ7I2ey1L0cMlqigWN9Kql3bpW-K7ZRT_mIP8RyLiwzFBz7-uetTG33SpOnXgB',
  screenTime: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8r5F8dD28slCIYA2s9aKRnx0uApEyC-ppD8DLNUx2-X5FfNFQcdM8OKJUWui0FekVLb68kQfkT-1cwWb0gQV7j7ByCGkWlauhEnJpptHOuNCkSzngOUHFwqnGARySp03UjnzsxG7kMKD62daIP6dBtMNhegwofC7BfwigGdnW2DFs-PBFldta7m6qgayt5m2637au0Hs2oan7RWWi4Gr6M-_qVeB_u4D_pAQFDTMnkNLFI1oxFD0Xqz0DYl8ItG1JsYZqGUPlfwDc',
  partner: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9z0_qFFcxPTynziBimlO4ZPOQFzK7CzCSyVCv0kNcrKCiAJBxSC5E1phNCkDn9xtVrExQQ87WeZIoheVpMKoAWKh41dsihbIIjOeUaFB8wHt5T--RFXDxFiuZTZO1vz6lISFQaOI04Tym26Ju5v_M3Car6glHvDiYJzZrxsZSfLbsTS8n4qUTvbU1Um6VgboqhHrYBMFUVZrJuwLBTCI0mDrRwx3eM2jkUnm56VUa29YoY5hiWJ-tcB-E4cNfJ-CTTJIPBiHFvTnT',
  conversation: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDK75pW4vwBoIKZKqRfXv5nNixz53H86_XDRAM5lFE_qLDRDA_0EaBcExFNNcW2diDMzW7oHfniK5vT0VoDh8ORn6nDCr0bAoTYjdXoKn1JXHixWNHCN-flYfPlrnxYxeG5Q-eArpggt6kseUMEvlK-J3dB7Rfp0Tns9F2koKnKe904q18HbSiSBZrD9zSh5xQev-Mj2Rmdv4u19VE3ebdtEcecyMf1yeEMgGXxigV2uEAzs-KrJzjcwbLwiRFVLZnLuTzU2HNOJQcX',
  journal: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfBxh_yzZ7uwgR50MZXnPl8QPW_ME7nN1lPEv_cD822RK8u7V3Of9E95ABemZ6rqV6rm8XlZxJ4wKTkxhiTM_BdCz20_ph4pMvKdJ0nnZ_vWe9SHbw_9L3pktumG67jQ9bcna8kWc8qkdjUObqfyMIRuBTqz8PcOF2YENphyR5zUA8P06cp0atPabHodQTd4U_R_CrPA0NsRlNWahv_-vNun8lbKvIeKrXMWssZuRwXhSxhjkg5EYMZoF14po0DPIq5w_QpV0AJlk5',
  contentFilter: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwFXB-FLuFEzJSGvNSOMO371jUsqU4or47dt12RQUpFyGKy0QYOYry8Y8HDlzk5QZ67tgUAlb-B-d19tir4g-nQ8QL0YgqMU_Prwnu0TABcEXoLJzVSBziYz3qoolNAD6Y618dCgmPAfcj9r_yUuXtYbEKV-2f0zOq_YLPiwbTA4liYmq9KZqjL29E__6ceJEJiW-KUMZC0sNZ-qY2P0HeyFgrtebqakuqHa9UQTP1wb_29AmK24CSjQSB7l_J5O6Bc1DpMOAVtinG',
  alignment: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5Ys--kStjkPby9Zzm20_PmXM5uVfGTfSuggs9r3WJvReEscj7W60sLEU-bUDtF0AeqbE_btr3fg9RPmicpxh6qiQDyEz9kbkYiONgY96ZqIF0rZzvv8n6COzpeCPg7_kjrqpK7j3jkkolkA5PkecMAoDZ2zWxG-K47MB8kCTYKEVOWCWAZ27E-IKn6Qa76TU-IwTauc8Vmc8t8kt1CVrPbj6lj7BcLktihlUai5twB3UU1E20Azu2iAHz59zoPDPhHCQV_js88LSX',
  encryption: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_SmlA10dM0e2T2J0UiwgngHZsGaBJ4JuqCNZAMl1QG4NU9v7tdmC3VWKFAAgak_lSpbNYxCSYrvDlzgYvrmimwqt6xA3UityznZhg10haskT1rixoScFsfQlyOxUPSy4fdt2iwV5XzUl3aCzdGUJ8rHfFoly-qoTP62_ZTq7p6uIvSVJhgSMv1mYaAxBej4h_RoU7Zw7LVBfQJ8TMInGYqDcbbHd0MWedNtXiT--RHCjXowUWZwHMl-8etkYyMXnymYrHzoXbOK3x',
};

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const db = createServiceClient();

  // Parallel data fetching (including walkthrough detection)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [profileRes, eventsRes, alertsRes, partnerRes, focusCountRes, journalCountRes, checkinCountRes, todayEventsRes, weekEventsRes, streakRes, journalWeekRes, moodCheckInsRes, focusStreakRes, trustPointsRes] = await Promise.all([
    db.from('users').select('name, goals, monitoring_enabled, streak_mode, created_at, walkthrough_dismissed_at, check_in_hour, check_in_frequency, foundational_motivator, login_count').eq('id', user.id).single(),
    db.from('events').select('id, category, severity, platform, app_name, timestamp').eq('user_id', user.id).order('timestamp', { ascending: false }).limit(5),
    db.from('alerts').select('id, sent_at, conversations(id, completed_at, outcome)').eq('user_id', user.id).order('sent_at', { ascending: false }).limit(5),
    db.from('partners').select('partner_name, status, relationship').eq('user_id', user.id).in('status', ['active', 'accepted']).maybeSingle(),
    db.from('focus_segments').select('id', { count: 'exact', head: true }).eq('user_id', user.id).limit(1),
    db.from('stringer_journal').select('id', { count: 'exact', head: true }).eq('user_id', user.id).limit(1),
    db.from('check_ins').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'completed').limit(1),
    db.from('events').select('id, severity', { count: 'exact', head: false }).eq('user_id', user.id).gte('timestamp', todayStart.toISOString()),
    db.from('events').select('id, severity, category').eq('user_id', user.id).gte('timestamp', sevenDaysAgo),
    db.from('milestones').select('milestone').eq('user_id', user.id).order('unlocked_at', { ascending: false }).limit(1),
    // Hero: 7-day journal count
    db.from('stringer_journal').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', sevenDaysAgo),
    // Hero: mood trend from recent check-ins
    db.from('check_ins').select('user_mood, sent_at').eq('user_id', user.id).eq('status', 'completed').gte('sent_at', sevenDaysAgo).order('sent_at', { ascending: true }),
    // Hero: streak from focus_segments (recent consecutive focused days)
    db.from('focus_segments').select('date, status').eq('user_id', user.id).order('date', { ascending: false }).limit(90),
    // Hero: trust points from milestones count as proxy
    db.from('milestones').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
  ]);

  // Fetch recent milestones for Focus Chips display
  const recentChipsRes = await db
    .from('milestones')
    .select('milestone, unlocked_at')
    .eq('user_id', user.id)
    .order('unlocked_at', { ascending: false })
    .limit(10);

  const profile = profileRes?.data ?? null;
  const events = eventsRes?.data ?? [];
  const alerts = alertsRes?.data ?? [];
  const partner = partnerRes?.data ?? null;

  const pendingConversations = alerts.filter((a: any) => !a.conversations?.[0]?.completed_at).length;

  // Dashboard card data
  const todayEvents = todayEventsRes?.data ?? [];
  const todayFlags = todayEvents.length;
  const todayHighFlags = todayEvents.filter((e: any) => e.severity === 'high').length;
  const weekEvents = weekEventsRes?.data ?? [];
  const weekFlags = weekEvents.length;
  const weekCategories = [...new Set(weekEvents.map((e: any) => e.category))];
  const journalCount = journalCountRes?.count ?? 0;
  const latestMilestone = streakRes?.data?.[0]?.milestone ?? null;

  // ── Hero data ────────────────────────────────────────────
  const journalCount7d = journalWeekRes?.count ?? 0;
  const heroTrustPoints = trustPointsRes?.count ?? 0;

  // Compute streak from focus_segments (consecutive "focused" days from most recent)
  const focusSegments = (focusStreakRes?.data ?? []) as { date: string; status: string }[];
  let currentStreak = 0;
  for (const seg of focusSegments) {
    if (seg.status === 'focused') currentStreak++;
    else break;
  }

  // Compute mood trend from check-in moods
  const moodCheckins = (moodCheckInsRes?.data ?? []) as { user_mood: number | null; sent_at: string }[];
  const moodValues = moodCheckins.filter((c) => c.user_mood != null).map((c) => c.user_mood as number);
  let heroMoodTrend: { start: number; end: number; direction: 'up' | 'down' | 'stable' } | undefined;
  if (moodValues.length >= 2) {
    const start = moodValues[0];
    const end = moodValues[moodValues.length - 1];
    const diff = end - start;
    heroMoodTrend = {
      start,
      end,
      direction: diff > 0.3 ? 'up' : diff < -0.3 ? 'down' : 'stable',
    };
  }

  // ── Recent Focus Chips ──────────────────────────────────
  const chipMilestoneMap: Record<string, number> = {
    full_days_7: 7, full_days_14: 14, full_days_30: 30,
    full_days_60: 60, full_days_90: 90,
    streak_7: 7, streak_30: 30, streak_90: 90,
  };
  const recentChipMilestones = (recentChipsRes?.data ?? [])
    .map((m: any) => ({
      days: chipMilestoneMap[m.milestone] ?? null,
      achievedDate: m.unlocked_at,
    }))
    .filter((c: any) => c.days !== null);
  // Also add day-1 if they have any focused segment
  if (currentStreak >= 1 && !recentChipMilestones.some((c: any) => c.days === 1)) {
    recentChipMilestones.push({ days: 1, achievedDate: new Date().toISOString() });
  }
  // Mark from streak
  for (const ms of [1, 7, 14, 30, 60, 90, 180, 365]) {
    if (currentStreak >= ms && !recentChipMilestones.some((c: any) => c.days === ms)) {
      recentChipMilestones.push({ days: ms, achievedDate: new Date().toISOString() });
    }
  }
  // Sort by days descending and take top 3
  const displayChips = recentChipMilestones
    .sort((a: any, b: any) => b.days - a.days)
    .slice(0, 3);

  // Walkthrough: detect which setup steps are complete
  // Show walkthrough only for first 2 logins, unless manually dismissed
  const loginCount = profile?.login_count ?? 0;
  const showWalkthrough = !profile?.walkthrough_dismissed_at && loginCount <= 2;

  // Increment login count (fire-and-forget, non-blocking)
  db.from('users')
    .update({ login_count: loginCount + 1 })
    .eq('id', user.id)
    .then(() => {});
  const completedSteps = {
    checkin_configured: (profile?.check_in_hour !== 21 || profile?.check_in_frequency !== 'daily'),
    focus_started: (focusCountRes?.count ?? 0) > 0,
    first_journal: (journalCountRes?.count ?? 0) > 0,
    first_checkin: (checkinCountRes?.count ?? 0) > 0,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 page-enter">
      {/* ── First-Time Walkthrough ─────────────────────────── */}
      {showWalkthrough && (
        <WalkthroughWrapper
          userName={profile?.name?.split(' ')[0] ?? ''}
          completedSteps={completedSteps}
        />
      )}

      {/* ── Dashboard Hero ─────────────────────────────────── */}
      <DashboardHero
        userName={profile?.name ?? 'there'}
        currentStreak={currentStreak}
        moodTrend={heroMoodTrend}
        journalCount7d={journalCount7d}
        trustPoints={heroTrustPoints}
        goals={profile?.goals ?? []}
      />

      {/* ── Nudges ─────────────────────────────────────────── */}
      <NudgeBanner />

      {/* ── Quick Mood Check-in ────────────────────────────── */}
      <QuickMoodCheckin />

      {/* ── Quote of the Day ──────────────────────────────── */}
      <QuoteOfTheDay motivator={profile?.foundational_motivator ?? null} />

      {/* ── Daily Challenge ────────────────────────────────── */}
      <Suspense fallback={<div className="skeleton-shimmer h-36 rounded-2xl" />}>
        <DailyChallenge />
      </Suspense>

      {/* ── Recent Focus Chips ─────────────────────────────── */}
      {displayChips.length > 0 && (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
              <h3 className="font-headline font-bold text-sm text-on-surface">Recent Chips</h3>
            </div>
            <Link href="/dashboard/chips" className="text-xs text-primary font-label font-medium hover:underline">
              View all
            </Link>
          </div>
          <div className="flex items-center justify-center gap-4">
            {displayChips.map((chip: any) => (
              <FocusChip
                key={chip.days}
                milestone={chip.days}
                achieved={true}
                achievedDate={chip.achievedDate}
                variant="compact"
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Referral Card ────────────────────────────────── */}
      <ReferralCard />

      {/* ── Featured Cards Grid ────────────────────────────── */}
      <section className="grid grid-cols-2 lg:grid-cols-3 gap-4 stagger">
        {/* Crisis Detection — full width with real data */}
        <Link href="/dashboard/activity" className="col-span-2 lg:col-span-3 group bg-surface-container-low rounded-2xl overflow-hidden shadow-sm ring-1 ring-outline-variant/10 hover:ring-primary/20 hover:shadow-lg transition-all duration-300 cursor-pointer p-5">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-surface-container-lowest rounded-xl shadow-sm">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              </div>
              <div>
                <h3 className="font-headline font-bold text-lg text-on-surface">Crisis Detection</h3>
                <p className="text-xs text-on-surface-variant">Real-time activity monitoring</p>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
              profile?.monitoring_enabled
                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50'
                : 'bg-red-50 text-red-700 ring-1 ring-red-200/50'
            }`}>
              {profile?.monitoring_enabled ? 'Active' : 'Inactive'}
            </span>
          </div>
          {/* Live stats bar */}
          <div className="flex gap-3 mt-3">
            <div className="flex-1 bg-surface-container-lowest rounded-xl p-3 text-center">
              <div className={`text-2xl font-headline font-bold ${todayFlags > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>{todayFlags}</div>
              <div className="text-[10px] text-on-surface-variant font-label">Flags Today</div>
            </div>
            <div className="flex-1 bg-surface-container-lowest rounded-xl p-3 text-center">
              <div className={`text-2xl font-headline font-bold ${todayHighFlags > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{todayHighFlags}</div>
              <div className="text-[10px] text-on-surface-variant font-label">High Severity</div>
            </div>
            <div className="flex-1 bg-surface-container-lowest rounded-xl p-3 text-center">
              <div className="text-2xl font-headline font-bold text-on-surface">{weekFlags}</div>
              <div className="text-[10px] text-on-surface-variant font-label">This Week</div>
            </div>
            <div className="flex-1 bg-surface-container-lowest rounded-xl p-3 text-center">
              <div className="text-2xl font-headline font-bold text-primary">{pendingConversations}</div>
              <div className="text-[10px] text-on-surface-variant font-label">Pending Talks</div>
            </div>
          </div>
          {/* Mini 7-day bar chart */}
          {weekFlags > 0 && (
            <div className="flex items-end gap-1 mt-3 h-8">
              {Array.from({ length: 7 }).map((_, i) => {
                const day = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
                const dayStr = day.toISOString().split('T')[0];
                const dayCount = weekEvents.filter((e: any) => e.timestamp?.startsWith(dayStr)).length;
                const maxDay = Math.max(...Array.from({ length: 7 }).map((_, j) => {
                  const d = new Date(Date.now() - (6 - j) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                  return weekEvents.filter((e: any) => e.timestamp?.startsWith(d)).length;
                }), 1);
                const height = Math.max(4, (dayCount / maxDay) * 32);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                    <div
                      className={`w-full rounded-sm transition-all ${dayCount > 0 ? 'bg-primary/60' : 'bg-surface-container'}`}
                      style={{ height: `${height}px` }}
                    />
                    <span className="text-[8px] text-on-surface-variant/50">{['S','M','T','W','T','F','S'][day.getDay()]}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Link>

        {/* Guardian Hub — with partner status */}
        <Link href="/dashboard/settings" className="group bg-surface-container-low rounded-2xl cursor-pointer ring-1 ring-outline-variant/10 hover:ring-primary/20 hover:shadow-lg hover:shadow-on-surface/[0.04] transition-all duration-300 p-4 flex flex-col">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-surface-container-lowest rounded-lg shadow-sm">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
            </div>
            <span className="bg-primary/10 text-primary text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">Admin</span>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-4 mb-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${profile?.monitoring_enabled ? 'bg-emerald-500 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-xs font-label text-on-surface">{profile?.monitoring_enabled ? 'Monitoring Active' : 'Monitoring Off'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-on-surface-variant">person</span>
              <span className="text-xs font-label text-on-surface-variant">{(profile?.goals ?? []).length} rivals tracked</span>
            </div>
          </div>
          <h3 className="font-headline font-bold text-sm text-on-surface">Guardian Hub</h3>
          <p className="text-[10px] text-on-surface-variant leading-tight mt-1">Central safety oversight.</p>
        </Link>

        {/* Screen Time — with today's stats */}
        <Link href="/dashboard/screen-time" className="group bg-surface-container-low rounded-2xl cursor-pointer ring-1 ring-outline-variant/10 hover:ring-primary/20 hover:shadow-lg hover:shadow-on-surface/[0.04] transition-all duration-300 p-4 flex flex-col">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-surface-container-lowest rounded-lg shadow-sm">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>timer</span>
            </div>
            <span className="bg-tertiary-container text-on-tertiary-container text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">Monitor</span>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-4 mb-3 text-center">
            <div className="text-3xl font-headline font-bold text-on-surface">{todayFlags}</div>
            <div className="text-[10px] text-on-surface-variant font-label">events today</div>
            {weekCategories.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1 mt-2">
                {weekCategories.slice(0, 3).map((cat: string) => (
                  <span key={cat} className="text-[8px] px-1.5 py-0.5 rounded-full bg-primary/5 text-primary font-label">
                    {GOAL_LABELS[cat as GoalCategory]?.split(' ')[0] ?? cat}
                  </span>
                ))}
              </div>
            )}
          </div>
          <h3 className="font-headline font-bold text-sm text-on-surface">Screen Time</h3>
          <p className="text-[10px] text-on-surface-variant leading-tight mt-1">Conscious digital limits.</p>
        </Link>

        {/* Candid Journal — with entry count */}
        <Link href="/dashboard/stringer-journal" className="group bg-surface-container-low rounded-2xl cursor-pointer ring-1 ring-outline-variant/10 hover:ring-primary/20 hover:shadow-lg hover:shadow-on-surface/[0.04] transition-all duration-300 p-4 flex flex-col">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-surface-container-lowest rounded-lg shadow-sm">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>edit_note</span>
            </div>
            <span className="bg-primary/10 text-primary text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">Reflect</span>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-4 mb-3 text-center">
            <div className="text-3xl font-headline font-bold text-primary">{journalCount}</div>
            <div className="text-[10px] text-on-surface-variant font-label">{journalCount === 1 ? 'entry' : 'entries'} written</div>
            {journalCount === 0 && (
              <p className="text-[9px] text-primary mt-1 font-label font-medium">Start your first entry &rarr;</p>
            )}
          </div>
          <h3 className="font-headline font-bold text-sm text-on-surface">Candid Journal</h3>
          <p className="text-[10px] text-on-surface-variant leading-tight mt-1">Private space for reflective growth.</p>
        </Link>

        {/* Partner Awareness — full width with real partner data */}
        <Link href="/dashboard/partner" className="col-span-2 lg:col-span-3 group bg-surface-container-low rounded-2xl ring-1 ring-outline-variant/10 hover:ring-primary/20 hover:shadow-lg transition-all duration-300 cursor-pointer p-5">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
              partner ? 'bg-emerald-50 ring-1 ring-emerald-200/50' : 'bg-surface-container'
            }`}>
              <span className={`material-symbols-outlined text-2xl ${partner ? 'text-emerald-600' : 'text-on-surface-variant/40'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                {partner ? 'handshake' : 'person_add'}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-headline font-bold text-base text-on-surface">
                {partner ? `Partner: ${partner.partner_name}` : 'Invite a Partner'}
              </h3>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                {partner
                  ? <>
                      <span className="inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Connected
                      </span>
                      {partner.relationship && <> &middot; {(partner.relationship as string).charAt(0).toUpperCase() + (partner.relationship as string).slice(1)}</>}
                      {pendingConversations > 0 && <> &middot; <span className="text-primary font-bold">{pendingConversations} conversation{pendingConversations !== 1 ? 's' : ''} waiting</span></>}
                    </>
                  : 'Get 30 free days + false flag verification. Invite someone you trust.'}
              </p>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant/40 group-hover:text-primary transition-colors">chevron_right</span>
          </div>
        </Link>
      </section>

      {/* ── Focus Board & Check-in ─────────────────────────── */}
      <div data-tour="focus-board">
        <FocusBoardMini />
      </div>
      <CheckInMini />

      {/* ── Relationship & Spouse Impact ────────────────────── */}
      <Suspense fallback={null}>
        <RelationshipMini />
      </Suspense>
      <Suspense fallback={null}>
        <SpouseImpactAwareness />
      </Suspense>

      {/* ── Screen Time & Content Filter Widgets ────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Suspense fallback={null}>
          <ScreenTimeCard />
        </Suspense>
        <Suspense fallback={null}>
          <ContentFilterStatus />
        </Suspense>
      </div>

      {/* ── Growth Journal Widget ────────────────────────── */}
      <Suspense fallback={null}>
        <GrowthJournalWidget />
      </Suspense>

      {/* ── Other Services ─────────────────────────────────── */}
      <section>
        <h3 className="font-headline text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-4">Other Services</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 stagger">
          <Link href="/dashboard/conversations" className="flex items-center gap-4 p-3 bg-surface-container-lowest ring-1 ring-outline-variant/10 rounded-xl cursor-pointer hover:ring-primary/20 hover:bg-surface-container-low hover:translate-x-0.5 transition-all duration-300">
            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMAGES.conversation} alt="Conversation Guides" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h4 className="font-headline font-bold text-sm text-on-surface">Conversation Guides</h4>
              <p className="text-[10px] text-on-surface-variant">Empathetic prompts for difficult talks.</p>
            </div>
            <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
          </Link>

          <Link href="/dashboard/stringer-journal" className="flex items-center gap-4 p-3 bg-surface-container-lowest ring-1 ring-outline-variant/10 rounded-xl cursor-pointer hover:ring-primary/20 hover:bg-surface-container-low hover:translate-x-0.5 transition-all duration-300">
            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMAGES.journal} alt="Candid Journal" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h4 className="font-headline font-bold text-sm text-on-surface">Candid Journal</h4>
              <p className="text-[10px] text-on-surface-variant">Private space for reflective growth.</p>
            </div>
            <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
          </Link>

          <Link href="/dashboard/content-filter" className="flex items-center gap-4 p-3 bg-surface-container-lowest ring-1 ring-outline-variant/10 rounded-xl cursor-pointer hover:ring-primary/20 hover:bg-surface-container-low hover:translate-x-0.5 transition-all duration-300">
            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMAGES.contentFilter} alt="AI Content Filtering" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h4 className="font-headline font-bold text-sm text-on-surface">AI Content Filtering</h4>
              <p className="text-[10px] text-on-surface-variant">Shielding from toxic environments.</p>
            </div>
            <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
          </Link>

          <Link href="/dashboard/streaks" className="flex items-center gap-4 p-3 bg-surface-container-lowest ring-1 ring-outline-variant/10 rounded-xl cursor-pointer hover:ring-primary/20 hover:bg-surface-container-low hover:translate-x-0.5 transition-all duration-300">
            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMAGES.alignment} alt="Alignment Tracking" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h4 className="font-headline font-bold text-sm text-on-surface">Alignment Tracking</h4>
              <p className="text-[10px] text-on-surface-variant">Sync habits with core values.</p>
            </div>
            <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
          </Link>

          <Link href="/dashboard/security" className="flex items-center gap-4 p-3 bg-surface-container-lowest ring-1 ring-outline-variant/10 rounded-xl cursor-pointer hover:ring-primary/20 hover:bg-surface-container-low hover:translate-x-0.5 transition-all duration-300">
            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMAGES.encryption} alt="End-to-End Encryption" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h4 className="font-headline font-bold text-sm text-on-surface">End-to-End Encryption</h4>
              <p className="text-[10px] text-on-surface-variant">Maximum privacy for interactions.</p>
            </div>
            <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
          </Link>

          <Link href="/dashboard/checkins" className="flex items-center gap-4 p-3 bg-surface-container-lowest ring-1 ring-outline-variant/10 rounded-xl cursor-pointer hover:ring-primary/20 hover:bg-surface-container-low hover:translate-x-0.5 transition-all duration-300">
            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <div className="flex-1">
              <h4 className="font-headline font-bold text-sm text-on-surface">Quick Check-in</h4>
              <p className="text-[10px] text-on-surface-variant">Log how you&apos;re doing right now.</p>
            </div>
            <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
          </Link>
        </div>
      </section>

      {/* ── Recent Events ──────────────────────────────────── */}
      {events.length > 0 && (
        <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/20">
            <h3 className="font-headline text-sm font-bold text-on-surface">Recent Events</h3>
            <Link href="/dashboard/activity" className="text-xs text-primary font-label font-medium hover:underline cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 rounded">
              View all
            </Link>
          </div>
          <div className="divide-y divide-outline-variant/20">
            {events.map((event: any) => (
              <div key={event.id} className="flex items-center gap-3 px-5 py-3.5">
                <span className="material-symbols-outlined text-primary text-xl flex-shrink-0">
                  monitoring
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-on-surface font-body">
                    {GOAL_LABELS[event.category as GoalCategory] ?? event.category}
                  </div>
                  <div className="text-xs text-on-surface-variant font-label">
                    {event.app_name && `${event.app_name} \u00B7 `}
                    {event.platform} &middot; {timeAgo(event.timestamp)}
                  </div>
                </div>
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-label font-semibold ${SEVERITY_STYLES[event.severity as Severity]}`}>
                  {event.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Pending Conversations ──────────────────────────── */}
      {pendingConversations > 0 && (
        <div className="bg-tertiary-container rounded-2xl p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMAGES.conversation} alt="Conversations" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h3 className="font-headline text-sm font-bold text-on-tertiary-container mb-0.5">
                {pendingConversations} conversation{pendingConversations !== 1 ? 's' : ''} waiting
              </h3>
              <p className="text-xs text-on-tertiary-container/70 font-body">
                Complete conversations to earn trust points and keep your streak alive.
              </p>
            </div>
            <Link
              href="/dashboard/conversations"
              className="px-4 py-2 bg-primary text-on-primary text-sm font-label font-bold rounded-full hover:opacity-90 transition-opacity flex-shrink-0 uppercase tracking-wider cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              View
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
