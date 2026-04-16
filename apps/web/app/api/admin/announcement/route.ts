export const dynamic = 'force-dynamic';
// ============================================================
// app/api/admin/announcement/route.ts
//
// POST → Send announcement email to all users via Resend.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { requireAdminAccess } from '@/lib/adminAccess';
import { adminLimiter, checkUserRate } from '@/lib/rateLimit';
import { Resend } from 'resend';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!);
}
const FROM = process.env.RESEND_FROM_EMAIL ?? 'Be Candid <noreply@becandid.io>';

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const adminAccess = await requireAdminAccess(supabase, user);
  if (!adminAccess.ok) {
    return NextResponse.json({ error: adminAccess.error }, { status: adminAccess.status });
  }

  const blocked = checkUserRate(adminLimiter, adminAccess.user.id);
  if (blocked) return blocked;

  const body = await req.json();
  const subject = (body.subject || '').trim();
  const message = (body.message || '').trim();

  if (!subject || !message) {
    return NextResponse.json(
      { error: 'Subject and message are required' },
      { status: 400 }
    );
  }

  if (subject.length > 200 || message.length > 5000) {
    return NextResponse.json(
      { error: 'Subject or message too long' },
      { status: 400 }
    );
  }

  const db = createServiceClient();

  // Fetch all user emails
  const { data: users, error: fetchError } = await db
    .from('users')
    .select('email')
    .not('email', 'is', null);

  if (fetchError || !users) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }

  const emails = users
    .map((u: { email: string }) => u.email)
    .filter(Boolean);

  if (emails.length === 0) {
    return NextResponse.json({ error: 'No users to email' }, { status: 400 });
  }

  const resend = getResend();

  // Send in batches of 50 using Resend batch API
  const batchSize = 50;
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    try {
      await resend.batch.send(
        batch.map((email: string) => ({
          from: FROM,
          to: email,
          subject,
          html: `<div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
            <h2 style="margin: 0 0 16px;">${escapeHtml(subject)}</h2>
            <div style="white-space: pre-wrap; line-height: 1.6;">${escapeHtml(message)}</div>
            <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e5e5;" />
            <p style="font-size: 12px; color: #888;">Sent from Be Candid Admin</p>
          </div>`,
        }))
      );
      sent += batch.length;
    } catch {
      failed += batch.length;
    }
  }

  // Log the announcement
  await db.from('audit_log').insert({
    user_id: adminAccess.user.id,
    action: 'admin_announcement',
    metadata: {
      subject,
      recipients: emails.length,
      sent,
      failed,
    },
  });

  return NextResponse.json({ sent, failed, total: emails.length });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
