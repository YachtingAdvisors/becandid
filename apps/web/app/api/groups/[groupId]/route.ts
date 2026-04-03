export const dynamic = 'force-dynamic';
// GET  /api/groups/[groupId] — group detail with members, check-ins, focus data
// POST /api/groups/[groupId] — submit a group check-in

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { safeError, sanitizeText } from '@/lib/security';
import { encrypt } from '@/lib/encryption';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = createServiceClient();

    // Verify membership
    const { data: membership } = await db
      .from('group_members')
      .select('id, display_name, role')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single();

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 });
    }

    // Fetch group, members, and recent check-ins in parallel
    const [groupRes, membersRes, checkinsRes, focusRes] = await Promise.all([
      db.from('accountability_groups')
        .select('id, name, description, invite_code, max_members, created_at')
        .eq('id', groupId)
        .single(),
      db.from('group_members')
        .select('id, display_name, role, joined_at')
        .eq('group_id', groupId)
        .order('joined_at', { ascending: true }),
      db.from('group_checkins')
        .select('id, user_id, mood, message, created_at')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })
        .limit(30),
      // Get focus segments for all group members for last 7 days
      db.from('group_members')
        .select('user_id, display_name')
        .eq('group_id', groupId),
    ]);

    if (!groupRes.data) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Build a user_id -> display_name map for anonymization
    const memberMap: Record<string, string> = {};
    (membersRes.data ?? []).forEach((m) => { memberMap[m.id] = m.display_name; });
    const userToDisplay: Record<string, string> = {};
    (focusRes.data ?? []).forEach((m) => { userToDisplay[m.user_id] = m.display_name; });

    // Anonymize check-ins (replace user_id with display_name)
    const checkins = (checkinsRes.data ?? []).map((c) => ({
      id: c.id,
      display_name: userToDisplay[c.user_id] || 'Unknown',
      mood: c.mood,
      message: c.message,
      created_at: c.created_at,
      is_mine: c.user_id === user.id,
    }));

    // Fetch focus data for anonymized board (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const memberUserIds = (focusRes.data ?? []).map((m) => m.user_id);

    const { data: focusSegments } = await db
      .from('focus_segments')
      .select('user_id, status, date')
      .in('user_id', memberUserIds)
      .gte('date', sevenDaysAgo.split('T')[0]);

    // Build anonymized focus board: { displayName: { date: status } }
    const focusBoard: Record<string, Record<string, string>> = {};
    (focusRes.data ?? []).forEach((m) => {
      focusBoard[m.display_name] = {};
    });
    (focusSegments ?? []).forEach((seg) => {
      const name = userToDisplay[seg.user_id];
      if (name && focusBoard[name]) {
        focusBoard[name][seg.date] = seg.status;
      }
    });

    return NextResponse.json({
      group: groupRes.data,
      members: membersRes.data ?? [],
      checkins,
      focus_board: focusBoard,
      my_membership: membership,
    });
  } catch (err) {
    return safeError('GET /api/groups/[groupId]', err);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const blocked = checkUserRate(actionLimiter, user.id);
    if (blocked) return blocked;

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

    const db = createServiceClient();

    // Verify membership
    const { data: membership } = await db
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single();

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 });
    }

    const mood = Number(body.mood);
    if (!mood || mood < 1 || mood > 5) {
      return NextResponse.json({ error: 'Mood must be between 1 and 5' }, { status: 400 });
    }

    // Encrypt message if provided
    let message: string | null = null;
    if (body.message && body.message.trim()) {
      const sanitized = sanitizeText(body.message, 1000);
      message = encrypt(sanitized, user.id);
    }

    const { data: checkin, error: err } = await db
      .from('group_checkins')
      .insert({
        group_id: groupId,
        user_id: user.id,
        mood,
        message,
      })
      .select('id, mood, created_at')
      .single();

    if (err) return safeError('POST /api/groups/[groupId]', err);

    return NextResponse.json({ checkin }, { status: 201 });
  } catch (err) {
    return safeError('POST /api/groups/[groupId]', err);
  }
}
