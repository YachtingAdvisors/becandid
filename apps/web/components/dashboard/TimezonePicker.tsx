'use client';

import { useState } from 'react';

// Common US + international timezones, sorted by offset
const TIMEZONES = [
  { value: 'Pacific/Honolulu',    label: 'Hawaii (HST)',          offset: -10 },
  { value: 'America/Anchorage',   label: 'Alaska (AKST)',         offset: -9 },
  { value: 'America/Los_Angeles', label: 'Pacific (PST)',         offset: -8 },
  { value: 'America/Denver',      label: 'Mountain (MST)',        offset: -7 },
  { value: 'America/Phoenix',     label: 'Arizona (MST)',         offset: -7 },
  { value: 'America/Chicago',     label: 'Central (CST)',         offset: -6 },
  { value: 'America/New_York',    label: 'Eastern (EST)',         offset: -5 },
  { value: 'America/Puerto_Rico', label: 'Atlantic (AST)',        offset: -4 },
  { value: 'America/Sao_Paulo',   label: 'Brasília (BRT)',        offset: -3 },
  { value: 'Europe/London',       label: 'London (GMT)',          offset: 0 },
  { value: 'Europe/Paris',        label: 'Central Europe (CET)',  offset: 1 },
  { value: 'Europe/Athens',       label: 'Eastern Europe (EET)',  offset: 2 },
  { value: 'Asia/Dubai',          label: 'Dubai (GST)',           offset: 4 },
  { value: 'Asia/Kolkata',        label: 'India (IST)',           offset: 5.5 },
  { value: 'Asia/Singapore',      label: 'Singapore (SGT)',       offset: 8 },
  { value: 'Asia/Tokyo',          label: 'Japan (JST)',           offset: 9 },
  { value: 'Australia/Sydney',    label: 'Sydney (AEST)',         offset: 10 },
  { value: 'Pacific/Auckland',    label: 'New Zealand (NZST)',    offset: 12 },
];

interface TimezonePickerProps {
  value: string;
  onChange: (tz: string) => void;
  disabled?: boolean;
}

export default function TimezonePicker({ value, onChange, disabled }: TimezonePickerProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-on-surface mb-1.5">
        Your Timezone
      </label>
      <p className="text-xs text-on-surface-variant mb-2">
        This determines when your morning (5 AM–5 PM) and evening (5 PM–5 AM) focus segments start.
      </p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2.5 rounded-xl border border-outline-variant bg-white text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors disabled:opacity-50"
      >
        {TIMEZONES.map((tz) => (
          <option key={tz.value} value={tz.value}>
            {tz.label}
          </option>
        ))}
      </select>
    </div>
  );
}
