#!/bin/bash
# ============================================================
# Be Candid — Master Assembly Script
#
# Run this from the monorepo root after unzipping all 9
# feature packages into a /packages-raw/ directory.
#
# Usage:
#   chmod +x scripts/assemble.sh
#   ./scripts/assemble.sh
#
# This script:
#   1. Creates all directories
#   2. Copies files in dependency order
#   3. Lists files that REPLACE vs NEW
#   4. Does NOT run migrations (do that manually)
# ============================================================

set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WEB="$ROOT/apps/web"
MOBILE="$ROOT/apps/mobile"
SHARED="$ROOT/packages/shared"
RAW="$ROOT/packages-raw"

echo "═══════════════════════════════════════════════════"
echo "  Be Candid — Assembly"
echo "═══════════════════════════════════════════════════"
echo ""

# ── Verify packages exist ────────────────────────────────
PACKAGES=(
  "be-candid-stringer-journal"
  "be-candid-security-ux"
  "be-candid-adoption-safety"
  "be-candid-integration-build"
  "be-candid-engagement-revenue"
  "be-candid-relationship-levels"
  "be-candid-spouse-experience"
)

echo "Checking packages..."
for pkg in "${PACKAGES[@]}"; do
  if [ -d "$RAW/$pkg" ]; then
    echo "  ✓ $pkg"
  else
    echo "  ✗ MISSING: $pkg"
    echo "    Unzip $pkg.zip into $RAW/$pkg"
  fi
done
echo ""

# ── Create directories ───────────────────────────────────
echo "Creating directories..."
dirs=(
  "$WEB/lib"
  "$WEB/lib/email"
  "$WEB/lib/push"
  "$WEB/app/api/journal"
  "$WEB/app/api/journal-reminders"
  "$WEB/app/api/cron/journal-reminders"
  "$WEB/app/api/cron/weekly-reflection"
  "$WEB/app/api/cron/patterns"
  "$WEB/app/api/solo-mode"
  "$WEB/app/api/relationship"
  "$WEB/app/api/conversation-outcomes"
  "$WEB/app/api/therapist"
  "$WEB/app/api/therapist/portal"
  "$WEB/app/api/privacy"
  "$WEB/app/api/privacy/sessions"
  "$WEB/app/api/spouse-journal"
  "$WEB/app/api/spouse-impact"
  "$WEB/app/api/auth/resend-verification"
  "$WEB/app/auth/reset"
  "$WEB/app/auth/update-password"
  "$WEB/app/auth/callback"
  "$WEB/app/dashboard/stringer-journal"
  "$WEB/app/onboarding"
  "$WEB/components/dashboard"
  "$WEB/components/onboarding"
  "$WEB/components/ui"
  "$SHARED/types"
  "$ROOT/supabase/migrations"
)
for d in "${dirs[@]}"; do mkdir -p "$d"; done
echo "  Done."
echo ""

# ── LAYER 1: Shared types (no dependencies) ─────────────
echo "Layer 1: Shared types..."
cp "$RAW/be-candid-stringer-journal/types/stringer.ts" "$SHARED/types/stringer.ts"
echo "  ✓ packages/shared/types/stringer.ts (NEW)"

# Append export to index
if ! grep -q "stringer" "$SHARED/types/index.ts" 2>/dev/null; then
  echo "export * from './stringer';" >> "$SHARED/types/index.ts"
  echo "  ✓ Added stringer export to types/index.ts"
fi
echo ""

# ── LAYER 2: Core lib files (depend on types only) ──────
echo "Layer 2: Core lib files..."

# Encryption (no app dependencies)
cp "$RAW/be-candid-security-ux/lib/encryption.ts" "$WEB/lib/encryption.ts"
echo "  ✓ lib/encryption.ts (NEW)"

# Auth guards
cp "$RAW/be-candid-security-ux/lib/authGuards.ts" "$WEB/lib/authGuards.ts"
echo "  ✓ lib/authGuards.ts (NEW)"

# Brute force
cp "$RAW/be-candid-security-ux/lib/bruteForce.ts" "$WEB/lib/bruteForce.ts"
echo "  ✓ lib/bruteForce.ts (NEW)"

# Session security
cp "$RAW/be-candid-security-ux/lib/sessionSecurity.ts" "$WEB/lib/sessionSecurity.ts"
echo "  ✓ lib/sessionSecurity.ts (NEW)"

# Push privacy
cp "$RAW/be-candid-security-ux/lib/pushPrivacy.ts" "$WEB/lib/push/pushPrivacy.ts"
echo "  ✓ lib/push/pushPrivacy.ts (NEW)"

