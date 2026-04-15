import { createHash, randomUUID } from 'crypto';

const DEFAULT_INVITE_TTL_DAYS = 14;
const INVITE_TOKEN_HASH_REGEX = /^[0-9a-f]{64}$/i;

export function normalizeInviteToken(token: string | null | undefined): string | null {
  if (typeof token !== 'string') return null;
  const normalized = token.trim();
  if (!normalized) return null;
  return normalized.slice(0, 200);
}

export function hashInviteToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function getInviteTokenCandidates(token: string): string[] {
  const normalized = normalizeInviteToken(token);
  if (!normalized) return [];

  const candidates = new Set<string>([hashInviteToken(normalized)]);
  if (INVITE_TOKEN_HASH_REGEX.test(normalized)) {
    candidates.add(normalized.toLowerCase());
  } else {
    candidates.add(normalized);
  }
  return Array.from(candidates);
}

export function createInviteToken(ttlDays = DEFAULT_INVITE_TTL_DAYS) {
  const rawToken = randomUUID();
  return {
    rawToken,
    tokenHash: hashInviteToken(rawToken),
    expiresAt: new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000).toISOString(),
  };
}

export function isInviteExpired(expiresAt: string | null | undefined): boolean {
  if (!expiresAt) return true;
  const expiresMs = new Date(expiresAt).getTime();
  if (Number.isNaN(expiresMs)) return true;
  return expiresMs <= Date.now();
}
