// ============================================================
// app/dashboard/layout.tsx — REWRITE
//
// Server component layout that:
//   1. Checks auth + redirects if not logged in
//   2. Detects solo mode (hides partner nav items)
//   3. Shows email verification banner if unverified
//   4. Renders sidebar with correct nav for mode
// ============================================================

import { redirect } from 'next/navigation';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import Sidebar from '@/components/dashboard/Sidebar';
import EmailVerificationBanner from '@/components/dashboard/EmailVerificationBanner';

// Nav items — some hidden in solo mode
const NAV_ITEMS = [
  { id: 'overview', href: '/dashboard', label: 'Overview', icon: '\u25C9', solo: true },
  { id: 'focus', href: '/dashboard/focus', label: 'Focus Board', icon: '\uD83C\uDFAF', solo: true },
  { id: 'checkins', href: '/dashboard/checkins', label: 'Check-ins', icon: '\u2713', solo: true },
  { id: 'stringer-journal', href: '/dashboard/stringer-journal', label: 'Candid Journal', icon: '\uD83D\uDCD3', solo: true },
  { id: 'journal', href: '/dashboard/journal', label: 'Growth Journal', icon: '\uD83D\uDCCA', solo: true },
  { id: 'activity', href: '/dashboard/activity', label: 'Activity', icon: '\u26A1', solo: true },
  { id: 'zone', href: '/dashboard/zone', label: 'In the Zone', icon: '\uD83D\uDD25', solo: true },
  { id: 'streaks', href: '/dashboard/streaks', label: 'Streaks', icon: '\uD83C\uDFC6', solo: true },
  { id: 'badges', href: '/dashboard/badges', label: 'Badges', icon: '\uD83C\uDFC5', solo: true },
  { id: 'notifications', href: '/dashboard/notifications', label: 'Notifications', icon: '\uD83D\uDD14', solo: true },
  { id: 'conversations', href: '/dashboard/conversations', label: 'Conversations', icon: '\uD83D\uDCAC', solo: false },
  { id: 'partner', href: '/dashboard/partner', label: 'Partner', icon: '\uD83E\uDD1D', solo: false },
  { id: 'settings', href: '/dashboard/settings', label: 'Settings', icon: '\u2699', solo: true },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  const db = createServiceClient();
  const { data: profile } = await db.from('users')
    .select('name, monitoring_enabled, solo_mode')
    .eq('id', user.id)
    .single();

  const isSolo = profile?.solo_mode ?? false;
  const isVerified = !!user.email_confirmed_at;

  // Filter nav items based on mode
  const visibleNav = NAV_ITEMS.filter((item) => {
    if (isSolo && !item.solo) return false;
    return true;
  });

  // In solo mode, add "Invite Partner" link to bottom of nav
  if (isSolo) {
    visibleNav.push({
      id: 'invite-partner',
      href: '/dashboard/partner',
      label: 'Invite a Partner',
      icon: '\u2795',
      solo: true,
    });
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        userName={profile?.name ?? user.email ?? 'User'}
        monitoringEnabled={profile?.monitoring_enabled ?? true}
        navItems={visibleNav}
        soloMode={isSolo}
      />
      <main className="flex-1 min-w-0 pt-16 pb-20 lg:pt-0 lg:pb-0">
        {!isVerified && user.email && (
          <EmailVerificationBanner email={user.email} />
        )}
        <div className="px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
