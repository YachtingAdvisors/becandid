import { CONFIG } from '../shared/config.js';
import { getSession, setSession, clearSession, setSettings } from '../shared/storage.js';
import { setUserRules } from './contentFilter.js';

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
  return !!session.access_token;
}

/**
 * Fetch user settings for the extension from the API.
 */
export async function fetchSettings(token) {
  try {
    const session = token ? { access_token: token } : await getSession();
    const res = await fetch(`${CONFIG.API_URL}/api/extension/settings`, {
      headers: { 'Authorization': `Bearer ${session.access_token}` },
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
