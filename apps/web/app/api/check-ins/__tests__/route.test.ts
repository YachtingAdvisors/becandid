import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Mocks ────────────────────────────────────────────────────

const mockGetUser = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase', () => ({
  createServerSupabaseClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
  createServiceClient: vi.fn(() => ({
    from: mockFrom,
  })),
}));

vi.mock('@/lib/rateLimit', () => ({
  actionLimiter: {},
  checkUserRate: vi.fn(async () => null),
}));

vi.mock('@/lib/checkInEngine', () => ({
  getCheckInStats: vi.fn(() =>
    Promise.resolve({
      total: 5,
      confirmed: 3,
      streak: 2,
      lastCheckIn: new Date().toISOString(),
    }),
  ),
}));

vi.mock('@/lib/security', () => ({
  safeError: vi.fn((err: any) => typeof err === 'string' ? err : 'Internal error'),
}));

// ── Helpers ──────────────────────────────────────────────────

function makeRequest(method: string, url: string, body?: any): NextRequest {
  const init: RequestInit = { method };
  if (body) {
    init.body = JSON.stringify(body);
    init.headers = { 'Content-Type': 'application/json' };
  }
  return new NextRequest(new URL(url, 'http://localhost:3000'), init as any);
}

function mockAuthUser(user: { id: string; email: string } | null) {
  mockGetUser.mockResolvedValue({ data: { user } });
}

function setupChainedQuery(returnValue: { data: any; error: any }) {
  const chain: any = {};
  const methods = ['select', 'insert', 'update', 'delete', 'eq', 'or', 'order', 'limit', 'single'];
  methods.forEach((m) => {
    chain[m] = vi.fn(() => chain);
  });
  Object.defineProperty(chain, 'then', {
    value: (resolve: any) => resolve(returnValue),
    configurable: true,
  });
  mockFrom.mockReturnValue(chain);
  return chain;
}

// ── Tests ────────────────────────────────────────────────────

describe('GET /api/check-ins', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockAuthUser(null);
    const req = makeRequest('GET', '/api/check-ins');

    const { GET } = await import('../route');
    const res = await GET(req);

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe('Unauthorized');
  });

  it('returns check_ins array and stats on success', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });

    const fakeCheckIns = [
      {
        id: 'ci-1',
        user_id: 'user-1',
        partner_user_id: 'partner-1',
        sent_at: new Date().toISOString(),
        user_confirmed: true,
        partner_confirmed: false,
      },
    ];

    setupChainedQuery({ data: fakeCheckIns, error: null });

    const req = makeRequest('GET', '/api/check-ins');

    const { GET } = await import('../route');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('checkIns');
    expect(json).toHaveProperty('stats');
    expect(Array.isArray(json.checkIns)).toBe(true);
    expect(json.checkIns).toHaveLength(1);
    expect(json.stats).toHaveProperty('total');
    expect(json.stats).toHaveProperty('streak');
  });

  it('returns empty array when no check-ins exist', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    setupChainedQuery({ data: null, error: null });

    const req = makeRequest('GET', '/api/check-ins');

    const { GET } = await import('../route');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.checkIns).toEqual([]);
  });

  it('respects role=partner filter', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const chain = setupChainedQuery({ data: [], error: null });

    const req = makeRequest('GET', '/api/check-ins?role=partner');

    const { GET } = await import('../route');
    await GET(req);

    // Should call eq with partner_user_id
    expect(chain.eq).toHaveBeenCalledWith('partner_user_id', 'user-1');
  });

  it('respects role=user filter', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const chain = setupChainedQuery({ data: [], error: null });

    const req = makeRequest('GET', '/api/check-ins?role=user');

    const { GET } = await import('../route');
    await GET(req);

    expect(chain.eq).toHaveBeenCalledWith('user_id', 'user-1');
  });
});
