export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { sanitizeText } from '@/lib/security';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = await checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  // Support both JSON and FormData
  const contentType = req.headers.get('content-type') ?? '';
  let type: string;
  let message: string;
  let pageUrl: string | null = null;
  let pagePath: string | null = null;
  let screenshotBuffer: Buffer | null = null;
  let screenshotFilename: string | null = null;
  let screenshotContentType: string | null = null;

  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData();
    type = sanitizeText((formData.get('type') as string) ?? '', 50);
    message = sanitizeText((formData.get('message') as string) ?? '', 2000);
    pageUrl = formData.get('pageUrl') as string | null;
    pagePath = formData.get('pagePath') as string | null;

    const file = formData.get('screenshot') as File | null;
    if (file && file.size > 0) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: 'Screenshot must be under 5 MB' }, { status: 400 });
      }
      screenshotBuffer = Buffer.from(await file.arrayBuffer());
      screenshotFilename = file.name || 'screenshot.png';
      screenshotContentType = file.type || 'image/png';
    }
  } else {
    const body = await req.json().catch(() => null);
    if (!body?.type || !body?.message) {
      return NextResponse.json({ error: 'type and message required' }, { status: 400 });
    }
    type = sanitizeText(body.type, 50);
    message = sanitizeText(body.message, 2000);
    pageUrl = body.pageUrl ?? null;
    pagePath = body.pagePath ?? null;
  }

  if (!type || !message) {
    return NextResponse.json({ error: 'type and message required' }, { status: 400 });
  }

  const db = createServiceClient();
  const { data: profile } = await db.from('users')
    .select('name, email')
    .eq('id', user.id)
    .single();

  // Build context section for email
  const contextParts: string[] = [];
  if (pageUrl) contextParts.push(`<p><strong>Page:</strong> <a href="${pageUrl}">${pagePath || pageUrl}</a></p>`);
  if (screenshotBuffer) contextParts.push(`<p><strong>Screenshot:</strong> attached (${screenshotFilename})</p>`);
  const contextHtml = contextParts.length > 0 ? `<h3>Context</h3>${contextParts.join('\n')}` : '';

  // Send email to support
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY!);

    const emailOptions: any = {
      from: process.env.RESEND_FROM_EMAIL ?? 'Be Candid <noreply@becandid.io>',
      to: 'shawn@becandid.io',
      replyTo: profile?.email || user.email || undefined,
      subject: `[${type.toUpperCase()}] Issue report from ${profile?.name || 'a user'}`,
      html: `
        <h2>Issue Report</h2>
        <p><strong>Type:</strong> ${type}</p>
        <p><strong>From:</strong> ${profile?.name || 'Unknown'} (${profile?.email || user.email})</p>
        <p><strong>User ID:</strong> <code>${user.id}</code></p>
        ${contextHtml}
        <hr />
        <p>${message.replace(/\n/g, '<br />')}</p>
      `,
    };

    // Attach screenshot if present
    if (screenshotBuffer && screenshotFilename && screenshotContentType) {
      emailOptions.attachments = [{
        filename: screenshotFilename,
        content: screenshotBuffer,
        content_type: screenshotContentType,
      }];
    }

    await resend.emails.send(emailOptions);
  } catch (e) {
    console.error('[support/report] Email error:', e);
  }

  // Log to audit
  try {
    await db.from('audit_log').insert({
      user_id: user.id,
      action: 'support_report',
      metadata: {
        type,
        message: message.slice(0, 200),
        page_url: pageUrl,
        has_screenshot: !!screenshotBuffer,
      },
    });
  } catch {}

  return NextResponse.json({ sent: true });
}
