// ============================================================
// Be Candid — Guardian Controls
//
// Invite, accept, revoke guardians and fetch guardian dashboards.
// ============================================================

import { createServiceClient } from './supabase';
import { generateInviteToken } from '@be-candid/shared';
import type { GuardianRelationship, GuardianPermissions } from '@be-candid/shared';

// ── Invite a guardian ──────────────────────────────────────
// The inviter can be either a teen inviting a parent or a parent
// inviting themselves to supervise a teen (via email).
export async function inviteGuardian(
  inviterUserId: string,
  email: string,
  relationship: GuardianRelationship
): Promise<string> {
  const db = createServiceClient();
  const token = generateInviteToken();

  // Determine if inviter is the teen or the guardian
  // For now, the inviter is always the teen (teen sends invite to a guardian)
  const { error } = await db.from('guardians').insert({
    guardian_user_id: inviterUserId, // Placeholder — replaced on accept
    teen_user_id: inviterUserId,
    relationship,
    status: 'pending',
    invite_token: token,
    permissions: {
      view_events: true,
      view_journal: false, // Journal is SACRED — never default true
      manage_content_filter: true,
      manage_screen_time: true,
      receive_alerts: true,
      manage_settings: false,
    },
  });

  if (error) {
    console.error('Failed to create guardian invite:', error);
    throw new Error('Failed to create guardian invite');
  }

  // TODO: Send invite email to the guardian email address
  // await sendGuardianInviteEmail(email, token, inviterUserId);

  return token;
}

// ── Accept guardian invite ─────────────────────────────────
export async function acceptGuardianInvite(
  token: string,
  guardianUserId: string
): Promise<void> {
  const db = createServiceClient();

  const { data: invite, error: fetchError } = await db
    .from('guardians')
    .select('*')
    .eq('invite_token', token)
    .eq('status', 'pending')
    .single();

  if (fetchError || !invite) {
    throw new Error('Invalid or expired invite token');
  }

  // Prevent self-guardianship
  if (invite.teen_user_id === guardianUserId) {
    throw new Error('Cannot be your own guardian');
  }

  const { error } = await db
    .from('guardians')
    .update({
      guardian_user_id: guardianUserId,
      status: 'active',
      accepted_at: new Date().toISOString(),
    })
    .eq('id', invite.id);

  if (error) {
    console.error('Failed to accept guardian invite:', error);
    throw new Error('Failed to accept invite');
  }
}

// ── Revoke guardian access ─────────────────────────────────
export async function revokeGuardian(
  userId: string,
  guardianId: string
): Promise<void> {
  const db = createServiceClient();

  // Either the teen or the guardian can revoke
  const { error } = await db
    .from('guardians')
    .update({ status: 'revoked' })
    .eq('id', guardianId)
    .or(`teen_user_id.eq.${userId},guardian_user_id.eq.${userId}`);

  if (error) {
    console.error('Failed to revoke guardian:', error);
    throw new Error('Failed to revoke guardian');
  }
}

// ── Get guardian dashboard data for a teen ──────────────────
export async function getGuardianDashboard(
  guardianUserId: string,
  teenUserId: string
): Promise<{
  teen: { name: string; account_mode: string };
  recentEvents: any[];
  screenTime: any[];
  focusScore: number;
  alertCount: number;
  contentFilterLevel: string;
}> {
  const db = createServiceClient();

  // Verify guardian relationship
  const { data: relationship } = await db
    .from('guardians')
    .select('permissions')
    .eq('guardian_user_id', guardianUserId)
    .eq('teen_user_id', teenUserId)
    .eq('status', 'active')
    .single();

  if (!relationship) {
    throw new Error('No active guardian relationship');
  }

  // Fetch teen profile
  const { data: teen } = await db
    .from('users')
    .select('name, account_mode')
    .eq('id', teenUserId)
    .single();

  // Fetch recent events (guardian can see these)
  const { data: events } = await db
    .from('events')
    .select('id, category, severity, platform, timestamp')
    .eq('user_id', teenUserId)
    .order('timestamp', { ascending: false })
    .limit(20);

  // Fetch screen time (today)
  const today = new Date().toISOString().split('T')[0];
  const { data: screenTime } = await db
    .from('screen_time_usage')
    .select('category, minutes_used')
    .eq('user_id', teenUserId)
    .eq('date', today);

  // Count alerts
  const { count: alertCount } = await db
    .from('alerts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', teenUserId);

  // Get content filter level from user settings
  const { data: settings } = await db
    .from('users')
    .select('content_filter_level')
    .eq('id', teenUserId)
    .single();

  return {
    teen: {
      name: teen?.name || 'Unknown',
      account_mode: teen?.account_mode || 'teen',
    },
    recentEvents: events || [],
    screenTime: screenTime || [],
    focusScore: 0, // Computed by focusIntegration — placeholder
    alertCount: alertCount || 0,
    contentFilterLevel: settings?.content_filter_level || 'standard',
  };
}

// ── Update guardian permissions ─────────────────────────────
export async function updateGuardianPermissions(
  guardianId: string,
  permissions: Partial<GuardianPermissions>
): Promise<void> {
  const db = createServiceClient();

  // Fetch current permissions
  const { data: current } = await db
    .from('guardians')
    .select('permissions')
    .eq('id', guardianId)
    .single();

  if (!current) {
    throw new Error('Guardian not found');
  }

  // SAFETY: Journal access can NEVER be enabled — it's sacred therapeutic space
  const merged = {
    ...(current.permissions as GuardianPermissions),
    ...permissions,
    view_journal: false, // ENFORCED: journal is always private
  };

  const { error } = await db
    .from('guardians')
    .update({ permissions: merged })
    .eq('id', guardianId);

  if (error) {
    console.error('Failed to update guardian permissions:', error);
    throw new Error('Failed to update permissions');
  }
}
