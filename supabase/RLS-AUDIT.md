# RLS Audit Report

**Scope:** All tables created in migrations 034 through 053  
**Date:** 2026-04-07  
**Auditor:** Automated scan of `supabase/migrations/034_*` through `053_*`

## Summary

- **Tables audited:** 17
- **RLS enabled:** 16
- **RLS missing:** 1 (`coaching_content`)
- **Fix migration:** `supabase/migrations/055_rls_fixes.sql`

## Audit Results

| Table | Migration | RLS Enabled | Policy | Status |
|-------|-----------|-------------|--------|--------|
| family_systems_notes | 034 | Yes | Therapists manage own notes + Users read own | ✅ |
| future_letters | 036 | Yes | Users manage own letters | ✅ |
| daily_challenges | 037 | Yes | Users manage own challenges | ✅ |
| accountability_groups | 038 | Yes | Members access own groups (via group_members subquery) | ✅ |
| group_members | 038 | Yes | Members access group data (via group_members subquery) | ✅ |
| group_checkins | 038 | Yes | Members access group checkins (via group_members subquery) | ✅ |
| community_posts | 040 | Yes | Anyone read, users insert/delete own | ✅ |
| community_hearts | 040 | Yes | Anyone read, users manage own | ✅ |
| mentors | 041 | Yes | Public read active mentors, users manage own profile | ✅ |
| mentorship_connections | 041 | Yes | Users see/manage connections where they are mentor or mentee | ✅ |
| amends | 042 | Yes | Users manage own amends | ✅ |
| daily_inventory | 043 | Yes | Users manage own inventory | ✅ |
| user_values | 044 | Yes | Users manage own values | ✅ |
| daily_commitments | 045 | Yes | Users manage own commitments | ✅ |
| coaching_content | 046 | **NO** | **MISSING** | ❌ FIX NEEDED |
| therapist_referrals | 047 | Yes | Therapists manage own referrals | ✅ |
| organization_plans | 048 | Yes | Service-only (no user policy — intentional) | ✅ |
| feature_flags | 049 | Yes | Service-only (no user policy — intentional) | ✅ |

## Migrations with no new tables (skipped)

| Migration | Description |
|-----------|-------------|
| 035 | Adds realtime policies to existing tables (alerts, check_ins, nudges, milestones, focus_segments) |
| 039 | Adds columns to existing `users` table (is_therapist, therapist_profile) |
| 050 | Adds `grandfathered` column to `users` |
| 051 | Adds `tracked_substances` column to `users` |
| 052 | Adds onboarding/churn columns to `users`, expands nudge constraint |
| 053 | Adds `coach_schedule` column to `users` |

## Issues Found

### 1. `coaching_content` (migration 046) — RLS not enabled

**Risk:** Without RLS, any authenticated user can INSERT, UPDATE, or DELETE coaching content rows directly via the Supabase client. This table holds pre-generated coaching responses that should be admin/service-role managed only.

**Fix:** Enable RLS with no user-facing policies (service-role only), plus an optional authenticated SELECT policy so the app can read content without elevated privileges.

**Applied in:** `supabase/migrations/055_rls_fixes.sql`

## Policy Pattern Notes

- **User-owned data** (journals, challenges, inventory, values, commitments, amends, letters): `auth.uid() = user_id` for all operations. Correct.
- **Group data** (groups, members, checkins): Access gated by membership subquery. Correct.
- **Community data** (posts, hearts): Public read, user-scoped write. Correct.
- **Therapist data** (family_systems_notes, referrals): Scoped to `therapist_id` / `therapist_user_id`. Users get read-only where applicable. Correct.
- **Admin/service tables** (feature_flags, organization_plans): RLS enabled with no user policies — only service role can access. Correct.
- **Coaching content**: Should follow the admin/service pattern. Fixed in 055.
