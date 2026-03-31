import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import SettingsForm from '@/components/dashboard/SettingsForm';
import VulnerabilityWindows from '@/components/dashboard/VulnerabilityWindows';
import BillingSection from '@/components/dashboard/BillingSection';
import SubscriptionCard from '@/components/dashboard/SubscriptionCard';
import JournalSettings from '@/components/dashboard/JournalSettings';
import PrivacySettings from '@/components/dashboard/PrivacySettings';
import SoloModeToggle from '@/components/dashboard/SoloModeToggle';
import TherapistSettings from '@/components/dashboard/TherapistSettings';
import Link from 'next/link';

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const db = createServiceClient();
  const { data: profile } = await db
    .from('users')
    .select('name, phone, goals, monitoring_enabled, streak_mode, timezone, nudge_enabled, check_in_enabled, check_in_hour, check_in_frequency, foundational_motivator')
    .eq('id', user.id)
    .single();

  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <p className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-widest">Account</p>
        <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface mb-1">Settings</h1>
        <p className="text-sm text-on-surface-variant font-body">
          Manage your profile, rivals, awareness preferences, and check-in schedule.
        </p>
      </div>

      <SettingsForm
        profile={{
          name: profile.name ?? '',
          phone: profile.phone ?? '',
          goals: profile.goals ?? [],
          monitoring_enabled: profile.monitoring_enabled ?? true,
          streak_mode: profile.streak_mode ?? 'no_failures',
          timezone: profile.timezone ?? 'America/New_York',
          nudge_enabled: profile.nudge_enabled ?? true,
          check_in_enabled: profile.check_in_enabled ?? true,
          check_in_hour: profile.check_in_hour ?? 21,
          check_in_frequency: profile.check_in_frequency ?? 'daily',
          foundational_motivator: profile.foundational_motivator ?? 'general',
        }}
      />

      {/* Solo Mode */}
      <SoloModeToggle />

      {/* Journal Settings */}
      <JournalSettings />

      {/* Therapist Portal */}
      <TherapistSettings />

      {/* Vulnerability Windows */}
      <VulnerabilityWindows />

      {/* Plan & Billing */}
      <BillingSection />

      {/* Subscription Details */}
      <SubscriptionCard />

      {/* Content Filter Settings */}
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

      {/* Screen Time Summary */}
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

      {/* Account Mode */}
      <section className="bg-surface-container-lowest rounded-3xl p-5 space-y-3 ring-1 ring-outline-variant/10 shadow-sm">
        <h2 className="font-headline text-lg font-bold text-on-surface">Account Mode</h2>
        <div className="flex items-center gap-3">
          <span className="inline-flex px-3 py-1 rounded-full text-xs font-label font-semibold bg-secondary-container text-on-secondary-container">
            Adult
          </span>
          <span className="text-xs text-on-surface-variant font-body">
            Self-directed accountability with optional partner support
          </span>
        </div>
      </section>

      {/* Privacy & Security */}
      <PrivacySettings />

      {/* Data & Account */}
      <section className="bg-surface-container-lowest rounded-3xl p-5 space-y-3 ring-1 ring-outline-variant/10 shadow-sm">
        <h2 className="font-headline text-lg font-bold text-on-surface">Your Data</h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-label font-medium text-on-surface">Export all data</div>
            <div className="text-xs text-on-surface-variant font-body">Download everything as a JSON file</div>
          </div>
          <a
            href="/api/account"
            download
            className="px-3 py-1.5 min-h-[44px] text-xs font-label font-medium text-primary border border-primary-container rounded-2xl hover:bg-primary-container/20 cursor-pointer transition-all duration-200"
          >
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
    </div>
  );
}
