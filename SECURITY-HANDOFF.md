# Security Handoff

This file documents security fixes already applied in this repo so future work does not accidentally reintroduce the same issues.

## Do Not Reintroduce

### 1. Secret handling

- `.mcp.json` was scrubbed to placeholders.
- `.mcp.json` and `.mcp.local.json` are now gitignored in `.gitignore`.
- `.mcp.example.json` is the safe template.
- Do not store live Supabase service-role keys, Stripe secret keys, or other production secrets in repo-tracked or workspace-local config files.

### 2. Login lockout flow

- `/api/auth/record-attempt` now records failed attempts only.
- Unauthenticated clients must never be allowed to report a successful login.
- Failed-attempt clearing now happens only in `/api/auth/sessions` after `supabase.auth.getUser()` confirms a real authenticated session.
- `middleware.ts` no longer treats `/api/auth/sessions` as a public API.

### 3. Partner invite acceptance

- `/api/partners/accept` is no longer a public API in middleware.
- The old sessionless `inlineUserId` acceptance flow was removed.
- Invite acceptance now requires a real authenticated session.
- The signed-in user's email must match `partners.partner_email` before the invite is activated.
- Do not add back any "accept invite without session" shortcut.

### 4. Invite page behavior

- The invite page only auto-accepts after signup if signup returned a real session.
- If signup requires email verification and no session exists yet, the user is redirected to sign in first, then accept with the invited email.
- Do not reintroduce auto-accept using arbitrary user IDs.

### 5. Therapist session-prep email safety

- `apps/web/app/api/therapist/session-prep/route.ts` now escapes model-generated and user-derived content before injecting it into HTML.
- Subject and preheader are also sanitized.
- Any future email HTML that includes AI output, journal text, therapist notes, or other user content must be escaped first.

### 6. Cross-site request hardening for cookie-authenticated API writes

- `apps/web/middleware.ts` now rejects mutating `/api/*` requests that rely on cookie auth when the request does not come from a trusted same-origin request context.
- The middleware checks `Origin`, `Referer`, and `Sec-Fetch-Site`, while still allowing the official extension origin and Bearer-token API clients.
- Do not remove this guard or re-open cookie-authenticated `POST`, `PATCH`, `PUT`, or `DELETE` routes to cross-site requests.

### 7. Admin surfaces now require MFA

- `apps/web/middleware.ts` now enforces `aal2` for `/admin` and `/api/admin/*` when the signed-in user is an admin.
- Browser admin pages redirect to `/auth/mfa-verify`; admin API calls without MFA get `403`.
- Do not weaken admin access back to email-only auth with no MFA requirement.

### 8. Token-login and desktop deep links are hardened

- Desktop tray deep links now use query parameters instead of URL fragments, so `/api/auth/token-login` actually receives the token payload.
- `/api/auth/token-login` now rate-limits with the shared limiter, forces relative redirects only, and sets `Cache-Control: no-store` plus `Referrer-Policy: no-referrer`.
- Do not reintroduce absolute redirect targets or fragment-based token passing for this route.

### 9. Shared request controls for retries and rate limits

- Added migration `supabase/migrations/066_request_controls.sql`.
- New backend primitives:
  - `rate_limit_buckets` + `consume_rate_limit(...)` for shared rate limiting across instances.
  - `request_idempotency` for replay-safe request handling.
- App-side helpers:
  - `apps/web/lib/distributedRateLimit.ts`
  - `apps/web/lib/idempotency.ts`
- Critical routes now use these shared controls with in-memory fallback if the migration is not present yet:
  - `/api/auth/check-lockout`
  - `/api/auth/record-attempt`
  - `/api/auth/token-login`
  - `/api/events`
  - `/api/screen-capture`
  - `/api/therapist/directory`
  - `/api/billing/org-plan`
  - `/api/releases/check`
- Do not revert these routes back to route-local `Map` counters or non-idempotent retry behavior.

### 10. Device/session bookkeeping is more stable

- `apps/web/lib/sessionSecurity.ts` now hashes device identity from user agent + platform instead of user agent + IP, so IP changes do not create phantom devices.
- `apps/web/app/api/auth/sessions/route.ts` now records `device_hash` and `platform`, matches the current session by device hash, and uses the cookie-scoped Supabase client for self-session reads/writes.
- `apps/web/app/dashboard/security/page.tsx` now shows desktop heartbeat health and uses the real session payload shape from `/api/auth/sessions`.
- Do not switch device identity back to IP-based hashing or current-session detection based only on exact IP matches.

