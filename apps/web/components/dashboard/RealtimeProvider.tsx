'use client';

// ============================================================
// RealtimeProvider — Client wrapper that fetches the current
// user ID from Supabase auth and renders the RealtimeToast.
//
// Used in server-component layouts that cannot call hooks
// directly but need to enable real-time toast notifications.
// ============================================================

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import RealtimeToast from '@/components/dashboard/RealtimeToast';

export default function RealtimeProvider() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
      }
    });

    // Listen for auth changes (sign-out clears the toast)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!userId) return null;

  return <RealtimeToast userId={userId} />;
}
