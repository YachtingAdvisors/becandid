export const dynamic = 'force-dynamic';
// ============================================================
// app/api/admin/email/route.ts
//
// POST → Send broadcast email to filtered audience via Resend.
// GET  → Return recent broadcast history from audit_log.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { isAdmin } from '@/lib/isAdmin';
import { accountLimiter, checkUserRate } from '@/lib/rateLimit';
import { emailWrapper } from '@/lib/email/template';
import { Resend } from 'resend';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!);
}
const FROM = process.env.RESEND_FROM_EMAIL ?? 'updates@updates.becandid.io';
const MAX_BATCH = 500;

type Audience = 'all' | 'pro' | 'therapy' | 'free' | 'trialing';

const AUDIENCE_VALUES: Audience[] = ['all', 'pro', 'therapy', 'free', 'trialing'];

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── POST: Send broadcast ────────────────────────────────────

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isAdmin(user.email || ''))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const blocked = checkUserRate(accountLimiter, user.id);
  if (blocked) return blocked;

  let body: { subject?: string; body?: string; audience?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const subject = (body.subject || '').trim();
  const htmlBody = (body.body || '').trim();
  const audience = (body.audience || '') as Audience;

  if (!subject || !htmlBody) {
    return NextResponse.json(
      { error: 'Subject and body are required' },
      { status: 400 },
    );
  }

  if (subject.length > 200 || htmlBody.length > 10000) {
    return NextResponse.json(
      { error: 'Subject or body too long' },
      { status: 400 },
    );
  }

  if (!AUDIENCE_VALUES.includes(audience)) {
    return NextResponse.json(
      { error: `Invalid audience. Must be one of: ${AUDIENCE_VALUES.join(', ')}` },
      { status: 400 },
    );
  }

  const db = createServiceClient();

  // Build query for the target audience
  let query = db.from('users').select('email').not('email', 'is', null);

  if (audience === 'pro') {
    query = query.eq('subscription_status', 'pro');
  } else if (audience === 'therapy') {
    query = query.eq('subscription_status', 'therapy');
  } else if (audience === 'free') {
    query = query.eq('subscription_status', 'free');
  } else if (audience === 'trialing') {
    query = query.eq('subscription_status', 'trialing');
  }
  // 'all' → no additional filter

  const { data: users, error: fetchError } = await query;

  if (fetchError || !users) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 },
    );
  }

  const emails = users
    .map((u: { email: string }) => u.email)
    .filter(Boolean);

  if (emails.length === 0) {
    return NextResponse.json({ error: 'No users match this audience' }, { status: 400 });
  }

  // Enforce rate limit
  const capped = emails.slice(0, MAX_BATCH);
  const resend = getResend();

  const wrappedHtml = emailWrapper({
    preheader: subject,
    body: `
      <h2 class="text-heading" style="margin:0 0 16px;color:#1a1a2e;font-size:20px;font-weight:700;">
        ${escapeHtml(subject)}
      </h2>
      <div class="text-body" style="color:#4b5563;font-size:14px;line-height:1.7;white-space:pre-wrap;">
        ${htmlBody}
      </div>
    `,
  });

  // Send in batches of 50 via Resend batch API
  const batchSize = 50;
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < capped.length; i += batchSize) {
    const batch = capped.slice(i, i + batchSize);
    try {
      await resend.batch.send(
        batch.map((email: string) => ({
          from: FROM,
          to: email,
          subject,
          html: wrappedHtml,
        })),
      );
      sent += batch.length;
    } catch {
      failed += batch.length;
    }
  }

  // Log to audit_log
  await db.from('audit_log').insert({
    user_id: user.id,
    action: 'admin_broadcast',
    details: JSON.stringify({
      subject,
      audience,
      total_matched: emails.length,
      sent,
      failed,
    }),
  });

  return NextResponse.json({
    sent,
    failed,
    total: emails.length,
    capped: emails.length > MAX_BATCH,
  });
}

// ─── GET: Broadcast history ──────────────────────────────────

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isAdmin(user.email || ''))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const db = createServiceClient();

  const { data: logs, error } = await db
    .from('audit_log')
    .select('*')
    .eq('action', 'admin_broadcast')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }

  const history = (logs || []).map((log: Record<string, unknown>) => {
    const details =
      typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
    return {
      id: log.id,
      subject: details?.subject ?? '',
      audience: details?.audience ?? 'all',
      sent: details?.sent ?? 0,
      failed: details?.failed ?? 0,
      total: details?.total_matched ?? 0,
      created_at: log.created_at,
    };
  });

  return NextResponse.json({ history });
}
