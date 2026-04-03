import type { Metadata } from 'next';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Therapist Dashboard',
  description: 'View your connected clients and their progress.',
};

const CONSENT_LABELS: Record<string, string> = {
  can_see_journal: 'Journal',
  can_see_moods: 'Moods',
  can_see_streaks: 'Streaks',
  can_see_outcomes: 'Outcomes',
  can_see_patterns: 'Patterns',
  can_see_family_systems: 'Family Systems',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

export default async function TherapistDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/signin?redirect=/therapist/dashboard');

  const db = createServiceClient();

  const { data: connections } = await db.from('therapist_connections')
    .select('id, user_id, can_see_journal, can_see_moods, can_see_streaks, can_see_outcomes, can_see_patterns, can_see_family_systems, accepted_at, users!therapist_connections_user_id_fkey(name, created_at)')
    .eq('therapist_user_id', user.id)
    .eq('status', 'accepted');

  const clients = (connections || []).map((c: any) => ({
    connectionId: c.id,
    userId: c.user_id,
    name: c.users?.name || 'Client',
    memberSince: c.users?.created_at,
    acceptedAt: c.accepted_at,
    consent: {
      can_see_journal: c.can_see_journal,
      can_see_moods: c.can_see_moods,
      can_see_streaks: c.can_see_streaks,
      can_see_outcomes: c.can_see_outcomes,
      can_see_patterns: c.can_see_patterns,
      can_see_family_systems: c.can_see_family_systems,
    },
  }));

  return (
    <div className="max-w-3xl mx-auto space-y-6 stagger">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span
          className="material-symbols-outlined text-primary text-3xl"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          psychology
        </span>
        <div>
          <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">
            Your Clients
          </h1>
          <p className="text-sm text-on-surface-variant font-body">
            Read-only access to client progress, respecting their consent settings.
          </p>
        </div>
      </div>

      {/* Client list */}
      {clients.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-8 text-center">
          <span
            className="material-symbols-outlined text-on-surface-variant text-5xl mb-4 block"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            group_off
          </span>
          <h2 className="font-headline text-lg font-bold text-on-surface mb-2">
            No clients yet
          </h2>
          <p className="text-sm text-on-surface-variant font-body max-w-md mx-auto">
            When a client invites you through Be Candid, their connection will appear here.
            Clients control what you can see through their consent settings.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {clients.map((client) => (
            <Link
              key={client.connectionId}
              href={`/therapist/clients/${client.userId}`}
              className="block bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 hover:border-primary/30 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-xl">
                      person
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-headline font-bold text-on-surface truncate">
                      {client.name}
                    </h3>
                    <p className="text-xs text-on-surface-variant font-label">
                      Member since {client.memberSince ? formatDate(client.memberSince) : 'unknown'}
                      {client.acceptedAt && (
                        <span className="ml-2 text-outline">
                          &middot; Connected {formatDate(client.acceptedAt)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors flex-shrink-0 mt-1">
                  chevron_right
                </span>
              </div>

              {/* Consent pills */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {Object.entries(CONSENT_LABELS).map(([key, label]) => {
                  const granted = client.consent[key as keyof typeof client.consent];
                  return (
                    <span
                      key={key}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-label font-medium ${
                        granted
                          ? 'bg-primary-container text-on-primary-container'
                          : 'bg-surface-container text-on-surface-variant/50 line-through'
                      }`}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: '14px' }}
                      >
                        {granted ? 'check_circle' : 'block'}
                      </span>
                      {label}
                    </span>
                  );
                })}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
