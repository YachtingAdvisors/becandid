// ============================================================
// lib/uaParser.ts
//
// Lightweight user-agent parsing for session display.
// No external dependencies — just regex matching.
// ============================================================

interface ParsedUA {
  browser: string;
  os: string;
  device: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
}

export function parseUserAgent(ua: string): ParsedUA {
  return {
    browser: parseBrowser(ua),
    os: parseOS(ua),
    device: parseDevice(ua),
    deviceType: parseDeviceType(ua),
  };
}

function parseBrowser(ua: string): string {
  if (/Edg\//i.test(ua)) return 'Edge';
  if (/OPR\//i.test(ua) || /Opera/i.test(ua)) return 'Opera';
  if (/Brave/i.test(ua)) return 'Brave';
  if (/Vivaldi/i.test(ua)) return 'Vivaldi';
  if (/Firefox/i.test(ua)) return 'Firefox';
  if (/CriOS/i.test(ua)) return 'Chrome';
  if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) return 'Chrome';
  if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return 'Safari';
  if (/MSIE|Trident/i.test(ua)) return 'Internet Explorer';
  return 'Unknown Browser';
}

function parseOS(ua: string): string {
  if (/iPhone|iPod/i.test(ua)) return 'iOS';
  if (/iPad/i.test(ua)) return 'iPadOS';
  if (/Android/i.test(ua)) return 'Android';
  if (/Mac OS X|Macintosh/i.test(ua)) return 'macOS';
  if (/Windows/i.test(ua)) return 'Windows';
  if (/CrOS/i.test(ua)) return 'ChromeOS';
  if (/Linux/i.test(ua)) return 'Linux';
  return 'Unknown OS';
}

function parseDevice(ua: string): string {
  if (/iPhone/i.test(ua)) return 'iPhone';
  if (/iPad/i.test(ua)) return 'iPad';
  if (/Android/i.test(ua) && /Mobile/i.test(ua)) return 'Android Phone';
  if (/Android/i.test(ua)) return 'Android Tablet';
  if (/Macintosh|Mac OS/i.test(ua)) return 'Mac';
  if (/Windows/i.test(ua)) return 'Windows PC';
  if (/CrOS/i.test(ua)) return 'Chromebook';
  if (/Linux/i.test(ua)) return 'Linux';
  return 'Unknown Device';
}

function parseDeviceType(ua: string): 'desktop' | 'mobile' | 'tablet' {
  if (/iPad/i.test(ua)) return 'tablet';
  if (/Android/i.test(ua) && !/Mobile/i.test(ua)) return 'tablet';
  if (/iPhone|iPod|Android.*Mobile|webOS|BlackBerry/i.test(ua)) return 'mobile';
  return 'desktop';
}

/**
 * Mask an IP address for display — show first two octets, mask last two.
 * IPv6 addresses are truncated to first segment.
 */
export function maskIp(ip: string): string {
  if (!ip || ip === 'unknown') return 'Unknown';

  // IPv4
  const ipv4Parts = ip.split('.');
  if (ipv4Parts.length === 4) {
    return `${ipv4Parts[0]}.${ipv4Parts[1]}.*.*`;
  }

  // IPv6 — show first segment only
  if (ip.includes(':')) {
    const first = ip.split(':')[0];
    return `${first}:****`;
  }

  return ip;
}
