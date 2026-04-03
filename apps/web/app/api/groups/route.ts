export const dynamic = 'force-dynamic';
// POST /api/groups — create a group
// GET  /api/groups — list user's groups
// PATCH /api/groups — update group name/description (admin only)

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { safeError, sanitizeText, sanitizeName } from '@/lib/security';
import { randomBytes } from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = createServiceClient();

    // Get all groups the user is a member of
    const { data: memberships } = await db
      .from('group_members')
      .select('group_id, display_name, role')
      .eq('user_id', user.id);

    if (!memberships || memberships.length === 0) {
      return NextResponse.json({ groups: [] });
    }

    const groupIds = memberships.map((m) => m.group_id);

    // Fetch group details
    const { data: groups } = await db
      .from('accountability_groups')
      .select('id, name, description, invite_code, max_members, created_at')
      .in('id', groupIds);

    // Fetch member counts
    const { data: memberCounts } = await db
      .from('group_members')
      .select('group_id')
      .in('group_id', groupIds);

    // Fetch latest check-in per group
    const { data: latestCheckins } = await db
      .from('group_checkins')
      .select('group_id, created_at')
      .in('group_id', groupIds)
      .order('created_at', { ascending: false });

    const countMap: Record<string, number> = {};
    (memberCounts ?? []).forEach((m) => {
      countMap[m.group_id] = (countMap[m.group_id] || 0) + 1;
    });

    const lastCheckinMap: Record<string, string> = {};
    (latestCheckins ?? []).forEach((c) => {
      if (!lastCheckinMap[c.group_id]) lastCheckinMap[c.group_id] = c.created_at;
    });

    const roleMap: Record<string, string> = {};
    memberships.forEach((m) => { roleMap[m.group_id] = m.role; });

    const enrichedGroups = (groups ?? []).map((g) => ({
      ...g,
      member_count: countMap[g.id] || 0,
      last_checkin: lastCheckinMap[g.id] || null,
      my_role: roleMap[g.id] || 'member',
    }));

    return NextResponse.json({ groups: enrichedGroups });
  } catch (err) {
    return safeError('GET /api/groups', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const blocked = checkUserRate(actionLimiter, user.id);
    if (blocked) return blocked;

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

    const name = sanitizeName(body.name || '');
    const description = sanitizeText(body.description || '', 500);
    if (!name || name.length < 1) {
      return NextResponse.json({ error: 'Group name is required' }, { status: 400 });
    }

    const inviteCode = randomBytes(4).toString('hex'); // 8-char code

    const db = createServiceClient();

    // Create group
    const { data: group, error: groupErr } = await db
      .from('accountability_groups')
      .insert({
        name,
        description: description || null,
        created_by: user.id,
        invite_code: inviteCode,
      })
      .select('id, name, description, invite_code, max_members, created_at')
      .single();

    if (groupErr || !group) {
      return safeError('POST /api/groups', groupErr);
    }

    // Add creator as admin (Member A)
    await db.from('group_members').insert({
      group_id: group.id,
      user_id: user.id,
      display_name: 'Member A',
      role: 'admin',
    });

    return NextResponse.json({ group }, { status: 201 });
  } catch (err) {
    return safeError('POST /api/groups', err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const blocked = checkUserRate(actionLimiter, user.id);
    if (blocked) return blocked;

    const body = await req.json().catch(() => null);
    if (!body || !body.group_id) return NextResponse.json({ error: 'group_id required' }, { status: 400 });

    const db = createServiceClient();

    // Verify admin role
    const { data: membership } = await db
      .from('group_members')
      .select('role')
      .eq('group_id', body.group_id)
      .eq('user_id', user.id)
      .single();

    if (!membership || membership.role !== 'admin') {
      return NextResponse.json({ error: 'Only group admins can update settings' }, { status: 403 });
    }

    const updates: Record<string, string> = {};
    if (body.name) updates.name = sanitizeName(body.name);
    if (body.description !== undefined) updates.description = sanitizeText(body.description || '', 500);

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    const { data: updated, error: err } = await db
      .from('accountability_groups')
      .update(updates)
      .eq('id', body.group_id)
      .select('id, name, description')
      .single();

    if (err) return safeError('PATCH /api/groups', err);

    return NextResponse.json({ group: updated });
  } catch (err) {
    return safeError('PATCH /api/groups', err);
  }
}
