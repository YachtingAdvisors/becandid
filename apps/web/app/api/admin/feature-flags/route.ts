export const dynamic = 'force-dynamic';
// ============================================================
// app/api/admin/feature-flags/route.ts
//
// GET   → List all feature flags.
// PATCH → Toggle a flag by key.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { isAdmin } from '@/lib/isAdmin';

// ─── GET: List all flags ─────────────────────────────────────

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isAdmin(user.email || ''))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const db = createServiceClient();
  const { data: flags, error } = await db
    .from('feature_flags')
    .select('*')
    .order('key', { ascending: true });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch flags' }, { status: 500 });
  }

  return NextResponse.json({ flags: flags || [] });
}

// ─── PATCH: Toggle a flag ────────────────────────────────────

export async function PATCH(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isAdmin(user.email || ''))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let body: { key?: string; enabled?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { key, enabled } = body;

  if (!key || typeof enabled !== 'boolean') {
    return NextResponse.json(
      { error: 'key (string) and enabled (boolean) are required' },
      { status: 400 },
    );
  }

  const db = createServiceClient();

  const { data: updated, error } = await db
    .from('feature_flags')
    .update({
      enabled,
      updated_by: user.email,
      updated_at: new Date().toISOString(),
    })
    .eq('key', key)
    .select()
    .single();

  if (error || !updated) {
    return NextResponse.json(
      { error: `Flag "${key}" not found or update failed` },
      { status: 404 },
    );
  }

  return NextResponse.json({ flag: updated });
}