### 11. Local token exposure was reduced on desktop and extension

- Desktop:
  - `apps/desktop/src/main/store.js` now encrypts `access_token` and `refresh_token` at rest with Electron `safeStorage` when available.
- Extension:
  - `apps/extension/src/shared/storage.js` now keeps `access_token` and `expires_at` in `chrome.storage.session` when available.
  - `refresh_token` and `user_id` remain in local storage so the extension can recover a short-lived access token after restart.
  - `apps/extension/src/shared/api.js` and `apps/extension/src/background/auth.js` now refresh access tokens on demand instead of assuming a persistent local access token.
- Product copy in `apps/web/app/privacy/page.tsx` was updated to match the new token-storage behavior.
- Do not move extension access tokens back into long-lived `chrome.storage.local`, and do not remove desktop token-at-rest encryption.

### 12. Service-role usage was reduced on self-scoped routes

- `apps/web/app/api/auth/profile/route.ts` now uses the cookie-scoped Supabase client for self-profile reads and writes, with service-role access retained only where cross-user referral rewards still need it.
- `apps/web/app/api/auth/sessions/route.ts` now uses the cookie-scoped Supabase client for self-session reads/writes; service role is only retained for clearing login-attempt records.
- `apps/web/app/dashboard/report/page.tsx` now fetches `/api/auth/profile` instead of piggybacking on `/api/account` export JSON.
- `apps/web/app/dashboard/security/page.tsx` now links exports to `/api/privacy`.
- Do not casually reintroduce service-role reads/writes for routes that can operate under user-scoped RLS.

### 13. Invite tokens are now hashed, expiring, and email-bound

- Added:
  - `apps/web/lib/inviteTokens.ts`
  - `supabase/migrations/067_invite_token_hardening.sql`
- New behavior:
  - Partner, guardian, and therapist invites are now stored as SHA-256 hashes instead of raw tokens.
  - Pending invites now carry `invite_expires_at`, currently set to a 14-day window.
  - Accepted or revoked invites clear `invite_token` and `invite_expires_at` so links cannot be replayed later.
  - Lookups accept legacy raw tokens during rollout by checking both the hashed value and the legacy raw token form.
- Partner invites:
  - `apps/web/app/api/partners/route.ts` stores only the hash and no longer returns the stored token/hash in the API response.
  - `apps/web/app/api/partners/invite/route.ts`, `.../accept/route.ts`, and `.../reinvite/route.ts` now enforce expiry-aware lookup/update behavior.
- Guardian invites:
  - `apps/web/lib/guardianControls.ts` now stores `guardian_email`, hashes invite tokens, and requires the signed-in email to match when accepting if the invite has a recorded email.
  - `apps/web/app/api/guardian/invite/route.ts` now validates/sanitizes guardian email before creating the invite.
- Therapist invites:
  - `apps/web/app/api/therapist/route.ts` now hashes therapist invite tokens, sets expirations, reuses the existing pending/revoked row instead of spraying duplicate pending records, and requires the signed-in therapist email to match the invited therapist email on acceptance.
- Do not reintroduce raw token storage, non-expiring invite links, or token-only acceptance without email binding where the invited email is known.

### 14. Privacy/session surfaces were consolidated

- `apps/web/components/dashboard/PrivacySettings.tsx` no longer calls the nonexistent `/api/privacy/sessions` route.
- Session management now lives in one place:
  - `apps/web/app/api/auth/sessions/route.ts`
  - `apps/web/components/dashboard/ActiveSessions.tsx`
- `apps/web/app/dashboard/settings/page.tsx` now passes the real `event_retention_days` into `PrivacySettings`, so the slider reflects persisted state instead of doing a placeholder fetch.
- `apps/web/app/api/privacy/route.ts` now handles only export, retention, and purge behavior; the dead `/sessions` sub-route logic was removed.
- Do not recreate duplicate session-management APIs or make `PrivacySettings` depend on imaginary nested Next route paths.

## Files Changed

