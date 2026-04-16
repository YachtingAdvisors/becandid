import { describe, expect, it } from 'vitest';
import { getPlatformRoleForUser, requireAdminAccess } from '../adminAccess';

function makeSupabase(result: { data: { platform_role?: string | null } | null; error: { code?: string; message?: string } | null }) {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => result,
        }),
      }),
    }),
  };
}

describe('adminAccess', () => {
  it('treats admin platform_role as privileged access', async () => {
    const supabase = makeSupabase({ data: { platform_role: 'admin' }, error: null });

    const result = await requireAdminAccess(supabase, {
      id: 'user-1',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as any);

    expect(result).toMatchObject({ ok: true, role: 'admin' });
  });

  it('rejects non-admin users even when authenticated', async () => {
    const supabase = makeSupabase({ data: { platform_role: 'user' }, error: null });

    const result = await requireAdminAccess(supabase, {
      id: 'user-2',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as any);

    expect(result).toEqual({ ok: false, error: 'Forbidden', status: 403 });
  });

  it('surfaces role lookup failures as unavailable admin verification', async () => {
    const result = await getPlatformRoleForUser(
      makeSupabase({ data: null, error: { message: 'column users.platform_role does not exist' } }),
      'user-3',
    );

    expect(result).toEqual({ ok: false, error: 'unavailable' });
  });
});
