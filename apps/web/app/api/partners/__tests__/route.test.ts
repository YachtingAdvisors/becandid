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
  ensureUserRow: vi.fn(),
}));

vi.mock('@/lib/rateLimit', () => ({
  actionLimiter: {},
  checkUserRate: vi.fn(() => null),
}));

vi.mock('@/lib/security', () => ({
  safeError: vi.fn((_ctx: string, err: any, status = 500) =>
    new Response(JSON.stringify({ error: typeof err === 'string' ? err : 'Internal error' }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  ),
  sanitizeName: vi.fn((s: string) => s.trim()),
  sanitizeEmail: vi.fn((s: string) => s?.toLowerCase().trim() || null),
  sanitizePhone: vi.fn((s: string) => s),
  auditLog: vi.fn(),
  escapeHtml: vi.fn((s: string) => s),
}));

vi.mock('resend', () => ({
  Resend: vi.fn(() => ({
    emails: { send: vi.fn(() => Promise.resolve({ data: { id: 'email-1' } })) },
  })),
}));

vi.mock('@/lib/email/template', () => ({
  emailWrapper: vi.fn(() => '<html>email</html>'),
}));

// ── Helpers ──────────────────────────────────────────────────

function makeRequest(method: string, url: string, body?: any): NextRequest {
  const init: RequestInit = { method };
  if (body) {
    init.body = JSON.stringify(body);
    init.headers = { 'Content-Type': 'application/json' };
  }
  return new NextRequest(new URL(url, 'http://localhost:3000'), init);
}

function mockAuthUser(user: { id: string; email: string } | null) {
  mockGetUser.mockResolvedValue({ data: { user } });
}

function setupChainedQuery(returnValue: { data: any; error: any }) {
  const chain: any = {};
  const methods = ['select', 'insert', 'update', 'delete', 'eq', 'in', 'order', 'single', 'limit'];
  methods.forEach((m) => {
    chain[m] = vi.fn(() => chain);
  });
  chain.single.mockReturnValue(returnValue);
  Object.defineProperty(chain, 'then', {
    value: (resolve: any) => resolve(returnValue),
    configurable: true,
  });
  mockFrom.mockReturnValue(chain);
  return chain;
}

// ── Tests ────────────────────────────────────────────────────

describe('GET /api/partners', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockAuthUser(null);
    const req = makeRequest('GET', '/api/partners');

    const { GET } = await import('../route');
    const res = await GET(req);

    expect(res.status).toBe(401);
  });

  it('returns partners array on success', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });

    const fakePartners = [
      {
        id: 'p-1',
        partner_name: 'Jane',
        partner_email: 'jane@example.com',
        partner_phone: null,
        status: 'active',
        relationship: 'spouse',
        invited_at: new Date().toISOString(),
        accepted_at: new Date().toISOString(),
      },
    ];

    const chain: any = {};
    const methods = ['select', 'insert', 'update', 'delete', 'eq', 'in', 'order', 'single', 'limit'];
    methods.forEach((m) => {
      chain[m] = vi.fn(() => chain);
    });

    let fromCallCount = 0;
    mockFrom.mockImplementation(() => {
      fromCallCount++;
      // First call: partners query
      if (fromCallCount === 1) {
        const partnerChain = { ...chain };
        Object.defineProperty(partnerChain, 'then', {
          value: (resolve: any) => resolve({ data: fakePartners, error: null }),
          configurable: true,
        });
        methods.forEach((m) => { partnerChain[m] = vi.fn(() => partnerChain); });
        return partnerChain;
      }
      // Second call: users query for plan
      const planChain = { ...chain };
      planChain.single = vi.fn(() => ({
        data: { subscription_plan: 'free' },
        error: null,
      }));
      methods.forEach((m) => {
        if (m !== 'single') planChain[m] = vi.fn(() => planChain);
      });
      return planChain;
    });

    const req = makeRequest('GET', '/api/partners');

    const { GET } = await import('../route');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('partners');
    expect(json).toHaveProperty('partner');
    expect(json).toHaveProperty('maxPartners');
    expect(Array.isArray(json.partners)).toBe(true);
  });
});

describe('POST /api/partners', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockAuthUser(null);
    const req = makeRequest('POST', '/api/partners', {
      partner_name: 'Jane',
      partner_email: 'jane@example.com',
      relationship_type: 'spouse',
    });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(401);
  });

  it('returns 400 when partner_email is missing', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const req = makeRequest('POST', '/api/partners', {
      partner_name: 'Jane',
      relationship_type: 'spouse',
    });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Invalid data');
  });

  it('returns 400 with invalid email format', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const req = makeRequest('POST', '/api/partners', {
      partner_name: 'Jane',
      partner_email: 'not-an-email',
      relationship_type: 'spouse',
    });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('returns 400 when inviting yourself', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });

    // Need to set up chain for the partner limit check
    setupChainedQuery({ data: [], error: null });

    const req = makeRequest('POST', '/api/partners', {
      partner_name: 'Myself',
      partner_email: 'test@example.com',
      relationship_type: 'spouse',
    });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('You cannot be your own partner');
  });

  it('returns 201 with partner on success', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });

    const fakePartner = {
      id: 'p-1',
      user_id: 'user-1',
      partner_email: 'jane@example.com',
      partner_name: 'Jane',
      invite_token: 'token-abc',
      status: 'pending',
    };

    const chain: any = {};
    const methods = ['select', 'insert', 'update', 'delete', 'eq', 'in', 'order', 'single', 'limit'];
    methods.forEach((m) => {
      chain[m] = vi.fn(() => chain);
    });

    let fromCallCount = 0;
    mockFrom.mockImplementation(() => {
      fromCallCount++;
      const c = { ...chain };
      methods.forEach((m) => { c[m] = vi.fn(() => c); });

      if (fromCallCount === 1) {
        // existing partners check
        Object.defineProperty(c, 'then', {
          value: (resolve: any) => resolve({ data: [], error: null }),
          configurable: true,
        });
      } else if (fromCallCount === 2) {
        // user plan check
        c.single = vi.fn(() => ({ data: { subscription_plan: 'free' }, error: null }));
      } else if (fromCallCount === 3) {
        // insert partner
        c.single = vi.fn(() => ({ data: fakePartner, error: null }));
      } else {
        // subsequent calls (user update, trial check, profile name)
        c.single = vi.fn(() => ({ data: { name: 'Test User', subscription_status: 'active' }, error: null }));
        Object.defineProperty(c, 'then', {
          value: (resolve: any) => resolve({ data: null, error: null }),
          configurable: true,
        });
      }
      return c;
    });

    const req = makeRequest('POST', '/api/partners', {
      partner_name: 'Jane',
      partner_email: 'jane@example.com',
      relationship_type: 'spouse',
    });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json).toHaveProperty('partner');
    expect(json.partner.id).toBe('p-1');
  });
});
