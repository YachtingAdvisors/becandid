'use client';

import { useState } from 'react';

interface AgeGateProps {
  onVerified: () => void;
  onRejected?: () => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function AgeGate({ onVerified, onRejected }: AgeGateProps) {
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState('');
  const [rejected, setRejected] = useState(false);

  const currentYear = new Date().getFullYear();

  const verify = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const m = parseInt(month);
    const d = parseInt(day);
    const y = parseInt(year);

    if (!m || !d || !y || m < 1 || m > 12 || d < 1 || d > 31 || y < 1900 || y > currentYear) {
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
        <div className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-surface-container-low">
          <span className="material-symbols-outlined text-error text-3xl">lock</span>
        </div>
        <h3 className="text-lg font-headline font-bold text-on-surface mb-2">You must be 18 or older</h3>
        <p className="text-sm text-on-surface-variant leading-relaxed max-w-sm mx-auto font-body">
          Be Candid is designed for adults. We take the privacy and safety of minors seriously. If you believe this is an error,
          please contact support@becandid.io.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Branding / Identity */}
      <div className="mb-10 text-center md:text-left">
        <div className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-surface-container-low">
          <span className="material-symbols-outlined text-primary text-3xl">verified_user</span>
        </div>
        <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface mb-4">
          Prioritizing your <span className="text-primary italic">well-being.</span>
        </h1>
        <p className="font-body text-on-surface-variant text-lg leading-relaxed max-w-md">
          To maintain a safe and supportive space for everyone, please confirm your date of birth. This information is used solely for age verification.
        </p>
      </div>

      {/* Verification Form */}
      <form onSubmit={verify} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Month */}
          <div className="flex flex-col gap-2">
            <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant ml-1">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full bg-surface-container-low border-none rounded-xl py-4 px-4 font-body text-on-surface focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
            >
              <option value="">Select Month</option>
              {MONTHS.map((name, i) => (
                <option key={i + 1} value={i + 1}>{name}</option>
              ))}
            </select>
          </div>

          {/* Day */}
          <div className="flex flex-col gap-2">
            <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant ml-1">Day</label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="w-full bg-surface-container-low border-none rounded-xl py-4 px-4 font-body text-on-surface focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
            >
              <option value="">Day</option>
              {Array.from({ length: 31 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div className="flex flex-col gap-2">
            <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant ml-1">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full bg-surface-container-low border-none rounded-xl py-4 px-4 font-body text-on-surface focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
            >
              <option value="">Year</option>
              {Array.from({ length: currentYear - 1920 + 1 }, (_, i) => {
                const y = currentYear - i;
                return <option key={y} value={y}>{y}</option>;
              })}
            </select>
          </div>
        </div>

        {error && (
          <p className="text-sm text-error font-body">{error}</p>
        )}

        {/* Primary CTA */}
        <button
          type="submit"
          disabled={!month || !day || !year}
          className="w-full bg-primary hover:bg-primary-dim text-on-primary font-headline font-bold py-5 px-8 rounded-full transition-all duration-200 shadow-lg shadow-primary/10 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-background"
        >
          Verify Age &amp; Continue
          <span className="material-symbols-outlined text-xl">arrow_forward</span>
        </button>

        {/* Supportive Note */}
        <div className="bg-tertiary-container/10 p-4 rounded-2xl flex items-start gap-3">
          <span className="material-symbols-outlined text-tertiary mt-0.5">info</span>
          <p className="font-body text-xs text-on-tertiary-container leading-relaxed">
            We don&apos;t store your birthday on your public profile. This is just to ensure you&apos;re entering the right community for your age group.
          </p>
        </div>
      </form>

      {/* Bottom tagline */}
      <div className="mt-8 text-center opacity-60">
        <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
          Your journey starts with a safe step.
        </p>
      </div>
    </div>
  );
}
