// ============================================================
// components/auth/SignupConsent.tsx
//
// Required checkbox at the bottom of the signup form.
// Links to Privacy Policy and Terms of Service.
// Signup button should be disabled until this is checked.
//
// Usage in signup form:
//   const [consented, setConsented] = useState(false);
//   <SignupConsent checked={consented} onChange={setConsented} />
//   <button disabled={!consented}>Sign Up</button>
// ============================================================

'use client';

import Link from 'next/link';

interface SignupConsentProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function SignupConsent({ checked, onChange }: SignupConsentProps) {
  return (
    <label className="flex items-start gap-2.5 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 rounded border-surface-border text-brand focus:ring-brand/20 shrink-0"
      />
      <span className="text-xs text-ink-muted leading-relaxed">
        I am at least 18 years old and agree to the{' '}
        <Link href="/legal/terms" target="_blank" className="text-brand hover:underline">Terms of Service</Link>
        {' '}and{' '}
        <Link href="/legal/privacy" target="_blank" className="text-brand hover:underline">Privacy Policy</Link>.
        I understand Be Candid monitors screen activity and shares category-level alerts
        with my accountability partner as described in the Privacy Policy.
      </span>
    </label>
  );
}
