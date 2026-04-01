import { createServiceClient } from '@/lib/supabase';
import { getBadgeByKey, TIER_STYLES, TIER_LABELS } from '@/lib/badges';
import type { Metadata } from 'next';
import Link from 'next/link';

interface Props {
  params: Promise<{ token: string }>;
}

async function getMilestoneData(token: string) {
  const db = createServiceClient();
  const { data } = await db
    .from('milestones')
    .select('milestone, unlocked_at, user_id')
    .eq('share_token', token)
    .maybeSingle();

  if (!data) return null;

  const { data: user } = await db
    .from('users')
    .select('name')
    .eq('id', data.user_id)
    .single();

  const firstName = user?.name?.split(' ')[0] ?? 'Someone';
  const badge = getBadgeByKey(data.milestone);

  return {
    firstName,
    badge,
    milestone: data.milestone,
    unlockedAt: data.unlocked_at,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const data = await getMilestoneData(token);

  if (!data?.badge) {
    return { title: 'Achievement | Be Candid' };
  }

  const title = `${data.firstName} earned ${data.badge.label} on Be Candid`;
  return {
    title,
    description: `${data.firstName} just hit a milestone on their digital wellness journey. Join Be Candid to start yours.`,
    openGraph: {
      title,
      description: `${data.firstName} just hit a milestone on their digital wellness journey. Join Be Candid to start yours.`,
      type: 'website',
      images: ['/og-image.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: `${data.firstName} just hit a milestone on their digital wellness journey.`,
    },
  };
}

export default async function ShareMilestonePage({ params }: Props) {
  const { token } = await params;
  const data = await getMilestoneData(token);

  if (!data?.badge) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center space-y-4">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant/30">link_off</span>
          <h1 className="font-headline text-xl font-bold text-on-surface">Achievement not found</h1>
          <p className="text-sm text-on-surface-variant font-body">This share link may have expired or been removed.</p>
          <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-on-primary text-sm font-label font-bold hover:brightness-110 transition-all">
            Visit Be Candid
          </Link>
        </div>
      </main>
    );
  }

  const tier = TIER_STYLES[data.badge.tier];
  const tierLabel = TIER_LABELS[data.badge.tier];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      {/* Header */}
      <Link href="/" className="mb-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Be Candid" className="h-10 w-auto" />
      </Link>

      {/* Achievement card */}
      <div className={`max-w-md w-full rounded-3xl p-8 text-center space-y-5 border-2 shadow-xl ${tier.bg} ${tier.border}`}>
        <div className="flex justify-center">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${tier.bg} border-2 ${tier.border}`}>
            <span
              className={`material-symbols-outlined text-5xl ${tier.text}`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {data.badge.icon}
            </span>
          </div>
        </div>

        <div>
          <p className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant/60 mb-1">
            {tierLabel} Achievement
          </p>
          <h1 className={`font-headline text-2xl font-extrabold ${tier.text}`}>
            {data.badge.label}
          </h1>
        </div>

        <p className="font-body text-sm text-on-surface-variant">
          <span className="font-bold text-on-surface">{data.firstName}</span> earned this badge on their digital wellness journey with Be Candid.
        </p>

        {data.unlockedAt && (
          <p className="text-xs text-on-surface-variant font-label">
            Unlocked {new Date(data.unlockedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        )}
      </div>

      {/* CTA */}
      <div className="mt-8 text-center space-y-3">
        <p className="text-sm text-on-surface-variant font-body">Ready to start your own journey?</p>
        <Link
          href="/auth/signup"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-on-primary font-headline font-bold text-lg shadow-lg shadow-primary/20 hover:brightness-110 transition-all"
        >
          Join Be Candid
          <span className="material-symbols-outlined">arrow_forward</span>
        </Link>
      </div>
    </main>
  );
}
