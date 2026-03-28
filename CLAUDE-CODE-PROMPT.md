# Claude Code Assembly Session — Be Candid

You are assembling the Be Candid accountability app from 9 feature packages into one deployable Next.js + Expo monorepo. The base codebase (v7) already exists. Your job is to integrate all new code, resolve every import error, and get `next build` passing clean.

## Context

Be Candid is an accountability app that monitors screen activity, alerts an accountability partner, and generates AI-powered conversation guides grounded in Jay Stringer's "Unwanted" framework. The app uses:
- Next.js 14 (App Router) with Tailwind CSS
- Supabase (Postgres + Auth + RLS)
- Anthropic Claude API for AI guides
- Resend (email) + Twilio (SMS)
- Expo React Native (mobile)

## Step 1: Run the assembly script

```bash
chmod +x scripts/assemble.sh
./scripts/assemble.sh
```

This copies ~70 files to their correct locations. Review its output for any MISSING packages.

## Step 2: Fix imports and type issues

After assembly, run `cd apps/web && npx next build`. It WILL fail. Here are the known issues to fix:

### Import path fixes
Many files use `@/lib/...` and `@be-candid/shared` aliases. Verify these are configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@be-candid/shared": ["../../packages/shared"],
      "@be-candid/shared/*": ["../../packages/shared/*"]
    }
  }
}
```

### Missing re-exports
`packages/shared/types/index.ts` must export stringer types:
```ts
export * from './stringer';
```

`packages/shared/index.ts` must export types and schemas:
```ts
export * from './types';
export * from './schemas';
```

### Files that reference modules not in packages

These files reference existing v7 modules. Verify they exist:
- `lib/supabase.ts` — must export `createClient`, `createServerSupabaseClient`, `createServiceClient`
- `lib/focusIntegration.ts` — must export `onEventFlagged`
- `lib/patternDetector.ts` — must export `detectPatterns`
- `lib/categoryGuidance.ts` — must export `buildCategoryPromptAddition`
- `lib/push/pushService.ts` — must export `sendPush`
- `lib/security.ts` — must export `sanitizeText`
- `@be-candid/shared` — must export `GOAL_LABELS`, `GoalCategory`
- `components/onboarding/GoalSelector.tsx` — must exist

If any are missing, create stubs:

```ts
// lib/security.ts (stub if missing)
export function sanitizeText(text: string): string {
  return text.replace(/<[^>]*>/g, '').replace(/javascript:/gi, '').trim();
}
```

### The `createServiceClient` fix
The v7 codebase had a bug where `createServiceClient` used `createBrowserClient` from `@supabase/ssr`. It should use `createClient` from `@supabase/supabase-js`:

```ts
import { createClient } from '@supabase/supabase-js';

export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
```

### Anthropic SDK import
Multiple files import from `@anthropic-ai/sdk`. Ensure it's installed:
```bash
npm install @anthropic-ai/sdk
```

The `Anthropic.TextBlock` type is used in several files:
```ts
import Anthropic from '@anthropic-ai/sdk';
// ...
response.content.filter((b): b is Anthropic.TextBlock => b.type === 'text')
```

## Step 3: Wiring hooks into existing code

These are the one-liner integrations that connect the feature modules:

### Journal API (apps/web/app/api/journal/route.ts)
After the successful INSERT in the POST handler, add:
```ts
import { onJournalEntry } from '@/lib/relationshipHooks';

// After: await db.rpc('award_trust_points', ...)
const allPrompts = !!(entry.tributaries && entry.longing && entry.roadmap);
await onJournalEntry(user.id, allPrompts).catch(() => {});
```

### Conversation outcomes (apps/web/app/api/conversation-outcomes/route.ts)
After both sides complete, add:
```ts
import { onOutcomeRated, onBothCompletedOutcome } from '@/lib/relationshipHooks';

// After user/partner submits:
await onOutcomeRated(user.id, role).catch(() => {});

// After both complete:
await onBothCompletedOutcome(alertUserId).catch(() => {});
```

### Focus segments cron (apps/web/app/api/cron/focus-segments/route.ts)
At end of cron, add:
```ts
import { onFocusedSegment } from '@/lib/relationshipHooks';
import { updateRelationshipStreaks } from '@/lib/relationshipEngine';

// After awarding focus trust points per user:
await onFocusedSegment(userId).catch(() => {});

// After all users processed:
await updateRelationshipStreaks().catch(() => {});
```

### Alert pipeline — spouse detection
In `lib/alertPipeline.ts`, the partner query already exists. After fetching the partner, add spouse detection:
```ts
import { SPOUSE_GUIDE_ADDITION, getSpouseAlertNotification } from './spouseExperience';
import { generateSpouseAlertEmail } from './email/spouseAlertEmail';

// When building the AI guide system prompt:
let systemPrompt = solo ? SOLO_GUIDE_SYSTEM_PROMPT : PARTNER_SYSTEM_PROMPT;
if (!solo && partner?.relationship === 'spouse') {
  systemPrompt += SPOUSE_GUIDE_ADDITION;
}

