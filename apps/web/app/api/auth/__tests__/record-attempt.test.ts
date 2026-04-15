import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockRecordFailedAttempt = vi.fn();
const mockCreateServiceClient = vi.fn(() => ({ from: vi.fn() }));
const mockLimiterCheck = vi.fn(() => true);

vi.mock('@/lib/supabase', () => ({
  createServiceClient: mockCreateServiceClient,
}));

vi.mock('@/lib/accountLockout', () => ({
  recordFailedAttempt: mockRecordFailedAttempt,
}));

vi.mock('@/lib/rateLimit', () => ({
  authLimiter: {
    check: mockLimiterCheck,
  },
  rateLimitResponse: vi.fn((seconds: number) =>
    new Response(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: { 'Retry-After': String(seconds), 'Content-Type': 'application/json' },
    }),
  ),
}));

function makeRequest(body: unknown) {
  return new Request('http://localhost:3000/api/auth/record-attempt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '203.0.113.10' },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

describe('POST /api/auth/record-attempt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLimiterCheck.mockReturnValue(true);
    mockCreateServiceClient.mockReturnValue({ from: vi.fn() });
  });

  it('records failed attempts', async () => {
    const req = makeRequest({ email: 'test@example.com', success: false });

    const { POST } = await import('../record-attempt/route');
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(mockRecordFailedAttempt).toHaveBeenCalledWith(
      expect.any(Object),
      'test@example.com',
      '203.0.113.10',
    );
  });

  it('rejects client-reported successful attempts', async () => {
    const req = makeRequest({ email: 'test@example.com', success: true });

    const { POST } = await import('../record-attempt/route');
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toMatch(/server-side/);
    expect(mockRecordFailedAttempt).not.toHaveBeenCalled();
  });
});
