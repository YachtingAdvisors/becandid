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

vi.mock('@/lib/stripe/server', () => ({
  createCheckoutSession: vi.fn(() =>
    Promise.resolve({ url: 'https://checkout.stripe.com/session_123' }),
  ),
  createPortalSession: vi.fn(() =>
    Promise.resolve({ url: 'https://billing.stripe.com/portal_123' }),
  ),
}));

vi.mock('@/lib/stripe/config', () => ({
  STRIPE_CONFIG: {
    prices: {
      pro_monthly: 'price_pro_monthly',
      pro_yearly: 'price_pro_yearly',
      therapy_monthly: 'price_therapy_monthly',
    },
  },
  getPlanLimits: vi.fn((plan: string) => ({
    aiGuidesPerMonth: plan === 'free' ? 3 : Infinity,
    partners: plan === 'free' ? 1 : 5,
  })),
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

function setupChainedQuery(returnValue: { data: any; error: any; count?: number | null }) {
  const chain: any = {};
  const methods = ['select', 'insert', 'update', 'delete', 'eq', 'gte', 'not', 'order', 'range', 'single', 'limit'];
  methods.forEach((m) => {
    chain[m] = vi.fn(() => chain);
  });
  chain.single.mockReturnValue(returnValue);
  Object.defineProperty(chain, 'then', {
    value: (resolve: any) => resolve(returnValue),
  });
  mockFrom.mockReturnValue(chain);
  return chain;
}

// ── Tests ────────────────────────────────────────────────────

describe('POST /api/billing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockAuthUser(null);
    const req = makeRequest('POST', '/api/billing', { price_id: 'price_pro_monthly' });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe('Unauthorized');
  });

  it('returns 400 when price_id is missing', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const req = makeRequest('POST', '/api/billing', {});

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Invalid price');
  });

  it('returns 400 when price_id is not a valid price', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const req = makeRequest('POST', '/api/billing', { price_id: 'price_invalid_abc' });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Invalid price');
  });

  it('returns checkout URL on success with valid price_id', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const req = makeRequest('POST', '/api/billing', { price_id: 'price_pro_monthly' });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.url).toBe('https://checkout.stripe.com/session_123');
  });

  it('resolves key-name price_id to actual Stripe ID', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const req = makeRequest('POST', '/api/billing', { price_id: 'pro_monthly' });

    const { POST } = await import('../route');
    const res = await POST(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.url).toBe('https://checkout.stripe.com/session_123');
  });
});

describe('GET /api/billing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockAuthUser(null);
    const req = makeRequest('GET', '/api/billing');

    const { GET } = await import('../route');
    const res = await GET(req);

    expect(res.status).toBe(401);
  });

  it('returns subscription data shape on success', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });

    const chain: any = {};
    const methods = ['select', 'eq', 'gte', 'not', 'single', 'order', 'limit'];
    methods.forEach((m) => {
      chain[m] = vi.fn(() => chain);
    });

    let callCount = 0;
    chain.single.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return {
          data: {
            subscription_plan: 'free',
            subscription_status: 'active',
            trial_ends_at: null,
            stripe_customer_id: null,
          },
          error: null,
        };
      }
      return { data: null, error: null };
    });

    // For the count query (alerts)
    Object.defineProperty(chain, 'then', {
      value: (resolve: any) => resolve({ data: null, error: null, count: 2 }),
      configurable: true,
    });

    mockFrom.mockReturnValue(chain);

    const req = makeRequest('GET', '/api/billing');

    const { GET } = await import('../route');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('plan');
    expect(json).toHaveProperty('status');
    expect(json).toHaveProperty('usage');
    expect(json).toHaveProperty('prices');
    expect(json).toHaveProperty('trial');
    expect(json).toHaveProperty('has_payment_method');
    expect(json.usage).toHaveProperty('ai_guides_used');
    expect(json.usage).toHaveProperty('ai_guides_limit');
  });
});

describe('PATCH /api/billing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    mockAuthUser(null);
    const req = makeRequest('PATCH', '/api/billing');

    const { PATCH } = await import('../route');
    const res = await PATCH(req);

    expect(res.status).toBe(401);
  });

  it('returns portal URL on success', async () => {
    mockAuthUser({ id: 'user-1', email: 'test@example.com' });
    const req = makeRequest('PATCH', '/api/billing');

    const { PATCH } = await import('../route');
    const res = await PATCH(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.url).toBe('https://billing.stripe.com/portal_123');
  });
});
