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
  checkUserRate: vi.fn(() => null),
}));

// ── Helpers ──────────────────────────────────────────────────

function makeRequest(method: string, url: string): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:3000'), { method });
}

function mockAuthUser(user: { id: string; email: string } | null) {
  mockGetUser.mockResolvedValue({ data: { user } });
}

function setupChainedQuery(returnValue: { data: any; error: any }) {
  const chain: any = {};
  const methods = ['select', 'eq', 'order', 'limit', 'single'];
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

describe('GET /api/alerts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockAuthUser(null);
    const req = makeRequest('GET', '/api/alerts');

    const { GET } = await import('../route');
    const res = await GET(req);

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe('Unauthorized');
  });

  it('returns alerts array with expected shape', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });

    const fakeAlerts = [
      {
        id: 'alert-1',
        sent_at: new Date().toISOString(),
        email_sent: true,
        sms_sent: false,
        ai_guide_user: 'Stay strong.',
        ai_guide_partner: null,
        events: [
          {
            id: 'evt-1',
            category: 'explicit',
            severity: 'high',
            platform: 'browser',
            app_name: 'Chrome',
            timestamp: new Date().toISOString(),
          },
        ],
        conversations: [],
      },
    ];

    setupChainedQuery({ data: fakeAlerts, error: null });

    const req = makeRequest('GET', '/api/alerts');

    const { GET } = await import('../route');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('alerts');
    expect(Array.isArray(json.alerts)).toBe(true);
    expect(json.alerts).toHaveLength(1);

    const alert = json.alerts[0];
    expect(alert).toHaveProperty('id');
    expect(alert).toHaveProperty('sent_at');
    expect(alert).toHaveProperty('email_sent');
    expect(alert).toHaveProperty('sms_sent');
    expect(alert).toHaveProperty('events');
    expect(alert).toHaveProperty('conversations');
  });

  it('returns empty array when no alerts exist', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    setupChainedQuery({ data: null, error: null });

    const req = makeRequest('GET', '/api/alerts');

    const { GET } = await import('../route');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.alerts).toEqual([]);
  });

  it('respects limit parameter', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const chain = setupChainedQuery({ data: [], error: null });

    const req = makeRequest('GET', '/api/alerts?limit=10');

    const { GET } = await import('../route');
    await GET(req);

    expect(chain.limit).toHaveBeenCalledWith(10);
  });

  it('caps limit at 100', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const chain = setupChainedQuery({ data: [], error: null });

    const req = makeRequest('GET', '/api/alerts?limit=999');

    const { GET } = await import('../route');
    await GET(req);

    expect(chain.limit).toHaveBeenCalledWith(100);
  });
});
