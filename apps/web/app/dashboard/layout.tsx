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
  { id: 'overview', href: '/dashboard', label: 'Overview', icon: '◉', solo: true },
  { id: 'focus', href: '/dashboard/focus', label: 'Focus Board', icon: '🎯', solo: true },
  { id: 'checkins', href: '/dashboard/checkins', label: 'Check-ins', icon: '✓', solo: true },
  { id: 'stringer-journal', href: '/dashboard/stringer-journal', label: 'Stringer Journal', icon: '📓', solo: true },
  { id: 'journal', href: '/dashboard/journal', label: 'Growth Journal', icon: '📊', solo: true },
  { id: 'activity', href: '/dashboard/activity', label: 'Activity', icon: '⚡', solo: true },
  { id: 'zone', href: '/dashboard/zone', label: 'In the Zone', icon: '🔥', solo: true },
  { id: 'streaks', href: '/dashboard/streaks', label: 'Streaks', icon: '🏆', solo: true },
  { id: 'badges', href: '/dashboard/badges', label: 'Badges', icon: '🏅', solo: true },
  { id: 'notifications', href: '/dashboard/notifications', label: 'Notifications', icon: '🔔', solo: true },
  { id: 'conversations', href: '/dashboard/conversations', label: 'Conversations', icon: '💬', solo: false },
  { id: 'partner', href: '/dashboard/partner', label: 'Partner', icon: '🤝', solo: false },
  { id: 'settings', href: '/dashboard/settings', label: 'Settings', icon: '⚙', solo: true },
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
      icon: '➕',
      solo: true,
    });
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar
        userName={profile?.name ?? user.email ?? 'User'}
        monitoringEnabled={profile?.monitoring_enabled ?? true}
        navItems={visibleNav}
        soloMode={isSolo}
      />
      <main className="flex-1 min-w-0 pt-16 lg:pt-0">
        {!isVerified && user.email && (
          <EmailVerificationBanner email={user.email} />
        )}
        {children}
      </main>
    </div>
  );
}
