// ============================================================
// Be Candid — Admin Check
// Verifies whether a given email belongs to a platform admin.
// Admin emails are defined via the ADMIN_EMAILS env var
// (comma-separated list).
// ============================================================

export function isAdmin(email: string): boolean {
  const admins = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.toLowerCase());
}
