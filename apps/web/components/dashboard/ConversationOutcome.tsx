// ============================================================
// components/dashboard/ConversationOutcome.tsx
//
// Shown at the bottom of the conversation guide page after
// the conversation happens. Both user and partner rate how
// it went. When both submit, the AI reflection appears.
//
// Usage:
//   <ConversationOutcome alertId={alert.id} role="user" />
// ============================================================

'use client';

import { useState, useEffect } from 'react';

const USER_FEELINGS = [
  { value: 'heard', emoji: 'hearing', label: 'Heard' },
  { value: 'relieved', emoji: 'sentiment_satisfied', label: 'Relieved' },
  { value: 'hopeful', emoji: 'eco', label: 'Hopeful' },
  { value: 'grateful', emoji: 'volunteer_activism', label: 'Grateful' },
  { value: 'defensive', emoji: 'shield', label: 'Defensive' },
  { value: 'ashamed', emoji: 'sentiment_dissatisfied', label: 'Ashamed' },
  { value: 'angry', emoji: 'sentiment_very_dissatisfied', label: 'Angry' },
  { value: 'numb', emoji: 'sentiment_neutral', label: 'Numb' },
];

const PARTNER_FEELINGS = [
  { value: 'helpful', emoji: 'fitness_center', label: 'Helpful' },
  { value: 'connected', emoji: 'handshake', label: 'Connected' },
  { value: 'hopeful', emoji: 'eco', label: 'Hopeful' },
  { value: 'grateful', emoji: 'volunteer_activism', label: 'Grateful' },
  { value: 'frustrated', emoji: 'sentiment_very_dissatisfied', label: 'Frustrated' },
  { value: 'worried', emoji: 'sentiment_worried', label: 'Worried' },
  { value: 'overwhelmed', emoji: 'psychology_alt', label: 'Overwhelmed' },
  { value: 'unsure', emoji: 'help', label: 'Unsure' },
];

const RATINGS = [
  { v: 1, label: 'Hard' },
  { v: 2, label: 'Tough' },
  { v: 3, label: 'Okay' },
  { v: 4, label: 'Good' },
  { v: 5, label: 'Great' },
];

export default function ConversationOutcome({
  alertId,
  role,
}: {
  alertId: string;
  role: 'user' | 'partner';
}) {
  const [existing, setExisting] = useState<any>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [felt, setFelt] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const feelings = role === 'user' ? USER_FEELINGS : PARTNER_FEELINGS;
  const myCompleted = role === 'user' ? existing?.user_completed_at : existing?.partner_completed_at;
  const otherCompleted = role === 'user' ? existing?.partner_completed_at : existing?.user_completed_at;

  useEffect(() => {
    fetch(`/api/conversation-outcomes?alert_id=${alertId}`)
      .then((r) => r.json())
      .then((d) => {
        const match = (d.outcomes || []).find((o: any) => o.alert_id === alertId);
        if (match) setExisting(match);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [alertId]);

  const submit = async () => {
    if (!rating) return;
    setSaving(true);
    try {
      const res = await fetch('/api/conversation-outcomes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alert_id: alertId, role, rating, felt, notes: notes.trim() || undefined }),
      });
      if (res.ok) {
        const data = await res.json();
        setExisting(data.outcome);
        setSaved(true);
      }
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  if (loading) return <div className="card p-5 animate-pulse"><div className="h-24 bg-gray-50 rounded-lg" /></div>;

  // Already submitted
  if (myCompleted) {
    return (
      <div className="card p-5">
        <div className="flex items-center gap-2.5 mb-3">
          <span className="material-symbols-outlined text-lg">forum</span>
          <h3 className="text-sm font-semibold text-ink">Conversation Outcome</h3>
          <span className="text-xs text-emerald-600 font-medium ml-auto flex items-center gap-0.5"><span className="material-symbols-outlined text-sm">check</span> Submitted</span>
        </div>

        <div className="flex items-center gap-4 mb-3">
          <div>
            <p className="text-xs text-ink-muted">Your rating</p>
            <p className="text-lg font-display font-semibold text-ink">{role === 'user' ? existing?.user_rating : existing?.partner_rating}/5</p>
          </div>
          {(role === 'user' ? existing?.user_felt : existing?.partner_felt) && (
            <div>
              <p className="text-xs text-ink-muted">You felt</p>
              <p className="text-sm font-medium text-ink capitalize">{role === 'user' ? existing?.user_felt : existing?.partner_felt}</p>
            </div>
          )}
        </div>

        {!otherCompleted && (
          <p className="text-xs text-ink-muted italic">Waiting for the other person to submit their rating…</p>
        )}

        {existing?.ai_reflection && (
          <div className="mt-3 p-3 rounded-lg bg-violet-50 border border-violet-100">
            <p className="text-xs text-violet-600 font-medium mb-1">AI Reflection</p>
            <p className="text-sm text-violet-800 leading-relaxed italic">{existing.ai_reflection}</p>
          </div>
        )}
      </div>
    );
  }

  // Rating form
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2.5 mb-1">
        <span className="material-symbols-outlined text-lg">forum</span>
        <h3 className="text-sm font-semibold text-ink">How did the conversation go?</h3>
      </div>
      <p className="text-xs text-ink-muted mb-4">
        {role === 'user'
          ? 'Your honest assessment helps track growth over time.'
          : 'Your perspective helps improve future conversations.'}
      </p>

      {/* Rating */}
      <div className="mb-4">
        <p className="text-xs font-medium text-ink-muted mb-2">Overall</p>
        <div className="flex gap-2">
          {RATINGS.map((r) => (
            <button key={r.v} onClick={() => setRating(r.v)}
              className={`flex-1 py-3 rounded-lg border text-center transition-all ${
                rating === r.v ? 'border-brand bg-brand/5 ring-2 ring-brand/20' : 'border-surface-border bg-white hover:bg-gray-50'
              }`}>
              <div className="text-lg font-display font-semibold text-ink">{r.v}</div>
              <div className="text-[10px] text-ink-muted">{r.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Feeling */}
      <div className="mb-4">
        <p className="text-xs font-medium text-ink-muted mb-2">How did you feel?</p>
        <div className="flex flex-wrap gap-1.5">
          {feelings.map((f) => (
            <button key={f.value} onClick={() => setFelt(felt === f.value ? null : f.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                felt === f.value ? 'bg-brand/10 text-brand border border-brand/30' : 'bg-gray-50 text-ink-muted border border-transparent hover:bg-gray-100'
              }`}>
              <span className="material-symbols-outlined text-sm">{f.emoji}</span> {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="mb-4">
        <p className="text-xs font-medium text-ink-muted mb-2">Anything else? <span className="font-normal">(optional)</span></p>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder="What stood out? What would you do differently?"
          className="w-full h-16 px-3 py-2 rounded-lg border border-surface-border bg-white text-ink text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand placeholder:text-ink-muted/50" />
      </div>

      <button onClick={submit} disabled={!rating || saving}
        className={`w-full py-2.5 text-sm font-medium rounded-lg transition-all ${
          saved ? 'bg-emerald-500 text-white' : rating ? 'bg-brand text-white hover:bg-brand-dark' : 'bg-gray-100 text-ink-muted cursor-not-allowed'
        }`}>
        {saved ? <><span className="material-symbols-outlined text-sm align-middle">check</span> Submitted +10 pts</> : saving ? 'Saving...' : 'Submit'}
      </button>
    </div>
  );
}
