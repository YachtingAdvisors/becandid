import type { Metadata } from 'next';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import MoodHeatmap from '@/components/dashboard/MoodHeatmap';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Mood Calendar',
  description: 'See your emotional patterns at a glance.',
};

export default async function MoodCalendarPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const db = createServiceClient();

  // Fetch journal moods and check-in moods in parallel
  const [journalRes, checkInRes] = await Promise.all([
    db.from('stringer_journal')
      .select('mood, created_at')
      .eq('user_id', user.id)
      .not('mood', 'is', null)
      .order('created_at', { ascending: false }),
    db.from('check_ins')
      .select('user_mood, created_at')
      .eq('user_id', user.id)
      .not('user_mood', 'is', null)
      .order('created_at', { ascending: false }),
  ]);

  // Map check-in mood strings to numeric values
  const checkInMoodMap: Record<string, number> = {
    crisis: 1,
    struggling: 2,
    okay: 3,
    good: 4,
    great: 5,
  };

  // Group all moods by date and average
  const moodByDate = new Map<string, number[]>();

  for (const j of journalRes.data ?? []) {
    const date = new Date(j.created_at).toISOString().slice(0, 10);
    const arr = moodByDate.get(date) ?? [];
    arr.push(j.mood);
    moodByDate.set(date, arr);
  }

  for (const c of checkInRes.data ?? []) {
    const numeric = checkInMoodMap[c.user_mood as string];
    if (!numeric) continue;
    const date = new Date(c.created_at).toISOString().slice(0, 10);
    const arr = moodByDate.get(date) ?? [];
    arr.push(numeric);
    moodByDate.set(date, arr);
  }

  const moods = Array.from(moodByDate.entries()).map(([date, values]) => ({
    date,
    mood: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
  }));

  // Count journal entries per day
  const { data: allJournals } = await db.from('stringer_journal')
    .select('created_at')
    .eq('user_id', user.id);

  const journalCountByDate = new Map<string, number>();
  for (const j of allJournals ?? []) {
    const date = new Date(j.created_at).toISOString().slice(0, 10);
    journalCountByDate.set(date, (journalCountByDate.get(date) ?? 0) + 1);
  }

  const journals = Array.from(journalCountByDate.entries()).map(([date, count]) => ({
    date,
    count,
  }));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <section className="relative pb-4">
        <p className="font-label text-xs text-on-surface-variant/60 uppercase tracking-widest">Insights</p>
        <h2 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">
          Mood Calendar
        </h2>
        <p className="font-body text-sm text-on-surface-variant mt-1">
          See your emotional patterns at a glance.
        </p>
        <div className="absolute bottom-0 left-0 w-16 h-0.5 rounded-full bg-gradient-to-r from-primary to-tertiary" />
      </section>

      <MoodHeatmap moods={moods} journals={journals} />

      <div className="text-center">
        <Link
          href="/dashboard/stringer-journal"
          className="inline-flex items-center gap-2 text-sm font-label font-medium text-primary hover:underline"
        >
          <span className="material-symbols-outlined text-base">edit_note</span>
          Write a journal entry
        </Link>
      </div>
    </div>
  );
}
