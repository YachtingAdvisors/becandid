export const dynamic = 'force-dynamic';
// ============================================================
// app/api/conversation-outcomes/route.ts
//
// POST → create/update outcome (user or partner side)
// GET  → list outcomes with optional filters
//
// After both user and partner submit their ratings, Claude
// generates a brief reflection on the conversation quality
// and awards trust points.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { encrypt } from '@/lib/encryption';
import { onOutcomeRated, onBothCompletedOutcome } from '@/lib/relationshipHooks';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { safeError } from '@/lib/security';
import Anthropic from '@anthropic-ai/sdk';

function getAnthropic() { return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! }); }

const USER_FEELINGS = ['heard', 'defensive', 'relieved', 'ashamed', 'hopeful', 'angry', 'grateful', 'numb'];
const PARTNER_FEELINGS = ['helpful', 'frustrated', 'connected', 'worried', 'hopeful', 'overwhelmed', 'grateful', 'unsure'];

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  const { alert_id, role, rating, felt, notes } = body;

  if (!alert_id) return NextResponse.json({ error: 'Missing alert_id' }, { status: 400 });
  if (!role || !['user', 'partner'].includes(role)) return NextResponse.json({ error: 'Role must be user or partner' }, { status: 400 });
  if (!rating || rating < 1 || rating > 5) return NextResponse.json({ error: 'Rating must be 1-5' }, { status: 400 });

  if (role === 'user' && felt && !USER_FEELINGS.includes(felt)) {
    return NextResponse.json({ error: `Invalid feeling. Options: ${USER_FEELINGS.join(', ')}` }, { status: 400 });
  }
  if (role === 'partner' && felt && !PARTNER_FEELINGS.includes(felt)) {
    return NextResponse.json({ error: `Invalid feeling. Options: ${PARTNER_FEELINGS.join(', ')}` }, { status: 400 });
  }

  const db = createServiceClient();

  // Verify the alert belongs to this user (or their partner)
  const { data: alert } = await db.from('alerts').select('user_id').eq('id', alert_id).single();
  if (!alert) return NextResponse.json({ error: 'Alert not found' }, { status: 404 });

  let alertUserId = alert.user_id;

  // If partner role, verify they're actually the partner
  if (role === 'partner') {
    const { data: partner } = await db.from('partners')
      .select('id').eq('user_id', alertUserId).eq('partner_user_id', user.id).eq('status', 'accepted').single();
    if (!partner) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  } else {
    if (alertUserId !== user.id) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  // Upsert outcome
  const updateData = role === 'user'
    ? {
        user_rating: rating,
        user_felt: felt || null,
        user_notes: notes ? encrypt(notes, alertUserId) : null,
        user_completed_at: new Date().toISOString(),
      }
    : {
        partner_rating: rating,
        partner_felt: felt || null,
        partner_notes: notes ? encrypt(notes, alertUserId) : null,
        partner_completed_at: new Date().toISOString(),
      };

  const { data: outcome, error: upsertError } = await db.from('conversation_outcomes')
    .upsert({
      alert_id,
      user_id: alertUserId,
      ...updateData,
    }, { onConflict: 'alert_id' })
    .select()
    .single();

  if (upsertError) return safeError('POST /api/conversation-outcomes', upsertError);

  // Check if both sides have completed
  if (outcome.user_completed_at && outcome.partner_completed_at && !outcome.ai_reflection) {
    // Generate AI reflection on the conversation
    try {
      const response = await getAnthropic().messages.create({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: 'You generate brief, warm reflections on accountability conversations. 2-3 sentences max. Acknowledge what went well and offer one gentle suggestion. Grounded in Stringer\'s philosophy: kindness and curiosity over shame. Respond with plain text only.',
        messages: [{
          role: 'user',
          content: `User rated: ${outcome.user_rating}/5, felt: ${outcome.user_felt || 'not specified'}. Partner rated: ${outcome.partner_rating}/5, felt: ${outcome.partner_felt || 'not specified'}.`,
        }],
      });

      const reflection = response.content.filter((b): b is Anthropic.TextBlock => b.type === 'text').map((b) => b.text).join('');

      await db.from('conversation_outcomes').update({
        ai_reflection: encrypt(reflection, alertUserId),
      }).eq('id', outcome.id);
    } catch (e) {
      console.error('AI reflection failed:', e);
    }

    // Award trust points for completing conversation
    try {
      await db.rpc('award_trust_points', {
        p_user_id: alertUserId, p_points: 25,
        p_reason: 'conversation_completed', p_reference_id: outcome.id,
      });
    } catch {}
  }

  // Award points for submitting your side
  try {
    await db.rpc('award_trust_points', {
      p_user_id: user.id, p_points: 10,
      p_reason: `outcome_${role}`, p_reference_id: outcome.id,
    });
  } catch {}

  // Relationship XP
  await onOutcomeRated(user.id, role).catch(() => {});
  if (outcome.user_completed_at && outcome.partner_completed_at) {
    await onBothCompletedOutcome(alertUserId).catch(() => {});
  }

  return NextResponse.json({ outcome, points_earned: 10 });
}

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);

  const db = createServiceClient();
  const { data, error } = await db.from('conversation_outcomes')
    .select('*, alerts(category, severity, created_at)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return safeError('GET /api/conversation-outcomes', error);
  return NextResponse.json({ outcomes: data || [] });
}