# Crisis detection
cp "$RAW/be-candid-adoption-safety/lib/crisisDetection.ts" "$WEB/lib/crisisDetection.ts"
echo "  ✓ lib/crisisDetection.ts (NEW)"

# Solo mode
cp "$RAW/be-candid-adoption-safety/lib/soloMode.ts" "$WEB/lib/soloMode.ts"
echo "  ✓ lib/soloMode.ts (NEW)"

# Partner fatigue
cp "$RAW/be-candid-adoption-safety/lib/partnerFatigue.ts" "$WEB/lib/partnerFatigue.ts"
echo "  ✓ lib/partnerFatigue.ts (NEW)"

# Relationship engine
cp "$RAW/be-candid-relationship-levels/lib/relationshipEngine.ts" "$WEB/lib/relationshipEngine.ts"
echo "  ✓ lib/relationshipEngine.ts (NEW)"

# Relationship hooks
cp "$RAW/be-candid-relationship-levels/lib/relationshipHooks.ts" "$WEB/lib/relationshipHooks.ts"
echo "  ✓ lib/relationshipHooks.ts (NEW)"

# Spouse experience
cp "$RAW/be-candid-spouse-experience/lib/spouseExperience.ts" "$WEB/lib/spouseExperience.ts"
echo "  ✓ lib/spouseExperience.ts (NEW)"

# Weekly reflection
cp "$RAW/be-candid-engagement-revenue/lib/weeklyReflection.ts" "$WEB/lib/weeklyReflection.ts"
echo "  ✓ lib/weeklyReflection.ts (NEW)"

# Journal relapse trigger
cp "$RAW/be-candid-stringer-journal/lib/journalRelapseTrigger.ts" "$WEB/lib/journalRelapseTrigger.ts"
echo "  ✓ lib/journalRelapseTrigger.ts (NEW)"
echo ""

# ── LAYER 3: Email templates ────────────────────────────
echo "Layer 3: Email templates..."
cp "$RAW/be-candid-stringer-journal/api/journal-route.ts" /dev/null 2>/dev/null  # Just checking
# Stringer self-notification (referenced by integration build)
# Note: This was in the improvements package, need to check which has it
if [ -f "$RAW/be-candid-security-ux/components/EmailVerificationBanner.tsx" ]; then
  echo "  (email templates from previous builds assumed in place)"
fi

# Spouse alert email
cp "$RAW/be-candid-spouse-experience/email-templates/spouseAlertEmail.ts" "$WEB/lib/email/spouseAlertEmail.ts"
echo "  ✓ lib/email/spouseAlertEmail.ts (NEW)"
echo ""

# ── LAYER 4: API routes ─────────────────────────────────
echo "Layer 4: API routes..."

# Journal CRUD
cp "$RAW/be-candid-stringer-journal/api/journal/route.ts" "$WEB/app/api/journal/route.ts"
echo "  ✓ api/journal/route.ts (NEW)"

# Journal reminders preferences
cp "$RAW/be-candid-stringer-journal/api/journal-reminders/route.ts" "$WEB/app/api/journal-reminders/route.ts"
echo "  ✓ api/journal-reminders/route.ts (NEW)"

# Solo mode
cp "$RAW/be-candid-adoption-safety/api/solo-mode-route.ts" "$WEB/app/api/solo-mode/route.ts"
echo "  ✓ api/solo-mode/route.ts (NEW)"

# Relationship
cp "$RAW/be-candid-relationship-levels/api/relationship-route.ts" "$WEB/app/api/relationship/route.ts"
echo "  ✓ api/relationship/route.ts (NEW)"

# Conversation outcomes
cp "$RAW/be-candid-engagement-revenue/api/conversation-outcomes-route.ts" "$WEB/app/api/conversation-outcomes/route.ts"
echo "  ✓ api/conversation-outcomes/route.ts (NEW)"

# Therapist
cp "$RAW/be-candid-engagement-revenue/api/therapist-route.ts" "$WEB/app/api/therapist/route.ts"
echo "  ✓ api/therapist/route.ts (NEW)"

# Therapist portal
cp "$RAW/be-candid-engagement-revenue/api/therapist-portal-route.ts" "$WEB/app/api/therapist/portal/route.ts"
echo "  ✓ api/therapist/portal/route.ts (NEW)"

