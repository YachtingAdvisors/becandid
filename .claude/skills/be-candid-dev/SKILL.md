---
name: be-candid-dev
description: Use this skill whenever working on Be Candid — the accountability app at becandid.io.
triggers:
  - Be Candid
  - becandid
  - accountability app
  - Stringer journal
  - relapse journaling
  - accountability partner app
  - shadow self app
---

# Be Candid Development Guide

## Project Overview

Be Candid is a digital accountability platform that helps users align their digital life with their values. Built on Jay Stringer's research from *Unwanted*, it uses a framework of self-awareness, partner accountability, and therapeutic insights.

## Architecture

- **Monorepo** with Turborepo at `/Users/2025macpro/Desktop/be-candid/`
- **Web app**: Next.js 14 App Router at `apps/web/`
- **Desktop app**: Electron tray app at `apps/desktop/`
- **Mobile app**: React Native/Expo at `apps/mobile/`
- **Chrome extension**: `apps/extension/`
- **Shared packages**: `packages/shared/` (types, schemas, quotes)
- **Database**: Supabase (PostgreSQL) with migrations at `supabase/migrations/`

## Key Directories

```
apps/web/
  app/                    # Next.js App Router pages
    api/                  # API routes (76+ endpoints)
    auth/                 # Auth pages (signin, signup, reset)
    dashboard/            # Dashboard pages (17+ pages)
    onboarding/           # Onboarding flow
  components/dashboard/   # Reusable dashboard components
  lib/                    # Server utilities
    supabase.ts          # DB clients + ensureUserRow()
    security.ts          # sanitize*, escapeHtml, auditLog, safeError
    rateLimit.ts         # In-memory rate limiter
    encryption.ts        # AES encryption for sensitive data
    stringerAnalysis.ts  # Stringer pattern analysis engine
    focusSegments.ts     # Focus streak tracking
    patternDetector.ts   # Behavioral pattern detection
    contentFilter.ts     # Multi-layer content filtering
    checkInEngine.ts     # Check-in scheduling
    badges.ts            # Badge/milestone definitions
```

## Design System

- **Tailwind CSS** with Material Design 3 color tokens
- Primary: `#226779` (teal)
- Background: `#fbf9f8` (off-white)
- Font classes: `font-headline`, `font-label`, `font-body`
- Surface system: `bg-surface-container-lowest`, `bg-surface-container-low`, etc.
- Icons: Material Symbols Outlined (`material-symbols-outlined`)
- Rounded corners: `rounded-2xl` (cards), `rounded-full` (buttons/pills)

## Database

- **Supabase** with Row Level Security (RLS)
- Three client types in `lib/supabase.ts`:
  - `createClient()` — browser-side (anon key)
  - `createServerSupabaseClient()` — server components (cookie auth)
  - `createServiceClient()` — service role (bypasses RLS)
- `ensureUserRow()` — guarantees `public.users` row exists (handles signup race condition)

## Key Tables

- `users` — profiles, settings, subscription status
- `events` — behavioral events (browsing, app usage)
- `alerts` — flagged events sent to partner
- `partners` — partner relationships + invite tokens
- `stringer_journal` — journal entries (freewrite, tributaries, longing, roadmap)
- `focus_segments` — morning/evening focus tracking
- `check_ins` — scheduled check-in records
- `trust_points` — gamification points
- `milestones` — badge/achievement tracking
- `site_lists` — user whitelist/blacklist domains
- `therapist_connections` — therapist access with granular consent
- `content_rules` — per-user content filter rules
- `conversation_outcomes` — accountability conversation ratings

## Stringer Framework

Based on Jay Stringer's *Unwanted*, the app uses three journal prompts:
1. **Tributaries** — "What was happening before?" (traces triggers)
2. **The Unmet Longing** — "What did you actually need?" (identifies needs)
3. **The Roadmap** — "What is this revealing about who you want to become?"

Six family-of-origin dynamics analyzed in `stringerAnalysis.ts`:
- Rigidity, Enmeshment, Triangulation, Dismissiveness, Abdication, Incongruence

## Subscription Tiers

- **Free**: 1 partner, 1 therapist, 21-day trial
- **Pro** ($9.99/mo): 5 partners, pattern detection, AI guides
- **Therapy** ($19.99/mo): Unlimited partners, therapist portal, HIPAA-ready

## Security Patterns

- All user input in HTML emails must use `escapeHtml()` from `lib/security.ts`
- Sensitive data encrypted with `encrypt()`/`decrypt()` from `lib/encryption.ts`
- Rate limiting via `checkUserRate(actionLimiter, userId)` on all mutation endpoints
- Error responses use `safeError()` — never expose raw DB errors
- Auth tokens use hash fragments (not query strings) in desktop app URLs

## Common Patterns

### API Route Template
```typescript
export const dynamic = 'force-dynamic';
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { actionLimiter, checkUserRate } from '@/lib/rateLimit';
import { safeError, sanitizeName, escapeHtml, auditLog } from '@/lib/security';

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const blocked = checkUserRate(actionLimiter, user.id);
  if (blocked) return blocked;

  const db = createServiceClient();
  // ... business logic
}
```

### Dashboard Page Template
```typescript
import { createServerSupabaseClient, createServiceClient, ensureUserRow } from '@/lib/supabase';

export default async function MyPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const db = createServiceClient();
  const profile = await ensureUserRow(db, user);
  // ... render
}
```

## Important Notes

- Never commit `.env` or Supabase service role keys
- The onboarding uses a sunrise gradient theme (dark → warm → light)
- Partner blacklists are private; whitelists are visible to partners
- Removing a blacklisted site triggers partner notification
- Password reset must route through `/auth/callback` for PKCE code exchange
