import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import SettingsForm from '@/components/dashboard/SettingsForm';
import VulnerabilityWindows from '@/components/dashboard/VulnerabilityWindows';
import BillingSection from '@/components/dashboard/BillingSection';
import JournalSettings from '@/components/dashboard/JournalSettings';
import PrivacySettings from '@/components/dashboard/PrivacySettings';
import SoloModeToggle from '@/components/dashboard/SoloModeToggle';
import TherapistSettings from '@/components/dashboard/TherapistSettings';

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const db = createServiceClient();
  const { data: profile } = await db
    .from('users')
    .select('name, phone, goals, monitoring_enabled, streak_mode, timezone, nudge_enabled, check_in_enabled, check_in_hour, check_in_frequency')
    .eq('id', user.id)
    .single();

  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink mb-1">Settings</h1>
        <p className="text-sm text-ink-muted">
          Manage your profile, rivals, monitoring preferences, and check-in schedule.
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

      {/* Privacy & Security */}
      <PrivacySettings />

      {/* Data & Account */}
      <section className="card p-5 space-y-3">
        <h2 className="font-display text-lg font-semibold text-ink">Your Data</h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-ink">Export all data</div>
            <div className="text-xs text-ink-muted">Download everything as a JSON file</div>
          </div>
          <a
            href="/api/account"
            download
            className="px-3 py-1.5 text-xs font-medium text-brand-600 border border-brand-300 rounded-lg hover:bg-brand-50 transition-colors"
          >
            Export
          </a>
        </div>
      </section>

      {/* Danger zone */}
      <section className="card p-5 border-red-200">
        <h2 className="font-display text-lg font-semibold text-red-600 mb-3">Danger Zone</h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-ink">Delete account</div>
            <div className="text-xs text-ink-muted">Permanently delete your account and all data. This cannot be undone.</div>
          </div>
          <button className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors">
            Delete Account
          </button>
        </div>
      </section>
    </div>
  );
}
