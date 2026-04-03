// ============================================================
// app/dashboard/groups/page.tsx — Accountability Groups
// Server component: lists groups, create/join modals
// ============================================================

import { createServerSupabaseClient, createServiceClient, ensureUserRow } from '@/lib/supabase';
import type { Metadata } from 'next';
import GroupsClient from './GroupsClient';

export const metadata: Metadata = {
  title: 'Accountability Groups',
  description: 'Join or create small accountability groups with shared focus boards and check-ins.',
};

export default async function GroupsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const db = createServiceClient();
  await ensureUserRow(db, user);

  // Fetch groups server-side for initial render
  const { data: memberships } = await db
    .from('group_members')
    .select('group_id, display_name, role')
    .eq('user_id', user.id);

  let groups: Array<{
    id: string;
    name: string;
    description: string | null;
    invite_code: string;
    member_count: number;
    last_checkin: string | null;
    my_role: string;
  }> = [];

  if (memberships && memberships.length > 0) {
    const groupIds = memberships.map((m) => m.group_id);

    const [groupsRes, countRes, checkinsRes] = await Promise.all([
      db.from('accountability_groups')
        .select('id, name, description, invite_code, created_at')
        .in('id', groupIds),
      db.from('group_members')
        .select('group_id')
        .in('group_id', groupIds),
      db.from('group_checkins')
        .select('group_id, created_at')
        .in('group_id', groupIds)
        .order('created_at', { ascending: false }),
    ]);

    const countMap: Record<string, number> = {};
    (countRes.data ?? []).forEach((m) => {
      countMap[m.group_id] = (countMap[m.group_id] || 0) + 1;
    });

    const lastCheckinMap: Record<string, string> = {};
    (checkinsRes.data ?? []).forEach((c) => {
      if (!lastCheckinMap[c.group_id]) lastCheckinMap[c.group_id] = c.created_at;
    });

    const roleMap: Record<string, string> = {};
    memberships.forEach((m) => { roleMap[m.group_id] = m.role; });

    groups = (groupsRes.data ?? []).map((g) => ({
      id: g.id,
      name: g.name,
      description: g.description,
      invite_code: g.invite_code,
      member_count: countMap[g.id] || 0,
      last_checkin: lastCheckinMap[g.id] || null,
      my_role: roleMap[g.id] || 'member',
    }));
  }

  return <GroupsClient initialGroups={groups} />;
}
