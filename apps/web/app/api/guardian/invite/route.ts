export const dynamic = 'force-dynamic';
// ============================================================
// app/api/guardian/invite/route.ts
//
// POST → Send guardian invite (email, relationship)
// PUT  → Accept invite (token)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { inviteGuardian, acceptGuardianInvite } from '@/lib/guardianControls';

const VALID_RELATIONSHIPS = ['parent', 'guardian', 'counselor', 'mentor'];

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  const body = await req.json().catch(() => null);
  if (!body?.email || !body?.relationship) {
    return NextResponse.json(
      { error: 'Missing email or relationship' },
      { status: 400 }
    );
  }

  if (!VALID_RELATIONSHIPS.includes(body.relationship)) {
    return NextResponse.json(
      { error: `Invalid relationship. Must be: ${VALID_RELATIONSHIPS.join(', ')}` },
      { status: 400 }
    );
  }

  try {
    const token = await inviteGuardian(user.id, body.email, body.relationship);
    return NextResponse.json({ ok: true, token }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  const body = await req.json().catch(() => null);
  if (!body?.token) {
    return NextResponse.json({ error: 'Missing invite token' }, { status: 400 });
  }

  try {
    await acceptGuardianInvite(body.token, user.id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
