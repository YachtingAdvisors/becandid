'use client';

import { useState, useEffect } from 'react';
import { GOAL_LABELS, getCategoryEmoji, type GoalCategory } from '@be-candid/shared';

interface JournalData {
  balance: number;
  streak: { streakDays: number };
  heatmap: Array<{ date: string; morning: string; evening: string }>;
  milestones: Array<{ milestone: string; unlocked_at: string }>;
  recentActions: Array<{ action: string; points: number; note: string; created_at: string }>;
}

interface CheckInEntry {
  id: string;
  status: string;
  sent_at: string;
  user_mood: string | null;
  user_response: string | null;
  partner_mood: string | null;
  partner_response: string | null;
}

const MOOD_EMOJIS: Record<string, string> = {
  great: '🌟', good: '✅', okay: '😐', struggling: '💭', crisis: '🆘',
  confident: '💪', hopeful: '🌱', concerned: '🤔', worried: '😟',
};

export default function GrowthJournalPage() {
  const [journal, setJournal] = useState<JournalData | null>(null);
  const [checkIns, setCheckIns] = useState<CheckInEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/trust-points/stats').then(r => r.json()),
      fetch('/api/check-ins?limit=50').then(r => r.json()),
    ])
      .then(([stats, ciData]) => {
        setJournal(stats);
        setCheckIns(ciData.checkIns ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="card p-8 animate-pulse"><div className="h-40 bg-gray-100 rounded" /></div>
      </div>
    );
  }

  if (!journal) return null;

  // Compute insights
  const heatmap = journal.heatmap;
  const totalSegments = heatmap.filter(d => d.morning !== 'pending' || d.evening !== 'pending').length * 2;
  const focusedSegments = heatmap.reduce((sum, d) => {
    return sum + (d.morning === 'focused' ? 1 : 0) + (d.evening === 'focused' ? 1 : 0);
  }, 0);
  const focusRate = totalSegments > 0 ? Math.round((focusedSegments / totalSegments) * 100) : 0;

  const completedCheckIns = checkIns.filter(ci => ci.status === 'completed');
  const checkInRate = checkIns.length > 0
    ? Math.round((completedCheckIns.length / checkIns.length) * 100)
    : 0;

  // Mood trend
  const moodValues: Record<string, number> = {
    great: 5, good: 4, okay: 3, struggling: 2, crisis: 1,
  };
  const moods = completedCheckIns
    .filter(ci => ci.user_mood)
    .map(ci => ({ mood: ci.user_mood!, value: moodValues[ci.user_mood!] ?? 3, date: ci.sent_at }))
    .reverse();

  const avgMood = moods.length > 0
    ? (moods.reduce((sum, m) => sum + m.value, 0) / moods.length).toFixed(1)
    : null;

  // Morning vs evening performance
  const morningFocused = heatmap.filter(d => d.morning === 'focused').length;
  const eveningFocused = heatmap.filter(d => d.evening === 'focused').length;
  const morningTotal = heatmap.filter(d => d.morning !== 'pending').length;
  const eveningTotal = heatmap.filter(d => d.evening !== 'pending').length;

  return (
    <div className="max-w-3xl mx-auto space-y-6 stagger">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink mb-1">Growth Journal</h1>
        <p className="text-sm text-ink-muted">Your accountability story, told in data and reflections.</p>
      </div>

      {/* ── Narrative Summary ──────────────────────────────── */}
      <div className="card p-5 bg-gradient-to-br from-brand-50 to-emerald-50 border-brand-200">
        <h3 className="font-display text-sm font-semibold text-brand-700 mb-2">21-Day Summary</h3>
        <p className="text-sm text-ink leading-relaxed">
          Over the last 3 weeks, you've been focused for <strong>{focusRate}%</strong> of your tracked segments.
          {' '}Your current streak is <strong>{journal.streak.streakDays} days</strong>.
          {morningTotal > 0 && eveningTotal > 0 && (
            <> You tend to be {morningFocused / morningTotal > eveningFocused / eveningTotal
              ? 'more focused in the mornings'
              : morningFocused / morningTotal < eveningFocused / eveningTotal
                ? 'more focused in the evenings'
                : 'equally focused morning and evening'
            }.</>
          )}
          {completedCheckIns.length > 0 && (
            <> You've completed <strong>{completedCheckIns.length}</strong> check-ins
              with a <strong>{checkInRate}%</strong> completion rate.</>
          )}
          {avgMood && (
            <> Your average mood is <strong>{parseFloat(avgMood) >= 4 ? 'strong' : parseFloat(avgMood) >= 3 ? 'steady' : 'work in progress'}</strong>.</>
          )}
        </p>
      </div>

      {/* ── Key Metrics ────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card px-4 py-3 text-center">
          <div className="text-2xl font-display font-bold text-brand-600">{focusRate}%</div>
          <div className="text-xs text-ink-muted mt-0.5">Focus Rate</div>
        </div>
        <div className="card px-4 py-3 text-center">
          <div className="text-2xl font-display font-bold text-emerald-600">{journal.streak.streakDays}d</div>
          <div className="text-xs text-ink-muted mt-0.5">Current Streak</div>
        </div>
        <div className="card px-4 py-3 text-center">
          <div className="text-2xl font-display font-bold text-brand-600">{journal.balance.toLocaleString()}</div>
          <div className="text-xs text-ink-muted mt-0.5">Trust Points</div>
        </div>
        <div className="card px-4 py-3 text-center">
          <div className="text-2xl font-display font-bold text-amber-600">{journal.milestones.length}</div>
          <div className="text-xs text-ink-muted mt-0.5">Milestones</div>
        </div>
      </div>

      {/* ── Morning vs Evening ─────────────────────────────── */}
      {morningTotal > 0 && eveningTotal > 0 && (
        <div className="card p-5">
          <h3 className="font-display text-sm font-semibold text-ink mb-3">Morning vs Evening</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-ink">Morning</span>
                <span className="text-xs text-ink-muted">{Math.round((morningFocused / morningTotal) * 100)}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all"
                  style={{ width: `${(morningFocused / morningTotal) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-ink">Evening</span>
                <span className="text-xs text-ink-muted">{Math.round((eveningFocused / eveningTotal) * 100)}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all"
                  style={{ width: `${(eveningFocused / eveningTotal) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Mood Timeline ──────────────────────────────────── */}
      {moods.length > 0 && (
        <div className="card p-5">
          <h3 className="font-display text-sm font-semibold text-ink mb-3">Mood Timeline</h3>
          <div className="flex items-end gap-1 h-20">
            {moods.slice(-21).map((m, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center justify-end"
                title={`${new Date(m.date).toLocaleDateString()} — ${m.mood}`}
              >
                <div
                  className={`w-full rounded-t-sm transition-all ${
                    m.value >= 4 ? 'bg-emerald-400'
                    : m.value >= 3 ? 'bg-amber-400'
                    : 'bg-red-400'
                  }`}
                  style={{ height: `${(m.value / 5) * 100}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1 text-[9px] text-ink-muted">
            <span>Oldest</span>
            <span>Most recent</span>
          </div>
        </div>
      )}

      {/* ── Recent Reflections ─────────────────────────────── */}
      {completedCheckIns.some(ci => ci.user_response) && (
        <div className="card p-5">
          <h3 className="font-display text-sm font-semibold text-ink mb-3">Your Reflections</h3>
          <div className="space-y-3">
            {completedCheckIns
              .filter(ci => ci.user_response)
              .slice(0, 10)
              .map(ci => (
                <div key={ci.id} className="flex gap-3 items-start">
                  <span className="text-lg flex-shrink-0 mt-0.5">
                    {MOOD_EMOJIS[ci.user_mood ?? 'okay']}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-ink leading-relaxed italic">"{ci.user_response}"</p>
                    <p className="text-xs text-ink-muted mt-1">
                      {new Date(ci.sent_at).toLocaleDateString('en-US', {
                        weekday: 'short', month: 'short', day: 'numeric',
                      })}
                      {ci.partner_mood && (
                        <> · Partner felt {MOOD_EMOJIS[ci.partner_mood]} {ci.partner_mood}</>
                      )}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ── Milestones Timeline ────────────────────────────── */}
      {journal.milestones.length > 0 && (
        <div className="card p-5">
          <h3 className="font-display text-sm font-semibold text-ink mb-3">Milestone Timeline</h3>
          <div className="space-y-2">
            {journal.milestones.map(m => (
              <div key={m.milestone} className="flex items-center gap-3 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                <span className="text-ink font-medium">{m.milestone.replace(/_/g, ' ')}</span>
                <span className="text-xs text-ink-muted ml-auto">
                  {new Date(m.unlocked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
