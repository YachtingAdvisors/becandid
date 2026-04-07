# Be Candid VPN Strategy: DNS-Only Packet Tunnel

## Architecture Overview

### The Problem with Traditional Accountability VPNs

```
Standard VPN (Covenant Eyes, Ever Accountable):
  ALL traffic → VPN tunnel → inspect → forward → slow, drains battery

Be Candid DNS-Only:
  DNS queries only → local resolver → check against blocklist → log if match
  All other traffic → passes through untouched at full speed
```

Traditional accountability apps route **every packet** through a VPN tunnel.
This means gigabytes of data per day are intercepted, inspected, and forwarded
-- even traffic that has nothing to do with accountability. The result: battery
drain, speed loss, broken apps, and constant reconnection issues.

Be Candid takes a fundamentally different approach. We only need to know
**which domains** a user visits, not what they do on those domains. DNS queries
are the minimal signal that gives us domain-level visibility.

---

## Implementation Plan

### 1. NEPacketTunnelProvider (iOS Network Extension)

The core of the DNS-only approach:

- **Intercept DNS queries only** (UDP port 53)
- Check each queried domain against the user's rival-specific blocklist
- If match: log the domain + category + timestamp to local storage
- If no match: forward the DNS query normally to the upstream resolver
- **ALL actual traffic** (HTTP, HTTPS, streaming, downloads) passes through
  untouched -- the packet tunnel only handles DNS resolution

#### How It Works

```
1. User opens Safari, types "example.com"
2. OS sends DNS query: "What is the IP of example.com?"
3. Our PacketTunnelProvider intercepts this tiny UDP packet (~100 bytes)
4. We check "example.com" against the user's blocklist
5. If flagged: log { domain, category, timestamp } locally
6. Forward the DNS query to the real DNS server (e.g., 1.1.1.1)
7. Return the DNS response to the OS
8. All subsequent HTTPS traffic to example.com flows normally -- we never touch it
```

### 2. Battery Optimization

DNS queries are negligible in terms of data and processing:

| Metric | DNS-Only (Be Candid) | Full VPN (Covenant Eyes) |
|--------|----------------------|--------------------------|
| Data processed/day | ~200 KB | 2-10 GB |
| Packets inspected/day | ~2,000 | Millions |
| CPU wake frequency | On DNS query only | Continuous |
| Battery impact | < 1% | 10-25% |
| Background processing | Minimal | Heavy |

- Average user makes ~2,000 DNS queries/day
- Each DNS query is ~100 bytes
- Processing 2,000 x 100 bytes = **200 KB/day** -- negligible
- Compared to Covenant Eyes: processes **ALL traffic** (GB/day)

### 3. Stability

The DNS-only approach eliminates the most common VPN-related issues:

- **No full traffic routing** = no speed impact on browsing or streaming
- **No TLS inspection** = no certificate conflicts, no HTTPS errors
- **No proxy** = no broken apps, banking apps work normally
- **No split tunneling conflicts** = works alongside corporate VPNs
- **Simple UDP packet inspection** = minimal crash surface
- **No content analysis** = no memory pressure from inspecting payloads

### 4. On-Demand Activation

Not every user needs DNS monitoring:

- **Only activate** for users with screen-scannable rivals (pornography,
  gambling, social media, dating apps, etc.)
- **Users with only behavioral rivals** (isolation, overworking,
  procrastination, emotional affairs, sleep avoidance) → no VPN needed.
  These users get check-ins, journal nudges, and connection tools instead.
  See `isolationMode.ts` and `isNonScanUser()`.
- **Configurable active hours**: users can set monitoring windows
  (e.g., 8 PM -- 6 AM only) to reduce resource usage further
- **Pause support**: temporary disable during work hours or travel

### 5. Privacy & Security

- DNS queries are checked **locally on-device** -- no data sent to our servers
  during the lookup
- Only the **domain name** is logged, never the full URL or page content
- Logged domains are synced to the server **periodically** (every 5 minutes)
  in a batched, encrypted payload
