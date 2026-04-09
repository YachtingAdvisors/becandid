import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Delete Your Account — Be Candid',
  description: 'How to request deletion of your Be Candid account and all associated data.',
};

export default function DeleteAccountPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Be Candid" className="h-8 w-auto" />
          <span className="text-on-surface-variant font-label text-sm">/</span>
          <span className="font-label text-sm text-on-surface-variant">Account Deletion</span>
        </div>

        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface mt-8 mb-4">
          Delete Your Be Candid Account
        </h1>
        <p className="text-base text-on-surface-variant font-body leading-relaxed mb-10">
          Be Candid respects your right to delete your account and all associated data at any time. This page explains how to request deletion, what data is removed, and any retention periods.
        </p>

        {/* Steps */}
        <section className="mb-10">
          <h2 className="font-headline text-xl font-bold text-on-surface mb-4">
            How to Delete Your Account
          </h2>
          <div className="space-y-4">
            {[
              {
                step: '1',
                title: 'Sign in to Be Candid',
                desc: 'Open the Be Candid app or visit becandid.io and sign in with your email and password.',
              },
              {
                step: '2',
                title: 'Go to Settings',
                desc: 'Navigate to your Dashboard and tap or click Settings in the sidebar menu.',
              },
              {
                step: '3',
                title: 'Scroll to "Delete Account"',
                desc: 'At the bottom of the Settings page, you will find the "Delete Account" section under Privacy.',
              },
              {
                step: '4',
                title: 'Confirm deletion',
                desc: 'Tap "Delete Account" and confirm when prompted. Your account and all data will be permanently deleted.',
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-headline font-bold text-sm">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-headline font-bold text-sm text-on-surface">{item.title}</h3>
                  <p className="text-sm text-on-surface-variant font-body mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/20">
            <p className="text-sm text-on-surface-variant font-body">
              <strong className="text-on-surface">Can&apos;t sign in?</strong> Email us at{' '}
              <a href="mailto:shawn@becandid.io?subject=Account%20Deletion%20Request" className="text-primary font-semibold hover:underline">
                shawn@becandid.io
              </a>{' '}
              with the subject &quot;Account Deletion Request&quot; and the email address associated with your account. We will process your request within 7 business days.
            </p>
          </div>
        </section>

        {/* Data deleted */}
        <section className="mb-10">
          <h2 className="font-headline text-xl font-bold text-on-surface mb-4">
            Data That Is Deleted
          </h2>
          <p className="text-sm text-on-surface-variant font-body mb-3">
            When you delete your Be Candid account, the following data is <strong className="text-on-surface">permanently and irreversibly deleted</strong>:
          </p>
          <ul className="space-y-2">
            {[
              'Your user profile (name, email, avatar, preferences)',
              'All journal entries (freewrite, tributaries, longing, roadmap)',
              'Check-in history and mood records',
              'Focus segments and streak data',
              'Milestones, badges, and trust points',
              'Browsing activity events and alerts',
              'Partner connections and conversation history',
              'Therapist connections and consent records',
              'Screen time data and content filter rules',
              'Push notification tokens and device registrations',
              'Dashboard layout preferences',
              'Assessment results and rival selections',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-on-surface-variant font-body">
                <span className="material-symbols-outlined text-red-500 text-sm mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>delete</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Data retained */}
        <section className="mb-10">
          <h2 className="font-headline text-xl font-bold text-on-surface mb-4">
            Data That May Be Retained
          </h2>
          <p className="text-sm text-on-surface-variant font-body mb-3">
            The following data may be retained for a limited period after account deletion:
          </p>
          <ul className="space-y-2">
            {[
              {
                item: 'Anonymized, aggregated analytics',
                detail: 'Non-identifiable usage statistics (e.g., total user counts) that cannot be linked back to your account. Retained indefinitely.',
              },
              {
                item: 'Audit logs',
                detail: 'Records of account creation and deletion events for security and compliance purposes. Retained for 90 days, then permanently deleted.',
              },
              {
                item: 'Payment records',
                detail: 'If you made a payment via Stripe, transaction records are retained by Stripe per their data retention policy. Be Candid does not store credit card numbers.',
              },
              {
                item: 'Backup copies',
                detail: 'Database backups may contain your data for up to 30 days after deletion. Backups are encrypted and automatically purged on a rolling basis.',
              },
            ].map((entry) => (
              <li key={entry.item} className="text-sm text-on-surface-variant font-body">
                <strong className="text-on-surface">{entry.item}:</strong> {entry.detail}
              </li>
            ))}
          </ul>
        </section>

        {/* Timeline */}
        <section className="mb-10">
          <h2 className="font-headline text-xl font-bold text-on-surface mb-4">
            Deletion Timeline
          </h2>
          <div className="p-4 bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/20 space-y-2">
            <p className="text-sm text-on-surface-variant font-body">
              <strong className="text-on-surface">Immediate:</strong> Your account is deactivated and you are signed out of all devices. All personal data is queued for deletion.
            </p>
            <p className="text-sm text-on-surface-variant font-body">
              <strong className="text-on-surface">Within 24 hours:</strong> All personal data is permanently deleted from our primary database.
            </p>
            <p className="text-sm text-on-surface-variant font-body">
              <strong className="text-on-surface">Within 30 days:</strong> All data is purged from encrypted backups.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="mb-10">
          <h2 className="font-headline text-xl font-bold text-on-surface mb-4">
            Questions?
          </h2>
          <p className="text-sm text-on-surface-variant font-body">
            If you have questions about data deletion or your privacy, contact us at{' '}
            <a href="mailto:shawn@becandid.io" className="text-primary font-semibold hover:underline">shawn@becandid.io</a>.
          </p>
          <p className="text-sm text-on-surface-variant font-body mt-2">
            For our full privacy policy, visit{' '}
            <Link href="/legal/privacy" className="text-primary font-semibold hover:underline">becandid.io/legal/privacy</Link>.
          </p>
        </section>

        {/* Footer */}
        <footer className="pt-6 border-t border-outline-variant/30 text-xs text-on-surface-variant/60 font-body">
          <p>&copy; {new Date().getFullYear()} Be Candid. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
