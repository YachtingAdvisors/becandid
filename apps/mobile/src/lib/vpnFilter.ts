/**
 * Be Candid VPN DNS Filter
 *
 * Unlike traditional VPNs that route ALL traffic (causing battery drain,
 * speed reduction, and connection issues), Be Candid uses a DNS-only
 * approach:
 *
 * - Intercepts DNS queries only (tiny packets, ~100 bytes each)
 * - Checks domain names against the user's rival-specific blocklist
 * - All actual traffic passes through untouched at full speed
 * - No TLS inspection, no certificate conflicts, no broken apps
 *
 * This gives us domain-level visibility with <1% of the battery impact
 * of a traditional VPN.
 *
 * Architecture:
 *   DNS queries → local NEPacketTunnelProvider → check blocklist → log if match
 *   All other traffic → passes through untouched at full speed
 *
 * On Android: Uses VpnService to create a local TUN interface (DNS-only)
 * On iOS: Uses NEPacketTunnelProvider (requires Network Extension entitlement)
 *
 * Falls back to periodic usage checking if VPN permission is denied.
 *
 * See: apps/mobile/docs/VPN-STRATEGY.md for full architecture details.
 */

import { NativeModules } from 'react-native';
import { checkUrlOnDevice } from './contentFilter.client';
import { recordAppUsage } from './screenTime.client';

const VpnDnsFilter = NativeModules.VpnDnsFilter;

// ── Types ───────────────────────────────────────────────────────

/** A single DNS query intercepted by the packet tunnel */
export interface DnsQuery {
  /** The domain name queried (e.g., "example.com") */
  domain: string;
  /** ISO 8601 timestamp of when the query was intercepted */
  timestamp: string;
  /** Whether this domain matched the user's blocklist */
  matched: boolean;
  /** The rival category if matched (e.g., "pornography", "gambling") */
  category?: string;
}

/** Configuration for the DNS-only VPN filter */
export interface VpnConfig {
  /** Whether the VPN DNS filter is enabled */
  enabled: boolean;
  /**
   * Optional active hours window (24h format).
   * If set, the VPN only runs during these hours.
   * Example: { start: 20, end: 6 } = 8 PM to 6 AM
   */
  activeHours?: { start: number; end: number };
  /** The rival categories this user is tracking */
  rivalCategories: string[];
  /** Domain blocklist synced from server, filtered to user's categories */
  blockedDomains: string[];
}

/** Status of the VPN DNS filter */
export interface VpnStatus {
  /** Whether the native module is available on this platform */
  available: boolean;
  /** Whether the VPN is currently running */
  active: boolean;
  /** Whether the user has granted VPN permission */
  permissionGranted: boolean;
  /** Number of DNS queries processed in current session */
  queriesProcessed: number;
  /** Number of blocklist matches in current session */
  matchesFound: number;
}

/** A logged domain match, ready for server sync */
export interface DnsMatchLog {
  domain: string;
  category: string;
  timestamp: string;
  /** Whether this has been synced to the server */
  synced: boolean;
}

// ── State ───────────────────────────────────────────────────────

let isRunning = false;
let onDomainDetected: ((domain: string) => void) | null = null;

// ── Public API ──────────────────────────────────────────────────

/**
 * Check if VPN filter is available on this platform.
 * Returns false on iOS simulator and devices without the Network Extension.
 */
export function isAvailable(): boolean {
  return !!VpnDnsFilter;
}

/**
 * Check if VPN is currently active (DNS tunnel is running).
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
 * Start the local VPN DNS filter.
 *
 * On first start, the OS will prompt the user for VPN permission.
 * The VPN only intercepts DNS queries (UDP port 53) -- all other
 * traffic passes through untouched at full speed.
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
 * Stop the VPN DNS filter.
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
 * Get recent DNS queries detected by the VPN.
 * Returns both matched and unmatched queries for diagnostics.
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
 * Set callback for when a flagged domain is detected.
 * The callback receives the domain name only -- never the full URL or content.
 */
export function onFlaggedDomain(callback: (domain: string) => void): void {
  onDomainDetected = callback;
}

/**
 * Update the VPN configuration (blocklist, active hours, etc.).
 * Call this when the user's rival categories change or after a server sync.
 */
export async function updateConfig(config: VpnConfig): Promise<boolean> {
  if (!VpnDnsFilter) return false;
  try {
    await VpnDnsFilter.updateConfig(config);
    return true;
  } catch (e) {
    console.error('[vpnFilter] Failed to update config:', e);
    return false;
  }
}

/**
 * Get unsync'd domain match logs for server upload.
 * After successful upload, call markLogsSynced() to clear them.
 */
export async function getUnsyncedLogs(): Promise<DnsMatchLog[]> {
  if (!VpnDnsFilter) return [];
  try {
    return await VpnDnsFilter.getUnsyncedLogs();
  } catch {
    return [];
  }
}

/**
 * Mark logs as synced after successful server upload.
 */
export async function markLogsSynced(timestamps: string[]): Promise<void> {
  if (!VpnDnsFilter) return;
  try {
    await VpnDnsFilter.markLogsSynced(timestamps);
  } catch (e) {
    console.error('[vpnFilter] Failed to mark logs synced:', e);
  }
}

// ── Polling ─────────────────────────────────────────────────────

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
