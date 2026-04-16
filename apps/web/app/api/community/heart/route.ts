export const dynamic = 'force-dynamic';
// POST /api/community/heart — toggle heart on a post

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { safeError } from '@/lib/security';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const blocked = await checkUserRate(actionLimiter, user.id);
    if (blocked) return blocked;

    const body = await req.json().catch(() => null);
    if (!body?.post_id) return NextResponse.json({ error: 'post_id required' }, { status: 400 });

    const db = createServiceClient();

    // Check if already hearted
    const { data: existing } = await db
      .from('community_hearts')
      .select('id')
      .eq('post_id', body.post_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      // Un-heart: remove heart row and decrement count
      await db.from('community_hearts').delete().eq('id', existing.id);
      // no rpc, do manual update
      // Decrement hearts count
      const { data: post } = await db
        .from('community_posts')
        .select('hearts')
        .eq('id', body.post_id)
        .single();

      const newCount = Math.max(0, (post?.hearts ?? 1) - 1);
      await db
        .from('community_posts')
        .update({ hearts: newCount })
        .eq('id', body.post_id);

      return NextResponse.json({ hearted: false, hearts: newCount });
    } else {
      // Heart: insert heart row and increment count
      const { error: heartErr } = await db
        .from('community_hearts')
        .insert({ post_id: body.post_id, user_id: user.id });

      if (heartErr) return safeError('POST /api/community/heart', heartErr);

      const { data: post } = await db
        .from('community_posts')
        .select('hearts')
        .eq('id', body.post_id)
        .single();

      const newCount = (post?.hearts ?? 0) + 1;
      await db
        .from('community_posts')
        .update({ hearts: newCount })
        .eq('id', body.post_id);

      return NextResponse.json({ hearted: true, hearts: newCount });
    }
  } catch (err) {
    return safeError('POST /api/community/heart', err);
  }
}
