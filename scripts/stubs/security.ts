// ============================================================
// stubs/security.ts
// If lib/security.ts doesn't exist in the v7 codebase,
// create it with this content:
// ============================================================

export function sanitizeText(text: string): string {
  if (!text) return text;
  return text
    .replace(/<[^>]*>/g, '')              // Strip HTML tags
    .replace(/javascript:/gi, '')          // Strip JS protocol
    .replace(/on\w+\s*=/gi, '')           // Strip event handlers
    .trim();
}

export function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z\s\-'.]/g, '').trim().slice(0, 100);
}

export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase().slice(0, 254);
}

export function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export function safeError(error: any, fallback = 'Something went wrong'): string {
  // Log the real error server-side, return generic message to client
  console.error('Error:', error);
  return fallback;
}
