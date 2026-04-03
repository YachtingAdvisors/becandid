import { createServerSupabaseClient, createServiceClient, ensureUserRow } from '@/lib/supabase';
import { decrypt } from '@/lib/encryption';
import Link from 'next/link';

export default async function WeeklyReflectionsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const db = createServiceClient();
  const profile = await ensureUserRow(db, user);

  const { data: reflections } = await db.from('weekly_reflections')
    .select('id, week_start, reflection, mood_avg, entry_count, created_at')
    .eq('user_id', user.id)
    .order('week_start', { ascending: false })
    .limit(20);

  const decrypted = (reflections || []).map((r: any) => {
    let parsed = null;
    try { parsed = JSON.parse(decrypt(r.reflection, user.id)); } catch {}
    return { ...r, reflection: parsed };
  });

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <section className="relative pb-4">
        <p className="font-label text-xs text-on-surface-variant/60 uppercase tracking-widest">Growth Over Time</p>
        <h2 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">
          Weekly Reflections
        </h2>
        <p className="font-body text-sm text-on-surface-variant mt-1">
          Each week, your journal entries are woven into a narrative — connecting dots you might miss in the moment.
        </p>
        <div className="absolute bottom-0 left-0 w-16 h-0.5 rounded-full bg-gradient-to-r from-primary to-tertiary" />
      </section>

      {decrypted.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-3">auto_stories</span>
          <h3 className="font-headline text-lg font-bold text-on-surface mb-2">No reflections yet</h3>
          <p className="text-sm text-on-surface-variant font-body max-w-md mx-auto">
            Write at least 2 journal entries this week and you&apos;ll receive your first weekly reflection next Monday.
            The more you journal, the richer your reflections become.
          </p>
          <Link href="/dashboard/stringer-journal" className="btn-primary mt-4 inline-flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">edit_note</span>
            Start Journaling
          </Link>
        </div>
      ) : (
        <div className="space-y-6 stagger">
          {decrypted.map((r: any) => {
            const ref = r.reflection;
            if (!ref) return null;
            const weekEnd = new Date(r.week_start);
            weekEnd.setDate(weekEnd.getDate() + 6);

            return (
              <article key={r.id} className="bg-surface-container-lowest rounded-3xl border border-outline-variant overflow-hidden">
                {/* Header bar */}
                <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-outline-variant/20">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">date_range</span>
                    <span className="text-xs font-label font-bold text-on-surface">
                      {new Date(r.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {r.entry_count && (
                      <span className="text-[10px] font-label text-on-surface-variant">{r.entry_count} entries</span>
                    )}
                    {r.mood_avg && (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-label font-semibold bg-primary-container text-primary">
                        Mood {r.mood_avg.toFixed(1)}/5
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Narrative */}
                  <p className="text-sm text-on-surface font-body leading-relaxed whitespace-pre-line">{ref.narrative}</p>

                  {/* Themes */}
                  {ref.themes?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {ref.themes.map((t: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 rounded-full text-[10px] font-label font-semibold bg-surface-container text-on-surface-variant">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Highlights grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ref.growth_moment && (
                      <div className="px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                        <p className="text-[10px] font-label font-bold text-emerald-700 uppercase tracking-wider mb-1">Growth Moment</p>
                        <p className="text-xs text-emerald-800 font-body leading-relaxed">{ref.growth_moment}</p>
                      </div>
                    )}
                    {ref.stringer_insight && (
                      <div className="px-4 py-3 rounded-2xl bg-primary-container/20 border border-primary/10">
                        <p className="text-[10px] font-label font-bold text-primary uppercase tracking-wider mb-1">Worth Noticing</p>
                        <p className="text-xs text-on-primary-container font-body leading-relaxed">{ref.stringer_insight}</p>
                      </div>
                    )}
                  </div>

                  {/* Looking ahead */}
                  {ref.looking_ahead && (
                    <div className="pt-3 border-t border-outline-variant/20">
                      <p className="text-xs text-on-surface-variant font-body italic">{ref.looking_ahead}</p>
                    </div>
                  )}

                  {/* Mood summary */}
                  {ref.mood_summary && (
                    <p className="text-[10px] text-on-surface-variant/60 font-label">{ref.mood_summary}</p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
