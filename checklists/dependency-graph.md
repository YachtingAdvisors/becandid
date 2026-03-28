# Import Dependency Graph

Shows what each file imports so build errors can be resolved in order.
Fix leaf nodes first, then work up.

## Leaf nodes (no app imports, fix these first)

```
packages/shared/types/stringer.ts → (no imports)
lib/security.ts → (no imports)
lib/crisisDetection.ts → (no imports)
lib/encryption.ts → (crypto only)
components/ui/Skeletons.tsx → (react only)
```

## Level 1 (import from leaves only)

```
lib/authGuards.ts
  → lib/supabase (existing)

lib/bruteForce.ts
  → lib/supabase (existing)

lib/push/pushPrivacy.ts
  → (no imports)

components/dashboard/CrisisResourceBanner.tsx
  → lib/crisisDetection

components/dashboard/EmailVerificationBanner.tsx
  → (react only)
```

## Level 2 (import from L1)

```
lib/sessionSecurity.ts
  → lib/supabase, lib/encryption, lib/push/pushService

lib/soloMode.ts
  → lib/supabase

lib/partnerFatigue.ts
  → lib/supabase, lib/push/pushService

lib/relationshipEngine.ts
  → lib/supabase, lib/push/pushService

lib/spouseExperience.ts
  → lib/supabase, lib/relationshipEngine

lib/email/spouseAlertEmail.ts
  → lib/spouseExperience
```

## Level 3

```
lib/relationshipHooks.ts
  → lib/relationshipEngine

lib/weeklyReflection.ts
  → lib/supabase, lib/encryption, @anthropic-ai/sdk, @be-candid/shared

lib/journalRelapseTrigger.ts
  → lib/push/pushService, @be-candid/shared, resend

lib/email/stringerSelfNotification.ts
  → @be-candid/shared
```

## Level 4 (the big integration files)

```
lib/alertPipeline.ts
  → @anthropic-ai/sdk, resend
  → @be-candid/shared
  → lib/supabase
  → lib/encryption
  → lib/soloMode
  → lib/focusIntegration (existing)
  → lib/journalRelapseTrigger
  → lib/push/pushPrivacy
  → lib/push/pushService (existing)
  → lib/categoryGuidance (existing)
  → lib/email/stringerSelfNotification
  → lib/spouseExperience (for spouse detection)
  → lib/email/spouseAlertEmail
```

## API routes (import from lib)

```
api/journal/route.ts → lib/supabase, lib/encryption, @be-candid/shared
api/journal-reminders/route.ts → lib/supabase
api/events/route.ts → lib/supabase, lib/alertPipeline, lib/security, @be-candid/shared
api/solo-mode/route.ts → lib/supabase, lib/soloMode
api/relationship/route.ts → lib/supabase, lib/relationshipEngine
api/conversation-outcomes/route.ts → lib/supabase, lib/encryption, @anthropic-ai/sdk
api/therapist/route.ts → lib/supabase, lib/encryption, resend
api/therapist/portal/route.ts → lib/supabase, lib/encryption
api/privacy/route.ts → lib/supabase, lib/encryption, lib/sessionSecurity
api/spouse-journal/route.ts → lib/supabase, lib/encryption, lib/relationshipEngine, lib/spouseExperience
api/spouse-impact/route.ts → lib/supabase, lib/encryption
api/cron/journal-reminders/route.ts → lib/supabase, lib/push/pushService, @be-candid/shared, resend
api/cron/patterns/route.ts → lib/supabase, lib/patternDetector, lib/partnerFatigue
api/cron/weekly-reflection/route.ts → lib/supabase, lib/weeklyReflection
```

## Pages (import from components + lib)

```
app/onboarding/page.tsx
  → components/onboarding/GoalSelector (existing)
  → components/onboarding/PartnerPreview

app/dashboard/layout.tsx
  → lib/supabase
  → components/dashboard/Sidebar
  → components/dashboard/EmailVerificationBanner

app/dashboard/stringer-journal/page.tsx
  → @be-candid/shared
  → lib/crisisDetection
  → components/dashboard/CrisisResourceBanner
```

## npm packages required

```
@anthropic-ai/sdk
@supabase/ssr
@supabase/supabase-js
resend
next
react
tailwindcss

# Mobile only:
@react-native-async-storage/async-storage
@react-native-community/netinfo
expo-notifications
expo-router
```
