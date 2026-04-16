import type { SupabaseClient, User } from '@supabase/supabase-js';

export const PLATFORM_ROLE_VALUES = ['user', 'admin'] as const;
export type PlatformRole = typeof PLATFORM_ROLE_VALUES[number];

type RoleLookupClient = SupabaseClient;

type AdminAccessSuccess = {
  ok: true;
  user: User;
  role: PlatformRole;
};

type AdminAccessFailure = {
  ok: false;
  error: string;
  status: 401 | 403 | 503;
};

type PlatformRoleLookup =
  | { ok: true; role: PlatformRole }
  | { ok: false; error: 'unavailable' };

export function isPlatformAdminRole(role: string | null | undefined): role is 'admin' {
  return role === 'admin';
}

function normalizePlatformRole(role: string | null | undefined): PlatformRole {
  return role === 'admin' ? 'admin' : 'user';
}

export async function getPlatformRoleForUser(
  supabase: RoleLookupClient,
  userId: string,
): Promise<PlatformRoleLookup> {
  const { data, error } = await supabase
    .from('users')
    .select('platform_role')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    return { ok: false, error: 'unavailable' };
  }

  return {
    ok: true,
    role: normalizePlatformRole(data?.platform_role),
  };
}

export async function requireAdminAccess(
  supabase: RoleLookupClient,
  user: User | null,
): Promise<AdminAccessSuccess | AdminAccessFailure> {
  if (!user) {
    return { ok: false, error: 'Unauthorized', status: 401 };
  }

  const roleResult = await getPlatformRoleForUser(supabase, user.id);
  if (!roleResult.ok) {
    return { ok: false, error: 'Unable to verify admin access', status: 503 };
  }

  if (!isPlatformAdminRole(roleResult.role)) {
    return { ok: false, error: 'Forbidden', status: 403 };
  }

  return {
    ok: true,
    user,
    role: roleResult.role,
  };
}
