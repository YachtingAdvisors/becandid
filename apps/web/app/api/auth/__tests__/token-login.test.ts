import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockCheckDistributedRateLimit = vi.fn(async () => null);
const mockSetSession = vi.fn();
const mockGetUser = vi.fn();

vi.mock('@/lib/distributedRateLimit', () => ({
  checkDistributedRateLimit: mockCheckDistributedRateLimit,
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      setSession: mockSetSession,
      getUser: mockGetUser,
    },
  })),
}));

describe('GET /api/auth/token-login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSetSession.mockResolvedValue({ data: { session: { id: 'session-1' } }, error: null });
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
  });

  function makeRequest(url: string): NextRequest {
    return Object.assign(new Request(url), {
      nextUrl: new URL(url),
      cookies: {
        getAll: () => [],
      },
    }) as unknown as NextRequest;
  }

  it('rejects absolute external redirects', async () => {
    const req = makeRequest(
      'http://localhost:3000/api/auth/token-login?token=abc123&redirect=https://evil.example/phish',
    );

    const { GET } = await import('../token-login/route');
    const res = await GET(req);

    expect(res.headers.get('location')).toBe('http://localhost:3000/dashboard');
  });

  it('preserves safe relative redirects', async () => {
    const req = makeRequest(
      'http://localhost:3000/api/auth/token-login?token=abc123&redirect=/dashboard/activity',
    );

    const { GET } = await import('../token-login/route');
    const res = await GET(req);

    expect(res.headers.get('location')).toBe('http://localhost:3000/dashboard/activity');
  });
});
