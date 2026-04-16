export const dynamic = 'force-dynamic';
// PATCH  /api/fasts/:id — mark fast as completed or broken
// DELETE /api/fasts/:id — remove a fast

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { z } from 'zod';
import { safeError } from '@/lib/security';

const UpdateFastSchema = z.object({
  completed_at: z.string().optional(),
  broken_at: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return safeError('PATCH /api/fasts/:id', 'Unauthorized', 401);

    const body = await req.json().catch(() => null);
    if (!body) return safeError('PATCH /api/fasts/:id', 'Invalid JSON', 400);

    const parsed = UpdateFastSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from('fasts')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Fast not found' }, { status: 404 });
    }
    if (existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updates: Record<string, string> = {};
    if (parsed.data.completed_at) updates.completed_at = parsed.data.completed_at;
    if (parsed.data.broken_at) updates.broken_at = parsed.data.broken_at;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    const { data: fast, error } = await supabase
      .from('fasts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return safeError('PATCH /api/fasts/:id', error);

    return NextResponse.json({ fast });
  } catch (err) {
    return safeError('PATCH /api/fasts/:id', err);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return safeError('DELETE /api/fasts/:id', 'Unauthorized', 401);

    // Verify ownership
    const { data: existing } = await supabase
      .from('fasts')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Fast not found' }, { status: 404 });
    }
    if (existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabase
      .from('fasts')
      .delete()
      .eq('id', id);

    if (error) return safeError('DELETE /api/fasts/:id', error);

    return NextResponse.json({ success: true });
  } catch (err) {
    return safeError('DELETE /api/fasts/:id', err);
  }
}
