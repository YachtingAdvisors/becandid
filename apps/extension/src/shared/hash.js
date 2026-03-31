/**
 * SHA-256 hash a string using Web Crypto API.
 * Returns hex-encoded hash. Used for URL privacy — never send full URLs.
 */
export async function sha256(str) {
  const data = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Extract domain from a URL string.
 */
export function extractDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}