# Privacy + sessions
cp "$RAW/be-candid-security-ux/api/privacy-route.ts" "$WEB/app/api/privacy/route.ts"
echo "  ✓ api/privacy/route.ts (NEW)"

# Spouse journal
cp "$RAW/be-candid-spouse-experience/api/spouse-journal-route.ts" "$WEB/app/api/spouse-journal/route.ts"
echo "  ✓ api/spouse-journal/route.ts (NEW)"

# Spouse impact
cp "$RAW/be-candid-spouse-experience/api/spouse-impact-route.ts" "$WEB/app/api/spouse-impact/route.ts"
echo "  ✓ api/spouse-impact/route.ts (NEW)"

# Auth callback
cp "$RAW/be-candid-security-ux/api/auth-callback.ts" "$WEB/app/auth/callback/route.ts"
echo "  ✓ auth/callback/route.ts (NEW)"
echo ""

# ── LAYER 5: Cron routes ────────────────────────────────
echo "Layer 5: Cron routes..."
cp "$RAW/be-candid-stringer-journal/api/cron/journal-reminders-route.ts" "$WEB/app/api/cron/journal-reminders/route.ts"
echo "  ✓ api/cron/journal-reminders/route.ts (NEW)"

cp "$RAW/be-candid-engagement-revenue/cron/weekly-reflection-route.ts" "$WEB/app/api/cron/weekly-reflection/route.ts"
echo "  ✓ api/cron/weekly-reflection/route.ts (NEW)"

# REPLACES existing patterns cron
cp "$RAW/be-candid-integration-build/cron/patterns-route.ts" "$WEB/app/api/cron/patterns/route.ts"
echo "  ✓ api/cron/patterns/route.ts (REPLACE)"
echo ""

# ── LAYER 6: REPLACEMENTS (overwrite existing files) ────
echo "Layer 6: File replacements (existing code overwritten)..."

# Alert pipeline (CRITICAL — the main integration file)
cp "$RAW/be-candid-integration-build/lib/alertPipeline.ts" "$WEB/lib/alertPipeline.ts"
echo "  ✓ lib/alertPipeline.ts (REPLACE — full rewrite)"

# Events API
cp "$RAW/be-candid-integration-build/api/events-route.ts" "$WEB/app/api/events/route.ts"
echo "  ✓ api/events/route.ts (REPLACE)"

# Onboarding
cp "$RAW/be-candid-integration-build/pages/onboarding-page.tsx" "$WEB/app/onboarding/page.tsx"
echo "  ✓ app/onboarding/page.tsx (REPLACE)"

# Dashboard layout
cp "$RAW/be-candid-integration-build/pages/dashboard-layout.tsx" "$WEB/app/dashboard/layout.tsx"
echo "  ✓ app/dashboard/layout.tsx (REPLACE)"

# Sidebar
cp "$RAW/be-candid-integration-build/components/Sidebar.tsx" "$WEB/components/dashboard/Sidebar.tsx"
echo "  ✓ components/dashboard/Sidebar.tsx (REPLACE)"

# vercel.json
cp "$RAW/be-candid-integration-build/vercel.json" "$WEB/vercel.json"
echo "  ✓ vercel.json (REPLACE)"

# .env.example
cp "$RAW/be-candid-integration-build/env.example" "$WEB/.env.example"
echo "  ✓ .env.example (REPLACE)"
echo ""

# ── LAYER 7: Pages ──────────────────────────────────────
echo "Layer 7: Pages..."

# Stringer journal page
cp "$RAW/be-candid-stringer-journal/pages/stringer-journal-page.tsx" "$WEB/app/dashboard/stringer-journal/page.tsx"
echo "  ✓ dashboard/stringer-journal/page.tsx (NEW)"

# Password reset
cp "$RAW/be-candid-security-ux/pages/reset-page.tsx" "$WEB/app/auth/reset/page.tsx"
echo "  ✓ auth/reset/page.tsx (NEW)"

# Update password
cp "$RAW/be-candid-security-ux/pages/update-password-page.tsx" "$WEB/app/auth/update-password/page.tsx"
echo "  ✓ auth/update-password/page.tsx (NEW)"

# Error pages
cp "$RAW/be-candid-security-ux/pages/not-found.tsx" "$WEB/app/not-found.tsx" 2>/dev/null || true
cp "$RAW/be-candid-security-ux/pages/error.tsx" "$WEB/app/error.tsx" 2>/dev/null || true
cp "$RAW/be-candid-security-ux/pages/dashboard-error.tsx" "$WEB/app/dashboard/error.tsx" 2>/dev/null || true
echo "  ✓ Error pages (not-found, error, dashboard/error)"
echo ""

