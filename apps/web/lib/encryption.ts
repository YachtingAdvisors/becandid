// ============================================================
// lib/encryption.ts
//
// Application-layer encryption for sensitive user data.
// Encrypts BEFORE writing to Supabase, decrypts AFTER reading.
//
// Why: Supabase encrypts at rest, but anyone with DB admin
// access (or a leaked service role key) can read plaintext.
// This ensures journal entries about shame, loneliness, and
// relapse are unreadable without the app's encryption key.
//
// Algorithm: AES-256-GCM (authenticated encryption)
// Key derivation: HKDF from master key + user ID (per-user keys)
// ============================================================

import { createCipheriv, createDecipheriv, randomBytes, createHmac } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
function getMasterKey(): string {
  const key = process.env.ENCRYPTION_MASTER_KEY ?? '';
  if (!key && process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
    console.warn('ENCRYPTION_MASTER_KEY not set — encryption will be a passthrough');
  }
  return key;
}

// ── Key derivation ──────────────────────────────────────────
// Derives a unique 32-byte key per user from the master key.
// This means compromising one user's data doesn't expose others.

function deriveKey(userId: string): Buffer {
  return createHmac('sha256', Buffer.from(getMasterKey() || '0'.repeat(64), 'hex'))
    .update(`be-candid:user:${userId}`)
    .digest();
}

// ── Encrypt ─────────────────────────────────────────────────
// Returns: base64 string of [iv (16) + authTag (16) + ciphertext]

export function encrypt(plaintext: string, userId: string): string {
  if (!plaintext) return plaintext;
  if (!getMasterKey()) return plaintext; // Skip in dev if no key configured

  const key = deriveKey(userId);
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  // Pack: iv + authTag + ciphertext
  const packed = Buffer.concat([iv, authTag, encrypted]);
  return packed.toString('base64');
}

// ── Decrypt ─────────────────────────────────────────────────

export function decrypt(ciphertext: string, userId: string): string {
  if (!ciphertext) return ciphertext;
  if (!getMasterKey()) return ciphertext;

  try {
    const packed = Buffer.from(ciphertext, 'base64');

    // Unpack
    const iv = packed.subarray(0, IV_LENGTH);
    const authTag = packed.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = packed.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    const key = deriveKey(userId);
    const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  } catch (e) {
    // If decryption fails, the data might be unencrypted (migration)
    // Return as-is rather than crashing
    console.warn('Decryption failed — returning raw value (may be pre-encryption data)');
    return ciphertext;
  }
}

// ── Batch helpers for journal entries ────────────────────────

const ENCRYPTED_JOURNAL_FIELDS = ['freewrite', 'tributaries', 'longing', 'roadmap', 'prompt_shown'] as const;
const ENCRYPTED_EVENT_FIELDS = ['metadata'] as const;

export function encryptJournalEntry(entry: Record<string, any>, userId: string): Record<string, any> {
  const encrypted = { ...entry };
  for (const field of ENCRYPTED_JOURNAL_FIELDS) {
    if (encrypted[field]) {
      encrypted[field] = encrypt(encrypted[field], userId);
    }
  }
  return encrypted;
}

export function decryptJournalEntry(entry: Record<string, any>, userId: string): Record<string, any> {
  if (!entry) return entry;
  const decrypted = { ...entry };
  for (const field of ENCRYPTED_JOURNAL_FIELDS) {
    if (decrypted[field]) {
      decrypted[field] = decrypt(decrypted[field], userId);
    }
  }
  return decrypted;
}

export function decryptJournalEntries(entries: Record<string, any>[], userId: string): Record<string, any>[] {
  return entries.map((e) => decryptJournalEntry(e, userId));
}

// ── Conversation guide encryption ───────────────────────────

export function encryptGuide(guideJson: string, userId: string): string {
  return encrypt(guideJson, userId);
}

export function decryptGuide(ciphertext: string, userId: string): string {
  return decrypt(ciphertext, userId);
}

// ── Hash for non-reversible data (URL hashes, etc.) ─────────

export function hashValue(value: string): string {
  return createHmac('sha256', Buffer.from(getMasterKey() || '0'.repeat(64), 'hex'))
    .update(value)
    .digest('hex');
}
