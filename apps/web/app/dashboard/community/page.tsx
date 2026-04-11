export const dynamic = 'force-dynamic';
// ============================================================
// app/dashboard/community/page.tsx — Anonymous Community Feed
// Server component: fetches initial posts, renders client component
// ============================================================

import { createServerSupabaseClient, createServiceClient, ensureUserRow } from '@/lib/supabase';
import type { Metadata } from 'next';
import CommunityClient from './CommunityClient';

export const metadata: Metadata = {
  title: 'Community',
  description: 'Anonymous wins and encouragement from fellow travelers.',
};

export default async function CommunityPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const db = createServiceClient();
  await ensureUserRow(db, user);

  // Fetch initial posts
  const { data: posts } = await db
    .from('community_posts')
    .select('id, anonymous_name, content, post_type, hearts, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  // Check which posts the user has hearted
  const postIds = (posts ?? []).map((p) => p.id);
  const { data: userHearts } = postIds.length > 0
    ? await db
        .from('community_hearts')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds)
    : { data: [] };

  const heartedSet = new Set((userHearts ?? []).map((h) => h.post_id));

  const enrichedPosts = (posts ?? []).map((p) => ({
    ...p,
    hearted: heartedSet.has(p.id),
  }));

  return <CommunityClient initialPosts={enrichedPosts} />;
}
