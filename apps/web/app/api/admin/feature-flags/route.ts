export const dynamic = 'force-dynamic';
// ============================================================
// app/api/admin/feature-flags/route.ts
//
// GET   → List all feature flags.
// PATCH → Toggle a flag by key.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { requireAdminAccess } from '@/lib/adminAccess';
import { accountLimiter, checkUserRate } from '@/lib/rateLimit';

// ─── GET: List all flags ─────────────────────────────────────

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const adminAccess = await requireAdminAccess(supabase, user);
  if (!adminAccess.ok) {
    return NextResponse.json({ error: adminAccess.error }, { status: adminAccess.status });
  }

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
  const adminAccess = await requireAdminAccess(supabase, user);
  if (!adminAccess.ok) {
    return NextResponse.json({ error: adminAccess.error }, { status: adminAccess.status });
  }

  const blocked = checkUserRate(accountLimiter, adminAccess.user.id);
  if (blocked) return blocked;

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
      updated_by: adminAccess.user.email,
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
