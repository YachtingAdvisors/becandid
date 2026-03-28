// ============================================================
// components/auth/AgeGate.tsx
//
// COPPA compliance: users must confirm they are 18+.
// Two approaches — use whichever fits your signup flow:
//
// Option A (simpler): Checkbox confirmation
// Option B (stronger): Date of birth entry
//
// This component implements Option B for stronger compliance.
// The DOB is NOT stored — it's only used for age verification.
// ============================================================

'use client';

import { useState } from 'react';

interface AgeGateProps {
  onVerified: () => void;
  onRejected?: () => void;
}

export default function AgeGate({ onVerified, onRejected }: AgeGateProps) {
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState('');
  const [rejected, setRejected] = useState(false);

  const verify = () => {
    setError('');

    const m = parseInt(month);
    const d = parseInt(day);
    const y = parseInt(year);

    if (!m || !d || !y || m < 1 || m > 12 || d < 1 || d > 31 || y < 1900 || y > new Date().getFullYear()) {
      setError('Please enter a valid date of birth.');
      return;
    }

    const dob = new Date(y, m - 1, d);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    const isOldEnough = age > 18 || (age === 18 && (monthDiff > 0 || (monthDiff === 0 && today.getDate() >= dob.getDate())));

    if (isOldEnough) {
      onVerified();
    } else {
      setRejected(true);
      onRejected?.();
    }
  };

  if (rejected) {
    return (
      <div className="text-center py-8">
        <div className="text-3xl mb-3">🔒</div>
        <h3 className="text-lg font-display font-semibold text-ink mb-2">Be Candid requires users to be 18 or older</h3>
        <p className="text-sm text-ink-muted leading-relaxed max-w-sm mx-auto">
          We take the privacy and safety of minors seriously. If you believe this is an error,
          please contact support@becandid.io.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-ink-muted mb-4">
        Be Candid is designed for adults. Please confirm your age to continue.
      </p>

      <div className="flex gap-2 mb-3">
        <div className="flex-1">
          <label className="block text-xs text-ink-muted mb-1">Month</label>
          <select value={month} onChange={(e) => setMonth(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-surface-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand">
            <option value="">MM</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{String(i + 1).padStart(2, '0')}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs text-ink-muted mb-1">Day</label>
          <select value={day} onChange={(e) => setDay(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-surface-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand">
            <option value="">DD</option>
            {Array.from({ length: 31 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{String(i + 1).padStart(2, '0')}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs text-ink-muted mb-1">Year</label>
          <input type="number" value={year} onChange={(e) => setYear(e.target.value)}
            placeholder="YYYY" min="1900" max={new Date().getFullYear()}
            className="w-full px-3 py-2.5 rounded-lg border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
        </div>
      </div>

      {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

      <button onClick={verify}
        disabled={!month || !day || !year}
        className="w-full py-2.5 text-sm font-medium rounded-lg bg-brand text-white hover:bg-brand-dark disabled:opacity-50 transition-colors">
        Verify Age &amp; Continue
      </button>

      <p className="text-[10px] text-ink-muted text-center mt-3">
        Your date of birth is used only for age verification and is not stored.
      </p>
    </div>
  );
}
