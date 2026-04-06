import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Mocks ────────────────────────────────────────────────────

const mockGetUser = vi.fn();
const mockFrom = vi.fn();

function chainBuilder(resolvedValue: { data: any; error: any; count?: number | null }) {
  const chain: any = {};
  const methods = [
    'select', 'insert', 'upsert', 'update', 'delete',
    'eq', 'single', 'order', 'range', 'contains',
  ];
  methods.forEach((m) => {
    chain[m] = vi.fn(() => chain);
  });
  chain.single.mockReturnValue(resolvedValue);
  // Support for count queries
  if (resolvedValue.count !== undefined) {
    chain.select.mockReturnValue({ ...chain, ...resolvedValue });
  }
  Object.defineProperty(chain, 'then', {
    value: (resolve: any) => resolve(resolvedValue),
  });
  return chain;
}

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
  decryptJournalEntries: vi.fn((entries: any) => entries),
  decrypt: vi.fn((val: any) => val),
}));

vi.mock('@/lib/security', () => ({
  sanitizeEmail: vi.fn((email: string) => {
    // Simple email check for test purposes
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email.toLowerCase() : null;
  }),
  sanitizeName: vi.fn((name: string) => name.trim()),
  safeError: vi.fn((e: any) => typeof e === 'string' ? e : 'Internal error'),
  escapeHtml: vi.fn((s: string) => s),
}));

vi.mock('resend', () => ({
  Resend: vi.fn(() => ({
    emails: {
      send: vi.fn(() => Promise.resolve({ id: 'email-1' })),
    },
  })),
}));

vi.mock('crypto', () => ({
  randomUUID: vi.fn(() => 'test-token-uuid'),
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

// ── POST Tests ───────────────────────────────────────────────

describe('POST /api/therapist (invite)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockAuthUser(null);
    const req = makeRequest('POST', '/api/therapist', {
      therapist_email: 'dr@example.com',
    });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe('Unauthorized');
  });

  it('returns 400 when therapist_email is missing', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const req = makeRequest('POST', '/api/therapist', {});

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Email required');
  });

  it('returns 400 when therapist_email is empty string', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const req = makeRequest('POST', '/api/therapist', {
      therapist_email: '   ',
    });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Email required');
  });

  it('returns 400 when therapist_email is invalid format', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const req = makeRequest('POST', '/api/therapist', {
      therapist_email: 'not-an-email',
    });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Invalid email address');
  });

  it('returns 400 when body is not valid JSON', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const req = new NextRequest(new URL('/api/therapist', 'http://localhost:3000'), {
      method: 'POST',
      body: 'bad json',
      headers: { 'Content-Type': 'application/json' },
    } as any);

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Invalid JSON');
  });

  it('returns 400 when already connected', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });

    const existingChain = chainBuilder({
      data: { id: 'conn-1', status: 'accepted' },
      error: null,
    });
    mockFrom.mockReturnValue(existingChain);

    const req = makeRequest('POST', '/api/therapist', {
      therapist_email: 'dr@example.com',
    });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Already connected');
  });
});

// ── PATCH Tests ──────────────────────────────────────────────

describe('PATCH /api/therapist', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockAuthUser(null);
    const req = makeRequest('PATCH', '/api/therapist', {
      action: 'accept',
      invite_token: 'some-token',
    });

    const { PATCH } = await import('../route');
    const res = await PATCH(req);

    expect(res.status).toBe(401);
  });

  it('returns 404 when accepting with invalid/expired token', async () => {
    mockAuthUser({ id: 'therapist-1', email: 'dr@example.com' });

    // Token lookup returns no results
    const chain = chainBuilder({ data: null, error: { message: 'Not found' } });
    mockFrom.mockReturnValue(chain);

    const req = makeRequest('PATCH', '/api/therapist', {
      action: 'accept',
      invite_token: 'invalid-token-xyz',
    });

    const { PATCH } = await import('../route');
    const res = await PATCH(req);

    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toContain('Invalid or expired');
  });

  it('returns 400 when connection_id is missing for non-accept actions', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });

    // No accept action, no connection_id
    const req = makeRequest('PATCH', '/api/therapist', {
      can_see_journal: false,
    });

    const { PATCH } = await import('../route');
    const res = await PATCH(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Missing connection_id');
  });

  it('returns 400 when body is not valid JSON', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const req = new NextRequest(new URL('/api/therapist', 'http://localhost:3000'), {
      method: 'PATCH',
      body: 'not json',
      headers: { 'Content-Type': 'application/json' },
    } as any);

    const { PATCH } = await import('../route');
    const res = await PATCH(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Invalid JSON');
  });
});

// ── GET Tests ────────────────────────────────────────────────

describe('GET /api/therapist', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockAuthUser(null);
    const req = makeRequest('GET', '/api/therapist');

    const { GET } = await import('../route');
    const res = await GET(req);

    expect(res.status).toBe(401);
  });

  it('returns connections with as_user and as_therapist arrays', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });

    // Mock two different from() calls: one for as_therapist, one for as_user
    const asTherapistChain = chainBuilder({ data: [], error: null });
    const asUserChain = chainBuilder({ data: [], error: null });

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      return callCount === 1 ? asTherapistChain : asUserChain;
    });

    const req = makeRequest('GET', '/api/therapist');

    const { GET } = await import('../route');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('as_user');
    expect(json).toHaveProperty('as_therapist');
    expect(Array.isArray(json.as_user)).toBe(true);
    expect(Array.isArray(json.as_therapist)).toBe(true);
  });
});