- **Partner never sees the domains** -- only the category and timing
  (e.g., "Pornography flag at 11:32 PM", not "pornhub.com")
- DNS responses are not modified -- we observe, we do not block

---

## Native Module Requirements

The `NEPacketTunnelProvider` requires:

1. **Network Extension capability** in Xcode project settings
2. **A separate App Extension target** (`PacketTunnelProvider.appex`)
3. **Apple Developer Program membership** (need account reinstatement first)
4. **App Groups** for sharing data between the main app and the extension
5. This **cannot** be done in Expo managed workflow -- requires `expo prebuild`
   to generate the native Xcode project

### Extension Target Structure

```
ios/
├── BeCandid/                    # Main app target
│   └── Info.plist
├── BeCandidTunnel/             # Network Extension target
│   ├── PacketTunnelProvider.swift
│   ├── DnsParser.swift
│   ├── BlocklistChecker.swift
│   └── Info.plist
└── BeCandid.entitlements
```

### Key Entitlements

```xml
<key>com.apple.developer.networking.networkextension</key>
<array>
    <string>packet-tunnel-provider</string>
</array>
```

---

## Interim Approach (Before Native Module)

Until the native VPN is built, we have coverage through other channels:

### Android
- **UsageStatsManager** already tracks app usage (which apps, duration)
- This works today and does not require a VPN

### iOS
- **Manual check-in system** + push notification nudges at vulnerability windows
- **Screen Time API** (limited) for basic app usage data
- **Journal prompts** triggered by time-of-day patterns

### Both Platforms
- **Browser extension** (Chrome/Firefox/Safari) for desktop web monitoring
- **Desktop app** for screen-level awareness on macOS/Windows

The VPN DNS filter is an **enhancement** for mobile web browsing visibility,
not a requirement for launch. The app is fully functional without it.

---

## Comparison with Competitors

| Aspect | Be Candid | Covenant Eyes | Ever Accountable |
|--------|-----------|---------------|------------------|
| VPN type | DNS-only | Full tunnel | Full tunnel |
| Traffic inspected | DNS queries | All traffic | All traffic |
| Screenshots | No | Yes (every few seconds) | Yes |
| TLS inspection | No | Yes | Yes |
| Battery impact | < 1% | 10-25% | 10-25% |
| Speed impact | None | Noticeable | Noticeable |
| Corporate VPN conflict | None | Frequent | Frequent |
| App breakage | None | Common | Common |
| Data processed/day | ~200 KB | 2-10 GB | 2-10 GB |
| Privacy | Domain + category only | Full browsing history | Full browsing history |

---

## Implementation Phases

### Phase 1: Foundation (Current)
- [x] Domain blocklist system (`contentBlocklist.ts`)
- [x] Category classification (25 rival categories)
- [x] Isolation mode detection (`isolationMode.ts`)
- [x] VPN helper types and stub (`vpnFilter.ts`)
- [x] Android native module structure

### Phase 2: iOS Native Extension
- [ ] Reinstate Apple Developer Program account
- [ ] Create Network Extension target in Xcode
- [ ] Implement `NEPacketTunnelProvider` with DNS parsing
- [ ] Implement local blocklist checker
- [ ] Set up App Groups for data sharing
- [ ] Run `expo prebuild` and integrate

### Phase 3: Enhancement
- [ ] Active hours scheduling
- [ ] Sync logged domains to server (batched, encrypted)
- [ ] Partner notification pipeline (category + timing only)
- [ ] Analytics: DNS query volume, match rate, category distribution
- [ ] Configurable upstream DNS (1.1.1.1, 8.8.8.8, user choice)

### Phase 4: Optimization
- [ ] Bloom filter for O(1) blocklist lookup on large lists
- [ ] DNS response caching to reduce upstream queries
- [ ] Battery usage telemetry and optimization
- [ ] Stress testing with high-volume DNS environments
