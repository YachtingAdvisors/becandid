// ============================================================
// Be Candid — Teen Mode
//
// Core logic for teen account restrictions and guardian lookups.
//
// Teen mode restrictions:
// - Content filter cannot be set to 'off'
// - Screen time rules set by guardian are enforced (teen can't change)
// - Journal is ALWAYS private (guardian cannot read it — this is sacred therapeutic space)
// - Guardian sees: events, alerts, screen time, focus scores
// - Guardian NEVER sees: journal entries, conversation guide content, mood data
// ============================================================

import { createServiceClient } from './supabase';
import type { Guardian } from '@be-candid/shared';

// ── Settings that require guardian approval in teen mode ────
const GUARDIAN_CONTROLLED_SETTINGS = new Set([
  'content_filter_level',
  'monitoring_enabled',
  'screen_time_rules',
  'account_mode',
]);

// ── Check if user is in teen mode ──────────────────────────
export async function isTeenAccount(userId: string): Promise<boolean> {
  const db = createServiceClient();
  const { data } = await db
    .from('users')
    .select('account_mode')
    .eq('id', userId)
    .single();
  return data?.account_mode === 'teen';
}

// ── Check if a setting change requires guardian approval ────
export async function requiresGuardianApproval(
  userId: string,
  setting: string
): Promise<boolean> {
  if (!GUARDIAN_CONTROLLED_SETTINGS.has(setting)) return false;
  const teen = await isTeenAccount(userId);
  if (!teen) return false;

  // Check if teen has an active guardian with manage_settings permission
  const db = createServiceClient();
  const { data: guardians } = await db
    .from('guardians')
    .select('permissions')
    .eq('teen_user_id', userId)
    .eq('status', 'active');

  if (!guardians || guardians.length === 0) return false;

  return guardians.some(
    (g: { permissions: { manage_settings?: boolean } }) =>
      g.permissions?.manage_settings === true
  );
}

// ── Get teen's guardian(s) ──────────────────────────────────
export async function getGuardians(teenUserId: string): Promise<Guardian[]> {
  const db = createServiceClient();
  const { data, error } = await db
    .from('guardians')
    .select('*')
    .eq('teen_user_id', teenUserId)
    .in('status', ['pending', 'active'])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch guardians:', error);
    return [];
  }
  return (data as Guardian[]) || [];
}

// ── Check if user is a guardian for any teens ──────────────
export async function getGuardedTeens(
  guardianUserId: string
): Promise<string[]> {
  const db = createServiceClient();
  const { data, error } = await db
    .from('guardians')
    .select('teen_user_id')
    .eq('guardian_user_id', guardianUserId)
    .eq('status', 'active');

  if (error) {
    console.error('Failed to fetch guarded teens:', error);
    return [];
  }
  return (data || []).map((row: { teen_user_id: string }) => row.teen_user_id);
}
