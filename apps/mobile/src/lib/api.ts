// ============================================================
// mobile/src/lib/api.ts
//
// Lightweight API client for the Be Candid backend.
// Automatically injects the Supabase access token and retries
// once on 401 after refreshing the session.
// ============================================================

import { supabase } from './supabase';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://becandid.io';

// ── Helpers ─────────────────────────────────────────────────

async function getAccessToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

async function refreshAndGetToken(): Promise<string | null> {
  const { data: { session }, error } = await supabase.auth.refreshSession();
  if (error || !session) return null;
  return session.access_token;
}

// ── Core request function ───────────────────────────────────

async function request<T = any>(
  method: 'GET' | 'POST' | 'PATCH',
  path: string,
  body?: unknown,
): Promise<T> {
  let token = await getAccessToken();

  const doFetch = async (accessToken: string | null): Promise<Response> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const opts: RequestInit = { method, headers };
    if (body !== undefined && method !== 'GET') {
      opts.body = JSON.stringify(body);
    }

    return fetch(`${BASE_URL}${path}`, opts);
  };

  let res = await doFetch(token);

  // On 401, try refreshing the token and retry once
  if (res.status === 401) {
    const freshToken = await refreshAndGetToken();
    if (freshToken) {
      res = await doFetch(freshToken);
    }
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new ApiError(res.status, text || `Request failed: ${method} ${path}`);
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

// ── Public API client ───────────────────────────────────────

export const apiClient = {
  get: <T = any>(path: string) => request<T>('GET', path),
  post: <T = any>(path: string, body?: unknown) => request<T>('POST', path, body),
  patch: <T = any>(path: string, body?: unknown) => request<T>('PATCH', path, body),
};

// ── Error class ─────────────────────────────────────────────

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}
