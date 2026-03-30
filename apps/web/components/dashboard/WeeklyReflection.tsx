// ============================================================
// components/dashboard/WeeklyReflection.tsx
//
// Displays the AI-generated weekly reflection on the Growth
// Journal page. Shows: narrative, themes, mood summary,
// growth moment, Stringer insight, and looking-ahead prompt.
//
// Fetches from /api/journal?weekly_reflection=true
// (add this query param handler to the journal API)
//
// Usage:
//   <Suspense fallback={<Bone className="h-48 w-full rounded-xl" />}>
//     <WeeklyReflection userId={user.id} />
//   </Suspense>
// ============================================================

import { createServiceClient } from '@/lib/supabase';
import { decrypt } from '@/lib/encryption';

export default async function WeeklyReflection({ userId }: { userId: string }) {
  const db = createServiceClient();

  // Get the most recent weekly reflection
  const { data } = await db.from('weekly_reflections')
    .select('*')
    .eq('user_id', userId)
    .order('week_start', { ascending: false })
    .limit(1)
    .single();

  if (!data) return null;

  let reflection: any;
  try {
    reflection = JSON.parse(decrypt(data.reflection, userId));
  } catch {
    return null;
  }

  const weekLabel = new Date(data.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const weekEnd = new Date(data.week_start);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekEndLabel = weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="card p-0 overflow-hidden mb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-50 to-amber-50 px-5 py-4 border-b border-violet-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-lg">auto_awesome</span>
            <div>
              <h3 className="text-sm font-semibold text-violet-900">Weekly Reflection</h3>
              <p className="text-xs text-violet-600">{weekLabel} – {weekEndLabel} · {data.entry_count} entries</p>
            </div>
          </div>
          {data.mood_avg && (
            <div className="text-right">
              <p className="text-xs text-violet-500">Avg mood</p>
              <p className="text-lg font-display font-semibold text-violet-800">{data.mood_avg.toFixed(1)}/5</p>
            </div>
          )}
        </div>
      </div>

      {/* Narrative */}
      <div className="px-5 py-4">
        <p className="text-sm text-ink leading-relaxed whitespace-pre-line">{reflection.narrative}</p>
      </div>

      {/* Themes */}
      {reflection.themes?.length > 0 && (
        <div className="px-5 pb-3">
          <p className="text-xs font-medium text-ink-muted uppercase tracking-wider mb-2">Themes this week</p>
          <div className="flex flex-wrap gap-1.5">
            {reflection.themes.map((theme: string, i: number) => (
              <span key={i} className="px-3 py-1 rounded-full text-xs bg-violet-50 text-violet-700 border border-violet-100 font-medium">
                {theme}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Growth moment */}
      {reflection.growth_moment && (
        <div className="mx-5 mb-3 p-3 rounded-lg bg-emerald-50 border border-emerald-100">
          <p className="text-xs text-emerald-600 font-medium mb-0.5">Growth moment</p>
          <p className="text-sm text-emerald-800">{reflection.growth_moment}</p>
        </div>
      )}

      {/* Stringer insight */}
      {reflection.stringer_insight && (
        <div className="mx-5 mb-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
          <p className="text-xs text-amber-600 font-medium mb-0.5">Therapeutic insight</p>
          <p className="text-sm text-amber-800 italic">{reflection.stringer_insight}</p>
        </div>
      )}

      {/* Looking ahead */}
      {reflection.looking_ahead && (
        <div className="px-5 pb-4 pt-2 border-t border-surface-border">
          <p className="text-xs text-ink-muted mb-1">Looking ahead</p>
          <p className="text-sm text-ink font-medium">{reflection.looking_ahead}</p>
        </div>
      )}
    </div>
  );
}
