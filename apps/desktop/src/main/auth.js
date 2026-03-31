/**
 * Supabase authentication for the desktop agent.
 * Same REST API approach as the Chrome extension.
 */

const { store } = require('./store');

const SUPABASE_URL = 'https://kiowvsemdxivuyzifmdn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtpb3d2c2VtZHhpdnV5emlmbWRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3NDU0NTksImV4cCI6MjA5MDMyMTQ1OX0.ffdjnAwdyvRBeOUb1S8MAbX3XTsX31xyApJTiQ-vEOs';
const API_URL = 'https://becandid.io';

async function signIn(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error_description || err.msg || 'Sign in failed');
  }

  const data = await res.json();
  store.set('access_token', data.access_token);
  store.set('refresh_token', data.refresh_token);
  store.set('expires_at', Date.now() + (data.expires_in * 1000));
  store.set('user_id', data.user?.id || null);

  // Fetch screen capture settings
  await fetchSettings();

  return data.user;
}

async function refreshToken() {
  const token = store.get('refresh_token');
  if (!token) return false;

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ refresh_token: token }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    store.set('access_token', data.access_token);
    store.set('refresh_token', data.refresh_token);
    store.set('expires_at', Date.now() + (data.expires_in * 1000));
    return true;
  } catch {
    return false;
  }
}

async function fetchSettings() {
  const token = store.get('access_token');
  if (!token) return;

  try {
    const res = await fetch(`${API_URL}/api/screen-capture/settings`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const settings = await res.json();
      if (typeof settings.interval_minutes === 'number') {
        store.set('interval_minutes', settings.interval_minutes);
      }
      if (typeof settings.change_threshold === 'number') {
        store.set('change_threshold', settings.change_threshold);
      }
      if (typeof settings.enabled === 'boolean') {
        store.set('monitoring_enabled', settings.enabled);
      }
    }
  } catch {}
}

function getAccessToken() {
  return store.get('access_token');
}

function getRefreshToken() {
  return store.get('refresh_token');
}

function isAuthenticated() {
  const token = store.get('access_token');
  const expiresAt = store.get('expires_at');
  return !!token && Date.now() < (expiresAt || 0);
}

function signOut() {
  store.set('access_token', null);
  store.set('refresh_token', null);
  store.set('expires_at', null);
  store.set('user_id', null);
}

module.exports = { signIn, signOut, refreshToken, fetchSettings, getAccessToken, getRefreshToken, isAuthenticated };
