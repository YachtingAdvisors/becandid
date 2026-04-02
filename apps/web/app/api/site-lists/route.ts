export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { safeError, escapeHtml } from '@/lib/security';
import { z } from 'zod';
import { Resend } from 'resend';
import twilio from 'twilio';

// ─── Validation ─────────────────────────────────────────────

const addSchema = z.object({
  domain: z
    .string()
    .min(1)
    .max(253)
    .transform((d) => d.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, ''))
    .refine(
      (d) => /^([a-z0-9-]+\.)+[a-z]{2,}$/.test(d),
      { message: 'Invalid domain format' }
    ),
  list_type: z.enum(['whitelist', 'blacklist']),
});

const deleteSchema = z.object({
  id: z.string().uuid(),
});

// ─── GET — fetch all site list entries for the current user ──

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = createServiceClient();
    const { data: sites, error } = await db
      .from('site_lists')
      .select('id, domain, list_type, added_at')
      .eq('user_id', user.id)
      .order('added_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ sites: sites ?? [] });
  } catch (err) {
    return safeError('GET /api/site-lists', err);
  }
}

// ─── POST — add a domain to whitelist or blacklist ───────────

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const parsed = addSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      );
    }

    const { domain, list_type } = parsed.data;
    const db = createServiceClient();

    // Upsert: if domain exists, update list_type
    const { data: site, error } = await db
      .from('site_lists')
      .upsert(
        { user_id: user.id, domain, list_type, added_at: new Date().toISOString() },
        { onConflict: 'user_id,domain' }
      )
      .select('id, domain, list_type, added_at')
      .single();

    if (error) throw error;

    return NextResponse.json({ site });
  } catch (err) {
    return safeError('POST /api/site-lists', err);
  }
}

// ─── DELETE — remove a site entry; notify partner if blacklisted ─

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const parsed = deleteSchema.safeParse({ id: searchParams.get('id') });
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const db = createServiceClient();
    const { id } = parsed.data;

    // Fetch the entry first to check list_type and ownership
    const { data: entry } = await db
      .from('site_lists')
      .select('id, domain, list_type, user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!entry) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Delete the entry
    const { error: delError } = await db
      .from('site_lists')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (delError) throw delError;

    // If removing a BLACKLISTED site, notify the partner
    if (entry.list_type === 'blacklist') {
      await notifyPartnerOfBlacklistRemoval(db, user.id, entry.domain);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return safeError('DELETE /api/site-lists', err);
  }
}

// ─── Partner Notification Helper ─────────────────────────────

async function notifyPartnerOfBlacklistRemoval(
  db: ReturnType<typeof createServiceClient>,
  userId: string,
  domain: string
) {
  try {
    // Get the user's name
    const { data: userData } = await db
      .from('users')
      .select('name, notification_prefs')
      .eq('id', userId)
      .single();

    // Find active partner
    const { data: partner } = await db
      .from('partners')
      .select('partner_name, partner_email, partner_phone, status')
      .eq('user_id', userId)
      .in('status', ['active', 'accepted'])
      .maybeSingle();

    if (!partner) return;

    const userName = userData?.name ?? 'Your partner';
    const partnerName = partner.partner_name ?? 'there';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://becandid.io';

    // Send email via Resend
    if (partner.partner_email) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY!);
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL ?? 'alerts@becandid.io',
          to: partner.partner_email,
          subject: `Be Candid: ${escapeHtml(userName)} removed a blocked site`,
          html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:32px 20px;">
  <div style="background:#fff;border-radius:16px;padding:28px;border:1px solid #e5e7eb;">
    <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:20px;">Site List Update</h2>
    <p style="margin:0 0 20px;color:#6b7280;font-size:14px;line-height:1.6;">
      Hey ${escapeHtml(partnerName)}, ${escapeHtml(userName)} removed <strong>${escapeHtml(domain)}</strong> from their blocked sites list.
      You may want to check in with them.
    </p>
    <a href="${appUrl}/dashboard" style="display:block;text-align:center;background:#4f46e5;color:white;padding:14px 24px;border-radius:12px;text-decoration:none;font-weight:600;font-size:15px;">
      Open Dashboard
    </a>
  </div>
  <div style="text-align:center;margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;">
    <p style="margin:0;color:#9ca3af;font-size:11px;line-height:1.6;">
      Be Candid &middot; Accountability that heals<br/>
      <a href="${appUrl}/dashboard/settings" style="color:#7c3aed;text-decoration:underline;">Settings</a>
    </p>
  </div>
</div>
</body></html>`,
        });
      } catch (emailErr) {
        console.error('[site-lists] Email notification failed:', emailErr);
      }
    }

    // Send SMS via Twilio if partner has phone and SMS alerts aren't disabled
    const notifPrefs = (userData?.notification_prefs as Record<string, unknown>) ?? {};
    if (partner.partner_phone && notifPrefs.alert_sms !== false) {
      try {
        const client = twilio(
          process.env.TWILIO_ACCOUNT_SID!,
          process.env.TWILIO_AUTH_TOKEN!,
        );
        await client.messages.create({
          body: `Be Candid: Hey ${partnerName}, ${userName} removed ${domain} from their blocked sites list. You may want to check in. ${appUrl}/dashboard`,
          from: process.env.TWILIO_PHONE_NUMBER!,
          to: partner.partner_phone,
        });
      } catch (smsErr) {
        console.error('[site-lists] SMS notification failed:', smsErr);
      }
    }
  } catch (err) {
    console.error('[site-lists] Partner notification error:', err);
  }
}
