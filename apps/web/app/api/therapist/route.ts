export const dynamic = 'force-dynamic';
// ============================================================
// app/api/therapist/route.ts
//
// POST   → invite a therapist (sends email with invite link)
// GET    → list connections (for user or therapist)
// PATCH  → update consent settings or revoke access
// DELETE → remove connection entirely
//
// GET /api/therapist/portal?token=... → therapist's read-only view data
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { decryptJournalEntries, decrypt } from '@/lib/encryption';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { sanitizeEmail, sanitizeName, safeError, escapeHtml } from '@/lib/security';
import { Resend } from 'resend';
import { randomUUID } from 'crypto';

function getResend() { return new Resend(process.env.RESEND_API_KEY!); }
const FROM = process.env.EMAIL_FROM || 'Be Candid <noreply@becandid.io>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://becandid.io';

// ── POST: Invite therapist ──────────────────────────────────

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  const { therapist_email, therapist_name, can_see_journal, can_see_moods, can_see_streaks, can_see_outcomes, can_see_patterns } = body;

  if (!therapist_email?.trim()) return NextResponse.json({ error: 'Email required' }, { status: 400 });
  const validatedEmail = sanitizeEmail(therapist_email);
  if (!validatedEmail) return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });

  const db = createServiceClient();

  // Check for existing connection
  const { data: existing } = await db.from('therapist_connections')
    .select('id, status')
    .eq('user_id', user.id)
    .eq('therapist_email', validatedEmail)
    .single();

  if (existing && existing.status === 'accepted') {
    return NextResponse.json({ error: 'Already connected' }, { status: 400 });
  }

  // Therapist connection limit: free=1, pro=1, therapy=unlimited
  const { data: userPlan } = await db.from('users')
    .select('subscription_plan').eq('id', user.id).single();
  const plan = userPlan?.subscription_plan;
  const maxTherapists = plan === 'therapy' ? Number.MAX_SAFE_INTEGER : 1;

  const { count } = await db.from('therapist_connections')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'accepted');

  if ((count ?? 0) >= maxTherapists) {
    const msg = plan === 'therapy'
      ? 'Maximum therapist connections reached.'
      : 'Free and Pro plans allow 1 therapist connection. Upgrade to Therapy for unlimited.';
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const token = randomUUID();
  const cleanName = therapist_name ? sanitizeName(therapist_name) : null;

  const { data: connection, error } = await db.from('therapist_connections').upsert({
    user_id: user.id,
    therapist_email: validatedEmail,
    therapist_name: cleanName,
    invite_token: token,
    status: 'pending',
    can_see_journal: can_see_journal ?? true,
    can_see_moods: can_see_moods ?? true,
    can_see_streaks: can_see_streaks ?? true,
    can_see_outcomes: can_see_outcomes ?? true,
    can_see_patterns: can_see_patterns ?? false,
  }, { onConflict: 'id' }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Get user's name for the email
  const { data: profile } = await db.from('users').select('name').eq('id', user.id).single();
  const userName = profile?.name || user.email || 'A client';

  // Send invite email
  const { emailWrapper } = await import('@/lib/email/template');

  const accessList = [
    can_see_journal !== false ? '<li>Journal entries (tributaries, longings, roadmap reflections)</li>' : '',
    can_see_moods !== false ? '<li>Mood timeline</li>' : '',
    can_see_streaks !== false ? '<li>Focus streaks and milestones</li>' : '',
    can_see_outcomes !== false ? '<li>Conversation outcome history</li>' : '',
  ].filter(Boolean).join('\n');

  await getResend().emails.send({
    from: FROM,
    to: validatedEmail,
    subject: `${escapeHtml(userName)} has invited you to Be Candid`,
    html: emailWrapper({
      preheader: `${escapeHtml(userName)} wants to share their progress with you on Be Candid`,
      body: `
        <h2 class="text-heading" style="margin:0 0 16px;color:#1a1a2e;font-size:20px;font-weight:700;">
          Therapist Portal Invitation
        </h2>
        <p class="text-body" style="font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 16px;">
          <strong>${escapeHtml(userName)}</strong> has invited you to view their progress on Be Candid, an accountability and reflection app grounded in a therapeutic framework for understanding unwanted behavior.
        </p>
        <p class="text-body" style="font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 8px;">
          You'll have read-only access to:
        </p>
        <ul style="font-size:13px;color:#4b5563;line-height:1.8;margin:0 0 20px;padding-left:20px;">
          ${accessList}
        </ul>
        <p class="text-muted" style="font-size:13px;color:#9ca3af;margin:0;font-style:italic;">
          You will never see: browsing history, URLs, screenshots, or push notification content.
        </p>
      `,
      ctaUrl: `${APP_URL}/therapist/accept/${token}`,
      ctaLabel: 'Accept Invitation',
      footerNote: 'All data is encrypted in transit and at rest. HIPAA-ready audit logging is enabled.',
    }),
  }).catch((e) => console.error('Therapist invite email failed:', e));

  await db.from('audit_log').insert({
    user_id: user.id,
    action: 'therapist_invited',
    metadata: { therapist_email: validatedEmail },
  });

  return NextResponse.json({ connection }, { status: 201 });
}

// ── GET: List connections ───────────────────────────────────

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = createServiceClient();

  // Check if user is a therapist viewing their clients
  const { data: asTherapist } = await db.from('therapist_connections')
    .select('*, users!therapist_connections_user_id_fkey(name, email)')
    .eq('therapist_user_id', user.id)
    .eq('status', 'accepted');

  // Check user's own connections
  const { data: asUser } = await db.from('therapist_connections')
    .select('*')
    .eq('user_id', user.id);

  return NextResponse.json({
    as_user: asUser || [],
    as_therapist: (asTherapist || []).map((c: any) => ({
      id: c.id,
      client_name: c.users?.name || 'Client',
      client_id: c.user_id,
      can_see_journal: c.can_see_journal,
      can_see_moods: c.can_see_moods,
      can_see_streaks: c.can_see_streaks,
      can_see_outcomes: c.can_see_outcomes,
      can_see_patterns: c.can_see_patterns,
      accepted_at: c.accepted_at,
    })),
  });
}

