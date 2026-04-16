export const dynamic = 'force-dynamic';
// POST /api/check-ins/create — manually trigger a check-in for the current user

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { calculateDueDate, type CheckInFrequency } from '@/lib/checkInEngine';
import { generateContextualPrompt } from '@/lib/checkInPrompts';
import { safeError } from '@/lib/security';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const blocked = await checkUserRate(actionLimiter, user.id);
    if (blocked) return blocked;

    const db = createServiceClient();

    // Get user profile
    const { data: profile } = await db
      .from('users')
      .select('name, goals, check_in_frequency')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check if there's already a pending check-in (prevent spam)
    const { data: existing } = await db
      .from('check_ins')
      .select('id')
      .eq('user_id', user.id)
      .in('status', ['pending', 'partial'])
      .limit(1)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'You already have an active check-in. Complete or wait for it to expire first.' },
        { status: 409 }
      );
    }

    // Get active partner
    const { data: partner } = await db
      .from('partners')
      .select('partner_user_id, partner_name, partner_email')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    const frequency = (profile.check_in_frequency ?? 'daily') as CheckInFrequency;
    const sentAt = new Date();
    const dueAt = calculateDueDate(sentAt, frequency);

    // Generate contextual prompt
    const prompt = await generateContextualPrompt(
      db, user.id, profile.name, profile.goals ?? [], frequency
    );

    // Create check-in record
    const { data: checkIn, error: insertError } = await db
      .from('check_ins')
      .insert({
        user_id: user.id,
        partner_user_id: partner?.partner_user_id ?? null,
        prompt,
        status: 'pending',
        sent_at: sentAt.toISOString(),
        due_at: dueAt.toISOString(),
      })
      .select()
      .single();

    if (insertError || !checkIn) {
      return NextResponse.json({ error: 'Failed to create check-in' }, { status: 500 });
    }

    return NextResponse.json({ checkIn }, { status: 201 });
  } catch (err: any) {
    return safeError('POST /api/check-ins/create', err);
  }
}
