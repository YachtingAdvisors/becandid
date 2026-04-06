export const dynamic = 'force-dynamic';
// ============================================================
// app/api/momentum/route.ts
//
// GET → returns the authenticated user's Momentum Score
// ============================================================

import { NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { calculateMomentumScore } from '@/lib/momentumScore';

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = createServiceClient();

  try {
    const result = await calculateMomentumScore(db, user.id);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to calculate momentum score';
    console.error('[momentum] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
