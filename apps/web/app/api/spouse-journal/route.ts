export const dynamic = 'force-dynamic';
// ============================================================
// app/api/spouse-journal/route.ts
//
// GET    → list spouse journal entries
// POST   → create entry (awards relationship XP + checks milestones)
// PATCH  → update entry or toggle sharing
// DELETE → delete entry
//
// GET /api/spouse-journal?impact=true → submit impact check-in
// POST /api/spouse-journal?impact=true → save impact check-in
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { encrypt, decrypt, encryptJournalEntry, decryptJournalEntries } from '@/lib/encryption';
import { awardRelationshipXP } from '@/lib/relationshipEngine';
import { checkContenderMilestones, analyzeTrustTrend } from '@/lib/spouseExperience';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { safeError } from '@/lib/security';
import { checkFeatureGate } from '@/lib/stripe/featureGate';

const ENCRYPTED_FIELDS = ['freewrite', 'impact', 'needs', 'boundaries'] as const;

function encryptSpouseEntry(entry: Record<string, any>, userId: string) {
  const encrypted = { ...entry };
  for (const field of ENCRYPTED_FIELDS) {
    if (encrypted[field]) encrypted[field] = encrypt(encrypted[field], userId);
  }
  return encrypted;
}

function decryptSpouseEntry(entry: Record<string, any>, userId: string) {
  if (!entry) return entry;
  const decrypted = { ...entry };
  for (const field of ENCRYPTED_FIELDS) {
    if (decrypted[field]) decrypted[field] = decrypt(decrypted[field], userId);
  }
  return decrypted;
}

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  // Feature gate: spouse experience requires Pro+
  const gate = await checkFeatureGate(user.id, 'spouseExperience');
  if (!gate.allowed) {
    return NextResponse.json(
      { error: gate.reason, upgrade_to: gate.requiredPlan },
      { status: 403 },
    );
  }

  const url = new URL(req.url);
  const db = createServiceClient();

  // Impact check-in history
  if (url.searchParams.get('impact') === 'true') {
    const { data } = await db.from('spouse_impact')
      .select('*')
      .eq('spouse_user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    return NextResponse.json({
      impacts: (data || []).map((i: any) => ({
        ...i,
        reflection: i.reflection ? decrypt(i.reflection, user.id) : null,
      })),
    });
  }

  // Journal entries
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);
  const offset = parseInt(url.searchParams.get('offset') || '0');

  const { data: entries } = await db.from('spouse_journal')
    .select('*')
    .eq('spouse_user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const decrypted = (entries || []).map((e: any) => decryptSpouseEntry(e, user.id));

  return NextResponse.json({ entries: decrypted });
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  // Feature gate: spouse experience requires Pro+
  const gate = await checkFeatureGate(user.id, 'spouseExperience');
  if (!gate.allowed) {
    return NextResponse.json(
      { error: gate.reason, upgrade_to: gate.requiredPlan },
      { status: 403 },
    );
  }

  const url = new URL(req.url);
  const db = createServiceClient();

  // Verify this user IS a spouse partner
  const { data: partnerRecord } = await db.from('partners')
    .select('id, user_id, relationship')
    .eq('partner_user_id', user.id)
    .eq('status', 'accepted')
    .eq('relationship', 'spouse')
    .single();

  if (!partnerRecord) {
    return NextResponse.json({ error: 'Spouse partner relationship not found' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

  // ── Impact check-in ─────────────────────────────────────
  if (url.searchParams.get('impact') === 'true') {
    const { feelings, trust_level, feels_safe, reflection, visible_to_partner } = body;

    const { data: impact, error } = await db.from('spouse_impact').insert({
      spouse_user_id: user.id,
      partner_id: partnerRecord.id,
      feelings: feelings || [],
      trust_level: trust_level || null,
      feels_safe: feels_safe ?? null,
      reflection: reflection ? encrypt(reflection, user.id) : null,
      visible_to_partner: visible_to_partner ?? false,
    }).select().single();

    if (error) return safeError('POST /api/spouse-journal', error);

    // Update trust trend
    await analyzeTrustTrend(user.id, partnerRecord.id);

    // Award relationship XP
    await awardRelationshipXP(user.id, 'partner', 'checkin_response', { type: 'impact_checkin' }).catch(() => {});

    // Check milestones
    const newMilestones = await checkContenderMilestones(user.id, partnerRecord.id);

    return NextResponse.json({ impact, new_milestones: newMilestones }, { status: 201 });
  }

  // ── Journal entry ───────────────────────────────────────
  const { freewrite, impact, needs, boundaries, mood, tags, triggered_by_alert } = body;

  if (!freewrite?.trim() && !impact?.trim() && !needs?.trim() && !boundaries?.trim()) {
    return NextResponse.json({ error: 'At least one field required' }, { status: 400 });
  }

  const entryData = encryptSpouseEntry({
    spouse_user_id: user.id,
    partner_id: partnerRecord.id,
    freewrite: freewrite?.trim() || null,
    impact: impact?.trim() || null,
    needs: needs?.trim() || null,
    boundaries: boundaries?.trim() || null,
    mood: mood || null,
    tags: tags || [],
    triggered_by_alert: triggered_by_alert || null,
  }, user.id);

  const { data: entry, error } = await db.from('spouse_journal')
    .insert(entryData).select().single();

  if (error) return safeError('POST /api/spouse-journal', error);

  // Award relationship XP (bonus — not required)
  await awardRelationshipXP(user.id, 'partner', 'sent_encouragement', {
    type: 'spouse_journal', bonus_xp: 8,
  }).catch(() => {});

  // Check milestones
  const newMilestones = await checkContenderMilestones(user.id, partnerRecord.id);

  return NextResponse.json({
    entry: decryptSpouseEntry(entry, user.id),
    new_milestones: newMilestones,
    xp_earned: 8,
  }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  // Feature gate: spouse experience requires Pro+
  const gate = await checkFeatureGate(user.id, 'spouseExperience');
  if (!gate.allowed) {
    return NextResponse.json(
      { error: gate.reason, upgrade_to: gate.requiredPlan },
      { status: 403 },
    );
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  const { id, share } = body;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const db = createServiceClient();

  // Toggle sharing
  if (share !== undefined) {
    const { data, error } = await db.from('spouse_journal')
      .update({
        shared_with_partner: share,
        shared_at: share ? new Date().toISOString() : null,
      })
      .eq('id', id)
      .eq('spouse_user_id', user.id)
      .select().single();

    if (error) return safeError('PATCH /api/spouse-journal', error);

    // Milestone check for first share
    const { data: partnerRecord } = await db.from('partners')
      .select('id').eq('partner_user_id', user.id).eq('status', 'accepted').single();
    if (partnerRecord && share) {
      await checkContenderMilestones(user.id, partnerRecord.id);
    }

    return NextResponse.json({ entry: decryptSpouseEntry(data, user.id) });
  }

  // Update content
  const updates = encryptSpouseEntry({
    freewrite: body.freewrite?.trim() || null,
    impact: body.impact?.trim() || null,
    needs: body.needs?.trim() || null,
    boundaries: body.boundaries?.trim() || null,
    mood: body.mood || null,
    tags: body.tags || [],
    updated_at: new Date().toISOString(),
  }, user.id);

  const { data, error } = await db.from('spouse_journal')
    .update(updates).eq('id', id).eq('spouse_user_id', user.id).select().single();

  if (error) return safeError('PATCH /api/spouse-journal', error);
  return NextResponse.json({ entry: decryptSpouseEntry(data, user.id) });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  // Feature gate: spouse experience requires Pro+
  const gate = await checkFeatureGate(user.id, 'spouseExperience');
  if (!gate.allowed) {
    return NextResponse.json(
      { error: gate.reason, upgrade_to: gate.requiredPlan },
      { status: 403 },
    );
  }

  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const db = createServiceClient();
  const { error } = await db.from('spouse_journal').delete()
    .eq('id', id).eq('spouse_user_id', user.id);

  if (error) return safeError('DELETE /api/spouse-journal', error);
  return NextResponse.json({ deleted: true });
}
