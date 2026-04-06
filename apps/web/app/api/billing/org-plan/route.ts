export const dynamic = 'force-dynamic';

// POST /api/billing/org-plan — request a group plan for a church/org

import { NextRequest, NextResponse } from 'next/server';
import { safeError, sanitizeText, sanitizeName } from '@/lib/security';
import { ipRateLimit, rateLimitResponse } from '@/lib/rateLimit';
import { Resend } from 'resend';
import { emailWrapper } from '@/lib/email/template';

const FROM = process.env.RESEND_FROM_EMAIL ?? 'alerts@updates.becandid.io';
const ADMIN_EMAIL = 'shawn@becandid.io';

function generatePromoCode(orgName: string): string {
  const clean = orgName
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .join('-')
    .toUpperCase();
  const year = new Date().getFullYear();
  return `${clean}-${year}`;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit by IP since this is public
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!ipRateLimit.check(`org-plan:${ip}`)) {
      return rateLimitResponse();
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { org_name, contact_email, contact_name, estimated_users, message } = body;

    // Validate required fields
    if (!org_name || typeof org_name !== 'string' || org_name.trim().length < 2) {
      return NextResponse.json({ error: 'Organization name is required' }, { status: 400 });
    }
    if (!contact_email || typeof contact_email !== 'string' || !isValidEmail(contact_email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const cleanOrgName = sanitizeName(org_name);
    const cleanContactName = contact_name ? sanitizeName(contact_name) : '';
    const cleanEmail = contact_email.trim().toLowerCase().slice(0, 254);
    const cleanMessage = message ? sanitizeText(message, 1000) : '';
    const userCount = typeof estimated_users === 'number'
      ? Math.min(Math.max(Math.round(estimated_users), 1), 10000)
      : null;

    const suggestedCode = generatePromoCode(cleanOrgName);

    // Send notification email to admin
    const resend = new Resend(process.env.RESEND_API_KEY!);
    await resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: `Group plan request — ${cleanOrgName}`,
      html: emailWrapper({
        preheader: `${cleanOrgName} wants group pricing for ${userCount || '?'} members`,
        body: `
          <h2 class="text-heading" style="margin:0 0 8px;color:#1a1a2e;font-size:20px;font-weight:700;">
            New Group Plan Request
          </h2>
          <p class="text-body" style="margin:0 0 20px;color:#6b7280;font-size:14px;">
            An organization is interested in group pricing.
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;background:#f3f4f6;border-radius:8px;">
            <tr><td style="padding:16px;">
              <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">Organization</p>
              <p style="margin:0 0 16px;font-size:16px;font-weight:700;color:#1a1a2e;">${cleanOrgName}</p>
              ${cleanContactName ? `<p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Contact: <strong style="color:#1a1a2e;">${cleanContactName}</strong></p>` : ''}
              <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Email: <strong style="color:#1a1a2e;">${cleanEmail}</strong></p>
              ${userCount ? `<p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Estimated members: <strong style="color:#1a1a2e;">${userCount}</strong></p>` : ''}
              ${cleanMessage ? `<p style="margin:12px 0 0;font-size:13px;color:#6b7280;">Message: <em style="color:#374151;">"${cleanMessage}"</em></p>` : ''}
            </td></tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;background:#ecfdf5;border-radius:8px;">
            <tr><td style="padding:12px 16px;">
              <p style="margin:0;font-size:12px;color:#6b7280;">Suggested promo code</p>
              <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:#065f46;letter-spacing:0.05em;">${suggestedCode}</p>
            </td></tr>
          </table>
        `,
        ctaUrl: 'https://becandid.io/admin',
        ctaLabel: 'Set Up Group Plan',
      }),
    });

    return NextResponse.json({
      success: true,
      message: "Thank you! We'll be in touch within 24 hours to set up your group plan.",
    });
  } catch (err) {
    return safeError('POST /api/billing/org-plan', err);
  }
}
