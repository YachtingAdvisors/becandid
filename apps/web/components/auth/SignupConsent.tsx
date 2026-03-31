'use client';

import Link from 'next/link';

interface SignupConsentProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function SignupConsent({ checked, onChange }: SignupConsentProps) {
  return (
    <label className="flex items-start gap-3 cursor-pointer select-none group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 rounded border-outline-variant text-primary focus:ring-2 focus:ring-primary/20 shrink-0 accent-primary cursor-pointer transition-all duration-200"
      />
      <span className="text-xs text-on-surface-variant leading-relaxed font-body group-hover:text-on-surface transition-colors duration-200">
        I am at least 18 years old and agree to the{' '}
        <Link href="/legal/terms" target="_blank" className="text-primary hover:underline font-medium transition-colors duration-200">Terms of Service</Link>
        {' '}and{' '}
        <Link href="/legal/privacy" target="_blank" className="text-primary hover:underline font-medium transition-colors duration-200">Privacy Policy</Link>.
        I understand Be Candid monitors screen activity and shares category-level alerts
        with my accountability partner as described in the Privacy Policy.
      </span>
    </label>
  );
}
