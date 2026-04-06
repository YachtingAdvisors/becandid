# Apple Developer Program Reinstatement Request

## To: Apple Developer Program Support
## From: Shawn Laser (slaser90@gmail.com)
## Team ID: TH92H9399U
## Date: April 2026

---

## App Description & Purpose

**Be Candid** is a digital accountability and wellness application that helps users align their screen time with their personal values. It is not surveillance software — it is a voluntary, consent-based accountability tool built on peer-reviewed psychological research.

### What the app does:

- **Heartbeat monitoring**: The desktop app runs as a lightweight tray application that pings our server every 2 minutes to confirm the user is actively using the accountability system. No keylogging, no browsing history collection, no screenshot transmission.

- **Focus tracking**: Detects which application is in the foreground (using Accessibility APIs) and categorizes it against the user's self-selected "rival" categories (e.g., social media, gambling, gaming). The user voluntarily chooses what to monitor.

- **Partner notifications**: When a flagged app is detected, the user's self-chosen accountability partner receives a notification. The partner never sees URLs, screenshots, or specific content — only the category and timing.

- **Conversation guides**: After a flag, the app generates evidence-based conversation guides (grounded in Motivational Interviewing) to help the user and their partner have a productive, shame-free conversation.

### What the app does NOT do:

- Does NOT capture screenshots or screen recordings
- Does NOT log keystrokes
- Does NOT record browsing history or URLs
- Does NOT transmit any personally identifiable content to third parties
- Does NOT run without the user's explicit consent
- Does NOT prevent the user from quitting the application
- Can be uninstalled at any time by the user

### Clinical foundation:

Be Candid is built on the research of Jay Stringer (author of *Unwanted*), Motivational Interviewing (Miller & Rollnick), and AA's evidence-based recovery principles. The app includes:

- A therapist portal where licensed clinicians can (with granular user consent) view mood data, journal themes, and behavioral patterns
- Integration with the Stringer framework's six family-of-origin dynamics
- A conversation coach grounded in clinical best practices

### Comparable approved apps:

The following apps with similar or more invasive functionality are available on the Mac App Store or distributed with Developer ID certificates:

- **Covenant Eyes** — screen capture + AI image analysis accountability
- **Ever Accountable** — always-on background monitoring
- **Bark** — text/social media scanning for parents
- **Qustodio** — full device monitoring and content blocking

Be Candid is significantly *less* invasive than all of the above.

---

## Website

**https://becandid.io**

The website includes:
- Full feature descriptions and privacy policy
- Pricing information (freemium model: Free / Pro $9.99/mo / Therapy $19.99/mo)
- Blog with educational content about digital wellness
- Therapist portal marketing page
- Terms of service and privacy policy

---

## Proof of Legitimate Business

1. **Active SaaS product** with paying subscribers (Stripe billing integration)
2. **Domain registration**: becandid.io — active since 2025
3. **Supabase backend** with 45+ database tables, 93 API routes, and end-to-end encryption
4. **Therapist portal** with HIPAA-informed consent controls
5. **Mobile app** (React Native/Expo) in development for iOS and Android
6. **Chrome extension** for web monitoring
7. **170+ source files** in the web application alone
8. **AgentShield security audit**: Grade A (100/100) — no vulnerabilities

---

## Root Cause of the Flag

The macOS desktop app was distributed with a valid Developer ID signature but was **not submitted to Apple's notarization service** before distribution. Users were instructed to bypass Gatekeeper via System Preferences → Privacy & Security → "Open Anyway." This pattern of Gatekeeper bypasses triggered Apple's automated malware detection.

### Corrective actions taken:

1. **Immediately pulled all download links** from becandid.io (download page now requires authentication and shows "Temporarily Unavailable")
2. **Configured notarization** in the build pipeline:
   - `hardenedRuntime: true` in electron-builder config
   - Proper entitlements file (screen capture, network, accessibility)
   - `@electron/notarize` integration for automatic notarization after signing
   - `afterSign` hook calling `notarize()` with Apple ID credentials
3. **No un-notarized builds will be distributed going forward**

---

## Request

We respectfully request reinstatement of our Apple Developer Program membership so that we can:

1. Properly notarize future macOS builds
2. Submit our iOS app to the App Store (currently in development via Expo/React Native)
3. Continue serving our users who depend on Be Candid for their digital wellness journey

We are committed to full compliance with Apple's Developer Program policies and will ensure all future distributions go through proper notarization.

---

**Contact:**
- Shawn Laser
- Email: shawn@becandid.io / slaser90@gmail.com
- Website: https://becandid.io
- Team ID: TH92H9399U
