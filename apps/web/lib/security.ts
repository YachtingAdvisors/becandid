// ============================================================
// Be Candid — Security Utilities
// Input sanitization, safe error responses, audit logging
// ============================================================

// ─── Input Sanitization ──────────────────────────────────────

/**
 * Strip HTML tags and limit string length.
 * Use on all user-provided text fields before storing.
 */
export function sanitizeText(input: string, maxLength: number = 500): string {
  return input
    .replace(/<[^>]*>/g, '')           // strip HTML tags
    .replace(/[<>]/g, '')              // remove stray angle brackets
    .replace(/javascript:/gi, '')      // remove JS protocol
    .replace(/on\w+\s*=/gi, '')        // remove event handlers
    .trim()
    .slice(0, maxLength);
}

/**
 * Sanitize a name field — stricter than general text.
 */
export function sanitizeName(input: string): string {
  return input
    .replace(/[<>"'`;(){}]/g, '')      // no special chars
    .replace(/\s+/g, ' ')             // collapse whitespace
    .trim()
    .slice(0, 100);
}

/**
 * Validate and normalize an email address.
 */
export function sanitizeEmail(input: string): string | null {
  const email = input.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) return null;
  if (email.length > 254) return null;
  return email;
}

/**
 * Validate and normalize a phone number.
 */
export function sanitizePhone(input: string): string | null {
  const digits = input.replace(/[^\d+]/g, '');
  if (digits.length < 10 || digits.length > 16) return null;
  return digits;
}

// ─── Safe Error Responses ────────────────────────────────────

/**
 * Create a safe error message that doesn't leak internals.
 * Logs the full error server-side, returns generic message to client.
 */
export function safeError(
  route: string,
  err: unknown,
  status: number = 500
): Response {
  // Log full error server-side
  console.error(`[${route}]`, err instanceof Error ? err.message : err);
  if (err instanceof Error && err.stack) {
    console.error(err.stack);
  }

  // Return generic message to client
  const clientMessage = status === 400 ? 'Invalid request'
    : status === 401 ? 'Unauthorized'
    : status === 403 ? 'Forbidden'
    : status === 404 ? 'Not found'
    : status === 409 ? 'Conflict'
    : status === 429 ? 'Too many requests'
    : 'Something went wrong';

  return new Response(
    JSON.stringify({ error: clientMessage }),
    { status, headers: { 'Content-Type': 'application/json' } }
  );
}

// ─── Audit Logger ────────────────────────────────────────────

export type AuditAction =
  | 'auth.signin'
  | 'auth.signup'
  | 'auth.signout'
  | 'profile.update'
  | 'partner.invite'
  | 'partner.accept'
  | 'event.created'
  | 'alert.sent'
  | 'conversation.completed'
  | 'checkin.confirmed'
  | 'account.exported'
  | 'account.deleted'
  | 'settings.changed'
  | 'vulnerability_window.created'
  | 'vulnerability_window.deleted'
  | 'therapist_invited'
  | 'therapist_revoked'
  | 'therapist_consent_updated'
  | 'data_export'
  | 'data_purge'
  | 'retention_updated'
  | 'payment_failed'
  | 'solo_mode_toggled';

interface AuditEntry {
  action: AuditAction;
  userId: string;
  metadata?: Record<string, unknown>;
  ip?: string;
}

/**
 * Log an audit event. In production, this should write to a
 * dedicated audit_log table or external service (Datadog, etc).
 * For now, structured console logging.
 */
export function auditLog(entry: AuditEntry): void {
  const log = {
    timestamp: new Date().toISOString(),
    action: entry.action,
    userId: entry.userId,
    ...entry.metadata,
    ...(entry.ip ? { ip: entry.ip } : {}),
  };

  console.log('[AUDIT]', JSON.stringify(log));
}

/**
 * Insert audit log into Supabase (if audit_log table exists).
 * Fails silently — audit logging should never block the request.
 */
export async function auditLogDb(
  db: any,
  entry: AuditEntry
): Promise<void> {
  try {
    await db.from('audit_log').insert({
      user_id: entry.userId,
      action: entry.action,
      metadata: entry.metadata ?? {},
      ip_address: entry.ip ?? null,
      created_at: new Date().toISOString(),
    });
  } catch {
    // Silent — audit logging never blocks
    auditLog(entry); // fallback to console
  }
}

// ─── UUID Validation ─────────────────────────────────────────

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUUID(input: string): boolean {
  return UUID_REGEX.test(input);
}
