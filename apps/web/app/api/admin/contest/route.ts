export const dynamic = 'force-dynamic';
// ============================================================
// app/api/admin/contest/route.ts
//
// POST -> Admin decides a contested flag: accept or reject.
// On acceptance: creates a false_positive_rule so future
// identical flags are automatically suppressed.
// Auth: must be authenticated AND an admin (ADMIN_EMAILS).
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { isAdmin } from '@/lib/isAdmin';
import { decrypt } from '@/lib/encryption';
import { adminLimiter, checkUserRate } from '@/lib/rateLimit';
import { emailWrapper } from '@/lib/email/template';
import { Resend } from 'resend';

const FROM = process.env.EMAIL_FROM || 'Be Candid <noreply@becandid.io>';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!);
}

async function verifyAdmin(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  if (!isAdmin(user.email || ''))
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };

  const blocked = checkUserRate(adminLimiter, user.id);
  if (blocked) return { error: blocked };

  return { user };
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdmin(req);
  if ('error' in auth && auth.error) return auth.error;
  const adminUser = auth.user!;

  let body: { event_id: string; decision: 'accepted' | 'rejected' };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { event_id, decision } = body;

  if (!event_id || !decision || !['accepted', 'rejected'].includes(decision)) {
    return NextResponse.json(
      { error: 'event_id and decision (accepted | rejected) are required' },
      { status: 400 },
    );
  }

  const db = createServiceClient();

  // Fetch the event
  const { data: event, error: eventErr } = await db
    .from('events')
    .select('id, user_id, category, app_name, url_hash, contest_decision')
    .eq('id', event_id)
    .single();

  if (eventErr || !event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  if (event.contest_decision) {
    return NextResponse.json(
      { error: 'Contest already decided' },
      { status: 409 },
    );
  }

  // Update the event with the decision
  const { error: updateErr } = await db
    .from('events')
    .update({
      contest_decision: decision,
      contest_decided_at: new Date().toISOString(),
      contest_decided_by: adminUser.id,
    })
    .eq('id', event_id);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  // Fetch user email for notification
  const { data: flaggedUser } = await db
    .from('users')
    .select('email, name')
    .eq('id', event.user_id)
    .single();

  if (decision === 'accepted') {
    // ── Create false positive rule ─────────────────────────
    // Decrypt app_name to use as the match value
    const decryptedAppName = event.app_name
      ? decrypt(event.app_name, event.user_id)
      : null;

    if (decryptedAppName) {
      await db.from('false_positive_rules').upsert(
        {
          user_id: event.user_id,
          match_type: 'app_name' as const,
          match_value: decryptedAppName.toLowerCase(),
          category: event.category,
          source_event_id: event.id,
        },
        { onConflict: 'user_id,match_type,match_value,category' },
      );
    }

    // Also create a url_hash rule if present
    if (event.url_hash) {
      await db.from('false_positive_rules').upsert(
        {
          user_id: event.user_id,
          match_type: 'url_hash' as const,
          match_value: event.url_hash,
          category: event.category,
          source_event_id: event.id,
        },
        { onConflict: 'user_id,match_type,match_value,category' },
      );
    }

    // Send acceptance email
    if (flaggedUser?.email) {
      const html = emailWrapper({
        preheader: 'Your contested flag has been accepted',
        body: `
          <h2 style="font-family:Georgia,serif;font-size:20px;color:#0f0e1a;margin:0 0 12px;">
            Hey ${flaggedUser.name || 'there'},
          </h2>
          <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 16px;">
            Good news -- we reviewed the flag you contested and agree it was a false positive.
            We've added a rule so this won't trigger again in the future.
          </p>
          <p style="font-size:13px;color:#6b7280;line-height:1.6;margin:0;">
            If you have questions, reply to this email.
          </p>
        `,
      });

      await getResend().emails.send({
        from: FROM,
        to: flaggedUser.email,
        subject: 'Be Candid — Your contested flag was accepted',
        html,
      }).catch((e) => console.error('Contest acceptance email failed:', e));
    }
  } else {
    // ── Rejected: send rejection email ─────────────────────
    if (flaggedUser?.email) {
      const html = emailWrapper({
        preheader: 'Your contested flag was reviewed',
        body: `
          <h2 style="font-family:Georgia,serif;font-size:20px;color:#0f0e1a;margin:0 0 12px;">
            Hey ${flaggedUser.name || 'there'},
          </h2>
          <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 16px;">
            We reviewed the flag you contested and determined it was correctly flagged.
            The original flag will remain on your timeline.
          </p>
          <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 16px;">
            Remember: flags aren't meant to shame you. They're signals worth being curious about.
          </p>
          <p style="font-size:13px;color:#6b7280;line-height:1.6;margin:0;">
            If you believe this was an error, reply to this email.
          </p>
        `,
      });

      await getResend().emails.send({
        from: FROM,
        to: flaggedUser.email,
        subject: 'Be Candid — Your contested flag was reviewed',
        html,
      }).catch((e) => console.error('Contest rejection email failed:', e));
    }
  }

  // Audit log
  await db.from('audit_log').insert({
    user_id: event.user_id,
    action: `contest_${decision}`,
    metadata: {
      event_id,
      decided_by: adminUser.id,
      decided_by_email: adminUser.email,
    },
  });

  return NextResponse.json({ success: true, decision });
}
