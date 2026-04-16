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

vi.mock('@/lib/security', () => ({
  safeError: vi.fn((_ctx: string, err: any) =>
    new Response(JSON.stringify({ error: typeof err === 'string' ? err : 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    }),
  ),
  sanitizeText: vi.fn((text: string, maxLen: number) => text?.slice(0, maxLen)?.trim() || ''),
}));

vi.mock('@/lib/anonymousNames', () => ({
  getAnonymousName: vi.fn(() => 'Brave Falcon'),
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

function setupChainedQuery(returnValue: { data: any; error: any; count?: number | null }) {
  const chain: any = {};
  const methods = ['select', 'insert', 'update', 'delete', 'eq', 'in', 'gte', 'order', 'limit', 'single'];
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

describe('GET /api/community', () => {
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

  it('returns posts array on success', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });

    const fakePosts = [
      {
        id: 'post-1',
        anonymous_name: 'Brave Falcon',
        content: '30 days clean!',
        post_type: 'milestone',
        hearts: 5,
        created_at: new Date().toISOString(),
      },
    ];

    let fromCallCount = 0;
    mockFrom.mockImplementation(() => {
      fromCallCount++;
      const chain: any = {};
      const methods = ['select', 'eq', 'in', 'order', 'limit'];
      methods.forEach((m) => { chain[m] = vi.fn(() => chain); });

      if (fromCallCount === 1) {
        // community_posts query
        Object.defineProperty(chain, 'then', {
          value: (resolve: any) => resolve({ data: fakePosts, error: null }),
          configurable: true,
        });
      } else {
        // community_hearts query
        Object.defineProperty(chain, 'then', {
          value: (resolve: any) => resolve({ data: [], error: null }),
          configurable: true,
        });
      }
      return chain;
    });

    const { GET } = await import('../route');
    const res = await GET();

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('posts');
    expect(Array.isArray(json.posts)).toBe(true);
    expect(json.posts[0]).toHaveProperty('hearted');
  });

  it('returns empty array when no posts exist', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    setupChainedQuery({ data: [], error: null });

    const { GET } = await import('../route');
    const res = await GET();

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.posts).toEqual([]);
  });
});

describe('POST /api/community', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockAuthUser(null);
    const req = makeRequest('POST', '/api/community', { content: 'Hello!' });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(401);
  });

  it('returns 400 when content is missing', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const req = makeRequest('POST', '/api/community', { content: '' });

    // Mock the daily count check
    setupChainedQuery({ data: null, error: null, count: 0 });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Content is required');
  });

  it('returns 400 when body is not valid JSON', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const req = new NextRequest(new URL('/api/community', 'http://localhost:3000'), {
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

  it('returns 201 with post including anonymous_name on success', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });

    const fakePost = {
      id: 'post-1',
      anonymous_name: 'Brave Falcon',
      content: 'Grateful today.',
      post_type: 'gratitude',
      hearts: 0,
      created_at: new Date().toISOString(),
    };

    let fromCallCount = 0;
    mockFrom.mockImplementation(() => {
      fromCallCount++;
      const chain: any = {};
      const methods = ['select', 'insert', 'eq', 'gte', 'order', 'limit', 'single'];
      methods.forEach((m) => { chain[m] = vi.fn(() => chain); });

      if (fromCallCount === 1) {
        // Daily post count
        Object.defineProperty(chain, 'then', {
          value: (resolve: any) => resolve({ data: null, error: null, count: 0 }),
          configurable: true,
        });
      } else {
        // Insert post
        chain.single.mockReturnValue({ data: fakePost, error: null });
      }
      return chain;
    });

    const req = makeRequest('POST', '/api/community', {
      content: 'Grateful today.',
      post_type: 'gratitude',
    });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json).toHaveProperty('post');
    expect(json.post.anonymous_name).toBe('Brave Falcon');
    expect(json.post).toHaveProperty('hearted', false);
  });

  it('returns 429 when daily post limit is reached', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });

    setupChainedQuery({ data: null, error: null, count: 5 });

    const req = makeRequest('POST', '/api/community', { content: 'Too many posts' });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(429);
    const json = await res.json();
    expect(json.error).toContain('5 posts per day');
  });
});
