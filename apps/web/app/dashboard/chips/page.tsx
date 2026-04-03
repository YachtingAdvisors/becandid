import type { Metadata } from 'next';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import FocusChip from '@/components/dashboard/FocusChip';
import ChipShareButton from '@/components/dashboard/ChipShareButton';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Focus Chips',
  description: 'Collect digital sobriety chips as you hit milestones. Each one represents real courage.',
};

const MILESTONES = [1, 7, 14, 30, 60, 90, 180, 365];

const TIER_NAMES: Record<number, string> = {
  1: 'Silver',
  7: 'Bronze',
  14: 'Copper',
  30: 'Gold',
  60: 'Emerald',
  90: 'Sapphire',
  180: 'Amethyst',
  365: 'Diamond',
};

/** Map milestones table entries to day counts */
function milestoneToDays(m: string): number | null {
  const map: Record<string, number> = {
    full_days_7: 7,
    full_days_14: 14,
    full_days_30: 30,
    full_days_60: 60,
    full_days_90: 90,
    streak_7: 7,
    streak_30: 30,
    streak_90: 90,
  };
  return map[m] ?? null;
}

export default async function ChipsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const db = createServiceClient();

  const [milestonesRes, focusRes] = await Promise.all([
    db.from('milestones')
      .select('milestone, unlocked_at')
      .eq('user_id', user.id)
      .order('unlocked_at', { ascending: true }),
    db.from('focus_segments')
      .select('date, status')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(400),
  ]);

  const milestones = milestonesRes?.data ?? [];
  const focusSegments = (focusRes?.data ?? []) as { date: string; status: string }[];

  // Calculate current streak
  let currentStreak = 0;
  for (const seg of focusSegments) {
    if (seg.status === 'focused') currentStreak++;
    else break;
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  for (const seg of [...focusSegments].reverse()) {
    if (seg.status === 'focused') {
      tempStreak++;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    } else {
      tempStreak = 0;
    }
  }

  // Build achieved set: milestone day -> unlocked_at date
  const achievedMap = new Map<number, string>();

  // From milestones table
  for (const m of milestones) {
    const days = milestoneToDays(m.milestone);
    if (days) achievedMap.set(days, m.unlocked_at);
  }

  // Also mark 1-day if they have any focused segment
  if (focusSegments.some(s => s.status === 'focused') && !achievedMap.has(1)) {
    const firstFocused = [...focusSegments].reverse().find(s => s.status === 'focused');
    if (firstFocused) achievedMap.set(1, firstFocused.date);
  }

  // Mark milestones based on current streak if not in milestones table
  for (const ms of MILESTONES) {
    if (currentStreak >= ms && !achievedMap.has(ms)) {
      achievedMap.set(ms, new Date().toISOString());
    }
  }

  const achievedCount = MILESTONES.filter(m => achievedMap.has(m)).length;

  // Find next milestone
  const nextMilestone = MILESTONES.find(m => !achievedMap.has(m));
  const daysToNext = nextMilestone ? Math.max(0, nextMilestone - currentStreak) : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-8 page-enter">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="p-2 -ml-2 rounded-xl hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
        </Link>
        <div>
          <p className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-widest">Dashboard</p>
          <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">Your Focus Chips</h1>
          <p className="text-sm text-on-surface-variant font-body">
            Collect them all. Each one represents real courage.
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex gap-3">
        <div className="flex-1 bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-4 text-center shadow-sm">
          <div className="text-3xl font-headline font-black text-primary">{achievedCount}</div>
          <div className="text-[10px] font-label font-semibold text-on-surface-variant uppercase tracking-wider">Chips Earned</div>
        </div>
        <div className="flex-1 bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-4 text-center shadow-sm">
          <div className="text-3xl font-headline font-black text-on-surface">{currentStreak}</div>
          <div className="text-[10px] font-label font-semibold text-on-surface-variant uppercase tracking-wider">Current Streak</div>
        </div>
        <div className="flex-1 bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-4 text-center shadow-sm">
          <div className="text-3xl font-headline font-black text-on-surface">{longestStreak}</div>
          <div className="text-[10px] font-label font-semibold text-on-surface-variant uppercase tracking-wider">Longest Streak</div>
        </div>
      </div>

      {/* Chip Grid — premium collectible display */}
      <section>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 justify-items-center stagger">
          {MILESTONES.map((ms) => {
            const achieved = achievedMap.has(ms);
            const isNext = ms === nextMilestone;
            return (
              <div key={ms} className="flex flex-col items-center gap-2">
                <FocusChip
                  milestone={ms}
                  achieved={achieved}
                  achievedDate={achieved ? achievedMap.get(ms) : undefined}
                  variant={isNext ? 'full' : 'full'}
                  daysAway={!achieved ? Math.max(0, ms - currentStreak) : undefined}
                  isNext={isNext}
                />
                {/* Tier name under each chip */}
                <span className={`text-[10px] font-label font-bold uppercase tracking-wider ${
                  achieved ? 'text-on-surface' : 'text-on-surface-variant/30'
                }`}>
                  {TIER_NAMES[ms]}
                </span>
                {/* Share button for achieved chips */}
                {achieved && (
                  <ChipShareButton milestone={ms} tierName={TIER_NAMES[ms]} />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Progress toward next chip */}
      {nextMilestone && (
        <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
              <span className="text-sm font-headline font-bold text-on-surface">Next: {TIER_NAMES[nextMilestone]} Chip</span>
            </div>
            <span className="text-xs font-label font-semibold text-primary">{daysToNext} day{daysToNext !== 1 ? 's' : ''} away</span>
          </div>
          <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-tertiary rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, nextMilestone > 0 ? ((currentStreak / nextMilestone) * 100) : 0)}%` }}
            />
          </div>
          <p className="text-[11px] text-on-surface-variant font-body mt-2">
            {currentStreak} of {nextMilestone} days complete
          </p>
        </div>
      )}

      {/* Motivational footer */}
      <div className="bg-gradient-to-br from-primary/5 via-surface to-tertiary/5 rounded-2xl ring-1 ring-primary/10 p-6 text-center shadow-sm">
        <span className="material-symbols-outlined text-primary text-3xl mb-2 block" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
        <p className="text-sm font-body text-on-surface leading-relaxed max-w-md mx-auto">
          {achievedCount === 0
            ? 'Your first chip is waiting. One day of focus is all it takes.'
            : achievedCount === MILESTONES.length
              ? 'You did it. Every single chip. This is extraordinary.'
              : `${achievedCount} down, ${MILESTONES.length - achievedCount} to go. ${daysToNext > 0 ? `${daysToNext} day${daysToNext !== 1 ? 's' : ''} until your next chip.` : 'Keep going.'}`
          }
        </p>
      </div>
    </div>
  );
}
