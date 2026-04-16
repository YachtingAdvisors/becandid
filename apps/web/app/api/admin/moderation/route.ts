export const dynamic = 'force-dynamic';
// ============================================================
// app/api/admin/moderation/route.ts
//
// GET  -> List community posts needing review (flagged or recent).
// PATCH -> Approve, hide, or delete a post.
// Auth: must be authenticated and hold users.platform_role='admin'.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { requireAdminAccess } from '@/lib/adminAccess';
import { adminLimiter, checkUserRate } from '@/lib/rateLimit';

// Simple keyword flag list for content that may need review.
const FLAGGED_KEYWORDS = [
  'suicide',
  'kill myself',
  'self-harm',
  'cutting',
  'overdose',
  'end it all',
  'want to die',
  'hate myself',
  'worthless',
  'no reason to live',
  'trigger',
  'relapse',
  'porn',
  'nude',
  'nsfw',
  'drugs',
  'dealer',
];

function isFlagged(content: string): boolean {
  const lower = content.toLowerCase();
  return FLAGGED_KEYWORDS.some((kw) => lower.includes(kw));
}

async function verifyAdmin(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const adminAccess = await requireAdminAccess(supabase, user);
  if (!adminAccess.ok) {
    return {
      error: NextResponse.json({ error: adminAccess.error }, { status: adminAccess.status }),
    };
  }

  const blocked = checkUserRate(adminLimiter, adminAccess.user.id);
  if (blocked) return { error: blocked };

  return { user: adminAccess.user };
}

// ── GET: List posts for moderation ──────────────────────────
export async function GET(req: NextRequest) {
  const auth = await verifyAdmin(req);
  if ('error' in auth && auth.error) return auth.error;

  const db = createServiceClient();
  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 200);
  const offset = parseInt(url.searchParams.get('offset') || '0', 10);
  const filter = url.searchParams.get('filter') || 'all'; // all | flagged

  const { data: posts, error, count } = await db
    .from('community_posts')
    .select('id, anonymous_name, content, post_type, hearts, created_at', {
      count: 'exact',
    })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const enriched = (posts || []).map((p) => ({
    ...p,
    flagged: isFlagged(p.content),
  }));

  const filtered =
    filter === 'flagged' ? enriched.filter((p) => p.flagged) : enriched;

  return NextResponse.json({
    items: filtered,
    total: filter === 'flagged' ? filtered.length : (count ?? 0),
    limit,
    offset,
  });
}

// ── PATCH: Moderate a post (approve, hide, delete) ──────────
export async function PATCH(req: NextRequest) {
  const auth = await verifyAdmin(req);
  if ('error' in auth && auth.error) return auth.error;

  const db = createServiceClient();

  let body: { action: string; post_ids: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { action, post_ids } = body;

  if (!action || !Array.isArray(post_ids) || post_ids.length === 0) {
    return NextResponse.json(
      { error: 'action and post_ids[] are required' },
      { status: 400 },
    );
  }

  if (!['approve', 'hide', 'delete'].includes(action)) {
    return NextResponse.json(
      { error: 'action must be approve, hide, or delete' },
      { status: 400 },
    );
  }

  if (action === 'delete') {
    const { error } = await db
      .from('community_posts')
      .delete()
      .in('id', post_ids);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ deleted: post_ids.length });
  }

  // For approve/hide we prepend a tag to the content so admins can
  // see which posts were reviewed. A real system would use a status
  // column; this is intentionally lightweight.
  if (action === 'hide') {
    const { error } = await db
      .from('community_posts')
      .update({ content: '[HIDDEN BY ADMIN]' })
      .in('id', post_ids);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ hidden: post_ids.length });
  }

  // "approve" is a no-op acknowledgment; return success
  return NextResponse.json({ approved: post_ids.length });
}
