/**
 * Upload captured screenshots to the Be Candid API for AI analysis.
 * Handles auth token refresh and retry logic.
 */

const { getAccessToken, refreshToken } = require('./auth');

const API_URL = 'https://becandid.io';

/**
 * Upload a base64 JPEG screenshot for analysis.
 * @param {string} base64Image - Base64-encoded JPEG screenshot
 * @param {object} [metadata] - Screenshot metadata for the pre-classifier
 * @param {string} [metadata.activeApp] - Name of the active application
 * @param {string} [metadata.windowTitle] - Window title text
 * @param {string} [metadata.activeUrl] - Active URL if in a browser
 * @param {string} [metadata.timestamp] - ISO timestamp of capture
 * @param {boolean} [metadata.screenChanged] - Whether the screen changed since last capture
 * @returns {Promise<object|null>} API response or null on failure
 */
async function uploadCapture(base64Image, metadata) {
  let token = getAccessToken();
  if (!token) {
    console.log('[uploader] No access token, skipping');
    return null;
  }

  let res = await doUpload(base64Image, token, metadata);

  // Handle 401 by refreshing token
  if (res?.status === 401) {
    const refreshed = await refreshToken();
    if (refreshed) {
      token = getAccessToken();
      res = await doUpload(base64Image, token, metadata);
    } else {
      console.log('[uploader] Token refresh failed');
      return null;
    }
  }

  if (res?.status === 429) {
    console.log('[uploader] Rate limited, will retry next cycle');
    return null;
  }

  if (!res?.ok) {
    console.error(`[uploader] Upload failed: ${res?.status}`);
    return null;
  }

  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function doUpload(base64Image, token, metadata) {
  try {
    return await fetch(`${API_URL}/api/screen-capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ image: base64Image, metadata: metadata || undefined }),
    });
  } catch (err) {
    console.error('[uploader] Network error:', err.message);
    return null;
  }
}

module.exports = { uploadCapture };
