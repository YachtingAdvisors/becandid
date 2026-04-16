import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Mocks ────────────────────────────────────────────────────

const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockRpc = vi.fn(() => ({ data: null, error: null }));
const mockInsert = vi.fn();
const mockSelect = vi.fn();
const mockSingle = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();
const mockRange = vi.fn();
const mockContains = vi.fn();

vi.mock('@/lib/supabase', () => ({
  createServerSupabaseClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
  createServiceClient: vi.fn(() => ({
    from: mockFrom,
    rpc: mockRpc,
  })),
}));

vi.mock('@/lib/rateLimit', () => ({
  actionLimiter: {},
  checkUserRate: vi.fn(async () => null),
}));

vi.mock('@/lib/encryption', () => ({
  encryptJournalEntry: vi.fn((entry: any) => entry),
  decryptJournalEntries: vi.fn((entries: any) => entries),
}));

vi.mock('@/lib/relationshipHooks', () => ({
  onJournalEntry: vi.fn(() => Promise.resolve()),
}));

vi.mock('@/lib/security', () => ({
  safeError: vi.fn((e: any) => typeof e === 'string' ? e : 'Internal error'),
}));

vi.mock('@be-candid/shared', () => ({
  STRINGER_PROMPTS: [],
  STRINGER_QUOTES: ['Keep going.'],
  JOURNAL_TAGS: ['gratitude', 'reflection'],
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
  const methods = ['select', 'insert', 'update', 'delete', 'eq', 'order', 'range', 'contains', 'single'];
  methods.forEach((m) => {
    chain[m] = vi.fn(() => chain);
  });
  // The final call resolves the data
  chain.single.mockReturnValue(returnValue);
  chain.range.mockReturnValue(Promise.resolve(returnValue));
  // For queries that don't end in single()
  Object.defineProperty(chain, 'then', {
    value: (resolve: any) => resolve(returnValue),
  });
  mockFrom.mockReturnValue(chain);
  return chain;
}

// ── Tests ────────────────────────────────────────────────────

describe('POST /api/journal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockAuthUser(null);
    const req = makeRequest('POST', '/api/journal', { freewrite: 'test' });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe('Unauthorized');
  });

  it('returns 400 when all content fields are empty', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const req = makeRequest('POST', '/api/journal', {
      freewrite: '',
      tributaries: '',
      longing: '',
      roadmap: '',
    });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('At least one field required');
  });

  it('returns 400 when all content fields are whitespace-only', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const req = makeRequest('POST', '/api/journal', {
      freewrite: '   ',
      tributaries: '  \n  ',
      longing: '\t',
      roadmap: ' ',
    });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('At least one field required');
  });

  it('returns 400 when body is not valid JSON', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const req = new NextRequest(new URL('/api/journal', 'http://localhost:3000'), {
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

  it('returns 201 with entry and points_earned on success', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });

    const fakeEntry = {
      id: 'entry-1',
      user_id: 'user-1',
      freewrite: 'Today was tough.',
      tributaries: null,
      longing: null,
      roadmap: null,
      mood: 3,
      tags: [],
      trigger_type: 'manual',
      created_at: new Date().toISOString(),
    };

    const chain = setupChainedQuery({ data: fakeEntry, error: null });

    const req = makeRequest('POST', '/api/journal', {
      freewrite: 'Today was tough.',
      mood: 3,
    });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json).toHaveProperty('entry');
    expect(json).toHaveProperty('points_earned', 10);
    expect(json.entry.id).toBe('entry-1');
  });
});

describe('PATCH /api/journal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockAuthUser(null);
    const req = makeRequest('PATCH', '/api/journal', { id: 'entry-1', freewrite: 'updated' });

    const { PATCH } = await import('../route');
    const res = await PATCH(req);

    expect(res.status).toBe(401);
  });

  it('returns 400 when id is missing', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const req = makeRequest('PATCH', '/api/journal', { freewrite: 'updated' });

    const { PATCH } = await import('../route');
    const res = await PATCH(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Missing id');
  });

  it('returns 400 when body is not valid JSON', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const req = new NextRequest(new URL('/api/journal', 'http://localhost:3000'), {
      method: 'PATCH',
      body: 'bad json',
      headers: { 'Content-Type': 'application/json' },
    } as any);

    const { PATCH } = await import('../route');
    const res = await PATCH(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Invalid JSON');
  });
});

describe('DELETE /api/journal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockAuthUser(null);
    const req = makeRequest('DELETE', '/api/journal');

    const { DELETE } = await import('../route');
    const res = await DELETE(req);

    expect(res.status).toBe(401);
  });

  it('returns 400 when id query param is missing', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const req = makeRequest('DELETE', '/api/journal');

    const { DELETE: DEL } = await import('../route');
    const res = await DEL(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Missing id');
  });

  it('returns success when id is provided', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    setupChainedQuery({ data: null, error: null });

    const req = makeRequest('DELETE', '/api/journal?id=entry-1');

    const { DELETE: DEL } = await import('../route');
    const res = await DEL(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.deleted).toBe(true);
  });
});

describe('GET /api/journal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockAuthUser(null);
    const req = makeRequest('GET', '/api/journal');

    const { GET } = await import('../route');
    const res = await GET(req);

    expect(res.status).toBe(401);
  });

  it('returns entries array and a quote on success', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    setupChainedQuery({ data: [], error: null });

    const req = makeRequest('GET', '/api/journal');

    const { GET } = await import('../route');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('entries');
    expect(json).toHaveProperty('quote');
    expect(Array.isArray(json.entries)).toBe(true);
  });
});
