import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

type StoredResponse = {
  status: number;
  body: Record<string, unknown>;
};

type IdempotencyState =
  | { state: 'new' }
  | { state: 'pending' }
  | { state: 'replay'; response: Response };

type StoredRecord = {
  status: 'pending' | 'completed';
  responseStatus?: number | null;
  responseBody?: Record<string, unknown> | null;
  expiresAt: string;
};

const FALLBACK_STORE = new Map<string, StoredRecord>();

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    const serialized = JSON.stringify(value);
    return serialized === undefined ? '"__undefined__"' : serialized;
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, val]) => `${JSON.stringify(key)}:${stableStringify(val)}`);
  return `{${entries.join(',')}}`;
}

export function buildIdempotencyKey(scope: string, userId: string, payload: unknown): string {
  const hash = crypto
    .createHash('sha256')
    .update(`${scope}:${userId}:${stableStringify(payload)}`)
    .digest('hex');
  return `${scope}:${userId}:${hash}`;
}

function replayResponse(response: StoredResponse) {
  return NextResponse.json(response.body, {
    status: response.status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Idempotent-Replay': 'true',
    },
  });
}

function getFallbackRecord(key: string): StoredRecord | null {
  const record = FALLBACK_STORE.get(key);
  if (!record) return null;
  if (new Date(record.expiresAt).getTime() <= Date.now()) {
    FALLBACK_STORE.delete(key);
    return null;
  }
  return record;
}

export async function getIdempotencyState(key: string): Promise<IdempotencyState> {
  const nowIso = new Date().toISOString();

  try {
    const db = createServiceClient();
    const { data, error } = await db
      .from('request_idempotency')
      .select('status, response_status, response_body, expires_at')
      .eq('key', key)
      .gt('expires_at', nowIso)
      .maybeSingle();

    if (!error && data) {
      if (
        data.status === 'completed'
        && typeof data.response_status === 'number'
        && data.response_body
      ) {
        return {
          state: 'replay',
          response: replayResponse({
            status: data.response_status,
            body: data.response_body as Record<string, unknown>,
          }),
        };
      }

      return { state: 'pending' };
    }
  } catch {
    // Fall back below.
  }

  const fallback = getFallbackRecord(key);
  if (!fallback) return { state: 'new' };

  if (
    fallback.status === 'completed'
    && typeof fallback.responseStatus === 'number'
    && fallback.responseBody
  ) {
    return {
      state: 'replay',
      response: replayResponse({
        status: fallback.responseStatus,
        body: fallback.responseBody,
      }),
    };
  }

  return { state: 'pending' };
}

export async function reserveIdempotencyKey(
  key: string,
  scope: string,
  userId: string,
  ttlMs: number,
): Promise<IdempotencyState> {
  const nowIso = new Date().toISOString();
  const expiresAt = new Date(Date.now() + ttlMs).toISOString();

  try {
    const db = createServiceClient();
    const current = await getIdempotencyState(key);
    if (current.state !== 'new') return current;

    const { error } = await db.from('request_idempotency').insert({
      key,
      user_id: userId,
      scope,
      status: 'pending',
      expires_at: expiresAt,
    });

    if (!error) {
      return { state: 'new' };
    }

    if (error.code === '23505') {
      const { data: recycled } = await db
        .from('request_idempotency')
        .update({
          user_id: userId,
          scope,
          status: 'pending',
          response_status: null,
          response_body: null,
          expires_at: expiresAt,
          updated_at: nowIso,
        })
        .eq('key', key)
        .lte('expires_at', nowIso)
        .select('key')
        .maybeSingle();

      if (recycled?.key) {
        return { state: 'new' };
      }

      return getIdempotencyState(key);
    }
  } catch {
    // Fall through to in-memory reservation.
  }

  FALLBACK_STORE.set(key, {
    status: 'pending',
    expiresAt,
  });

  return { state: 'new' };
}

export async function storeIdempotentResponse(
  key: string,
  response: StoredResponse,
): Promise<void> {
  const nowIso = new Date().toISOString();

  try {
    const db = createServiceClient();
    await db.from('request_idempotency').update({
      status: 'completed',
      response_status: response.status,
      response_body: response.body,
      updated_at: nowIso,
    }).eq('key', key);
    return;
  } catch {
    // Fall back below.
  }

  const fallback = getFallbackRecord(key);
  if (!fallback) return;

  FALLBACK_STORE.set(key, {
    ...fallback,
    status: 'completed',
    responseStatus: response.status,
    responseBody: response.body,
    expiresAt: fallback.expiresAt,
  });
}
