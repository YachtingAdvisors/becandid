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

vi.mock('@/lib/encryption', () => ({
  encrypt: vi.fn((val: string) => `enc:${val}`),
  decrypt: vi.fn((val: string) => val.replace('enc:', '')),
}));

vi.mock('@/lib/security', () => ({
  sanitizeText: vi.fn((text: string, _max: number) => text?.trim() || ''),
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
  const methods = ['select', 'insert', 'update', 'delete', 'eq', 'order', 'single'];
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

describe('POST /api/amends', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockAuthUser(null);
    const req = makeRequest('POST', '/api/amends', { person_name: 'John' });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe('Unauthorized');
  });

  it('returns 400 when person_name is missing', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const req = makeRequest('POST', '/api/amends', { what_happened: 'something' });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Person name is required');
  });

  it('returns 400 when person_name is whitespace-only', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const req = makeRequest('POST', '/api/amends', { person_name: '   ' });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Person name is required');
  });

  it('returns 400 with invalid amend_type', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const req = makeRequest('POST', '/api/amends', {
      person_name: 'John',
      amend_type: 'invalid_type',
    });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Invalid amend type');
  });

  it('returns 400 when body is not valid JSON', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const req = new NextRequest(new URL('/api/amends', 'http://localhost:3000'), {
      method: 'POST',
      body: 'not json',
      headers: { 'Content-Type': 'application/json' },
    } as any);

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Invalid JSON');
  });

  it('returns 201 with amend on success', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });

    const fakeAmend = {
      id: 'amend-1',
      user_id: 'user-1',
      person_name: 'enc:John',
      relationship: 'enc:friend',
      what_happened: 'enc:I lied',
      what_to_say: null,
      amend_type: 'direct',
      status: 'identified',
      notes: null,
      created_at: new Date().toISOString(),
    };

    setupChainedQuery({ data: fakeAmend, error: null });

    const req = makeRequest('POST', '/api/amends', {
      person_name: 'John',
      relationship: 'friend',
      what_happened: 'I lied',
      amend_type: 'direct',
    });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json).toHaveProperty('amend');
    expect(json.amend).toHaveProperty('id', 'amend-1');
  });
});

describe('PATCH /api/amends', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockAuthUser(null);
    const req = makeRequest('PATCH', '/api/amends', { id: 'amend-1', status: 'planned' });

    const { PATCH } = await import('../route');
    const res = await PATCH(req);

    expect(res.status).toBe(401);
  });

  it('returns 400 when id is missing', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const req = makeRequest('PATCH', '/api/amends', { status: 'planned' });

    const { PATCH } = await import('../route');
    const res = await PATCH(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Missing id');
  });

  it('returns 400 with invalid status', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const req = makeRequest('PATCH', '/api/amends', {
      id: 'amend-1',
      status: 'bogus_status',
    });

    const { PATCH } = await import('../route');
    const res = await PATCH(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Invalid status');
  });

  it('returns 400 with invalid amend_type', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const req = makeRequest('PATCH', '/api/amends', {
      id: 'amend-1',
      amend_type: 'bogus_type',
    });

    const { PATCH } = await import('../route');
    const res = await PATCH(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Invalid amend type');
  });

  it('updates amend successfully', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });

    const updatedAmend = {
      id: 'amend-1',
      user_id: 'user-1',
      person_name: 'enc:John',
      status: 'made',
      completed_at: new Date().toISOString(),
    };

    setupChainedQuery({ data: updatedAmend, error: null });

    const req = makeRequest('PATCH', '/api/amends', {
      id: 'amend-1',
      status: 'made',
    });

    const { PATCH } = await import('../route');
    const res = await PATCH(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('amend');
  });
});

describe('DELETE /api/amends', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockAuthUser(null);
    const req = makeRequest('DELETE', '/api/amends?id=amend-1');

    const { DELETE: DEL } = await import('../route');
    const res = await DEL(req);

    expect(res.status).toBe(401);
  });

  it('returns 400 when id query param is missing', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const req = makeRequest('DELETE', '/api/amends');

    const { DELETE: DEL } = await import('../route');
    const res = await DEL(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Missing id');
  });

  it('returns success when id is provided', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    setupChainedQuery({ data: null, error: null });

    const req = makeRequest('DELETE', '/api/amends?id=amend-1');

    const { DELETE: DEL } = await import('../route');
    const res = await DEL(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.deleted).toBe(true);
  });
});

describe('GET /api/amends', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockAuthUser(null);
    const req = makeRequest('GET', '/api/amends');

    const { GET } = await import('../route');
    const res = await GET(req);

    expect(res.status).toBe(401);
  });

  it('returns amends array on success', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });

    const fakeAmends = [
      {
        id: 'amend-1',
        user_id: 'user-1',
        person_name: 'enc:John',
        status: 'identified',
        amend_type: 'direct',
        created_at: new Date().toISOString(),
      },
    ];

    setupChainedQuery({ data: fakeAmends, error: null });

    const req = makeRequest('GET', '/api/amends');

    const { GET } = await import('../route');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('amends');
    expect(Array.isArray(json.amends)).toBe(true);
    expect(json.amends).toHaveLength(1);
  });
});
