export const dynamic = 'force-dynamic';
// POST /api/groups/join — join a group via invite code

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { safeError } from '@/lib/security';

const DISPLAY_NAMES = ['Member A', 'Member B', 'Member C', 'Member D', 'Member E'];

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const blocked = await checkUserRate(actionLimiter, user.id);
    if (blocked) return blocked;

    const body = await req.json().catch(() => null);
    if (!body || !body.invite_code) {
      return NextResponse.json({ error: 'Invite code is required' }, { status: 400 });
    }

    const code = String(body.invite_code).trim().toLowerCase();
    const db = createServiceClient();

    // Find group by invite code
    const { data: group } = await db
      .from('accountability_groups')
      .select('id, name, max_members')
      .eq('invite_code', code)
      .single();

    if (!group) {
      return NextResponse.json({ error: 'Invalid invite code. Please check and try again.' }, { status: 404 });
    }

    // Check if already a member
    const { data: existing } = await db
      .from('group_members')
      .select('id')
      .eq('group_id', group.id)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'You are already a member of this group', group_id: group.id }, { status: 409 });
    }

    // Check member count
    const { count } = await db
      .from('group_members')
      .select('id', { count: 'exact', head: true })
      .eq('group_id', group.id);

    if ((count ?? 0) >= group.max_members) {
      return NextResponse.json({ error: 'This group is full' }, { status: 400 });
    }

    // Get existing display names to pick next available
    const { data: members } = await db
      .from('group_members')
      .select('display_name')
      .eq('group_id', group.id);

    const usedNames = new Set((members ?? []).map((m) => m.display_name));
    const displayName = DISPLAY_NAMES.find((n) => !usedNames.has(n)) || `Member ${(count ?? 0) + 1}`;

    // Join group
    const { error: joinErr } = await db
      .from('group_members')
      .insert({
        group_id: group.id,
        user_id: user.id,
        display_name: displayName,
        role: 'member',
      });

    if (joinErr) return safeError('POST /api/groups/join', joinErr);

    return NextResponse.json({
      group_id: group.id,
      group_name: group.name,
      display_name: displayName,
    });
  } catch (err) {
    return safeError('POST /api/groups/join', err);
  }
}
