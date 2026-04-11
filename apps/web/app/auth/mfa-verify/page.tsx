'use client';

import { useSearchParams } from 'next/navigation';
import MFAChallenge from '@/components/auth/MFAChallenge';
import AuthCard from '@/components/auth/AuthCard';
import { createClient } from '@/lib/supabase';

export default function MFAVerifyPage() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/dashboard';
  const supabase = createClient();

  return (
    <AuthCard>
      <MFAChallenge
        redirectTo={redirect}
        onBack={() => {
          supabase.auth.signOut().then(() => {
            window.location.href = '/auth/signin';
          });
        }}
      />
    </AuthCard>
  );
}
