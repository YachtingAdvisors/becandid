# Be Candid — Post-Assembly Verification Checklist

Run through this after `next build` passes clean.

## Build Verification
- [ ] `npx next build` completes with zero errors
- [ ] `npx next build` completes with zero warnings (or only expected ones)
- [ ] `npm run dev` starts without crashing

## Auth Flow
- [ ] `/auth/signup` — form renders, creates user + profile in Supabase
- [ ] `/auth/signin` — form renders, signs in, redirects to dashboard
- [ ] `/auth/reset` — form renders, "sends" reset email (check Resend dashboard)
- [ ] `/auth/update-password` — loads correctly when opened from reset email
- [ ] Signing out redirects to signin page
- [ ] Unauthenticated user visiting `/dashboard` redirects to `/auth/signin`

## Onboarding
- [ ] Step 1: GoalSelector renders all 16 categories in 8 groups
- [ ] Step 1: Can select/deselect categories, count updates
- [ ] Step 2: Stringer philosophy cards cycle through 3 pillars
- [ ] Step 2: Skip button works
- [ ] Step 3: Partner Preview shows "They see" / "They never see" tabs
- [ ] Step 3: Mock notification preview renders
- [ ] Step 3: "Solo mode" button works (sets solo_mode=true, skips to done)
- [ ] Step 4: Partner invite form validates email
- [ ] Step 5: Done page shows next steps

## Dashboard
- [ ] Sidebar renders with correct nav items
- [ ] Solo mode: Partner/Conversations nav items hidden
- [ ] Solo mode: "Invite a Partner" link visible
- [ ] Mobile: Hamburger menu opens/closes drawer
- [ ] Email verification banner shows for unverified users
- [ ] Loading skeletons display during data fetch
- [ ] Error boundary catches and displays errors gracefully

## Stringer Journal
- [ ] `/dashboard/stringer-journal` — list view renders
- [ ] Empty state shows with "Write Your First Entry" CTA
- [ ] New entry: freewrite textarea works
- [ ] New entry: 3 Stringer prompts expand/collapse
- [ ] New entry: mood picker works
- [ ] New entry: tag selector works
- [ ] New entry: save creates entry, shows +10 pts
- [ ] Entry detail: displays all filled prompts with colors
- [ ] Entry detail: edit button loads form with existing data
- [ ] Entry detail: delete with confirmation works
- [ ] Search filters entries by text
- [ ] Tag filter chips filter by tag
- [ ] Crisis detection: typing "I want to die" shows resource banner
- [ ] Crisis detection: banner shows 988 lifeline
- [ ] Crisis detection: privacy note says "not shared"
- [ ] Export Word: downloads .doc file
- [ ] Export Apple Notes: downloads .txt file
- [ ] Deep link `?action=write&trigger=relapse` opens in write mode

## Journal Settings
- [ ] Reminder toggle on/off
- [ ] Frequency selector (daily, every 2 days, etc.)
- [ ] Time picker (24 options)
- [ ] Timezone selector
- [ ] After-relapse toggle
- [ ] Delay selector (5 min to 2 hours)
- [ ] Changes persist on page reload

## Relationship Level
- [ ] RelationshipMini renders on dashboard overview
- [ ] Shows level emoji, title, XP, streak
- [ ] Progress ring animates
- [ ] RelationshipLevel full card renders on partner page
- [ ] XP progress bar shows correct percentage
- [ ] Streak multiplier badge appears when streak ≥ 3
- [ ] Contribution balance bar shows user vs partner split
- [ ] Activity feed expands/collapses
- [ ] Level roadmap expands/collapses with all 10 levels

## Spouse Experience (when partner relationship = "spouse")
- [ ] Committed Contender card renders for spouse user
- [ ] Impact check-in form: feelings multi-select works
- [ ] Impact check-in: trust meter 1-10 works
- [ ] Impact check-in: safety question shows DV hotline when "No"
- [ ] Impact check-in: share toggle works
- [ ] Spouse journal: different prompts (Impact, Needs, Boundaries)
- [ ] Spouse journal: share toggle per entry works
- [ ] SpouseImpactAwareness shows on user's dashboard (consent-gated)
- [ ] Trust trend displays correctly
- [ ] Shared entries visible to user only when shared

## Conversation Outcomes
- [ ] Outcome component renders at bottom of conversation page
- [ ] Rating 1-5 selector works
- [ ] Feeling word selector works
- [ ] Notes textarea works
- [ ] Submit shows "+10 pts"
- [ ] Already-submitted state shows rating
- [ ] AI reflection appears when both sides complete

## Privacy & Security
- [ ] Active sessions list renders in Settings
- [ ] Can remove individual sessions
- [ ] "Log out everywhere" works
- [ ] Data retention slider works (30-365 days)
- [ ] Export data downloads JSON
- [ ] Data purge: events/journal/alerts each with confirmation
- [ ] 404 page renders at `/nonexistent`
- [ ] Error boundary renders on crash

## Therapist Portal
- [ ] Invite therapist form in Settings
- [ ] 5 consent toggles work independently
- [ ] Revoke button works
- [ ] Pending invite shows status

## API Endpoints (test with curl or API client)
- [ ] GET /api/journal — returns entries
- [ ] POST /api/journal — creates entry
- [ ] GET /api/journal?export=word — downloads .doc
- [ ] GET /api/journal?export=notes — downloads .txt
- [ ] GET /api/journal-reminders — returns preferences
- [ ] PUT /api/journal-reminders — updates preferences
- [ ] GET /api/relationship — returns level/XP/streak
- [ ] GET /api/solo-mode — returns solo status
- [ ] PUT /api/solo-mode — toggles solo mode
- [ ] POST /api/conversation-outcomes — creates outcome
- [ ] GET /api/privacy — exports all data
- [ ] POST /api/events — creates event + runs pipeline
- [ ] POST /api/events (batch) — syncs multiple events

## Cron Jobs (verify routes exist and return 401 without CRON_SECRET)
- [ ] GET /api/cron/focus-segments — 401 without secret
- [ ] GET /api/cron/checkin — 401 without secret
- [ ] GET /api/cron/journal-reminders — 401 without secret
- [ ] GET /api/cron/patterns — 401 without secret
- [ ] GET /api/cron/weekly-reflection — 401 without secret
- [ ] GET /api/cron/digest — 401 without secret

## Encryption
- [ ] Journal entry content is encrypted in Supabase (check raw DB)
- [ ] Journal entry content decrypts correctly in the API response
- [ ] Missing ENCRYPTION_MASTER_KEY in dev doesn't crash (graceful passthrough)

## Mobile (verify files exist, may not run without Expo setup)
- [ ] apps/mobile/app/_layout.tsx exists and imports correctly
- [ ] apps/mobile/src/lib/offlineQueue.ts exists
- [ ] Offline queue exports: queueEvent, syncPendingEvents, startOfflineQueueListener
