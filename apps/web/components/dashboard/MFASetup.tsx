'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

type MFAState = 'loading' | 'disabled' | 'enrolling' | 'verifying' | 'enabled' | 'disabling';

export default function MFASetup() {
  const supabase = createClient();

  const [state, setState] = useState<MFAState>('loading');
  const [factorId, setFactorId] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    checkMFAStatus();
  }, []);

  async function checkMFAStatus() {
    setState('loading');
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) {
      setState('disabled');
      return;
    }
    const activeTOTP = data.totp.find(f => f.status === 'verified');
    if (activeTOTP) {
      setFactorId(activeTOTP.id);
      setState('enabled');
    } else {
      setState('disabled');
    }
  }

  async function startEnrollment() {
    setError('');
    setSuccess('');
    setState('enrolling');

    // Clean up any unverified factors first
    const { data: existing } = await supabase.auth.mfa.listFactors();
    if (existing?.totp) {
      for (const factor of existing.totp) {
        if ((factor.status as string) === 'unverified') {
          await supabase.auth.mfa.unenroll({ factorId: factor.id });
        }
      }
    }

    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
    if (error) {
      setError(error.message);
      setState('disabled');
      return;
    }

    setFactorId(data.id);
    setQrCode(data.totp.qr_code);
    setSecret(data.totp.secret);
    setState('verifying');
  }

  async function verifyEnrollment() {
    if (code.length !== 6) {
      setError('Please enter a 6-digit code.');
      return;
    }

    setError('');
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId,
    });

    if (challengeError) {
      setError(challengeError.message);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code,
    });

    if (verifyError) {
      setError('Invalid code. Please try again.');
      return;
    }

    setCode('');
    setQrCode('');
    setSecret('');
    setSuccess('Two-factor authentication has been enabled.');
    setState('enabled');
  }

  async function disableMFA() {
    if (disableCode.length !== 6) {
      setError('Please enter your current 6-digit code to disable 2FA.');
      return;
    }

    setError('');

    // Verify the code first
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId,
    });

    if (challengeError) {
      setError(challengeError.message);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: disableCode,
    });

    if (verifyError) {
      setError('Invalid code. Please enter the correct code from your authenticator app.');
      return;
    }

    const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId });
    if (unenrollError) {
      setError(unenrollError.message);
      return;
    }

    setDisableCode('');
    setFactorId('');
    setSuccess('Two-factor authentication has been disabled.');
    setState('disabled');
  }

  function cancelEnrollment() {
    // Clean up the unverified factor
    if (factorId) {
      supabase.auth.mfa.unenroll({ factorId }).catch(() => {});
    }
    setQrCode('');
    setSecret('');
    setCode('');
    setFactorId('');
    setError('');
    setState('disabled');
  }

  if (state === 'loading') {
    return (
      <section className="bg-surface-container-lowest rounded-3xl p-5 space-y-3 ring-1 ring-outline-variant/10 shadow-sm">
        <h2 className="font-headline text-lg font-bold text-on-surface">Two-Factor Authentication</h2>
        <p className="text-xs text-on-surface-variant font-body">Loading...</p>
      </section>
    );
  }

  return (
    <section className="bg-surface-container-lowest rounded-3xl p-5 space-y-4 ring-1 ring-outline-variant/10 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-container/30 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-[20px]">security</span>
          </div>
          <div>
            <h2 className="font-headline text-lg font-bold text-on-surface">Two-Factor Authentication</h2>
            <p className="text-xs text-on-surface-variant font-body">
              Add an extra layer of security to your account with a TOTP authenticator app.
            </p>
          </div>
        </div>
        {state === 'enabled' && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-label font-semibold bg-green-500/10 text-green-600 dark:text-green-400 ring-1 ring-green-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Enabled
          </span>
        )}
      </div>

      {/* Error / Success messages */}
      {error && (
        <div className="px-4 py-3 rounded-2xl bg-error/10 ring-1 ring-error/20 text-error text-sm font-body flex items-center gap-3">
          <span className="material-symbols-outlined text-[18px]">error</span>
          {error}
        </div>
      )}
      {success && (
        <div className="px-4 py-3 rounded-2xl bg-green-500/10 ring-1 ring-green-500/20 text-green-700 dark:text-green-400 text-sm font-body flex items-center gap-3">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          {success}
        </div>
      )}

      {/* Disabled state — show enable button */}
      {state === 'disabled' && (
        <button
          onClick={startEnrollment}
          className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] text-sm font-label font-medium text-white bg-primary rounded-2xl hover:brightness-110 cursor-pointer transition-all duration-200"
        >
          <span className="material-symbols-outlined text-[18px]">lock</span>
          Enable Two-Factor Authentication
        </button>
      )}

      {/* Enrollment — show QR code and verification */}
      {state === 'verifying' && (
        <div className="space-y-4">
          <div className="px-4 py-3 rounded-2xl bg-primary-container/20 ring-1 ring-primary/10 text-sm text-on-surface font-body">
            <p className="font-label font-medium mb-1">Step 1: Scan this QR code</p>
            <p className="text-xs text-on-surface-variant">
              Open your authenticator app (Google Authenticator, Authy, 1Password, etc.) and scan the code below.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrCode} alt="Scan this QR code with your authenticator app" width={200} height={200} />
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-label font-medium text-on-surface-variant">
              Or enter this secret manually:
            </p>
            <code className="block bg-surface-container rounded-xl px-4 py-3 text-sm font-mono text-on-surface select-all break-all">
              {secret}
            </code>
          </div>

          <div className="space-y-2">
            <div className="px-4 py-3 rounded-2xl bg-primary-container/20 ring-1 ring-primary/10 text-sm text-on-surface font-body">
              <p className="font-label font-medium mb-1">Step 2: Enter the verification code</p>
              <p className="text-xs text-on-surface-variant">
                Enter the 6-digit code from your authenticator app to complete setup.
              </p>
            </div>

            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '');
                setCode(val);
                setError('');
              }}
              placeholder="000000"
              autoFocus
              className="w-full bg-surface-container border-none rounded-xl py-4 px-4 text-center text-2xl font-mono tracking-[0.5em] text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={verifyEnrollment}
              disabled={code.length !== 6}
              className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] text-sm font-label font-medium text-white bg-primary rounded-2xl hover:brightness-110 cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              Verify & Enable
            </button>
            <button
              onClick={cancelEnrollment}
              className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] text-sm font-label font-medium text-on-surface-variant hover:text-on-surface rounded-2xl hover:bg-surface-container cursor-pointer transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Enabled state — option to disable */}
      {state === 'enabled' && !success && (
        <div className="space-y-3">
          <p className="text-sm text-on-surface-variant font-body">
            Your account is protected with two-factor authentication. You will be asked for a code from your authenticator app each time you sign in.
          </p>
          <div className="border-t border-outline-variant/20 pt-3 space-y-3">
            <p className="text-xs font-label font-medium text-on-surface-variant">
              Enter your current authenticator code to disable 2FA:
            </p>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={disableCode}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '');
                setDisableCode(val);
                setError('');
              }}
              placeholder="000000"
              className="w-full max-w-[200px] bg-surface-container border-none rounded-xl py-3 px-4 text-center text-lg font-mono tracking-[0.4em] text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:ring-2 focus:ring-error/30 transition-all duration-200"
            />
            <button
              onClick={disableMFA}
              disabled={disableCode.length !== 6}
              className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] text-xs font-label font-medium text-error border border-error/30 rounded-2xl hover:bg-error/5 cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[16px]">lock_open</span>
              Disable Two-Factor Authentication
            </button>
          </div>
        </div>
      )}

      {/* Just-enabled success state */}
      {state === 'enabled' && success && (
        <div className="space-y-3">
          <div className="px-4 py-3 rounded-2xl bg-amber-500/10 ring-1 ring-amber-500/20 text-sm font-body text-amber-700 dark:text-amber-400 flex items-start gap-3">
            <span className="material-symbols-outlined text-[18px] mt-0.5 shrink-0">info</span>
            <div>
              <p className="font-label font-medium mb-0.5">Save your authenticator app</p>
              <p className="text-xs">
                Make sure you have access to your authenticator app. If you lose access, you may be locked out of your account. Consider keeping a backup of your authentication method.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
