export const dynamic = 'force-dynamic';
// ============================================================
// app/api/content-filter/route.ts
//
// CRUD API for user's custom content filter rules.
//   GET    — list user's custom block/allow rules
//   POST   — add a new rule (domain, type, category)
//   DELETE — remove a rule by ID
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { getUserContentRules, addContentRule, removeContentRule } from '@/lib/contentFilter';

// ── GET: List user's rules ───────────────────────────────────

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = await checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  const rules = await getUserContentRules(user.id);
  return NextResponse.json({ rules });
}

// ── POST: Add a new rule ─────────────────────────────────────

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = await checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  const body = await req.json();
  const { domain, rule_type, category } = body;

  if (!domain || typeof domain !== 'string' || domain.length > 253) {
    return NextResponse.json({ error: 'Invalid domain' }, { status: 400 });
  }
  if (!rule_type || !['block', 'allow'].includes(rule_type)) {
    return NextResponse.json({ error: 'Invalid rule_type. Must be "block" or "allow".' }, { status: 400 });
  }

  const rule = await addContentRule(user.id, {
    domain: domain.trim(),
    rule_type,
    category: category || undefined,
  });

  if (!rule) {
    return NextResponse.json({ error: 'Failed to create rule' }, { status: 500 });
  }

  // Audit log
  const db = createServiceClient();
  await db.from('audit_log').insert({
    user_id: user.id,
    action: 'content_rule_added',
    metadata: { domain, rule_type, category },
  });

  return NextResponse.json({ rule }, { status: 201 });
}

// ── DELETE: Remove a rule ────────────────────────────────────

export async function DELETE(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = await checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  const url = new URL(req.url);
  const ruleId = url.searchParams.get('id');
  if (!ruleId) {
    return NextResponse.json({ error: 'Missing rule ID' }, { status: 400 });
  }

  const success = await removeContentRule(user.id, ruleId);
  if (!success) {
    return NextResponse.json({ error: 'Failed to delete rule' }, { status: 500 });
  }

  // Audit log
  const db = createServiceClient();
  await db.from('audit_log').insert({
    user_id: user.id,
    action: 'content_rule_removed',
    metadata: { rule_id: ruleId },
  });

  return NextResponse.json({ deleted: true });
}
