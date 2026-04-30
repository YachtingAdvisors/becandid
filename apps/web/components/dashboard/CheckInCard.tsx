'use client';

import { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────

type CheckInStatus = 'pending' | 'partial' | 'completed' | 'expired';
type UserMood = 'great' | 'good' | 'okay' | 'struggling' | 'crisis';
type PartnerMood = 'confident' | 'hopeful' | 'concerned' | 'worried';

interface CheckIn {
  id: string;
  prompt: string;
  status: CheckInStatus;
  sent_at: string;
  due_at: string | null;
  user_confirmed_at: string | null;
  user_mood: UserMood | null;
  partner_confirmed_at: string | null;
  partner_mood: PartnerMood | null;
}

interface CheckInCardProps {
  checkIn: CheckIn;
  role: 'user' | 'partner';
  partnerName?: string;
  onConfirmed?: (status: CheckInStatus, milestones: string[]) => void;
}

// ─── Mood Options ─────────────────────────────────────────────

const USER_MOODS: { value: UserMood; emoji: string; label: string }[] = [
  { value: 'great',      emoji: 'star', label: 'Great' },
  { value: 'good',       emoji: 'check_circle', label: 'Good' },
  { value: 'okay',       emoji: 'sentiment_neutral', label: 'Okay' },
  { value: 'struggling', emoji: 'chat_bubble', label: 'Struggling' },
  { value: 'crisis',     emoji: 'emergency', label: 'Crisis' },
];

const PARTNER_MOODS: { value: PartnerMood; emoji: string; label: string }[] = [
  { value: 'confident', emoji: 'fitness_center', label: 'Confident' },
  { value: 'hopeful',   emoji: 'eco', label: 'Hopeful' },
  { value: 'concerned', emoji: 'help', label: 'Concerned' },
  { value: 'worried',   emoji: 'sentiment_worried', label: 'Worried' },
];

const STATUS_CONFIG = {
  pending:   { label: 'Waiting for both',     bg: 'bg-surface-container-low',    border: 'border-outline-variant',   dot: 'bg-gray-400' },
  partial:   { label: 'Waiting for one more', bg: 'bg-amber-50',   border: 'border-amber-200',  dot: 'bg-amber-400' },
  completed: { label: 'Completed',            bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  expired:   { label: 'Expired',              bg: 'bg-red-50',     border: 'border-red-200',    dot: 'bg-red-400' },
};

// ─── Helpers ──────────────────────────────────────────────────

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function timeUntil(ts: string): string {
  const diff = new Date(ts).getTime() - Date.now();
  if (diff <= 0) return 'expired';
  const hrs = Math.floor(diff / (1000 * 60 * 60));
  if (hrs < 1) return `${Math.floor(diff / 60000)}m left`;
  if (hrs < 24) return `${hrs}h left`;
  return `${Math.floor(hrs / 24)}d left`;
}

// ─── Component ────────────────────────────────────────────────

export default function CheckInCard({ checkIn, role, partnerName, onConfirmed }: CheckInCardProps) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const config = STATUS_CONFIG[checkIn.status];
  const moods = role === 'user' ? USER_MOODS : PARTNER_MOODS;

  // Has this person already confirmed?
  const alreadyConfirmed = role === 'user'
    ? !!checkIn.user_confirmed_at
    : !!checkIn.partner_confirmed_at;

  // Can this person still confirm?
  const canConfirm = !alreadyConfirmed
    && checkIn.status !== 'completed'
    && checkIn.status !== 'expired';

  // Who's confirmed so far?
  const userDone = !!checkIn.user_confirmed_at;
  const partnerDone = !!checkIn.partner_confirmed_at;

  async function handleConfirm() {
    if (!selectedMood) { setError('Select how you\'re feeling'); return; }
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/check-ins/${checkIn.id}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: selectedMood, response: response.trim() || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Failed to confirm');
        return;
      }

      onConfirmed?.(data.status, data.milestonesUnlocked ?? []);
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`card ${config.bg} ${config.border} border overflow-hidden`}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${config.dot}`} />
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
            {config.label}
          </span>
        </div>
        <div className="text-xs text-on-surface-variant">
          {timeAgo(checkIn.sent_at)}
          {checkIn.due_at && checkIn.status !== 'completed' && checkIn.status !== 'expired' && (
            <> · <span className="font-medium">{timeUntil(checkIn.due_at)}</span></>
          )}
        </div>
      </div>

      {/* Prompt */}
      <div className="px-4 pb-3">
        <p className="text-sm text-on-surface leading-relaxed">{checkIn.prompt}</p>
      </div>

      {/* Dual confirmation progress */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-3">
          {/* User indicator */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            userDone
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-surface-container-low text-gray-500'
          }`}>
            {userDone ? <span className="material-symbols-outlined text-sm">check</span> : <span className="material-symbols-outlined text-sm">radio_button_unchecked</span>} You{role === 'partner' ? 'r partner' : ''}
            {userDone && checkIn.user_mood && (
              <span className="ml-0.5">
                {USER_MOODS.find(m => m.value === checkIn.user_mood)?.emoji}
              </span>
            )}
          </div>

          {/* Connection line */}
          <div className={`flex-1 h-0.5 rounded-full ${
            userDone && partnerDone ? 'bg-emerald-400' : 'bg-surface-container'
          }`} />

          {/* Partner indicator */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            partnerDone
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-surface-container-low text-gray-500'
          }`}>
            {partnerDone ? <span className="material-symbols-outlined text-sm">check</span> : <span className="material-symbols-outlined text-sm">radio_button_unchecked</span>} {role === 'user' ? (partnerName ?? 'Partner') : 'You'}
            {partnerDone && checkIn.partner_mood && (
              <span className="ml-0.5">
                {PARTNER_MOODS.find(m => m.value === checkIn.partner_mood)?.emoji}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation form */}
      {canConfirm && (
        <div className="px-4 pb-4 pt-2 border-t border-outline-variant/50">
          <div className="text-xs font-medium text-on-surface mb-2">
            {role === 'user' ? 'How are you feeling?' : `How do you feel about ${partnerName ?? 'their'} progress?`}
          </div>

          {/* Mood selector */}
          <div className="flex gap-2 mb-3">
            {moods.map((m) => (
              <button
                key={m.value}
                onClick={() => setSelectedMood(m.value)}
                className={`flex-1 flex flex-col items-center gap-1 px-2 py-2 rounded-xl border-2 transition-all text-center ${
                  selectedMood === m.value
                    ? 'border-primary bg-primary-container/30'
                    : 'border-transparent bg-white hover:border-primary/20'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{m.emoji}</span>
                <span className="text-[10px] font-medium text-on-surface-variant">{m.label}</span>
              </button>
            ))}
          </div>

          {/* Optional message */}
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Anything you want to share? (optional)"
            rows={2}
            className="w-full px-3 py-2 rounded-xl border border-outline-variant text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 mb-3"
          />

          {error && (
            <div className="text-xs text-red-600 mb-2">{error}</div>
          )}

          <button
            onClick={handleConfirm}
            disabled={loading || !selectedMood}
            className="w-full py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary transition-colors motion-reduce:transition-none disabled:opacity-50"
          >
            {loading ? 'Confirming…' : 'Confirm Check-in'}
          </button>
        </div>
      )}

      {/* Already confirmed message */}
      {alreadyConfirmed && checkIn.status !== 'completed' && (
        <div className="px-4 pb-3 pt-2 border-t border-outline-variant/50">
          <p className="text-xs text-on-surface-variant text-center">
            <span className="material-symbols-outlined text-sm align-middle">check</span> You've confirmed. Waiting for {role === 'user' ? (partnerName ?? 'your partner') : 'them'} to complete their side.
          </p>
        </div>
      )}

      {/* Completed message */}
      {checkIn.status === 'completed' && (
        <div className="px-4 pb-3 pt-2 border-t border-emerald-200/50">
          <p className="text-xs text-emerald-700 text-center font-medium">
            <span className="material-symbols-outlined text-sm align-middle">check</span> Both confirmed — check-in complete! +5 reputation points each
          </p>
        </div>
      )}

      {/* Expired */}
      {checkIn.status === 'expired' && (
        <div className="px-4 pb-3 pt-2 border-t border-red-200/50">
          <p className="text-xs text-red-600 text-center">
            This check-in expired before both parties confirmed.
          </p>
        </div>
      )}
    </div>
  );
}
