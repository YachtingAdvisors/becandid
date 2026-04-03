'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const FamilySystemsPanel = dynamic(
  () => import('@/components/dashboard/FamilySystemsPanel'),
  { ssr: false, loading: () => <div className="animate-pulse bg-surface-container-low rounded-3xl h-64" /> },
);

// ── Types ──────────────────────────────────────────────────

const TABS = [
  { key: 'summary', label: 'Summary', icon: 'dashboard' },
  { key: 'journal', label: 'Journal', icon: 'book' },
  { key: 'moods', label: 'Moods', icon: 'mood' },
  { key: 'streaks', label: 'Streaks', icon: 'local_fire_department' },
  { key: 'outcomes', label: 'Outcomes', icon: 'forum' },
  { key: 'patterns', label: 'Patterns', icon: 'analytics' },
  { key: 'family_systems', label: 'Family Systems', icon: 'family_restroom' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

const MOOD_EMOJI: Record<number, string> = {
  1: '\u{1F61E}', 2: '\u{1F61F}', 3: '\u{1F610}', 4: '\u{1F642}', 5: '\u{1F60A}',
};

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ── Skeleton ───────────────────────────────────────────────

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-surface-container-low rounded-xl ${className}`} />;
}

function CardSkeleton() {
  return (
    <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 space-y-3">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
}

// ── Summary Tab ────────────────────────────────────────────

function SummarySection({ data }: { data: any }) {
  const stats = [
    { label: 'Journal Entries', value: data.journal_count ?? '\u2014', icon: 'book', sub: data.journal_this_week != null ? `${data.journal_this_week} this week` : null },
    { label: 'Avg Mood (7d)', value: data.avg_mood_7d != null ? `${data.avg_mood_7d}/5` : '\u2014', icon: 'mood', sub: null },
    { label: 'Current Streak', value: data.current_streak != null ? `${data.current_streak}d` : '\u2014', icon: 'local_fire_department', sub: null },
    { label: 'Conversations', value: data.conversations_completed ?? '\u2014', icon: 'forum', sub: null },
  ];

  return (
    <div className="space-y-4">
      {data.member_since && (
        <p className="text-xs text-on-surface-variant font-label">
          Member since {new Date(data.member_since).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      )}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary text-lg">{s.icon}</span>
              <span className="text-xs text-on-surface-variant font-label">{s.label}</span>
            </div>
            <p className="font-headline text-2xl font-extrabold text-on-surface">{s.value}</p>
            {s.sub && <p className="text-xs text-on-surface-variant mt-1">{s.sub}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Journal Tab ────────────────────────────────────────────

function JournalSection({ data }: { data: any }) {
  const entries = data.entries || [];
  if (entries.length === 0) {
    return <EmptyState icon="book" message="No journal entries yet." />;
  }
  return (
    <div className="space-y-3">
      {entries.map((e: any) => (
        <div key={e.id} className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {e.mood && <span className="text-lg">{MOOD_EMOJI[e.mood] || `${e.mood}/5`}</span>}
              <span className="text-xs text-on-surface-variant font-label">
                {new Date(e.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            {e.trigger_type && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-label font-medium bg-tertiary-container text-on-tertiary-container">
                {e.trigger_type}
              </span>
            )}
          </div>
          {e.tags && e.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {e.tags.map((tag: string) => (
                <span key={tag} className="px-2 py-0.5 rounded-full text-xs font-label bg-surface-container text-on-surface-variant">
                  {tag}
                </span>
              ))}
            </div>
          )}
          {e.freewrite && (
            <p className="text-sm text-on-surface font-body leading-relaxed line-clamp-3">{e.freewrite}</p>
          )}
          {e.tributaries && (
            <p className="text-sm text-on-surface-variant font-body mt-2 italic line-clamp-2">
              <span className="font-label font-medium text-on-surface">Tributaries:</span> {e.tributaries}
            </p>
          )}
          {e.longing && (
            <p className="text-sm text-on-surface-variant font-body mt-1 italic line-clamp-2">
              <span className="font-label font-medium text-on-surface">Longing:</span> {e.longing}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Moods Tab ──────────────────────────────────────────────

function MoodsSection({ data }: { data: any }) {
  const journalMoods = data.journal_moods || [];
  const checkinMoods = data.checkin_moods || [];
  const allMoods = [...journalMoods, ...checkinMoods]
    .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  if (allMoods.length === 0) {
    return <EmptyState icon="mood" message="No mood data recorded yet." />;
  }

  const maxMood = 5;

  return (
    <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5">
      <h3 className="font-headline font-bold text-on-surface mb-4">Mood Timeline</h3>
      <div className="flex items-end gap-1 h-32">
        {allMoods.slice(-60).map((m: any, i: number) => {
          const height = (m.mood / maxMood) * 100;
          const colors = ['bg-error', 'bg-error/70', 'bg-on-surface-variant/30', 'bg-primary/60', 'bg-primary'];
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full" title={`${new Date(m.created_at).toLocaleDateString()} \u2014 ${m.mood}/5`}>
              <div
                className={`w-full min-w-[4px] max-w-[12px] rounded-t-sm ${colors[m.mood - 1] || 'bg-outline'}`}
                style={{ height: `${height}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2 text-xs text-on-surface-variant font-label">
        <span>{new Date(allMoods[Math.max(0, allMoods.length - 60)].created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        <span>{new Date(allMoods[allMoods.length - 1].created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
      </div>
    </div>
  );
}

// ── Streaks Tab ────────────────────────────────────────────

function StreaksSection({ data }: { data: any }) {
  const segments = data.segments || [];
  const milestones = data.milestones || [];

  return (
    <div className="space-y-4">
      {data.total_trust_points != null && (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
          <div>
            <p className="font-headline font-bold text-on-surface">{data.total_trust_points.toLocaleString()} Trust Points</p>
            <p className="text-xs text-on-surface-variant font-label">Lifetime earned</p>
          </div>
        </div>
      )}

      {segments.length > 0 && (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5">
          <h3 className="font-headline font-bold text-on-surface mb-3">Recent Focus Segments</h3>
          <div className="flex flex-wrap gap-1.5">
            {segments.map((s: any, i: number) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-label font-medium ${
                  s.status === 'focused'
                    ? 'bg-primary-container text-on-primary-container'
                    : 'bg-error/10 text-error'
                }`}
                title={`${s.date} \u2014 ${s.period} \u2014 ${s.status}`}
              >
                {s.status === 'focused' ? '\u2713' : '\u2717'}
              </div>
            ))}
          </div>
        </div>
      )}

      {milestones.length > 0 && (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5">
          <h3 className="font-headline font-bold text-on-surface mb-3">Milestones</h3>
          <div className="space-y-2">
            {milestones.map((m: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                <div>
                  <p className="text-sm font-body text-on-surface font-medium">{m.type} \u2014 {m.value}</p>
                  <p className="text-xs text-on-surface-variant font-label">
                    {new Date(m.achieved_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {segments.length === 0 && milestones.length === 0 && (
        <EmptyState icon="local_fire_department" message="No streak data yet." />
      )}
    </div>
  );
}

// ── Outcomes Tab ───────────────────────────────────────────

function OutcomesSection({ data }: { data: any }) {
  const outcomes = data.outcomes || [];
  if (outcomes.length === 0) {
    return <EmptyState icon="forum" message="No conversation outcomes recorded yet." />;
  }

  const ratingLabel = (r: number | null) => {
    if (r == null) return '\u2014';
    const labels: Record<number, string> = { 1: 'Poor', 2: 'Fair', 3: 'OK', 4: 'Good', 5: 'Great' };
    return labels[r] || `${r}/5`;
  };

  return (
    <div className="space-y-3">
      {outcomes.map((o: any, i: number) => (
        <div key={i} className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-on-surface-variant font-label">
              {new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            {o.alerts?.category && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-label font-medium bg-tertiary-container text-on-tertiary-container">
                {o.alerts.category}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 mb-2">
            <div>
              <p className="text-xs text-on-surface-variant font-label">User Rating</p>
              <p className="text-sm font-body font-medium text-on-surface">{ratingLabel(o.user_rating)}</p>
              {o.user_felt && <p className="text-xs text-on-surface-variant italic">{o.user_felt}</p>}
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-label">Partner Rating</p>
              <p className="text-sm font-body font-medium text-on-surface">{ratingLabel(o.partner_rating)}</p>
              {o.partner_felt && <p className="text-xs text-on-surface-variant italic">{o.partner_felt}</p>}
            </div>
          </div>
          {o.ai_reflection && (
            <div className="mt-3 pt-3 border-t border-outline-variant/50">
              <p className="text-xs text-on-surface-variant font-label mb-1">AI Reflection</p>
              <p className="text-sm text-on-surface font-body leading-relaxed">{o.ai_reflection}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Patterns Tab ───────────────────────────────────────────

function PatternsSection({ data }: { data: any }) {
  const hourDist = data.hour_distribution || [];
  const categories = data.category_breakdown || {};
  const nudges = data.nudges || [];
  const maxHour = Math.max(...hourDist, 1);

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-4 text-center">
          <p className="text-xs text-on-surface-variant font-label">Events (90d)</p>
          <p className="font-headline text-xl font-extrabold text-on-surface">{data.total_events_90d ?? 0}</p>
        </div>
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-4 text-center">
          <p className="text-xs text-on-surface-variant font-label">Rate/Day</p>
          <p className="font-headline text-xl font-extrabold text-on-surface">{data.recent_rate_per_day ?? '\u2014'}</p>
        </div>
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-4 text-center">
          <p className="text-xs text-on-surface-variant font-label">Trend</p>
          <p className={`font-headline text-xl font-extrabold ${
            data.frequency_spike_percent != null
              ? data.frequency_spike_percent > 0 ? 'text-error' : 'text-primary'
              : 'text-on-surface-variant'
          }`}>
            {data.frequency_spike_percent != null
              ? `${data.frequency_spike_percent > 0 ? '+' : ''}${data.frequency_spike_percent}%`
              : '\u2014'}
          </p>
        </div>
      </div>

      {/* Hour distribution */}
      {hourDist.length > 0 && (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5">
          <h3 className="font-headline font-bold text-on-surface mb-3">Hour Distribution</h3>
          <div className="flex items-end gap-0.5 h-28">
            {hourDist.map((count: number, hour: number) => {
              const height = (count / maxHour) * 100;
              return (
                <div key={hour} className="flex-1 flex flex-col items-center justify-end h-full" title={`${hour}:00 \u2014 ${count} events`}>
                  <div
                    className="w-full min-w-[3px] rounded-t-sm bg-primary/70"
                    style={{ height: `${Math.max(height, count > 0 ? 4 : 0)}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-1 text-xs text-on-surface-variant font-label">
            <span>12am</span><span>6am</span><span>12pm</span><span>6pm</span><span>11pm</span>
          </div>
        </div>
      )}

      {/* Day distribution */}
      {data.day_distribution && (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5">
          <h3 className="font-headline font-bold text-on-surface mb-3">Day of Week</h3>
          <div className="space-y-1.5">
            {data.day_distribution.map((count: number, day: number) => {
              const maxDay = Math.max(...data.day_distribution, 1);
              const width = (count / maxDay) * 100;
              return (
                <div key={day} className="flex items-center gap-2">
                  <span className="text-xs text-on-surface-variant font-label w-8">{DAY_LABELS[day]}</span>
                  <div className="flex-1 h-5 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-primary/60 rounded-full transition-all" style={{ width: `${Math.max(width, count > 0 ? 4 : 0)}%` }} />
                  </div>
                  <span className="text-xs text-on-surface-variant font-label w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category breakdown */}
      {Object.keys(categories).length > 0 && (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5">
          <h3 className="font-headline font-bold text-on-surface mb-3">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(categories)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .map(([cat, count]) => (
                <span key={cat} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-label font-medium bg-primary-container text-on-primary-container">
                  {cat} <span className="text-on-primary-container/70">{count as number}</span>
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Nudges */}
      {nudges.length > 0 && (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5">
          <h3 className="font-headline font-bold text-on-surface mb-3">Recent Nudges</h3>
          <div className="space-y-2">
            {nudges.map((n: any, i: number) => (
              <div key={i} className="flex items-start gap-2 p-3 rounded-2xl bg-surface-container">
                <span className="material-symbols-outlined text-primary text-lg mt-0.5">notifications</span>
                <div className="min-w-0">
                  <p className="text-sm font-body text-on-surface">{n.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {n.category && (
                      <span className="text-xs text-on-surface-variant font-label">{n.category}</span>
                    )}
                    <span className="text-xs text-outline">&middot;</span>
                    <span className="text-xs text-on-surface-variant font-label">
                      {new Date(n.sent_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Family Systems Tab ─────────────────────────────────────

function FamilySystemsSection({ data, clientId }: { data: any; clientId: string }) {
  const handleAddNote = async (note: { dynamic?: string; note: string; note_type: string; confirmed?: boolean; parenting_style?: string }) => {
    await fetch('/api/therapist/family-systems', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: clientId, ...note }),
    });
  };

  return (
    <FamilySystemsPanel
      analysis={data.analysis}
      notes={data.therapist_notes || []}
      clientName={data.client_name || 'Client'}
      onAddNote={handleAddNote}
    />
  );
}

// ── Empty / Forbidden states ───────────────────────────────

function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-8 text-center">
      <span className="material-symbols-outlined text-on-surface-variant text-4xl mb-3 block" style={{ fontVariationSettings: "'FILL' 0" }}>
        {icon}
      </span>
      <p className="text-sm text-on-surface-variant font-body">{message}</p>
    </div>
  );
}

function ForbiddenState({ section }: { section: string }) {
  const label = section.replace(/_/g, ' ');
  return (
    <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-8 text-center">
      <span className="material-symbols-outlined text-on-surface-variant text-4xl mb-3 block" style={{ fontVariationSettings: "'FILL' 0" }}>
        lock
      </span>
      <h3 className="font-headline font-bold text-on-surface mb-1">Access Not Granted</h3>
      <p className="text-sm text-on-surface-variant font-body">
        Client hasn&apos;t granted access to the <span className="capitalize">{label}</span> section.
        They can update this from their settings.
      </p>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────

export default function TherapistClientDetailPage() {
  const params = useParams();
  const clientId = params.clientId as string;

  const [activeTab, setActiveTab] = useState<TabKey>('summary');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  // Session prep state
  const [prepReport, setPrepReport] = useState<any>(null);
  const [prepLoading, setPrepLoading] = useState(false);
  const [prepError, setPrepError] = useState<string | null>(null);
  const [prepOpen, setPrepOpen] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const fetchSection = useCallback(async (section: TabKey) => {
    setLoading(true);
    setError(null);
    setForbidden(false);
    setData(null);

    try {
      const res = await fetch(`/api/therapist/portal?client_id=${clientId}&section=${section}`);
      if (res.status === 403) {
        setForbidden(true);
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || 'Failed to load data');
        return;
      }
      const json = await res.json();
      setData(json);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  const fetchSessionPrep = useCallback(async () => {
    setPrepLoading(true);
    setPrepError(null);
    setPrepReport(null);
    setPrepOpen(true);
    try {
      const res = await fetch(`/api/therapist/session-prep?client_id=${clientId}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setPrepError(body.error || 'Failed to generate report');
        return;
      }
      const json = await res.json();
      setPrepReport(json);
    } catch {
      setPrepError('Network error. Please try again.');
    } finally {
      setPrepLoading(false);
    }
  }, [clientId]);

  const emailReport = useCallback(async () => {
    setEmailSending(true);
    try {
      const res = await fetch(`/api/therapist/session-prep?client_id=${clientId}&format=email`);
      if (res.ok) {
        setEmailSent(true);
        setTimeout(() => setEmailSent(false), 3000);
      }
    } catch { /* ignore */ }
    finally { setEmailSending(false); }
  }, [clientId]);

  useEffect(() => {
    fetchSection(activeTab);
  }, [activeTab, fetchSection]);

  const handleTabChange = (tab: TabKey) => {
    if (tab !== activeTab) setActiveTab(tab);
  };

  const clientName = data?.client_name || 'Client';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back + Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Link href="/therapist/dashboard" className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors font-label">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to clients
          </Link>
          <button
            onClick={fetchSessionPrep}
            disabled={prepLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-label font-medium bg-tertiary-container text-on-tertiary-container hover:opacity-90 transition-all cursor-pointer shadow-sm"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>clinical_notes</span>
            {prepLoading ? 'Generating...' : 'Prep for Session'}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-primary text-xl">person</span>
          </div>
          <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">
            {clientName}
          </h1>
        </div>
      </div>

      {/* Session Prep Report Modal */}
      {prepOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-scrim/40" onClick={() => setPrepOpen(false)} />
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-surface-container-lowest rounded-3xl shadow-2xl ring-1 ring-outline-variant/10 p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-xl font-bold text-on-surface">Session Prep Report</h2>
              <button onClick={() => setPrepOpen(false)} className="p-1 rounded-full hover:bg-surface-container cursor-pointer">
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>

            {prepLoading && (
              <div className="py-12 text-center space-y-3">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-on-surface-variant font-body">Generating session prep...</p>
                <p className="text-xs text-on-surface-variant/70 font-body">Analyzing 14 days of client data with AI</p>
              </div>
            )}

            {prepError && (
              <div className="py-8 text-center">
                <span className="material-symbols-outlined text-error text-3xl mb-2 block">error</span>
                <p className="text-sm text-on-surface-variant font-body">{prepError}</p>
                <button onClick={fetchSessionPrep} className="mt-3 text-sm text-primary font-label cursor-pointer hover:underline">Try again</button>
              </div>
            )}

            {prepReport && !prepLoading && (
              <>
                {/* Metadata */}
                <div className="flex flex-wrap gap-2 text-xs text-on-surface-variant font-label">
                  <span>Client: <strong className="text-on-surface">{prepReport.client_name}</strong></span>
                  <span>&middot;</span>
                  <span>{prepReport.period_days}-day window</span>
                  <span>&middot;</span>
                  <span>{prepReport.data_summary?.journal_entries ?? 0} journal entries, {prepReport.data_summary?.mood_readings ?? 0} mood readings</span>
                </div>

                {/* Overall summary */}
                {prepReport.overall_summary && (
                  <p className="text-sm text-on-surface font-body leading-relaxed">{prepReport.overall_summary}</p>
                )}

                {/* Mood trajectory */}
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-4">
                  <h3 className="text-xs font-label font-medium text-primary uppercase tracking-wider mb-2">Mood Trajectory</h3>
                  <p className="text-sm font-body text-on-surface">
                    <strong>Trend:</strong> {prepReport.mood_trajectory?.trend || 'N/A'}
                  </p>
                  {prepReport.mood_trajectory?.average != null && (
                    <p className="text-sm font-body text-on-surface-variant mt-1">Average: {prepReport.mood_trajectory.average}/5</p>
                  )}
                  {/* Mini sparkline for mood data */}
                  {prepReport.data_summary?.mood_readings > 0 && prepReport.mood_trajectory?.notable_shifts?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {prepReport.mood_trajectory.notable_shifts.map((shift: string, i: number) => (
                        <span key={i} className="text-xs font-body text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">{shift}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Journal themes as pills */}
                {prepReport.journal_themes && (
                  <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-4">
                    <h3 className="text-xs font-label font-medium text-secondary uppercase tracking-wider mb-2">Journal Themes</h3>
                    <div className="space-y-2">
                      {prepReport.journal_themes.tributaries?.length > 0 && (
                        <div>
                          <span className="text-xs font-label text-on-surface-variant">Tributaries: </span>
                          <div className="inline-flex flex-wrap gap-1 mt-0.5">
                            {prepReport.journal_themes.tributaries.map((t: string, i: number) => (
                              <span key={i} className="px-2 py-0.5 rounded-full text-xs font-label bg-primary-container/50 text-on-primary-container">{t}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {prepReport.journal_themes.longings?.length > 0 && (
                        <div>
                          <span className="text-xs font-label text-on-surface-variant">Longings: </span>
                          <div className="inline-flex flex-wrap gap-1 mt-0.5">
                            {prepReport.journal_themes.longings.map((l: string, i: number) => (
                              <span key={i} className="px-2 py-0.5 rounded-full text-xs font-label bg-tertiary-container/50 text-on-tertiary-container">{l}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {prepReport.journal_themes.recurring_tags?.length > 0 && (
                        <div>
                          <span className="text-xs font-label text-on-surface-variant">Tags: </span>
                          <div className="inline-flex flex-wrap gap-1 mt-0.5">
                            {prepReport.journal_themes.recurring_tags.map((tag: string, i: number) => (
                              <span key={i} className="px-2 py-0.5 rounded-full text-xs font-label bg-secondary-container/50 text-on-secondary-container">{tag}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Behavioral patterns */}
                {prepReport.behavioral_patterns && (
                  <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-4">
                    <h3 className="text-xs font-label font-medium text-tertiary uppercase tracking-wider mb-2">Behavioral Patterns</h3>
                    <p className="text-sm font-body text-on-surface">{prepReport.behavioral_patterns.summary}</p>
                    {prepReport.behavioral_patterns.frequency_note && (
                      <p className="text-xs font-body text-on-surface-variant mt-1">{prepReport.behavioral_patterns.frequency_note}</p>
                    )}
                  </div>
                )}

                {/* Suggested talking points */}
                {prepReport.talking_points?.length > 0 && (
                  <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-4">
                    <h3 className="text-xs font-label font-medium text-primary uppercase tracking-wider mb-2">Suggested Talking Points</h3>
                    <ol className="list-decimal list-inside space-y-1.5">
                      {prepReport.talking_points.map((point: string, i: number) => (
                        <li key={i} className="text-sm font-body text-on-surface leading-relaxed">{point}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Risk flags */}
                {prepReport.risk_flags?.length > 0 && (
                  <div className="bg-error/5 rounded-2xl border border-error/20 p-4">
                    <h3 className="text-xs font-label font-medium text-error uppercase tracking-wider mb-2">Risk Flags</h3>
                    <div className="space-y-1.5">
                      {prepReport.risk_flags.map((flag: string, i: number) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-label font-bold bg-error text-on-error shrink-0 mt-0.5">FLAG</span>
                          <p className="text-sm font-body text-on-surface">{flag}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Growth observations */}
                {prepReport.growth_observations?.length > 0 && (
                  <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-4">
                    <h3 className="text-xs font-label font-medium text-emerald-700 uppercase tracking-wider mb-2">Growth Observations</h3>
                    <ul className="space-y-1.5">
                      {prepReport.growth_observations.map((obs: string, i: number) => (
                        <li key={i} className="text-sm font-body text-on-surface leading-relaxed flex items-start gap-2">
                          <span className="text-emerald-600 shrink-0 mt-0.5">&#10003;</span>
                          {obs}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-outline-variant/50 print:hidden">
                  <button
                    onClick={emailReport}
                    disabled={emailSending}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-label font-medium bg-primary text-on-primary hover:opacity-90 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>email</span>
                    {emailSent ? 'Sent!' : emailSending ? 'Sending...' : 'Email Report'}
                  </button>
                  <button
                    onClick={() => window.open(`/therapist/session-report/${clientId}`, '_blank')}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-label font-medium ring-1 ring-outline-variant/10 text-on-surface-variant hover:bg-surface-container-low transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>picture_as_pdf</span>
                    Download PDF
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-label font-medium ring-1 ring-outline-variant/10 text-on-surface-variant hover:bg-surface-container-low transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>print</span>
                    Print
                  </button>
                  <button
                    onClick={() => setPrepOpen(false)}
                    className="ml-auto px-4 py-2.5 rounded-2xl text-sm font-label text-on-surface-variant hover:bg-surface-container-low transition-all cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Tab navigation */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-label font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.key
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        activeTab === 'summary' ? <GridSkeleton /> : (
          <div className="space-y-3">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        )
      ) : forbidden ? (
        <ForbiddenState section={activeTab} />
      ) : error ? (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-8 text-center">
          <span className="material-symbols-outlined text-error text-4xl mb-3 block">error</span>
          <h3 className="font-headline font-bold text-on-surface mb-1">Something went wrong</h3>
          <p className="text-sm text-on-surface-variant font-body">{error}</p>
          <button onClick={() => fetchSection(activeTab)} className="btn-ghost mt-4 text-sm">
            Try again
          </button>
        </div>
      ) : data ? (
        <>
          {activeTab === 'summary' && <SummarySection data={data} />}
          {activeTab === 'journal' && <JournalSection data={data} />}
          {activeTab === 'moods' && <MoodsSection data={data} />}
          {activeTab === 'streaks' && <StreaksSection data={data} />}
          {activeTab === 'outcomes' && <OutcomesSection data={data} />}
          {activeTab === 'patterns' && <PatternsSection data={data} />}
          {activeTab === 'family_systems' && <FamilySystemsSection data={data} clientId={clientId} />}
        </>
      ) : null}
    </div>
  );
}
