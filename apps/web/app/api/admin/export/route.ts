export const dynamic = 'force-dynamic';
// ============================================================
// app/api/admin/export/route.ts
//
// GET → Export data as downloadable CSV.
// Query params:
//   ?type=users       — All users
//   ?type=revenue     — Subscription / revenue data
//   ?type=engagement  — Weekly engagement metrics
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { requireAdminAccess } from '@/lib/adminAccess';
import { accountLimiter, checkUserRate } from '@/lib/rateLimit';

function escapeCsvField(value: unknown): string {
  const str = value == null ? '' : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsv(headers: string[], rows: Record<string, unknown>[]): string {
  const headerLine = headers.join(',');
  const dataLines = rows.map((row) =>
    headers.map((h) => escapeCsvField(row[h])).join(','),
  );
  return [headerLine, ...dataLines].join('\n');
}

function csvResponse(csv: string, filename: string): NextResponse {
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

export async function GET(req: NextRequest) {
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

  const type = req.nextUrl.searchParams.get('type');
  const db = createServiceClient();

  // ─── Users export ────────────────────────────────────────
  if (type === 'users') {
    const { data: users, error } = await db
      .from('users')
      .select('id, email, name, subscription_status, trial_ends_at, streak, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to export users' }, { status: 500 });
    }

    const rows = (users || []).map((u: Record<string, unknown>) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      plan: u.subscription_status,
      status: u.subscription_status,
      streak: u.streak ?? 0,
      joined: u.created_at,
    }));

    const csv = toCsv(['id', 'email', 'name', 'plan', 'status', 'streak', 'joined'], rows);
    return csvResponse(csv, `becandid-users-${new Date().toISOString().slice(0, 10)}.csv`);
  }

  // ─── Revenue export ──────────────────────────────────────
  if (type === 'revenue') {
    const { data: users, error } = await db
      .from('users')
      .select('email, subscription_status, trial_ends_at, stripe_customer_id, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to export revenue data' }, { status: 500 });
    }

    const rows = (users || []).map((u: Record<string, unknown>) => ({
      email: u.email,
      plan: u.subscription_status,
      status: u.subscription_status,
      trial_ends: u.trial_ends_at ?? '',
      stripe_id: u.stripe_customer_id ?? '',
    }));

    const csv = toCsv(['email', 'plan', 'status', 'trial_ends', 'stripe_id'], rows);
    return csvResponse(csv, `becandid-revenue-${new Date().toISOString().slice(0, 10)}.csv`);
  }

  // ─── Engagement export ───────────────────────────────────
  if (type === 'engagement') {
    const { data: users, error } = await db
      .from('users')
      .select('email, name, streak, last_check_in, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to export engagement data' }, { status: 500 });
    }

    const rows = (users || []).map((u: Record<string, unknown>) => ({
      email: u.email,
      name: u.name,
      streak: u.streak ?? 0,
      last_check_in: u.last_check_in ?? '',
      joined: u.created_at,
    }));

    const csv = toCsv(['email', 'name', 'streak', 'last_check_in', 'joined'], rows);
    return csvResponse(csv, `becandid-engagement-${new Date().toISOString().slice(0, 10)}.csv`);
  }

  return NextResponse.json(
    { error: 'Invalid type. Use: users, revenue, or engagement' },
    { status: 400 },
  );
}
