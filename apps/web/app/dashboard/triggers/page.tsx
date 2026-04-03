import type { Metadata } from 'next';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import TriggerMap from '@/components/dashboard/TriggerMap';

export const metadata: Metadata = {
  title: 'Trigger Map',
  description: 'Discover which tags correlate most with relapses.',
};

export default async function TriggersPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const db = createServiceClient();

  // Fetch all journal entries with tags
  const { data: entries } = await db.from('stringer_journal')
    .select('tags, trigger_type')
    .eq('user_id', user.id);

  const allEntries = entries ?? [];

  // Compute per-tag frequencies and relapse correlations
  const tagTotal = new Map<string, number>();
  const tagRelapse = new Map<string, number>();

  for (const entry of allEntries) {
    const tags: string[] = entry.tags ?? [];
    for (const tag of tags) {
      tagTotal.set(tag, (tagTotal.get(tag) ?? 0) + 1);
      if (entry.trigger_type === 'relapse') {
        tagRelapse.set(tag, (tagRelapse.get(tag) ?? 0) + 1);
      }
    }
  }

  const triggers = Array.from(tagTotal.entries())
    .map(([tag, total]) => {
      const relapse_count = tagRelapse.get(tag) ?? 0;
      return {
        tag,
        total,
        relapse_count,
        correlation: total > 0 ? relapse_count / total : 0,
      };
    })
    .filter(t => t.total >= 1)
    .sort((a, b) => b.correlation - a.correlation || b.total - a.total);

  // Compute co-occurrence pairs on relapse entries
  const pairCounts = new Map<string, number>();
  const relapseEntries = allEntries.filter(e => e.trigger_type === 'relapse');

  for (const entry of relapseEntries) {
    const tags: string[] = (entry.tags ?? []).sort();
    for (let i = 0; i < tags.length; i++) {
      for (let j = i + 1; j < tags.length; j++) {
        const key = `${tags[i]}|||${tags[j]}`;
        pairCounts.set(key, (pairCounts.get(key) ?? 0) + 1);
      }
    }
  }

  const topPairs = Array.from(pairCounts.entries())
    .map(([key, count]) => {
      const [a, b] = key.split('|||');
      return { tags: [a, b] as [string, string], count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <section className="relative pb-4">
        <p className="font-label text-xs text-on-surface-variant/60 uppercase tracking-widest">Insights</p>
        <h2 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">
          Trigger Map
        </h2>
        <p className="font-body text-sm text-on-surface-variant mt-1">
          Discover which tags correlate most with relapses.
        </p>
        <div className="absolute bottom-0 left-0 w-16 h-0.5 rounded-full bg-gradient-to-r from-primary to-tertiary" />
      </section>

      <TriggerMap triggers={triggers} topPairs={topPairs} />
    </div>
  );
}
