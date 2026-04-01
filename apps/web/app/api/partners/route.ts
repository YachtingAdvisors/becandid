export const dynamic = 'force-dynamic';
// GET  /api/partners — get active partner
// POST /api/partners — invite a partner

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { z } from 'zod';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { safeError, sanitizeName, sanitizeEmail, sanitizePhone, auditLog } from '@/lib/security';

const InviteSchema = z.object({
  partner_name: z.string().min(1).max(100),
  partner_email: z.string().email().max(254),
  partner_phone: z.string().max(20).optional(),
  relationship_type: z.string().min(1).max(50),
});

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return safeError('GET /api/partners', 'Unauthorized', 401);

    const db = createServiceClient();
    const { data: partner } = await db
      .from('partners')
      .select('id, partner_name, partner_email, partner_phone, status, invited_at, accepted_at')
      .eq('user_id', user.id)
      .order('invited_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return NextResponse.json({ partner });
  } catch (err) {
    return safeError('GET /api/partners', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return safeError('POST /api/partners', 'Unauthorized', 401);

    const blocked = checkUserRate(actionLimiter, user.id);
    if (blocked) return blocked;

    const body = await req.json().catch(() => null);
    if (!body) return safeError('POST /api/partners', 'Invalid JSON', 400);

    const parsed = InviteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten() }, { status: 400 });
    }

    // Sanitize
    const cleanName = sanitizeName(parsed.data.partner_name);
    const cleanEmail = sanitizeEmail(parsed.data.partner_email);
    if (!cleanEmail) return NextResponse.json({ error: 'Invalid email' }, { status: 400 });

    // Can't invite yourself
    if (cleanEmail === user.email?.toLowerCase()) {
      return NextResponse.json({ error: 'You cannot be your own partner' }, { status: 400 });
    }

    const cleanPhone = parsed.data.partner_phone ? sanitizePhone(parsed.data.partner_phone) : null;

    const db = createServiceClient();

    // Check for existing active partner
    const { data: existing } = await db
      .from('partners').select('id').eq('user_id', user.id).eq('status', 'active').maybeSingle();
    if (existing) {
      return NextResponse.json({ error: 'You already have an active partner' }, { status: 400 });
    }

    const inviteToken = crypto.randomUUID();

    const { data: partner, error } = await db
      .from('partners')
      .insert({
        user_id: user.id,
        partner_email: cleanEmail,
        partner_name: cleanName,
        partner_phone: cleanPhone,
        relationship: parsed.data.relationship_type,
        invite_token: inviteToken,
        status: 'pending',
      })
      .select()
      .single();

    if (error) return safeError('POST /api/partners', error);

    await db.from('users').update({
      relationship_type: parsed.data.relationship_type,
      partner_id: partner.id,
    }).eq('id', user.id);

    auditLog({
      action: 'partner.invite',
      userId: user.id,
      metadata: { partnerEmail: cleanEmail },
    });

    return NextResponse.json({ partner }, { status: 201 });
  } catch (err) {
    return safeError('POST /api/partners', err);
  }
}
