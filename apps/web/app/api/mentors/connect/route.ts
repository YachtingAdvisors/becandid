export const dynamic = 'force-dynamic';
// POST   /api/mentors/connect — request mentorship connection
// DELETE /api/mentors/connect — end mentorship connection

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { safeError } from '@/lib/security';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const blocked = await checkUserRate(actionLimiter, user.id);
    if (blocked) return blocked;

    const body = await req.json().catch(() => null);
    if (!body?.mentor_id) return NextResponse.json({ error: 'mentor_id required' }, { status: 400 });

    const db = createServiceClient();

    // Verify mentor exists and is active
    const { data: mentor } = await db
      .from('mentors')
      .select('id, user_id, max_mentees')
      .eq('id', body.mentor_id)
      .eq('active', true)
      .maybeSingle();

    if (!mentor) {
      return NextResponse.json({ error: 'Mentor not found or inactive' }, { status: 404 });
    }

    // Can't mentor yourself
    if (mentor.user_id === user.id) {
      return NextResponse.json({ error: 'You cannot be your own mentor' }, { status: 400 });
    }

    // Check mentee doesn't already have an active mentor
    const { data: existingConnection } = await db
      .from('mentorship_connections')
      .select('id')
      .eq('mentee_user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (existingConnection) {
      return NextResponse.json(
        { error: 'You already have an active mentor. End your current mentorship first.' },
        { status: 409 },
      );
    }

    // Check mentor has availability
    const { count } = await db
      .from('mentorship_connections')
      .select('id', { count: 'exact', head: true })
      .eq('mentor_id', body.mentor_id)
      .eq('status', 'active');

    if ((count ?? 0) >= mentor.max_mentees) {
      return NextResponse.json({ error: 'This mentor has no spots available right now.' }, { status: 409 });
    }

    const { data: connection, error: insertErr } = await db
      .from('mentorship_connections')
      .insert({
        mentor_id: body.mentor_id,
        mentee_user_id: user.id,
      })
      .select('id, mentor_id, mentee_user_id, status, started_at')
      .single();

    if (insertErr) return safeError('POST /api/mentors/connect', insertErr);

    return NextResponse.json({ connection }, { status: 201 });
  } catch (err) {
    return safeError('POST /api/mentors/connect', err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const blocked = await checkUserRate(actionLimiter, user.id);
    if (blocked) return blocked;

    const body = await req.json().catch(() => null);
    const connectionId = body?.connection_id;

    const db = createServiceClient();

    // Find the active connection for this user (as mentee or as mentor)
    let query = db
      .from('mentorship_connections')
      .select('id, mentor_id, mentee_user_id')
      .eq('status', 'active');

    if (connectionId) {
      query = query.eq('id', connectionId);
    } else {
      // End mentee's active connection by default
      query = query.eq('mentee_user_id', user.id);
    }

    const { data: connection } = await query.maybeSingle();

    if (!connection) {
      return NextResponse.json({ error: 'No active connection found' }, { status: 404 });
    }

    // Verify this user is part of the connection
    const { data: mentorRow } = await db
      .from('mentors')
      .select('user_id')
      .eq('id', connection.mentor_id)
      .single();

    const isMentee = connection.mentee_user_id === user.id;
    const isMentor = mentorRow?.user_id === user.id;

    if (!isMentee && !isMentor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await db
      .from('mentorship_connections')
      .update({ status: 'ended', ended_at: new Date().toISOString() })
      .eq('id', connection.id);

    return NextResponse.json({ ended: true });
  } catch (err) {
    return safeError('DELETE /api/mentors/connect', err);
  }
}
