'use client';

import {
  FREQUENCY_LABELS,
  FREQUENCY_DESCRIPTIONS,
  type CheckInFrequency,
} from '../../lib/checkInEngine';

interface FrequencyPickerProps {
  value: CheckInFrequency;
  onChange: (freq: CheckInFrequency) => void;
  disabled?: boolean;
}

const FREQUENCIES: CheckInFrequency[] = [
  'daily',
  'every_2_days',
  'every_3_days',
  'weekly',
  'every_2_weeks',
];

const FREQUENCY_ICONS: Record<CheckInFrequency, string> = {
  daily:         'local_fire_department',
  every_2_days:  'bolt',
  every_3_days:  'event',
  weekly:        'date_range',
  every_2_weeks: 'calendar_month',
};

export default function FrequencyPicker({ value, onChange, disabled }: FrequencyPickerProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-1.5">
        Check-in Frequency
      </label>
      <p className="text-xs text-ink-muted mb-3">
        Both you and your partner must confirm each check-in for it to count.
      </p>
      <div className="space-y-2">
        {FREQUENCIES.map((freq) => (
          <button
            key={freq}
            type="button"
            onClick={() => onChange(freq)}
            disabled={disabled}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
              value === freq
                ? 'border-brand-500 bg-brand-50'
                : 'border-surface-border hover:border-brand-200'
            } disabled:opacity-50`}
          >
            <span className="material-symbols-outlined text-xl flex-shrink-0">{FREQUENCY_ICONS[freq]}</span>
            <div className="flex-1">
              <div className="text-sm font-semibold text-ink">{FREQUENCY_LABELS[freq]}</div>
              <div className="text-xs text-ink-muted mt-0.5">{FREQUENCY_DESCRIPTIONS[freq]}</div>
            </div>
            {value === freq && (
              <div className="w-5 h-5 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
