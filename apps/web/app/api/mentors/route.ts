export const dynamic = 'force-dynamic';
// GET   /api/mentors — list active mentors
// POST  /api/mentors — opt in as mentor (requires 90+ day streak)
// PATCH /api/mentors — update mentor profile or deactivate

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { safeError, sanitizeText, sanitizeName } from '@/lib/security';

const VALID_SPECIALTIES = [
  'pornography', 'gambling', 'social-media', 'gaming',
  'doomscrolling', 'sexting', 'general',
];

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = createServiceClient();
    const url = new URL(req.url);
    const specialty = url.searchParams.get('specialty');

    // Get active mentors
    let query = db
      .from('mentors')
      .select('id, user_id, display_name, bio, specialties, max_mentees, streak_at_signup, created_at')
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (specialty && VALID_SPECIALTIES.includes(specialty)) {
      query = query.contains('specialties', [specialty]);
    }

    const { data: mentors, error: mentorsErr } = await query;
    if (mentorsErr) return safeError('GET /api/mentors', mentorsErr);

    if (!mentors || mentors.length === 0) {
      return NextResponse.json({ mentors: [] });
    }

    // Get active connection counts per mentor
    const mentorIds = mentors.map((m) => m.id);
    const { data: connections } = await db
      .from('mentorship_connections')
      .select('mentor_id')
      .in('mentor_id', mentorIds)
      .eq('status', 'active');

    const countMap: Record<string, number> = {};
    (connections ?? []).forEach((c) => {
      countMap[c.mentor_id] = (countMap[c.mentor_id] || 0) + 1;
    });

    // Check if current user has an active connection
    const { data: myConnection } = await db
      .from('mentorship_connections')
      .select('mentor_id')
      .eq('mentee_user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    const enriched = mentors.map((m) => ({
      ...m,
      active_mentees: countMap[m.id] || 0,
      spots_open: m.max_mentees - (countMap[m.id] || 0),
      is_mine: m.user_id === user.id,
    }));

    return NextResponse.json({
      mentors: enriched,
      my_mentor_id: myConnection?.mentor_id ?? null,
    });
  } catch (err) {
    return safeError('GET /api/mentors', err);
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

    const displayName = sanitizeName(body.display_name || '');
    if (!displayName || displayName.length < 1) {
      return NextResponse.json({ error: 'Display name is required' }, { status: 400 });
    }

    const bio = sanitizeText(body.bio || '', 500);
    const specialties = (body.specialties || [])
      .filter((s: string) => VALID_SPECIALTIES.includes(s))
      .slice(0, 5);

    const db = createServiceClient();

    // Check streak requirement (90+ days)
    const { data: profile } = await db
      .from('users')
      .select('current_streak')
      .eq('id', user.id)
      .single();

    const streak = profile?.current_streak ?? 0;
    if (streak < 90) {
      return NextResponse.json(
        { error: 'You need a 90+ day streak to become a mentor.' },
        { status: 403 },
      );
    }

    // Check if already a mentor
    const { data: existing } = await db
      .from('mentors')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'You are already registered as a mentor.' }, { status: 409 });
    }

    const { data: mentor, error: insertErr } = await db
      .from('mentors')
      .insert({
        user_id: user.id,
        display_name: displayName,
        bio: bio || null,
        specialties,
        streak_at_signup: streak,
      })
      .select('id, display_name, bio, specialties, max_mentees, streak_at_signup, created_at')
      .single();

    if (insertErr || !mentor) return safeError('POST /api/mentors', insertErr);

    return NextResponse.json({ mentor }, { status: 201 });
  } catch (err) {
    return safeError('POST /api/mentors', err);
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
    if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

    const db = createServiceClient();

    // Verify this user is a mentor
    const { data: existing } = await db
      .from('mentors')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: 'Mentor profile not found' }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};
    if (body.display_name) updates.display_name = sanitizeName(body.display_name);
    if (body.bio !== undefined) updates.bio = sanitizeText(body.bio || '', 500) || null;
    if (body.specialties) {
      updates.specialties = (body.specialties as string[])
        .filter((s) => VALID_SPECIALTIES.includes(s))
        .slice(0, 5);
    }
    if (body.max_mentees !== undefined) {
      updates.max_mentees = Math.min(10, Math.max(1, Number(body.max_mentees) || 3));
    }
    if (body.active !== undefined) updates.active = !!body.active;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    const { data: updated, error: updateErr } = await db
      .from('mentors')
      .update(updates)
      .eq('id', existing.id)
      .select('id, display_name, bio, specialties, max_mentees, active, streak_at_signup')
      .single();

    if (updateErr) return safeError('PATCH /api/mentors', updateErr);

    return NextResponse.json({ mentor: updated });
  } catch (err) {
    return safeError('PATCH /api/mentors', err);
  }
}
