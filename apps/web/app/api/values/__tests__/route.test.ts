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

vi.mock('@/lib/encryption', () => ({
  encrypt: vi.fn((val: string) => `enc:${val}`),
  decrypt: vi.fn((val: string) => val.replace('enc:', '')),
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
  return new NextRequest(new URL(url, 'http://localhost:3000'), init);
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

describe('GET /api/values', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockAuthUser(null);

    const { GET } = await import('../route');
    const res = await GET();

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe('Unauthorized');
  });

  it('returns values array on success', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });

    const fakeValues = [
      {
        id: 'v-1',
        user_id: 'user-1',
        value_name: 'Faith',
        rank: 1,
        rival_conflict: 'enc:Porn contradicts my faith',
      },
      {
        id: 'v-2',
        user_id: 'user-1',
        value_name: 'Marriage',
        rank: 2,
        rival_conflict: null,
      },
    ];

    setupChainedQuery({ data: fakeValues, error: null });

    const { GET } = await import('../route');
    const res = await GET();

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('values');
    expect(Array.isArray(json.values)).toBe(true);
    expect(json.values).toHaveLength(2);
    // Decrypted rival_conflict
    expect(json.values[0].rival_conflict).toBe('Porn contradicts my faith');
    expect(json.values[1].rival_conflict).toBeNull();
  });

  it('returns empty array when no values saved', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    setupChainedQuery({ data: [], error: null });

    const { GET } = await import('../route');
    const res = await GET();

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.values).toEqual([]);
  });
});

describe('POST /api/values', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockAuthUser(null);
    const req = makeRequest('POST', '/api/values', {
      values: [{ value_name: 'Faith', rank: 1 }],
    });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(401);
  });

  it('returns 400 when values array is missing', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const req = makeRequest('POST', '/api/values', { something: 'else' });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Provide 1-10 values');
  });

  it('returns 400 when values array is empty', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const req = makeRequest('POST', '/api/values', { values: [] });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Provide 1-10 values');
  });

  it('returns 400 when values exceed limit of 10', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const tooMany = Array.from({ length: 11 }, (_, i) => ({
      value_name: `Value ${i + 1}`,
      rank: i + 1,
    }));
    const req = makeRequest('POST', '/api/values', { values: tooMany });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Provide 1-10 values');
  });

  it('returns 400 when a value has no name', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const req = makeRequest('POST', '/api/values', {
      values: [{ value_name: '', rank: 1 }],
    });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Each value needs a name and rank (1-10)');
  });

  it('returns 400 when rank is out of range', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const req = makeRequest('POST', '/api/values', {
      values: [{ value_name: 'Faith', rank: 0 }],
    });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Each value needs a name and rank (1-10)');
  });

  it('returns 400 when rival_conflict exceeds 2000 chars', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const req = makeRequest('POST', '/api/values', {
      values: [{ value_name: 'Faith', rank: 1, rival_conflict: 'x'.repeat(2001) }],
    });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Conflict description must be under 2000 characters');
  });

  it('returns 400 when body is not valid JSON', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const req = new NextRequest(new URL('/api/values', 'http://localhost:3000'), {
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

  it('returns saved values on success', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });

    // delete existing + insert new
    setupChainedQuery({ data: null, error: null });

    const req = makeRequest('POST', '/api/values', {
      values: [
        { value_name: 'Faith', rank: 1, rival_conflict: 'Contradicts my beliefs' },
        { value_name: 'Marriage', rank: 2 },
      ],
    });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('ok', true);
    expect(json).toHaveProperty('count', 2);
  });
});
