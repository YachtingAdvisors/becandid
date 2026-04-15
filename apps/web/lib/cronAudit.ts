// ============================================================
// lib/cronAudit.ts — Cron completion logger
//
// Call logCronRun() at the end of every cron handler so the
// admin health page can show last-run time and result.
// ============================================================

import type { SupabaseClient } from '@supabase/supabase-js';

export async function logCronRun(
  db: SupabaseClient,
  job: string,
  stats: Record<string, unknown> = {}
): Promise<void> {
  try {
    await db.from('audit_log').insert({
      user_id: null,
      action: `cron_${job}`,
      metadata: { result: 'success', ...stats },
    });
  } catch {
    // Never let audit logging break the cron response
  }
}
