import { CONFIG } from '../shared/config.js';
import { getSession, setSession, clearSession, setSettings } from '../shared/storage.js';
import { setUserRules } from './contentFilter.js';

async function ensureAccessToken(explicitToken) {
  if (explicitToken) return explicitToken;

  const session = await getSession();
  if (session.access_token) return session.access_token;
  if (!session.refresh_token) return null;

  try {
    const res = await fetch(`${CONFIG.SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: {
        'apikey': CONFIG.SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: session.refresh_token }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    await setSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + (data.expires_in * 1000),
      user_id: data.user?.id || session.user_id,
    });

    return data.access_token;
  } catch {
    return null;
  }
}

/**
 * Sign in with email and password via Supabase REST API.
 */
export async function signIn(email, password) {
  const res = await fetch(`${CONFIG.SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'apikey': CONFIG.SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error_description || err.msg || 'Sign in failed');
  }

  const data = await res.json();
  await setSession({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + (data.expires_in * 1000),
    user_id: data.user?.id,
  });

  // Fetch extension settings
  await fetchSettings(data.access_token);

  return data.user;
}

/**
 * Sign out and clear all stored data.
 */
export async function signOut() {
  await clearSession();
  setUserRules(null);
}

/**
 * Check if the user is authenticated with a valid token.
 */
export async function isAuthenticated() {
  const session = await getSession();
  return !!(session.access_token || session.refresh_token);
}

/**
 * Fetch user settings for the extension from the API.
 */
export async function fetchSettings(token) {
  try {
    const accessToken = await ensureAccessToken(token);
    if (!accessToken) return null;
    const res = await fetch(`${CONFIG.API_URL}/api/extension/settings`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    if (res.ok) {
      const settings = await res.json();
      await setSettings(settings);
      if (settings.content_rules) {
        setUserRules(settings.content_rules);
      }
      return settings;
    }
  } catch (e) {
    console.warn('Failed to fetch settings:', e);
  }
  return null;
}
