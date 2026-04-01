export const dynamic = 'force-dynamic';
// GET  /api/fasts — list all fasts for user
// POST /api/fasts — create a new fast

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { z } from 'zod';
import { safeError } from '@/lib/security';

const MAX_DURATION_DAYS = 90;

const CreateFastSchema = z.object({
  label: z.string().min(1, 'Label is required').max(200),
  category: z.string().min(1).max(100),
  ends_at: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
  notes: z.string().max(1000).optional(),
});

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return safeError('GET /api/fasts', 'Unauthorized', 401);

    const db = createServiceClient();

    // Active fasts first (no completed_at, no broken_at), then past fasts
    const { data: fasts, error } = await db
      .from('fasts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) return safeError('GET /api/fasts', error);

    // Sort: active first, then completed/broken by created_at desc
    const active = (fasts ?? []).filter(
      (f: any) => !f.completed_at && !f.broken_at
    );
    const past = (fasts ?? []).filter(
      (f: any) => f.completed_at || f.broken_at
    );

    return NextResponse.json({ fasts: [...active, ...past] });
  } catch (err) {
    return safeError('GET /api/fasts', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return safeError('POST /api/fasts', 'Unauthorized', 401);

    const body = await req.json().catch(() => null);
    if (!body) return safeError('POST /api/fasts', 'Invalid JSON', 400);

    const parsed = CreateFastSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const endsAt = new Date(parsed.data.ends_at);
    const now = new Date();

    // ends_at must be in the future
    if (endsAt <= now) {
      return NextResponse.json(
        { error: 'End date must be in the future' },
        { status: 400 }
      );
    }

    // Duration max 90 days
    const diffDays = (endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays > MAX_DURATION_DAYS) {
      return NextResponse.json(
        { error: `Duration cannot exceed ${MAX_DURATION_DAYS} days` },
        { status: 400 }
      );
    }

    const db = createServiceClient();
    const { data: fast, error } = await db
      .from('fasts')
      .insert({
        user_id: user.id,
        label: parsed.data.label.trim(),
        category: parsed.data.category.trim().toLowerCase(),
        ends_at: endsAt.toISOString(),
        notes: parsed.data.notes?.trim() || null,
      })
      .select()
      .single();

    if (error) return safeError('POST /api/fasts', error);

    return NextResponse.json({ fast }, { status: 201 });
  } catch (err) {
    return safeError('POST /api/fasts', err);
  }
}