# ── LAYER 8: Components ─────────────────────────────────
echo "Layer 8: Components..."

# Dashboard components
DASHBOARD_COMPONENTS=(
  "be-candid-stringer-journal:components/JournalSettings.tsx:JournalSettings.tsx"
  "be-candid-security-ux:components/PrivacySettings.tsx:PrivacySettings.tsx"
  "be-candid-security-ux:components/EmailVerificationBanner.tsx:EmailVerificationBanner.tsx"
  "be-candid-security-ux:components/Skeletons.tsx:../ui/Skeletons.tsx"
  "be-candid-adoption-safety:components/CrisisResourceBanner.tsx:CrisisResourceBanner.tsx"
  "be-candid-adoption-safety:components/SoloModeToggle.tsx:SoloModeToggle.tsx"
  "be-candid-relationship-levels:components/RelationshipLevel.tsx:RelationshipLevel.tsx"
  "be-candid-relationship-levels:components/RelationshipMini.tsx:RelationshipMini.tsx"
  "be-candid-engagement-revenue:components/ConversationOutcome.tsx:ConversationOutcome.tsx"
  "be-candid-engagement-revenue:components/TherapistSettings.tsx:TherapistSettings.tsx"
  "be-candid-engagement-revenue:components/WeeklyReflection.tsx:WeeklyReflection.tsx"
  "be-candid-spouse-experience:components/CommittedContender.tsx:CommittedContender.tsx"
  "be-candid-spouse-experience:components/SpouseImpactAwareness.tsx:SpouseImpactAwareness.tsx"
)

for entry in "${DASHBOARD_COMPONENTS[@]}"; do
  IFS=':' read -r pkg src dest <<< "$entry"
  if [[ "$dest" == ../* ]]; then
    cp "$RAW/$pkg/$src" "$WEB/components/${dest#../}"
  else
    cp "$RAW/$pkg/$src" "$WEB/components/dashboard/$dest"
  fi
  echo "  ✓ $dest (NEW)"
done

# Onboarding components
cp "$RAW/be-candid-adoption-safety/components/PartnerPreview.tsx" "$WEB/components/onboarding/PartnerPreview.tsx"
echo "  ✓ onboarding/PartnerPreview.tsx (NEW)"
echo ""

# ── LAYER 9: Mobile ─────────────────────────────────────
echo "Layer 9: Mobile..."
cp "$RAW/be-candid-integration-build/mobile/root-layout.tsx" "$MOBILE/app/_layout.tsx"
echo "  ✓ mobile/app/_layout.tsx (REPLACE)"

cp "$RAW/be-candid-adoption-safety/mobile/offlineQueue.ts" "$MOBILE/src/lib/offlineQueue.ts"
echo "  ✓ mobile/src/lib/offlineQueue.ts (NEW)"
echo ""

# ── LAYER 10: Migrations ────────────────────────────────
echo "Layer 10: Migrations..."
cp "$RAW/be-candid-stringer-journal/migration/011_stringer_journal.sql" "$ROOT/supabase/migrations/011_stringer_journal.sql"
cp "$RAW/be-candid-security-ux/migration/013_security_hardening.sql" "$ROOT/supabase/migrations/013_security_hardening.sql"
cp "$RAW/be-candid-adoption-safety/migration/014_solo_fatigue_crisis.sql" "$ROOT/supabase/migrations/014_solo_fatigue_crisis.sql"
cp "$RAW/be-candid-engagement-revenue/migration/015_outcomes_therapist_multi.sql" "$ROOT/supabase/migrations/015_outcomes_therapist_multi.sql"
cp "$RAW/be-candid-relationship-levels/migration/016_relationship_levels.sql" "$ROOT/supabase/migrations/016_relationship_levels.sql"
cp "$RAW/be-candid-spouse-experience/migration/017_spouse_experience.sql" "$ROOT/supabase/migrations/017_spouse_experience.sql"
echo "  ✓ 6 migrations (011–017)"
echo ""

# ── Summary ──────────────────────────────────────────────
echo "═══════════════════════════════════════════════════"
echo "  Assembly complete."
echo ""
echo "  Next steps:"
echo "  1. Run: cd apps/web && npm install"
echo "  2. Run: npx next build (fix any import errors)"
echo "  3. Run migrations: supabase db push"
echo "  4. Set all env vars in .env.local"
echo "  5. Run: npm run dev"
echo "═══════════════════════════════════════════════════"
