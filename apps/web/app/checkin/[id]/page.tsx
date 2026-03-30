'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { isValidUUID } from '@/lib/security';

type UserMood = 'great' | 'good' | 'okay' | 'struggling' | 'crisis';
type PartnerMood = 'confident' | 'hopeful' | 'concerned' | 'worried';

const USER_MOODS: { value: UserMood; emoji: string; label: string; desc: string }[] = [
  { value: 'great',      emoji: 'star', label: 'Great',      desc: 'Feeling strong and focused' },
  { value: 'good',       emoji: 'check_circle', label: 'Good',       desc: 'Steady and on track' },
  { value: 'okay',       emoji: 'sentiment_neutral', label: 'Okay',       desc: 'Managing, but could be better' },
  { value: 'struggling', emoji: 'chat_bubble', label: 'Struggling', desc: 'Having a tough time' },
  { value: 'crisis',     emoji: 'emergency', label: 'Crisis',     desc: 'Need immediate support' },
];

const PARTNER_MOODS: { value: PartnerMood; emoji: string; label: string; desc: string }[] = [
  { value: 'confident', emoji: 'fitness_center', label: 'Confident', desc: 'They seem to be doing well' },
  { value: 'hopeful',   emoji: 'eco', label: 'Hopeful',   desc: 'Making progress, still growing' },
  { value: 'concerned', emoji: 'help', label: 'Concerned', desc: 'Something feels off' },
  { value: 'worried',   emoji: 'sentiment_worried', label: 'Worried',   desc: 'I think they need more support' },
];

interface CheckInData {
  id: string;
  prompt: string;
  status: string;
  user_id: string;
  partner_user_id: string | null;
  user_confirmed_at: string | null;
  partner_confirmed_at: string | null;
  due_at: string | null;
}

export default function CheckInResponsePage() {
  const params = useParams();
  const router = useRouter();
  const checkInId = params.id as string;

  const [checkIn, setCheckIn] = useState<CheckInData | null>(null);
  const [role, setRole] = useState<'user' | 'partner' | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [response, setResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!checkInId || !isValidUUID(checkInId)) {
      setError('Invalid check-in link');
      setLoading(false);
      return;
    }

    // Fetch check-in data and determine role
    fetch(`/api/check-ins?limit=1`)
      .then(r => r.json())
      .then(data => {
        const ci = (data.checkIns ?? []).find((c: any) => c.id === checkInId);
        if (ci) {
          setCheckIn(ci);
          // Role is determined by the API based on auth
          // For now, check if user already confirmed
          if (ci.user_confirmed_at && !ci.partner_confirmed_at) {
            setRole('partner');
          } else if (!ci.user_confirmed_at) {
            setRole('user');
          } else {
            setRole('user'); // both confirmed
          }
        } else {
          setError('Check-in not found');
        }
      })
      .catch(() => setError('Failed to load check-in'))
      .finally(() => setLoading(false));
  }, [checkInId]);

  async function handleSubmit() {
    if (!selectedMood) { setError('Select how you\'re feeling'); return; }
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/check-ins/${checkInId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: selectedMood, response: response.trim() || undefined }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to confirm');
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setError('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  const moods = role === 'partner' ? PARTNER_MOODS : USER_MOODS;
  const alreadyConfirmed = role === 'user'
    ? !!checkIn?.user_confirmed_at
    : !!checkIn?.partner_confirmed_at;

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="card p-8 animate-pulse w-80">
          <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-4" />
          <div className="h-4 bg-gray-100 rounded w-64 mx-auto" />
        </div>
      </div>
    );
  }

  if (error && !checkIn) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="card p-8 text-center max-w-sm">
          <span className="material-symbols-outlined text-4xl mb-4">sentiment_dissatisfied</span>
          <h2 className="font-display text-xl font-semibold text-ink mb-2">Something's Wrong</h2>
          <p className="text-sm text-ink-muted mb-6">{error}</p>
          <a href="/auth/signin" className="btn-primary">Sign In</a>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="card p-10 text-center max-w-sm stagger">
          <div className="text-5xl mb-4">
            {selectedMood === 'crisis' || selectedMood === 'struggling' ? <span className="material-symbols-outlined text-blue-400">favorite</span> : <span className="material-symbols-outlined text-emerald-500">check_circle</span>}
          </div>
          <h2 className="font-display text-2xl font-semibold text-ink mb-3">
            {selectedMood === 'crisis' ? 'Thanks for being honest.'
              : selectedMood === 'struggling' ? 'That takes courage.'
              : 'Checked in.'}
          </h2>
          <p className="text-sm text-ink-muted mb-8 leading-relaxed">
            {selectedMood === 'crisis'
              ? "Reach out to someone you trust today — you don't have to carry this alone."
              : selectedMood === 'struggling'
                ? "Acknowledging it is the first step. We'll keep showing up for you."
                : "Every check-in is a small act of honesty. Keep going."}
          </p>
          <button onClick={() => router.push('/dashboard')} className="btn-primary">
            Go to Dashboard →
          </button>
        </div>
      </div>
    );
  }

  if (alreadyConfirmed) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="card p-10 text-center max-w-sm">
          <span className="material-symbols-outlined text-5xl mb-4 text-emerald-500">check_circle</span>
          <h2 className="font-display text-xl font-semibold text-ink mb-3">Already Confirmed</h2>
          <p className="text-sm text-ink-muted mb-6">
            {checkIn?.status === 'completed'
              ? 'Both sides have confirmed — this check-in is complete!'
              : 'You\'ve already confirmed. Waiting for the other person.'}
          </p>
          <button onClick={() => router.push('/dashboard')} className="btn-primary">Dashboard →</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 stagger">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl font-bold">C</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-ink mb-2">Check-in Time</h1>
          {checkIn?.prompt && (
            <p className="text-sm text-ink-muted leading-relaxed">{checkIn.prompt}</p>
          )}
        </div>

        {/* Mood picker */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-ink mb-3">
            {role === 'partner' ? 'How do you feel about their progress?' : 'How are you feeling?'}
          </h3>
          <div className="space-y-2">
            {moods.map(m => (
              <button
                key={m.value}
                onClick={() => setSelectedMood(m.value)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                  selectedMood === m.value
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-surface-border hover:border-brand-200'
                }`}
              >
                <span className="material-symbols-outlined text-2xl">{m.emoji}</span>
                <div>
                  <div className="text-sm font-semibold text-ink">{m.label}</div>
                  <div className="text-xs text-ink-muted">{m.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Optional response */}
        <div className="card p-5">
          <label className="block text-sm font-medium text-ink mb-2">
            Anything you want to share? <span className="text-ink-muted">(optional)</span>
          </label>
          <textarea
            value={response}
            onChange={e => setResponse(e.target.value)}
            rows={3}
            placeholder="Speak freely…"
            className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting || !selectedMood}
          className="btn-primary w-full justify-center py-3.5 disabled:opacity-50"
        >
          {submitting ? 'Confirming…' : 'Confirm Check-in'}
        </button>

        {checkIn?.due_at && (
          <p className="text-center text-xs text-ink-muted">
            Due by {new Date(checkIn.due_at).toLocaleString('en-US', {
              weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
            })}
          </p>
        )}
      </div>
    </div>
  );
}
