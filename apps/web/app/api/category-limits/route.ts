export const dynamic = 'force-dynamic';
// GET  /api/category-limits — fetch all limits for user
// POST /api/category-limits — create or update a limit

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { safeError } from '@/lib/security';
import { z } from 'zod';

const LimitSchema = z.object({
  category: z.string().min(1).max(50),
  daily_limit_minutes: z.number().int().min(1).max(1440),
  warning_minutes: z.number().int().min(1).max(60).default(5),
  sequential_limit_minutes: z.number().int().min(1).max(1440).nullable().optional(),
  enabled: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return safeError('GET /api/category-limits', 'Unauthorized', 401);

    const { data: limits } = await supabase
      .from('category_time_limits')
      .select('*')
      .eq('user_id', user.id)
      .order('category');

    return NextResponse.json({ limits: limits ?? [] });
  } catch (err) {
    return safeError('GET /api/category-limits', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return safeError('POST /api/category-limits', 'Unauthorized', 401);

    const body = await req.json().catch(() => null);
    const parsed = LimitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten() }, { status: 400 });
    }

    // Upsert: update if exists, insert if not
    const { data: existing } = await supabase
      .from('category_time_limits')
      .select('id')
      .eq('user_id', user.id)
      .eq('category', parsed.data.category)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('category_time_limits')
        .update({
          daily_limit_minutes: parsed.data.daily_limit_minutes,
          warning_minutes: parsed.data.warning_minutes,
          sequential_limit_minutes: parsed.data.sequential_limit_minutes ?? null,
          enabled: parsed.data.enabled,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (error) return safeError('POST /api/category-limits', error);
    } else {
      const { error } = await supabase
        .from('category_time_limits')
        .insert({
          user_id: user.id,
          category: parsed.data.category,
          daily_limit_minutes: parsed.data.daily_limit_minutes,
          warning_minutes: parsed.data.warning_minutes,
          sequential_limit_minutes: parsed.data.sequential_limit_minutes ?? null,
          enabled: parsed.data.enabled,
        });

      if (error) return safeError('POST /api/category-limits', error);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return safeError('POST /api/category-limits', err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return safeError('DELETE /api/category-limits', 'Unauthorized', 401);

    const url = new URL(req.url);
    const category = url.searchParams.get('category');
    if (!category) return NextResponse.json({ error: 'Category required' }, { status: 400 });

    await supabase
      .from('category_time_limits')
      .delete()
      .eq('user_id', user.id)
      .eq('category', category);

    return NextResponse.json({ success: true });
  } catch (err) {
    return safeError('DELETE /api/category-limits', err);
  }
}
