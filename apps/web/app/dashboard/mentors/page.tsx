export const dynamic = 'force-dynamic';
// ============================================================
// app/dashboard/mentors/page.tsx — Sponsor/Mentorship Matching
// Server component: fetches user streak, mentor profile, connections
// ============================================================

import { createServerSupabaseClient, createServiceClient, ensureUserRow } from '@/lib/supabase';
import type { Metadata } from 'next';
import MentorsClient from './MentorsClient';

export const metadata: Metadata = {
  title: 'Mentors',
  description: 'Find a mentor or become one. Connect with someone who has walked this road.',
};

export default async function MentorsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const db = createServiceClient();
  const profile = await ensureUserRow(db, user);
  const streak = profile?.current_streak ?? 0;

  // Check if user is already a mentor
  const { data: myMentorProfile } = await db
    .from('mentors')
    .select('id, display_name, bio, specialties, max_mentees, active, streak_at_signup, created_at')
    .eq('user_id', user.id)
    .maybeSingle();

  // Get active mentees if user is a mentor
  let myMentees: Array<{ id: string; mentee_user_id: string; started_at: string }> = [];
  if (myMentorProfile) {
    const { data: menteeRows } = await db
      .from('mentorship_connections')
      .select('id, mentee_user_id, started_at')
      .eq('mentor_id', myMentorProfile.id)
      .eq('status', 'active');
    myMentees = menteeRows ?? [];
  }

  // Check if user has an active mentor connection (as mentee)
  const { data: myMentorConnection } = await db
    .from('mentorship_connections')
    .select('id, mentor_id, started_at')
    .eq('mentee_user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  // Get mentor details if connected
  let connectedMentor: { display_name: string; bio: string | null; specialties: string[]; streak_at_signup: number } | null = null;
  if (myMentorConnection) {
    const { data: mentorRow } = await db
      .from('mentors')
      .select('display_name, bio, specialties, streak_at_signup')
      .eq('id', myMentorConnection.mentor_id)
      .single();
    connectedMentor = mentorRow ?? null;
  }

  // Get available mentors
  const { data: mentors } = await db
    .from('mentors')
    .select('id, user_id, display_name, bio, specialties, max_mentees, streak_at_signup, created_at')
    .eq('active', true)
    .order('created_at', { ascending: false });

  // Get active connection counts per mentor
  const mentorIds = (mentors ?? []).map((m) => m.id);
  const { data: connections } = mentorIds.length > 0
    ? await db
        .from('mentorship_connections')
        .select('mentor_id')
        .in('mentor_id', mentorIds)
        .eq('status', 'active')
    : { data: [] };

  const countMap: Record<string, number> = {};
  (connections ?? []).forEach((c) => {
    countMap[c.mentor_id] = (countMap[c.mentor_id] || 0) + 1;
  });

  const enrichedMentors = (mentors ?? []).map((m) => ({
    ...m,
    active_mentees: countMap[m.id] || 0,
    spots_open: m.max_mentees - (countMap[m.id] || 0),
    is_mine: m.user_id === user.id,
  }));

  return (
    <MentorsClient
      streak={streak}
      myMentorProfile={myMentorProfile}
      myMentees={myMentees}
      myMentorConnection={myMentorConnection ? {
        ...myMentorConnection,
        mentor: connectedMentor!,
      } : null}
      initialMentors={enrichedMentors}
    />
  );
}
