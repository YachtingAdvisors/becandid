'use client';

import dynamic from 'next/dynamic';

export const WhatsNew = dynamic(
  () => import('@/components/dashboard/WhatsNew'),
  { ssr: false },
);
export const ScheduledCoach = dynamic(
  () => import('@/components/dashboard/ScheduledCoach'),
  { ssr: false, loading: () => <div className="skeleton-shimmer h-36 rounded-3xl" /> },
);
export const DailyChallenge = dynamic(
  () => import('@/components/dashboard/DailyChallenge'),
  { ssr: false, loading: () => <div className="skeleton-shimmer h-36 rounded-2xl" /> },
);
export const DailyCommitment = dynamic(
  () => import('@/components/dashboard/DailyCommitment'),
  { ssr: false, loading: () => <div className="skeleton-shimmer h-36 rounded-3xl" /> },
);
export const SpouseImpactAwareness = dynamic(
  () => import('@/components/dashboard/SpouseImpactAwareness'),
  { ssr: false, loading: () => <div className="skeleton-shimmer h-32 rounded-2xl" /> },
);
export const ScreenTimeCard = dynamic(
  () => import('@/components/dashboard/ScreenTimeCard'),
  { ssr: false, loading: () => <div className="skeleton-shimmer h-28 rounded-2xl" /> },
);
export const ContentFilterStatus = dynamic(
  () => import('@/components/dashboard/ContentFilterStatus'),
  { ssr: false, loading: () => <div className="skeleton-shimmer h-28 rounded-2xl" /> },
);
export const WalkthroughWrapper = dynamic(
  () => import('@/components/dashboard/WalkthroughWrapper'),
  { ssr: false },
);
export const QuickMoodCheckin = dynamic(
  () => import('@/components/dashboard/QuickMoodCheckin'),
  { ssr: false, loading: () => <div className="skeleton-shimmer h-24 rounded-2xl" /> },
);
export const GrowthJournalWidget = dynamic(
  () => import('@/components/dashboard/GrowthJournalWidget'),
  { ssr: false, loading: () => <div className="skeleton-shimmer h-32 rounded-2xl" /> },
);
export const ReferralCard = dynamic(
  () => import('@/components/dashboard/ReferralCard'),
  { ssr: false, loading: () => <div className="skeleton-shimmer h-24 rounded-2xl" /> },
);
export const DailyInventory = dynamic(
  () => import('@/components/dashboard/DailyInventory'),
  { ssr: false, loading: () => <div className="skeleton-shimmer h-48 rounded-2xl" /> },
);
export const IsolationCheck = dynamic(
  () => import('@/components/dashboard/IsolationCheck'),
  { ssr: false, loading: () => <div className="skeleton-shimmer h-48 rounded-2xl" /> },
);
export const DoomscrollCheck = dynamic(
  () => import('@/components/dashboard/DoomscrollCheck'),
  { ssr: false, loading: () => <div className="skeleton-shimmer h-48 rounded-2xl" /> },
);
export const ProcrastinationCheck = dynamic(
  () => import('@/components/dashboard/ProcrastinationCheck'),
  { ssr: false, loading: () => <div className="skeleton-shimmer h-48 rounded-2xl" /> },
);
export const WorkLifeCheck = dynamic(
  () => import('@/components/dashboard/WorkLifeCheck'),
  { ssr: false, loading: () => <div className="skeleton-shimmer h-48 rounded-2xl" /> },
);
export const SleepCheck = dynamic(
  () => import('@/components/dashboard/SleepCheck'),
  { ssr: false, loading: () => <div className="skeleton-shimmer h-48 rounded-2xl" /> },
);
export const FirstVisitCoach = dynamic(
  () => import('@/components/dashboard/FirstVisitCoach'),
  { ssr: false },
);
export const TherapistBadge = dynamic(
  () => import('@/components/dashboard/TherapistBadge'),
  { ssr: false },
);
