export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { sanitizeText } from '@/lib/security';

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  const body = await req.json().catch(() => null);
  if (!body?.type || !body?.message) {
    return NextResponse.json({ error: 'type and message required' }, { status: 400 });
  }

  const type = sanitizeText(body.type, 50);
  const message = sanitizeText(body.message, 2000);

  const db = createServiceClient();
  const { data: profile } = await db.from('users')
    .select('name, email')
    .eq('id', user.id)
    .single();

  // Send email to support
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY!);

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'Be Candid <noreply@becandid.io>',
      to: 'shawn@becandid.io',
      replyTo: profile?.email || user.email || undefined,
      subject: `[${type.toUpperCase()}] Issue report from ${profile?.name || 'a user'}`,
      html: `
        <h2>Issue Report</h2>
        <p><strong>Type:</strong> ${type}</p>
        <p><strong>From:</strong> ${profile?.name || 'Unknown'} (${profile?.email || user.email})</p>
        <p><strong>User ID:</strong> <code>${user.id}</code></p>
        <hr />
        <p>${message.replace(/\n/g, '<br />')}</p>
      `,
    });
  } catch (e) {
    console.error('[support/report] Email error:', e);
  }

  // Log to audit
  try {
    await db.from('audit_log').insert({
      user_id: user.id,
      action: 'support_report',
      metadata: { type, message: message.slice(0, 200) },
    });
  } catch {}

  return NextResponse.json({ sent: true });
}
