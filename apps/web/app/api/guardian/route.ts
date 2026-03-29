export const dynamic = 'force-dynamic';
// ============================================================
// app/api/guardian/route.ts
//
// GET    → List guardians (for teen) or guarded teens (for guardian)
// DELETE → Revoke guardian by ID
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { getGuardians, getGuardedTeens } from '@/lib/teenMode';
import { revokeGuardian } from '@/lib/guardianControls';

export async function GET(_req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Return both perspectives
  const [guardians, guardedTeens] = await Promise.all([
    getGuardians(user.id),
    getGuardedTeens(user.id),
  ]);

  return NextResponse.json({ guardians, guardedTeens });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  const body = await req.json().catch(() => null);
  if (!body?.guardian_id) {
    return NextResponse.json({ error: 'Missing guardian_id' }, { status: 400 });
  }

  try {
    await revokeGuardian(user.id, body.guardian_id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