- `.gitignore`
- `.mcp.json`
- `.mcp.example.json`
- `SECURITY-HANDOFF.md`
- `apps/web/middleware.ts`
- `apps/web/app/api/auth/record-attempt/route.ts`
- `apps/web/app/api/auth/check-lockout/route.ts`
- `apps/web/app/api/auth/sessions/route.ts`
- `apps/web/app/api/auth/token-login/route.ts`
- `apps/web/app/api/auth/profile/route.ts`
- `apps/web/app/auth/signin/page.tsx`
- `apps/web/app/api/guardian/invite/route.ts`
- `apps/web/app/api/partners/accept/route.ts`
- `apps/web/app/api/partners/invite/route.ts`
- `apps/web/app/api/partners/reinvite/route.ts`
- `apps/web/app/invite/[token]/page.tsx`
- `apps/web/app/api/privacy/route.ts`
- `apps/web/app/api/events/route.ts`
- `apps/web/app/api/screen-capture/route.ts`
- `apps/web/app/api/therapist/route.ts`
- `apps/web/app/api/therapist/directory/route.ts`
- `apps/web/app/api/billing/org-plan/route.ts`
- `apps/web/app/api/releases/check/route.ts`
- `apps/web/app/api/therapist/session-prep/route.ts`
- `apps/web/app/dashboard/report/page.tsx`
- `apps/web/app/dashboard/settings/page.tsx`
- `apps/web/app/dashboard/security/page.tsx`
- `apps/web/app/privacy/page.tsx`
- `apps/web/components/dashboard/PrivacySettings.tsx`
- `apps/web/lib/distributedRateLimit.ts`
- `apps/web/lib/guardianControls.ts`
- `apps/web/lib/inviteTokens.ts`
- `apps/web/lib/idempotency.ts`
- `apps/web/lib/sessionSecurity.ts`
- `apps/desktop/src/main/store.js`
- `apps/desktop/src/main/tray.js`
- `apps/extension/src/background/auth.js`
- `apps/extension/src/shared/api.js`
- `apps/extension/src/shared/storage.js`
- `packages/shared/types/index.ts`
- `supabase/migrations/066_request_controls.sql`
- `supabase/migrations/067_invite_token_hardening.sql`

## Tests Added

- `apps/web/app/api/auth/__tests__/record-attempt.test.ts`
- `apps/web/app/api/auth/__tests__/token-login.test.ts`
- `apps/web/app/api/partners/__tests__/accept.test.ts`

## Tests Updated

- `apps/web/app/api/partners/__tests__/route.test.ts`
- `apps/web/app/api/therapist/__tests__/route.test.ts`

## Verification

- `npx tsc --noEmit -p apps/web/tsconfig.json` passed.
- `node --check` passed for:
  - `apps/desktop/src/main/store.js`
  - `apps/desktop/src/main/tray.js`
  - `apps/extension/src/shared/storage.js`
  - `apps/extension/src/shared/api.js`
  - `apps/extension/src/background/auth.js`
- `npm run --workspace=@be-candid/web test -- app/api/auth/__tests__/token-login.test.ts app/api/auth/__tests__/record-attempt.test.ts app/api/partners/__tests__/accept.test.ts app/api/events/__tests__/route.test.ts` passed.
- `npm run --workspace=@be-candid/web test -- app/api/partners/__tests__/accept.test.ts app/api/partners/__tests__/route.test.ts app/api/therapist/__tests__/route.test.ts` passed.

## Remaining Manual Action

- The previously exposed Supabase service-role key and Stripe secret key still need to be rotated out-of-band. Scrubbing the file fixed the repo/workspace exposure, but the old credentials should be treated as compromised.
- Apply both Supabase migrations before relying on the new shared controls and invite-token behavior in production:
  - `supabase/migrations/066_request_controls.sql`
  - `supabase/migrations/067_invite_token_hardening.sql`

## Remaining Larger Follow-Ups

- Broader service-role reduction is still worth doing, but it needs a deliberate route-by-route RLS audit before moving more handlers off `createServiceClient()`.
- The app still does expensive AI and notification work inline in request-response paths. Moving those flows into explicit jobs/workers is still recommended, but that is a larger architecture change than this pass.
- Admin authorization is still email-list based. MFA is now required, but a real role model is still the right long-term direction.
- Older guardian invites created before `guardian_email` existed can only be email-bound after reinvite. Reissuing those invites after the migration is the cleanest path.