// ── PATCH: Update consent or revoke ─────────────────────────

export async function PATCH(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  const { connection_id, action, invite_token, can_see_journal, can_see_moods, can_see_streaks, can_see_outcomes, can_see_patterns } = body;

  const db = createServiceClient();

  // ── Accept invite via token ──────────────────────────────
  if (action === 'accept' && invite_token) {
    const { data: conn, error: lookupErr } = await db.from('therapist_connections')
      .select('id, user_id, status, therapist_email')
      .eq('invite_token', invite_token)
      .single();

    if (lookupErr || !conn) {
      return NextResponse.json({ error: 'Invalid or expired invite token' }, { status: 404 });
    }
    if (conn.status === 'accepted') {
      return NextResponse.json({ error: 'Already accepted', connection_id: conn.id }, { status: 400 });
    }
    if (conn.status === 'revoked') {
      return NextResponse.json({ error: 'This invitation has been revoked' }, { status: 410 });
    }

    const { error: updateErr } = await db.from('therapist_connections').update({
      therapist_user_id: user.id,
      status: 'accepted',
      accepted_at: new Date().toISOString(),
    }).eq('id', conn.id);

    if (updateErr) return safeError('PATCH /api/therapist', updateErr);

    // Fetch client name for the response
    const { data: clientRow } = await db.from('users').select('name').eq('id', conn.user_id).single();

    try {
      await db.from('audit_log').insert({
        user_id: conn.user_id,
        action: 'therapist_accepted',
        metadata: { therapist_user_id: user.id, connection_id: conn.id },
      });
    } catch { /* audit logging never blocks */ }

    return NextResponse.json({ accepted: true, connection_id: conn.id, client_name: clientRow?.name });
  }

  if (!connection_id) return NextResponse.json({ error: 'Missing connection_id' }, { status: 400 });

  if (action === 'revoke') {
    await db.from('therapist_connections').update({
      status: 'revoked',
      revoked_at: new Date().toISOString(),
    }).eq('id', connection_id).eq('user_id', user.id);

    await db.from('audit_log').insert({
      user_id: user.id,
      action: 'therapist_revoked',
      metadata: { connection_id },
    });

    return NextResponse.json({ revoked: true });
  }

  // Update consent settings
  const updates: any = {};
  if (can_see_journal !== undefined) updates.can_see_journal = can_see_journal;
  if (can_see_moods !== undefined) updates.can_see_moods = can_see_moods;
  if (can_see_streaks !== undefined) updates.can_see_streaks = can_see_streaks;
  if (can_see_outcomes !== undefined) updates.can_see_outcomes = can_see_outcomes;
  if (can_see_patterns !== undefined) updates.can_see_patterns = can_see_patterns;

  const { data, error } = await db.from('therapist_connections')
    .update(updates)
    .eq('id', connection_id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  try {
    await db.from('audit_log').insert({
      user_id: user.id,
      action: 'therapist_consent_updated',
      metadata: { connection_id, updates },
    });
  } catch { /* audit logging never blocks */ }

  return NextResponse.json({ connection: data });
}
