import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Mocks ────────────────────────────────────────────────────

const mockGetUser = vi.fn();

vi.mock('@/lib/supabase', () => ({
  createServerSupabaseClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}));

vi.mock('@/lib/rateLimit', () => ({
  rateLimitResponse: vi.fn((retryAfter: number) =>
    new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', 'Retry-After': String(retryAfter) },
    }),
  ),
}));

vi.mock('@/lib/conversationCoach', () => ({
  streamCoachResponse: vi.fn(async function* () {
    yield 'Hello, ';
    yield 'how are you?';
  }),
}));

vi.mock('@/lib/security', () => ({
  safeError: vi.fn(() =>
    new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    }),
  ),
}));

// ── Helpers ──────────────────────────────────────────────────

function makeRequest(body?: any): NextRequest {
  const init: RequestInit = { method: 'POST' };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
    init.headers = { 'Content-Type': 'application/json' };
  }
  return new NextRequest(new URL('/api/coach', 'http://localhost:3000'), init as any);
}

function mockAuthUser(user: { id: string; email: string } | null) {
  mockGetUser.mockResolvedValue({ data: { user } });
}

// ── Tests ────────────────────────────────────────────────────

describe('POST /api/coach', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockAuthUser(null);
    const req = makeRequest({ message: 'hello', history: [] });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe('Unauthorized');
  });

  it('returns 400 when message is empty string', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const req = makeRequest({ message: '', history: [] });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('Invalid request');
  });

  it('returns 400 when message exceeds 1000 characters', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const longMessage = 'a'.repeat(1001);
    const req = makeRequest({ message: longMessage, history: [] });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('1-1000 characters');
  });

  it('returns 400 when history is not an array', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const req = makeRequest({ message: 'hello', history: 'not-array' });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('returns 400 when history contains invalid role', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const req = makeRequest({
      message: 'hello',
      history: [{ role: 'system', content: 'test' }],
    });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('returns 400 when history message content exceeds 5000 chars', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const req = makeRequest({
      message: 'hello',
      history: [{ role: 'user', content: 'x'.repeat(5001) }],
    });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('returns 400 when body is missing message field', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const req = makeRequest({ history: [] });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('returns 400 when body is invalid JSON', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const req = new NextRequest(new URL('/api/coach', 'http://localhost:3000'), {
      method: 'POST',
      body: 'not json{{{',
      headers: { 'Content-Type': 'application/json' },
    } as any);

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Invalid JSON');
  });

  it('returns a streaming text/plain response on valid request', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const req = makeRequest({
      message: 'I had a tough day',
      history: [
        { role: 'user', content: 'Hi' },
        { role: 'assistant', content: 'Hello! How are you?' },
      ],
    });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('text/plain; charset=utf-8');
    expect(res.headers.get('Cache-Control')).toBe('no-cache, no-store');

    // Read the stream to verify it works
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      fullText += decoder.decode(value);
    }
    expect(fullText).toContain('Hello, ');
    expect(fullText).toContain('how are you?');
  });

  it('accepts optional alert_id field', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const req = makeRequest({
      message: 'I need help',
      history: [],
      alert_id: 'alert-123',
    });

    const { POST } = await import('../route');
    const res = await POST(req);

    // Should not reject the request due to alert_id
    expect(res.status).toBe(200);
  });

  it('returns 400 when history exceeds 100 messages', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const longHistory = Array.from({ length: 101 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: 'message',
    }));
    const req = makeRequest({ message: 'hello', history: longHistory });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(400);
  });
});
