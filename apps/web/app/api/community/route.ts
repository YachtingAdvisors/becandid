export const dynamic = 'force-dynamic';
// GET  /api/community — list recent posts
// POST /api/community — create a post

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { safeError, sanitizeText } from '@/lib/security';
import { getAnonymousName } from '@/lib/anonymousNames';

const VALID_TYPES = ['win', 'milestone', 'encouragement', 'gratitude'];
const MAX_POSTS_PER_DAY = 5;

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = createServiceClient();

    // Fetch last 50 posts
    const { data: posts, error: postsErr } = await db
      .from('community_posts')
      .select('id, anonymous_name, content, post_type, hearts, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (postsErr) return safeError('GET /api/community', postsErr);

    if (!posts || posts.length === 0) {
      return NextResponse.json({ posts: [] });
    }

    // Check which posts the current user has hearted
    const postIds = posts.map((p) => p.id);
    const { data: userHearts } = await db
      .from('community_hearts')
      .select('post_id')
      .eq('user_id', user.id)
      .in('post_id', postIds);

    const heartedSet = new Set((userHearts ?? []).map((h) => h.post_id));

    const enriched = posts.map((p) => ({
      ...p,
      hearted: heartedSet.has(p.id),
    }));

    return NextResponse.json({ posts: enriched });
  } catch (err) {
    return safeError('GET /api/community', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const blocked = await checkUserRate(actionLimiter, user.id);
    if (blocked) return blocked;

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

    const content = sanitizeText(body.content || '', 280);
    if (!content || content.length < 1) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const postType = VALID_TYPES.includes(body.post_type) ? body.post_type : 'win';

    const db = createServiceClient();

    // Enforce 5 posts per day
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { count } = await db
      .from('community_posts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', todayStart.toISOString());

    if ((count ?? 0) >= MAX_POSTS_PER_DAY) {
      return NextResponse.json(
        { error: `You can share up to ${MAX_POSTS_PER_DAY} posts per day.` },
        { status: 429 },
      );
    }

    const anonymousName = getAnonymousName(user.id);

    const { data: post, error: insertErr } = await db
      .from('community_posts')
      .insert({
        user_id: user.id,
        anonymous_name: anonymousName,
        content,
        post_type: postType,
      })
      .select('id, anonymous_name, content, post_type, hearts, created_at')
      .single();

    if (insertErr || !post) return safeError('POST /api/community', insertErr);

    return NextResponse.json({ post: { ...post, hearted: false } }, { status: 201 });
  } catch (err) {
    return safeError('POST /api/community', err);
  }
}
