import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Mocks ────────────────────────────────────────────────────

const mockGetUserFromRequest = vi.fn();

vi.mock('@/lib/authFromRequest', () => ({
  getUserFromRequest: (...args: any[]) => mockGetUserFromRequest(...args),
}));

vi.mock('@/lib/supabase', () => ({
  createServiceClient: vi.fn(() => ({
    from: vi.fn(() => {
      const chain: any = {};
      const methods = ['select', 'eq', 'order', 'range'];
      methods.forEach((m) => { chain[m] = vi.fn(() => chain); });
      Object.defineProperty(chain, 'then', {
        value: (resolve: any) => resolve({ data: [], error: null }),
      });
      return chain;
    }),
  })),
}));

vi.mock('@/lib/alertPipeline', () => ({
  runAlertPipeline: vi.fn(() =>
    Promise.resolve({
      alert: { id: 'alert-123' },
      solo: false,
    }),
  ),
}));

vi.mock('@/lib/security', () => ({
  sanitizeText: vi.fn((t: string) => t),
}));

vi.mock('@be-candid/shared', () => ({
  GOAL_LABELS: {
    pornography: 'Pornography',
    sexting: 'Sexting',
    social_media: 'Social Media & News',
    gambling: 'Gambling',
    gaming: 'Excessive Gaming',
  },
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

// ── POST Tests ───────────────────────────────────────────────

describe('POST /api/events', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the module-level rate limit map between tests
    vi.resetModules();
  });

  it('returns 401 when not authenticated', async () => {
    mockGetUserFromRequest.mockResolvedValue(null);
    const req = makeRequest('POST', '/api/events', {
      category: 'pornography',
      severity: 'high',
    });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe('Unauthorized');
  });

  it('returns 400 when category is missing', async () => {
    mockGetUserFromRequest.mockResolvedValue({ id: 'user-1' });
    const req = makeRequest('POST', '/api/events', {
      severity: 'high',
    });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('category');
  });

  it('returns 400 when category is invalid', async () => {
    mockGetUserFromRequest.mockResolvedValue({ id: 'user-1' });
    const req = makeRequest('POST', '/api/events', {
      category: 'totally_fake_category',
      severity: 'high',
    });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('Invalid category');
  });

  it('returns 400 when severity is missing', async () => {
    mockGetUserFromRequest.mockResolvedValue({ id: 'user-1' });
    const req = makeRequest('POST', '/api/events', {
      category: 'pornography',
    });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('severity');
  });

  it('returns 400 when severity is not low/medium/high', async () => {
    mockGetUserFromRequest.mockResolvedValue({ id: 'user-1' });
    const req = makeRequest('POST', '/api/events', {
      category: 'pornography',
      severity: 'critical',
    });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('Invalid severity');
  });

  it('returns 400 when platform is invalid', async () => {
    mockGetUserFromRequest.mockResolvedValue({ id: 'user-1' });
    const req = makeRequest('POST', '/api/events', {
      category: 'pornography',
      severity: 'high',
      platform: 'nintendo_switch',
    });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('Invalid platform');
  });

  it('returns 400 when timestamp is more than 7 days old', async () => {
    mockGetUserFromRequest.mockResolvedValue({ id: 'user-1' });
    const eightDaysAgo = new Date(Date.now() - 8 * 86400000).toISOString();
    const req = makeRequest('POST', '/api/events', {
      category: 'pornography',
      severity: 'high',
      timestamp: eightDaysAgo,
    });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('too old');
  });

  it('returns 400 when timestamp is invalid date string', async () => {
    mockGetUserFromRequest.mockResolvedValue({ id: 'user-1' });
    const req = makeRequest('POST', '/api/events', {
      category: 'pornography',
      severity: 'high',
      timestamp: 'not-a-date',
    });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('Invalid timestamp');
  });

  it('returns 201 with alert_id on valid event', async () => {
    mockGetUserFromRequest.mockResolvedValue({ id: 'user-1' });
    const req = makeRequest('POST', '/api/events', {
      category: 'pornography',
      severity: 'high',
      platform: 'web',
    });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json).toHaveProperty('alert_id');
    expect(json).toHaveProperty('solo_mode');
  });

  it('accepts valid event with recent timestamp', async () => {
    mockGetUserFromRequest.mockResolvedValue({ id: 'user-1' });
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const req = makeRequest('POST', '/api/events', {
      category: 'gambling',
      severity: 'medium',
      platform: 'ios',
      timestamp: oneHourAgo,
    });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(201);
  });
});

// ── GET Tests ────────────────────────────────────────────────

describe('GET /api/events', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('returns 401 when not authenticated', async () => {
    mockGetUserFromRequest.mockResolvedValue(null);
    const req = makeRequest('GET', '/api/events');

    const { GET } = await import('../route');
    const res = await GET(req);

    expect(res.status).toBe(401);
  });

  it('returns events array on success', async () => {
    mockGetUserFromRequest.mockResolvedValue({ id: 'user-1' });
    const req = makeRequest('GET', '/api/events');

    const { GET } = await import('../route');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('events');
    expect(Array.isArray(json.events)).toBe(true);
  });
});
