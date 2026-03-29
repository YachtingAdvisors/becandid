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
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-container mb-4">
          <span className="text-2xl">🔒</span>
        </div>
        <h3 className="text-lg font-headline font-semibold text-on-surface mb-2">You must be 18 or older</h3>
        <p className="text-sm text-on-surface-variant leading-relaxed max-w-sm mx-auto font-body">
          Be Candid is designed for adults. We take the privacy and safety of minors seriously. If you believe this is an error,
          please contact support@becandid.io.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-5">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-container mb-3">
          <span className="text-xl">🔐</span>
        </div>
        <h3 className="text-base font-headline font-semibold text-on-surface mb-1">Age verification</h3>
        <p className="text-sm text-on-surface-variant font-body">
          Be Candid is designed for adults. Please confirm your age to continue.
        </p>
      </div>

      <div className="flex gap-2 mb-3">
        <div className="flex-1">
          <label className="block text-xs text-on-surface-variant mb-1 font-label">Month</label>
          <select value={month} onChange={(e) => setMonth(e.target.value)}
            className="w-full px-3 py-2.5 rounded-2xl border border-outline-variant text-sm bg-white font-body focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
            <option value="">MM</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{String(i + 1).padStart(2, '0')}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs text-on-surface-variant mb-1 font-label">Day</label>
          <select value={day} onChange={(e) => setDay(e.target.value)}
            className="w-full px-3 py-2.5 rounded-2xl border border-outline-variant text-sm bg-white font-body focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
            <option value="">DD</option>
            {Array.from({ length: 31 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{String(i + 1).padStart(2, '0')}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs text-on-surface-variant mb-1 font-label">Year</label>
          <input type="number" value={year} onChange={(e) => setYear(e.target.value)}
            placeholder="YYYY" min="1900" max={new Date().getFullYear()}
            className="w-full px-3 py-2.5 rounded-2xl border border-outline-variant text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" />
        </div>
      </div>

      {error && <p className="text-xs text-error mb-3 font-body">{error}</p>}

      <button onClick={verify}
        disabled={!month || !day || !year}
        className="w-full py-3 text-sm font-headline font-bold rounded-full bg-primary text-on-primary hover:opacity-90 disabled:opacity-50 transition-opacity">
        Verify Age &amp; Continue
      </button>

      <p className="text-[10px] text-on-surface-variant text-center mt-3 font-body">
        Your date of birth is used only for age verification and is not stored.
      </p>
    </div>
  );
}
