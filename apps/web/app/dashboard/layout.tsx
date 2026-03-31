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
import WebTrackingProvider from '@/components/dashboard/WebTrackingProvider';

// Nav items — some hidden in solo mode
const NAV_ITEMS = [
  { id: 'overview', href: '/dashboard', label: 'Overview', icon: 'dashboard', solo: true },
  { id: 'focus', href: '/dashboard/focus', label: 'Focus Board', icon: 'center_focus_strong', solo: true },
  { id: 'checkins', href: '/dashboard/checkins', label: 'Check-ins', icon: 'check_circle', solo: true },
  { id: 'stringer-journal', href: '/dashboard/stringer-journal', label: 'Candid Journal', icon: 'edit_note', solo: true },
  { id: 'activity', href: '/dashboard/activity', label: 'Activity', icon: 'timeline', solo: true },
  { id: 'progress', href: '/dashboard/progress', label: 'Progress', icon: 'trending_up', solo: true },
  { id: 'conversations', href: '/dashboard/conversations', label: 'Partner Conversations', icon: 'forum', solo: false },
  { id: 'settings', href: '/dashboard/settings', label: 'Settings', icon: 'settings', solo: true },
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
      icon: 'person_add',
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
      <main className="flex-1 min-w-0 pt-16 pb-20 lg:pt-0 lg:pb-0 relative">
        {/* Subtle top gradient decorative element */}
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none" />
        <WebTrackingProvider />
        {!isVerified && user.email && (
          <EmailVerificationBanner email={user.email} />
        )}
        <div className="relative px-4 py-6 lg:px-10 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
