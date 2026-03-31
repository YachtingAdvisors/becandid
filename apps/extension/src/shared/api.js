import { CONFIG } from './config.js';
import { getSession } from './storage.js';

/**
 * Authenticated API request to Be Candid.
 */
async function apiRequest(method, path, body = null) {
  const session = await getSession();
  if (!session.access_token) {
    throw new Error('Not authenticated');
  }

  const headers = {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  };

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${CONFIG.API_URL}${path}`, options);

  if (res.status === 401) {
    // Token expired — try refresh
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${refreshed}`;
      const retry = await fetch(`${CONFIG.API_URL}${path}`, { ...options, headers });
      return retry.json();
    }
    throw new Error('Session expired');
  }

  return res.json();
}

export function apiGet(path) {
  return apiRequest('GET', path);
}

export function apiPost(path, body) {
  return apiRequest('POST', path, body);
}

export function apiPatch(path, body) {
  return apiRequest('PATCH', path, body);
}

/**
 * Refresh the access token using the stored refresh token.
 */
async function refreshAccessToken() {
  const session = await getSession();
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
    const { setSession } = await import('./storage.js');
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
