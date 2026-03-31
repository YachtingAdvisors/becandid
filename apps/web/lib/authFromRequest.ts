import { NextRequest } from 'next/server';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';

/**
 * Authenticate a request via cookie session OR Bearer token.
 * Cookie auth is tried first (standard web flow).
 * Bearer token is used by the Chrome extension and external API clients.
 */
export async function getUserFromRequest(req: NextRequest) {
  // Try cookie-based auth first (existing web flow)
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) return user;
  } catch {}

  // Fall back to Bearer token (extension/API clients)
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const db = createServiceClient();
      const { data: { user } } = await db.auth.getUser(token);
      return user ?? null;
    } catch {}
  }

  return null;
}
