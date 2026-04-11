export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import { createServerSupabaseClient, createServiceClient, ensureUserRow } from '@/lib/supabase';
import SettingsForm from '@/components/dashboard/SettingsForm';
import VulnerabilityWindows from '@/components/dashboard/VulnerabilityWindows';
import BillingSection from '@/components/dashboard/BillingSection';
import SubscriptionCard from '@/components/dashboard/SubscriptionCard';
import JournalSettings from '@/components/dashboard/JournalSettings';
import PrivacySettings from '@/components/dashboard/PrivacySettings';
import MFASetup from '@/components/dashboard/MFASetup';
import ActiveSessions from '@/components/dashboard/ActiveSessions';
import SoloModeToggle from '@/components/dashboard/SoloModeToggle';
import TherapistSettings from '@/components/dashboard/TherapistSettings';
import CategoryTimeLimits from '@/components/dashboard/CategoryTimeLimits';
import SiteListsManager from '@/components/dashboard/SiteListsManager';
import SettingsTabs from '@/components/dashboard/SettingsTabs';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your Be Candid account settings, privacy preferences, notification controls, and subscription details.',
};

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const db = createServiceClient();
  const raw = await ensureUserRow(db, user);
  if (!raw) return null;

  const profile = {
    name: raw.name ?? '',
    phone: raw.phone ?? '',
    goals: raw.goals ?? [],
    monitoring_enabled: raw.monitoring_enabled ?? true,
    streak_mode: raw.streak_mode ?? 'no_failures',
    timezone: raw.timezone ?? 'America/New_York',
    nudge_enabled: raw.nudge_enabled ?? true,
    check_in_enabled: raw.check_in_enabled ?? true,
    check_in_hour: raw.check_in_hour ?? 21,
    check_in_frequency: raw.check_in_frequency ?? 'daily',
    foundational_motivator: raw.foundational_motivator ?? 'general',
  };

  const { data: partnerData } = await db
    .from('partners')
    .select('id')
    .eq('user_id', user.id)
    .in('status', ['active', 'accepted'])
    .maybeSingle();
  const hasPartner = !!partnerData;

  /* ── Tab content sections ───────────────────────────────────── */

  const profileTab = (
    <>
      <SettingsForm
        hasPartner={hasPartner}
        profile={profile}
      />
      <SoloModeToggle />
      {/* Account Mode */}
      <section className="bg-surface-container-lowest rounded-3xl p-5 space-y-3 ring-1 ring-outline-variant/10 shadow-sm">
        <h2 className="font-headline text-lg font-bold text-on-surface">Account Mode</h2>
        <div className="flex items-center gap-3">
          <span className="inline-flex px-3 py-1 rounded-full text-xs font-label font-semibold bg-secondary-container text-on-secondary-container">
            Adult
          </span>
          <span className="text-xs text-on-surface-variant font-body">
            Self-directed awareness with optional partner support
          </span>
        </div>
      </section>
    </>
  );

  const awarenessTab = (
    <>
      <CategoryTimeLimits />
      <VulnerabilityWindows />
      {/* Content Filter */}
      <section className="bg-surface-container-lowest rounded-3xl p-5 space-y-3 ring-1 ring-outline-variant/10 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-lg font-bold text-on-surface">Content Filter</h2>
          <Link href="/dashboard/content-filter" className="text-xs text-primary font-label font-medium hover:underline cursor-pointer transition-colors duration-200">
            Manage
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex px-3 py-1 rounded-full text-xs font-label font-semibold bg-primary-container text-primary">
            Standard
          </span>
          <span className="text-xs text-on-surface-variant font-body">
            AI-powered content filtering is active
          </span>
        </div>
      </section>
      <SiteListsManager />
      {/* Screen Time */}
      <section className="bg-surface-container-lowest rounded-3xl p-5 space-y-3 ring-1 ring-outline-variant/10 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-lg font-bold text-on-surface">Screen Time</h2>
          <Link href="/dashboard/screen-time" className="text-xs text-primary font-label font-medium hover:underline cursor-pointer transition-colors duration-200">
            View Details
          </Link>
        </div>
        <p className="text-xs text-on-surface-variant font-body">
          Monitor and manage screen time usage, set limits by category, and configure downtime schedules.
        </p>
      </section>
    </>
  );

  const journalTab = (
    <>
      <JournalSettings />
      <TherapistSettings />
    </>
  );

  const billingTab = (
    <>
      <BillingSection />
      <SubscriptionCard />
    </>
  );

  const privacyTab = (
    <>
      <PrivacySettings />
      <MFASetup />
      <ActiveSessions />
      {/* Data Export */}
      <section className="bg-surface-container-lowest rounded-3xl p-5 space-y-3 ring-1 ring-outline-variant/10 shadow-sm">
        <h2 className="font-headline text-lg font-bold text-on-surface">Your Data</h2>
        <p className="text-xs text-on-surface-variant font-body">
          Download a complete copy of all your data. This includes journals, events, moods, conversations, and everything else we store about you.
        </p>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-label font-medium text-on-surface">Download All My Data</div>
            <div className="text-xs text-on-surface-variant font-body">GDPR-compliant JSON export of every table</div>
          </div>
          <a
            href="/api/privacy"
            download
            className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] text-xs font-label font-medium text-primary border border-primary-container rounded-2xl hover:bg-primary-container/20 cursor-pointer transition-all duration-200"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Export
          </a>
        </div>
      </section>
      {/* Danger zone */}
      <section className="bg-surface-container-lowest rounded-3xl p-5 ring-1 ring-error/20 shadow-sm">
        <h2 className="font-headline text-lg font-bold text-error mb-3">Danger Zone</h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-label font-medium text-on-surface">Delete account</div>
            <div className="text-xs text-on-surface-variant font-body">Permanently delete your account and all data. This cannot be undone.</div>
          </div>
          <button className="px-3 py-1.5 min-h-[44px] text-xs font-label font-medium text-error border border-error/30 rounded-2xl hover:bg-error/5 cursor-pointer transition-all duration-200">
            Delete Account
          </button>
        </div>
      </section>
    </>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <p className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-widest">Account</p>
        <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface mb-1">Settings</h1>
        <p className="text-sm text-on-surface-variant font-body">
          Manage your profile, rivals, awareness preferences, and check-in schedule.
        </p>
      </div>

      <SettingsTabs
        profile={profileTab}
        awareness={awarenessTab}
        journal={journalTab}
        billing={billingTab}
        privacy={privacyTab}
      />
    </div>
  );
}
