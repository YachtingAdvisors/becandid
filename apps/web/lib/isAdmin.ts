// ============================================================
// Be Candid — Admin Check
// Verifies whether a given email belongs to a platform admin.
// Admin emails are defined via the ADMIN_EMAILS env var
// (comma-separated list).
// ============================================================

// Founder email always has admin access
const FOUNDER_EMAILS = ['slaser90@gmail.com', 'shawn@becandid.io'];

export function isAdmin(email: string): boolean {
  const normalizedEmail = email.toLowerCase();

  // Founder always has access
  if (FOUNDER_EMAILS.includes(normalizedEmail)) return true;

  // Additional admins from env var
  const admins = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(normalizedEmail);
}
