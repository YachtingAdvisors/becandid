import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const mockGetUser = vi.fn();
const mockEnsureUserRow = vi.fn();
const mockCheckUserRate = vi.fn(() => null);
const mockFrom = vi.fn();

vi.mock('@/lib/supabase', () => ({
  createServerSupabaseClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
  createServiceClient: vi.fn(() => ({
    from: mockFrom,
  })),
  ensureUserRow: mockEnsureUserRow,
}));

vi.mock('@/lib/rateLimit', () => ({
  actionLimiter: {},
  checkUserRate: mockCheckUserRate,
}));

function makeRequest(body: unknown): NextRequest {
  return new Request('http://localhost:3000/api/partners/accept', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

function makeThenableChain(result: { data: any; error?: any }) {
  const chain: any = {};
  const methods = ['select', 'eq', 'in', 'maybeSingle', 'update', 'single'];
  methods.forEach((method) => {
    chain[method] = vi.fn(() => chain);
  });
  chain.maybeSingle = vi.fn(() => Promise.resolve(result));
  chain.single = vi.fn(() => Promise.resolve(result));
  Object.defineProperty(chain, 'then', {
    value: (resolve: (value: typeof result) => void) => resolve(result),
    configurable: true,
  });
  return chain;
}

describe('POST /api/partners/accept', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckUserRate.mockReturnValue(null);
  });

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const { POST } = await import('../accept/route');
    const res = await POST(makeRequest({ token: 'invite-token' }));

    expect(res.status).toBe(401);
  });

  it('rejects authenticated users whose email does not match the invite', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1', email: 'different@example.com' } },
    });

    let fromCall = 0;
    mockFrom.mockImplementation(() => {
      fromCall += 1;
      if (fromCall === 1) {
        return makeThenableChain({
          data: {
            id: 'partner-1',
            partner_email: 'invited@example.com',
            invite_expires_at: '2099-01-01T00:00:00.000Z',
          },
        });
      }
      return makeThenableChain({ data: null });
    });

    const { POST } = await import('../accept/route');
    const res = await POST(makeRequest({ token: 'invite-token' }));
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json.error).toMatch(/invited email/i);
    expect(mockEnsureUserRow).toHaveBeenCalled();
  });

  it('rejects expired invites before activating the partnership', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1', email: 'invited@example.com' } },
    });

    mockFrom.mockImplementation(() => makeThenableChain({
      data: {
        id: 'partner-1',
        partner_email: 'invited@example.com',
        invite_expires_at: '2000-01-01T00:00:00.000Z',
      },
    }));

    const { POST } = await import('../accept/route');
    const res = await POST(makeRequest({ token: 'invite-token' }));
    const json = await res.json();

    expect(res.status).toBe(410);
    expect(json.error).toMatch(/expired/i);
  });
});
