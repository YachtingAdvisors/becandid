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

vi.mock('@/lib/security', () => ({
  safeError: vi.fn((_ctx: string, err: any) =>
    new Response(JSON.stringify({ error: typeof err === 'string' ? err : 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    }),
  ),
  sanitizeText: vi.fn((text: string, _max: number) => text?.trim() || ''),
  sanitizeName: vi.fn((name: string) => name?.trim() || ''),
}));

vi.mock('crypto', async () => {
  const actual = await vi.importActual('crypto');
  return {
    ...actual,
    randomBytes: vi.fn(() => Buffer.from('a1b2c3d4')),
  };
});

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

describe('GET /api/groups', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockAuthUser(null);
    const req = makeRequest('GET', '/api/groups');

    const { GET } = await import('../route');
    const res = await GET(req);

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe('Unauthorized');
  });

  it('returns empty groups array when user has no memberships', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });

    setupChainedQuery({ data: null, error: null });

    const req = makeRequest('GET', '/api/groups');

    const { GET } = await import('../route');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('groups');
    expect(json.groups).toEqual([]);
  });

  it('returns groups array with enriched data', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });

    const fakeMemberships = [
      { group_id: 'g-1', display_name: 'Member A', role: 'admin' },
    ];
    const fakeGroups = [
      {
        id: 'g-1',
        name: 'Recovery Bros',
        description: 'Daily accountability',
        invite_code: 'abc123',
        max_members: 10,
        created_at: new Date().toISOString(),
      },
    ];
    const fakeMemberCounts = [{ group_id: 'g-1' }, { group_id: 'g-1' }, { group_id: 'g-1' }];
    const fakeCheckins = [{ group_id: 'g-1', created_at: new Date().toISOString() }];

    let fromCallCount = 0;
    mockFrom.mockImplementation(() => {
      fromCallCount++;
      const chain: any = {};
      const methods = ['select', 'eq', 'in', 'order', 'single', 'limit'];
      methods.forEach((m) => { chain[m] = vi.fn(() => chain); });

      let data: any;
      switch (fromCallCount) {
        case 1: data = fakeMemberships; break; // group_members (user's memberships)
        case 2: data = fakeGroups; break;       // accountability_groups
        case 3: data = fakeMemberCounts; break; // group_members (counts)
        case 4: data = fakeCheckins; break;     // group_checkins
        default: data = null;
      }

      Object.defineProperty(chain, 'then', {
        value: (resolve: any) => resolve({ data, error: null }),
        configurable: true,
      });
      return chain;
    });

    const req = makeRequest('GET', '/api/groups');

    const { GET } = await import('../route');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('groups');
    expect(Array.isArray(json.groups)).toBe(true);
    expect(json.groups[0]).toHaveProperty('member_count', 3);
    expect(json.groups[0]).toHaveProperty('my_role', 'admin');
    expect(json.groups[0]).toHaveProperty('last_checkin');
  });
});

describe('POST /api/groups', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockAuthUser(null);
    const req = makeRequest('POST', '/api/groups', { name: 'Test Group' });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(401);
  });

  it('returns 400 when name is missing', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const req = makeRequest('POST', '/api/groups', { description: 'no name' });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Group name is required');
  });

  it('returns 400 when name is empty string', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const req = makeRequest('POST', '/api/groups', { name: '' });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Group name is required');
  });

  it('returns 400 when body is not valid JSON', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const req = new NextRequest(new URL('/api/groups', 'http://localhost:3000'), {
      method: 'POST',
      body: 'not json',
      headers: { 'Content-Type': 'application/json' },
    });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Invalid JSON');
  });

  it('returns 201 with group on success', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });

    const fakeGroup = {
      id: 'g-1',
      name: 'Recovery Group',
      description: null,
      invite_code: '61316232',
      max_members: 10,
      created_at: new Date().toISOString(),
    };

    let fromCallCount = 0;
    mockFrom.mockImplementation(() => {
      fromCallCount++;
      const chain: any = {};
      const methods = ['select', 'insert', 'eq', 'single'];
      methods.forEach((m) => { chain[m] = vi.fn(() => chain); });

      if (fromCallCount === 1) {
        // Insert group
        chain.single.mockReturnValue({ data: fakeGroup, error: null });
      } else {
        // Insert member
        Object.defineProperty(chain, 'then', {
          value: (resolve: any) => resolve({ data: null, error: null }),
          configurable: true,
        });
      }
      return chain;
    });

    const req = makeRequest('POST', '/api/groups', { name: 'Recovery Group' });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json).toHaveProperty('group');
    expect(json.group.name).toBe('Recovery Group');
    expect(json.group).toHaveProperty('invite_code');
  });
});

describe('PATCH /api/groups', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockAuthUser(null);
    const req = makeRequest('PATCH', '/api/groups', { group_id: 'g-1', name: 'New Name' });

    const { PATCH } = await import('../route');
    const res = await PATCH(req);

    expect(res.status).toBe(401);
  });

  it('returns 400 when group_id is missing', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const req = makeRequest('PATCH', '/api/groups', { name: 'New Name' });

    const { PATCH } = await import('../route');
    const res = await PATCH(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('group_id required');
  });

  it('returns 403 when user is not an admin', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });

    const chain: any = {};
    const methods = ['select', 'update', 'eq', 'single'];
    methods.forEach((m) => { chain[m] = vi.fn(() => chain); });
    chain.single.mockReturnValue({ data: { role: 'member' }, error: null });
    mockFrom.mockReturnValue(chain);

    const req = makeRequest('PATCH', '/api/groups', { group_id: 'g-1', name: 'New Name' });

    const { PATCH } = await import('../route');
    const res = await PATCH(req);

    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toContain('admin');
  });
});
