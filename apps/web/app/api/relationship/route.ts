export const dynamic = 'force-dynamic';
// ============================================================
// app/api/relationship/route.ts
//
// GET → relationship status (level, XP, streak, activity feed)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getRelationshipStatus } from '@/lib/relationshipEngine';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  const status = await getRelationshipStatus(user.id);
  if (!status) {
    return NextResponse.json({ error: 'No active partnership', solo: true }, { status: 404 });
  }

  return NextResponse.json(status);
}
