import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ────────────────────────────────────────────────────

const mockGetUser = vi.fn();
const mockSignOut = vi.fn();

vi.mock('@/lib/supabase', () => ({
  createServerSupabaseClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
      signOut: mockSignOut,
    },
  })),
}));

vi.mock('@/lib/rateLimit', () => ({
  actionLimiter: {},
  checkUserRate: vi.fn(() => null),
}));

// ── Helpers ──────────────────────────────────────────────────

function mockAuthUser(user: { id: string; email: string } | null) {
  mockGetUser.mockResolvedValue({ data: { user } });
}

// ── Tests ────────────────────────────────────────────────────

describe('POST /api/auth/signout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignOut.mockResolvedValue({ error: null });
  });

  it('returns 401 when not authenticated', async () => {
    mockAuthUser(null);

    const { POST } = await import('../signout/route');
    const res = await POST();

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe('Unauthorized');
  });

  it('calls supabase signOut and returns ok when authenticated', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });

    const { POST } = await import('../signout/route');
    const res = await POST();

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(mockSignOut).toHaveBeenCalledOnce();
  });

  it('returns the response shape { ok: true }', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });

    const { POST } = await import('../signout/route');
    const res = await POST();

    const json = await res.json();
    expect(Object.keys(json)).toEqual(['ok']);
    expect(json.ok).toBe(true);
  });
});