// When sending partner notification:
if (partner?.relationship === 'spouse') {
  const spouseEmail = generateSpouseAlertEmail({
    spouseName: partner.partner_name || 'there',
    userName,
    categoryLabel,
    severity: event.severity,
    alertId: alertRecord.id,
    appUrl: APP_URL,
    contenderLevel: partner.spouse_contender_level || 0,
  });
  // Use spouseEmail instead of buildPartnerEmailHTML
}
```

### Journal page — crisis detection
In `apps/web/app/dashboard/stringer-journal/page.tsx`, add:
```ts
import { useMemo } from 'react'; // already imported
import { checkForCrisisLanguage } from '@/lib/crisisDetection';
import CrisisResourceBanner from '@/components/dashboard/CrisisResourceBanner';

// Inside the component, after form state:
const crisisCheck = useMemo(() => checkForCrisisLanguage(freewrite), [freewrite]);

// In the renderForm function, after the freewrite textarea:
{crisisCheck.detected && <CrisisResourceBanner result={crisisCheck} />}
```

### Dashboard overview page
Add widgets to the dashboard overview:
```tsx
import { Suspense } from 'react';
import RelationshipMini from '@/components/dashboard/RelationshipMini';
import SpouseImpactAwareness from '@/components/dashboard/SpouseImpactAwareness';

// In the render:
<RelationshipMini />
<SpouseImpactAwareness />
```

### Settings page
Add settings panels:
```tsx
import JournalSettings from '@/components/dashboard/JournalSettings';
import PrivacySettings from '@/components/dashboard/PrivacySettings';
import SoloModeToggle from '@/components/dashboard/SoloModeToggle';
import TherapistSettings from '@/components/dashboard/TherapistSettings';

// In the settings page:
<SoloModeToggle />
<JournalSettings />
<TherapistSettings />
<PrivacySettings />
```

## Step 4: Verify build

```bash
cd apps/web
npx next build
```

Fix errors iteratively until the build passes clean. Common issues:
- Missing `'use client'` directives on components with hooks
- Missing `Suspense` boundaries around async Server Components
- Type mismatches between `any` and specific types
- Optional chaining needed on nullable fields

## Step 5: Verify migrations

Review all migration files in order:
```
011_stringer_journal.sql
013_security_hardening.sql
014_solo_fatigue_crisis.sql
015_outcomes_therapist_multi.sql
016_relationship_levels.sql
017_spouse_experience.sql
```

Check for:
- Table/column name conflicts
- Missing referenced tables (e.g., `alerts`, `users`, `events` must exist from earlier migrations)
- RLS policies referencing `auth.uid()` correctly

## Step 6: Environment variables

Verify `.env.local` has ALL of these:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
RESEND_API_KEY=
EMAIL_FROM=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
NEXT_PUBLIC_APP_URL=
CRON_SECRET=
ENCRYPTION_MASTER_KEY=
```

Generate the encryption key: `openssl rand -hex 32`

## Step 7: Smoke test

After build passes, run `npm run dev` and verify:
1. Landing page loads at `/`
2. Sign up creates a user in Supabase
3. Onboarding flow completes (goals → Stringer intro → partner preview → invite/solo → done)
4. Dashboard loads with sidebar
5. Stringer Journal page opens, can write and save an entry
6. Settings page shows all settings panels
7. Export journal as Word downloads a .doc file

## File inventory (what should exist after assembly)

### New lib files (13):
- lib/encryption.ts
- lib/authGuards.ts
- lib/bruteForce.ts
- lib/sessionSecurity.ts
- lib/crisisDetection.ts
- lib/soloMode.ts
- lib/partnerFatigue.ts
- lib/relationshipEngine.ts
- lib/relationshipHooks.ts
- lib/spouseExperience.ts
- lib/weeklyReflection.ts
- lib/journalRelapseTrigger.ts
- lib/push/pushPrivacy.ts

### New email templates (1):
- lib/email/spouseAlertEmail.ts

### New API routes (11):
- api/journal/route.ts
- api/journal-reminders/route.ts
- api/solo-mode/route.ts
- api/relationship/route.ts
- api/conversation-outcomes/route.ts
- api/therapist/route.ts
- api/therapist/portal/route.ts
- api/privacy/route.ts
- api/spouse-journal/route.ts
- api/spouse-impact/route.ts
- auth/callback/route.ts

### New cron routes (2):
- api/cron/journal-reminders/route.ts
- api/cron/weekly-reflection/route.ts

### Replaced files (5):
- lib/alertPipeline.ts
- api/events/route.ts
- api/cron/patterns/route.ts
- app/onboarding/page.tsx
- app/dashboard/layout.tsx

### New pages (4):
- dashboard/stringer-journal/page.tsx
- auth/reset/page.tsx
- auth/update-password/page.tsx
- (error pages: not-found.tsx, error.tsx, dashboard/error.tsx)

### New components (15):
- dashboard/JournalSettings.tsx
- dashboard/PrivacySettings.tsx
- dashboard/EmailVerificationBanner.tsx
- dashboard/CrisisResourceBanner.tsx
- dashboard/SoloModeToggle.tsx
- dashboard/RelationshipLevel.tsx
- dashboard/RelationshipMini.tsx
- dashboard/ConversationOutcome.tsx
- dashboard/TherapistSettings.tsx
- dashboard/WeeklyReflection.tsx
- dashboard/CommittedContender.tsx
- dashboard/SpouseImpactAwareness.tsx
- dashboard/Sidebar.tsx (replaced)
- onboarding/PartnerPreview.tsx
- ui/Skeletons.tsx

### Migrations (6):
- 011 through 017 (012 may have been in an earlier package)

### Mobile (2):
- app/_layout.tsx (replaced)
- src/lib/offlineQueue.ts
