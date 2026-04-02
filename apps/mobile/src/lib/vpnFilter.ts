/**
 * Local VPN DNS Filter
 *
 * Creates a local VPN that intercepts DNS queries to detect domain access.
 * All processing happens on-device — no traffic leaves the phone.
 *
 * On Android: Uses VpnService to create a local TUN interface
 * On iOS: Uses NEDNSProxyProvider (requires Network Extension entitlement)
 *
 * Falls back to periodic usage checking if VPN permission is denied.
 */

import { NativeModules } from 'react-native';
import { checkUrlOnDevice } from './contentFilter.client';
import { recordAppUsage } from './screenTime.client';

const VpnDnsFilter = NativeModules.VpnDnsFilter;

interface DnsQuery {
  domain: string;
  timestamp: number;
}

let isRunning = false;
let onDomainDetected: ((domain: string) => void) | null = null;

/**
 * Check if VPN filter is available on this platform
 */
export function isAvailable(): boolean {
  return !!VpnDnsFilter;
}

/**
 * Check if VPN is currently active
 */
export async function isActive(): Promise<boolean> {
  if (!VpnDnsFilter) return false;
  try {
    return await VpnDnsFilter.isActive();
  } catch {
    return false;
  }
}

/**
 * Start the local VPN DNS filter
 * User will be prompted for VPN permission on first start
 */
export async function start(): Promise<boolean> {
  if (!VpnDnsFilter) {
    console.warn('[vpnFilter] VPN DNS filter not available on this platform');
    return false;
  }

  try {
    await VpnDnsFilter.start();
    isRunning = true;

    // Start polling for detected domains
    startPolling();
    return true;
  } catch (e) {
    console.error('[vpnFilter] Failed to start:', e);
    return false;
  }
}

/**
 * Stop the VPN DNS filter
 */
export async function stop(): Promise<void> {
  if (!VpnDnsFilter) return;
  try {
    await VpnDnsFilter.stop();
    isRunning = false;
  } catch (e) {
    console.error('[vpnFilter] Failed to stop:', e);
  }
}

/**
 * Get recent DNS queries detected by the VPN
 */
export async function getRecentQueries(limit = 50): Promise<DnsQuery[]> {
  if (!VpnDnsFilter) return [];
  try {
    return await VpnDnsFilter.getRecentQueries(limit);
  } catch {
    return [];
  }
}

/**
 * Set callback for when a flagged domain is detected
 */
export function onFlaggedDomain(callback: (domain: string) => void): void {
  onDomainDetected = callback;
}

// Poll for new DNS queries and check against content filter
let pollInterval: ReturnType<typeof setInterval> | null = null;

function startPolling() {
  if (pollInterval) clearInterval(pollInterval);

  pollInterval = setInterval(async () => {
    if (!isRunning) {
      if (pollInterval) clearInterval(pollInterval);
      return;
    }

    try {
      const queries = await getRecentQueries(20);
      const seen = new Set<string>();

      for (const q of queries) {
        if (seen.has(q.domain)) continue;
        seen.add(q.domain);

        const result = await checkUrlOnDevice(`https://${q.domain}`);
        if (result.blocked) {
          // Record the screen time
          const category = result.category || 'other';
          await recordAppUsage(q.domain, category, 1); // 1 min per detection

          // Notify callback
          if (onDomainDetected) {
            onDomainDetected(q.domain);
          }
        }
      }
    } catch (_e) {
      // Silent fail on poll
    }
  }, 30_000); // Check every 30 seconds
}
