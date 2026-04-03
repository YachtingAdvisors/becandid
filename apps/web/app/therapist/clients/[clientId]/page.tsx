'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import FamilySystemsPanel from '@/components/dashboard/FamilySystemsPanel';
import { GOAL_LABELS, getCategoryEmoji } from '@be-candid/shared';
import type { GoalCategory } from '@be-candid/shared';

type Section = 'summary' | 'journal' | 'moods' | 'streaks' | 'outcomes' | 'patterns' | 'family_systems';

const TABS: { key: Section; label: string; icon: string }[] = [
  { key: 'summary', label: 'Summary', icon: 'dashboard' },
  { key: 'journal', label: 'Journal', icon: 'edit_note' },
  { key: 'moods', label: 'Moods', icon: 'mood' },
  { key: 'streaks', label: 'Streaks', icon: 'local_fire_department' },
  { key: 'outcomes', label: 'Outcomes', icon: 'forum' },
  { key: 'patterns', label: 'Patterns', icon: 'insights' },
  { key: 'family_systems', label: 'Family Systems', icon: 'psychology' },
];

const MOOD_EMOJI = ['', '\u{1F629}', '\u{1F614}', '\u{1F610}', '\u{1F642}', '\u{1F604}'];

export default function TherapistClientDetail() {
  const params = useParams();
  const clientId = params.clientId as string;
  const [tab, setTab] = useState<Section>('summary');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientName, setClientName] = useState('');

  const fetchSection = useCallback(async (section: Section) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/therapist/portal?client_id=${clientId}&section=${section}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Failed to load');
        setData(null);
      } else {
        setData(json);
        if (json.client_name) setClientName(json.client_name);
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => { fetchSection(tab); }, [tab, fetchSection]);

  const handleAddNote = async (note: any) => {
    await fetch('/api/therapist/family-systems', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: clientId, ...note }),
    });
    fetchSection('family_systems');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/therapist/dashboard" className="btn-ghost py-1.5 px-3 text-xs">
          <span className="material-symbols-outlined text-sm">arrow_back</span> Clients
        </Link>
        <div>
          <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">
            {clientName || 'Client'}
          </h1>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-label font-semibold whitespace-nowrap transition-all ${
              tab === t.key
                ? 'bg-primary text-on-primary'
                : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading && (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-8 animate-pulse space-y-4">
          <div className="h-5 bg-surface-container-low rounded w-48" />
          <div className="h-32 bg-surface-container-low rounded" />
        </div>
      )}

      {error && (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-8 text-center">
          <span className="material-symbols-outlined text-3xl text-on-surface-variant/30 mb-2">lock</span>
          <p className="text-sm text-on-surface-variant font-body">{error}</p>
        </div>
      )}

      {!loading && !error && data && (
        <>
          {/* Summary */}
          {tab === 'summary' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {data.journal_count != null && (
                  <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant px-4 py-3 text-center">
                    <p className="text-2xl font-headline font-extrabold text-on-surface">{data.journal_count}</p>
                    <p className="text-[10px] font-label text-on-surface-variant">Total Journals</p>
                  </div>
                )}
                {data.journal_this_week != null && (
                  <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant px-4 py-3 text-center">
                    <p className="text-2xl font-headline font-extrabold text-on-surface">{data.journal_this_week}</p>
                    <p className="text-[10px] font-label text-on-surface-variant">This Week</p>
                  </div>
                )}
                {data.avg_mood_7d != null && (
                  <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant px-4 py-3 text-center">
                    <p className="text-2xl font-headline font-extrabold text-on-surface">{data.avg_mood_7d}</p>
                    <p className="text-[10px] font-label text-on-surface-variant">Avg Mood (7d)</p>
                  </div>
                )}
                {data.current_streak != null && (
                  <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant px-4 py-3 text-center">
                    <p className="text-2xl font-headline font-extrabold text-primary">{data.current_streak}</p>
                    <p className="text-[10px] font-label text-on-surface-variant">Day Streak</p>
                  </div>
                )}
                {data.conversations_completed != null && (
                  <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant px-4 py-3 text-center">
                    <p className="text-2xl font-headline font-extrabold text-on-surface">{data.conversations_completed}</p>
                    <p className="text-[10px] font-label text-on-surface-variant">Conversations</p>
                  </div>
                )}
              </div>
              {data.member_since && (
                <p className="text-xs text-on-surface-variant font-body">
                  Member since {new Date(data.member_since).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
          )}

          {/* Journal */}
          {tab === 'journal' && (
            <div className="space-y-3">
              {(data.entries || []).length === 0 && <p className="text-sm text-on-surface-variant font-body p-6 text-center">No journal entries yet.</p>}
              {(data.entries || []).map((e: any) => (
                <div key={e.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant font-label">
                    <span>{new Date(e.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    {e.mood && <span>{MOOD_EMOJI[e.mood]}</span>}
                    <span className="px-1.5 py-0.5 rounded-full bg-surface-container text-[9px] font-bold uppercase">{e.trigger_type}</span>
                    {(e.tags || []).map((t: string) => (
                      <span key={t} className="px-1.5 py-0.5 rounded-full bg-primary-container/30 text-primary text-[9px]">{t}</span>
                    ))}
                  </div>
                  {e.tributaries && <div><p className="text-[10px] font-label font-bold text-on-surface-variant uppercase">Tributaries</p><p className="text-sm font-body text-on-surface">{e.tributaries}</p></div>}
                  {e.longing && <div><p className="text-[10px] font-label font-bold text-on-surface-variant uppercase">Longing</p><p className="text-sm font-body text-on-surface">{e.longing}</p></div>}
                  {e.roadmap && <div><p className="text-[10px] font-label font-bold text-on-surface-variant uppercase">Roadmap</p><p className="text-sm font-body text-on-surface">{e.roadmap}</p></div>}
                  {e.freewrite && <div><p className="text-[10px] font-label font-bold text-on-surface-variant uppercase">Freewrite</p><p className="text-sm font-body text-on-surface">{e.freewrite}</p></div>}
                </div>
              ))}
            </div>
          )}

          {/* Moods */}
          {tab === 'moods' && (
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5">
              <h3 className="font-headline text-sm font-bold text-on-surface mb-4">Mood Timeline</h3>
              <div className="flex items-end gap-1 h-32">
                {(data.journal_moods || []).map((m: any, i: number) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                    <div
                      className="w-full max-w-[12px] rounded-sm bg-primary/60"
                      style={{ height: `${(m.mood / 5) * 100}%` }}
                      title={`${new Date(m.created_at).toLocaleDateString()} — Mood: ${m.mood}`}
                    />
                  </div>
                ))}
              </div>
              {(data.journal_moods || []).length === 0 && <p className="text-sm text-on-surface-variant text-center py-8">No mood data yet.</p>}
            </div>
          )}

          {/* Streaks */}
          {tab === 'streaks' && (
            <div className="space-y-4">
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant px-4 py-3 text-center">
                <p className="text-3xl font-headline font-extrabold text-primary">{data.total_trust_points ?? 0}</p>
                <p className="text-xs font-label text-on-surface-variant">Total Trust Points</p>
              </div>
              {(data.milestones || []).length > 0 && (
                <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5">
                  <h3 className="font-headline text-sm font-bold text-on-surface mb-3">Milestones</h3>
                  <div className="space-y-2">
                    {(data.milestones || []).map((m: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <span className="material-symbols-outlined text-tertiary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                        <span className="font-label font-medium text-on-surface">{m.type}: {m.value}</span>
                        <span className="ml-auto text-[10px] text-on-surface-variant">{new Date(m.achieved_at).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Outcomes */}
          {tab === 'outcomes' && (
            <div className="space-y-3">
              {(data.outcomes || []).length === 0 && <p className="text-sm text-on-surface-variant font-body p-6 text-center">No conversation outcomes yet.</p>}
              {(data.outcomes || []).map((o: any, i: number) => (
                <div key={i} className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-4">
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant font-label mb-2">
                    <span>{new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    {o.user_felt && <span className="px-1.5 py-0.5 rounded-full bg-primary-container/30 text-primary text-[9px]">{o.user_felt}</span>}
                    {o.partner_felt && <span className="px-1.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[9px]">{o.partner_felt}</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-lg font-headline font-bold">{o.user_rating ?? '-'}/5</p>
                      <p className="text-[10px] font-label text-on-surface-variant">User Rating</p>
                    </div>
                    <div>
                      <p className="text-lg font-headline font-bold">{o.partner_rating ?? '-'}/5</p>
                      <p className="text-[10px] font-label text-on-surface-variant">Partner Rating</p>
                    </div>
                  </div>
                  {o.ai_reflection && <p className="text-xs text-on-surface-variant font-body mt-2 italic">{o.ai_reflection}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Patterns */}
          {tab === 'patterns' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant px-4 py-3 text-center">
                  <p className="text-2xl font-headline font-extrabold text-on-surface">{data.total_events_90d ?? 0}</p>
                  <p className="text-[10px] font-label text-on-surface-variant">Events (90d)</p>
                </div>
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant px-4 py-3 text-center">
                  <p className="text-2xl font-headline font-extrabold text-on-surface">{data.recent_rate_per_day ?? 0}</p>
                  <p className="text-[10px] font-label text-on-surface-variant">Events/Day (7d)</p>
                </div>
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant px-4 py-3 text-center">
                  <p className={`text-2xl font-headline font-extrabold ${(data.frequency_spike_percent ?? 0) > 50 ? 'text-error' : 'text-on-surface'}`}>
                    {data.frequency_spike_percent != null ? `${data.frequency_spike_percent > 0 ? '+' : ''}${data.frequency_spike_percent}%` : 'N/A'}
                  </p>
                  <p className="text-[10px] font-label text-on-surface-variant">vs Baseline</p>
                </div>
              </div>

              {/* Hour distribution */}
              {data.hour_distribution && (
                <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5">
                  <h3 className="font-headline text-sm font-bold text-on-surface mb-3">Activity by Hour</h3>
                  <div className="flex items-end gap-0.5 h-24">
                    {(data.hour_distribution as number[]).map((count: number, h: number) => {
                      const max = Math.max(...data.hour_distribution, 1);
                      return (
                        <div key={h} className="flex-1 flex flex-col items-center justify-end h-full">
                          <div
                            className="w-full rounded-t-sm bg-primary/50 hover:bg-primary/80 transition-colors"
                            style={{ height: `${(count / max) * 100}%`, minHeight: count > 0 ? '2px' : '0' }}
                            title={`${h}:00 — ${count} events`}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[8px] text-on-surface-variant">12am</span>
                    <span className="text-[8px] text-on-surface-variant">6am</span>
                    <span className="text-[8px] text-on-surface-variant">12pm</span>
                    <span className="text-[8px] text-on-surface-variant">6pm</span>
                    <span className="text-[8px] text-on-surface-variant">12am</span>
                  </div>
                </div>
              )}

              {/* Category breakdown */}
              {data.category_breakdown && Object.keys(data.category_breakdown).length > 0 && (
                <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5">
                  <h3 className="font-headline text-sm font-bold text-on-surface mb-3">Category Breakdown</h3>
                  <div className="space-y-2">
                    {Object.entries(data.category_breakdown as Record<string, number>)
                      .sort(([,a], [,b]) => (b as number) - (a as number))
                      .map(([cat, count]) => {
                        const max = Math.max(...Object.values(data.category_breakdown as Record<string, number>), 1);
                        return (
                          <div key={cat} className="flex items-center gap-2">
                            <span className="text-sm w-6">{getCategoryEmoji(cat as GoalCategory)}</span>
                            <span className="text-xs font-label font-medium text-on-surface w-28 truncate">{GOAL_LABELS[cat as GoalCategory] || cat}</span>
                            <div className="flex-1 h-2 rounded-full bg-surface-container-low overflow-hidden">
                              <div className="h-full rounded-full bg-primary/60" style={{ width: `${((count as number) / max) * 100}%` }} />
                            </div>
                            <span className="text-[10px] font-label text-on-surface-variant w-6 text-right">{count as number}</span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Recent nudges */}
              {(data.nudges || []).length > 0 && (
                <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5">
                  <h3 className="font-headline text-sm font-bold text-on-surface mb-3">Recent Nudges</h3>
                  <div className="space-y-2">
                    {(data.nudges || []).map((n: any, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <span className={`material-symbols-outlined text-sm mt-0.5 ${n.severity === 'urgent' ? 'text-error' : n.severity === 'warning' ? 'text-tertiary' : 'text-on-surface-variant'}`}>
                          {n.severity === 'urgent' ? 'warning' : n.severity === 'warning' ? 'notification_important' : 'info'}
                        </span>
                        <div>
                          <p className="text-on-surface font-body">{n.message}</p>
                          <p className="text-[10px] text-on-surface-variant">{new Date(n.sent_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Family Systems */}
          {tab === 'family_systems' && data.analysis && (
            <FamilySystemsPanel
              analysis={data.analysis}
              notes={data.therapist_notes || []}
              clientName={clientName}
              onAddNote={handleAddNote}
            />
          )}
        </>
      )}
    </div>
  );
}
