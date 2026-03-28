# Trust Points & Focus Segments — Integration Guide

## Overview

This feature divides each day into **Morning** (5AM–5PM) and **Evening** (5PM–5AM) segments. Each segment is either **focused** (no flags) or **distracted** (1+ flags). Users earn trust points for staying focused and completing conversations.

---

## New Files

| File | Purpose |
|------|---------|
| `supabase/migrations/005_trust_points.sql` | DB tables: `focus_segments`, `trust_points`, `milestones` + RLS |
| `apps/web/lib/focusSegments.ts` | Core engine: segment evaluation, streak calc, 21-day heatmap, points |
| `apps/web/lib/focusIntegration.ts` | Glue: `onEventFlagged()` + `onConversationCompleted()` |
| `apps/web/app/api/trust-points/stats/route.ts` | GET endpoint: balance, streak, heatmap, milestones |
| `apps/web/app/api/cron/focus-segments/route.ts` | Nightly cron: backfill focused segments, award points, check milestones |
| `apps/web/app/api/conversations/route.ts` | Updated: awards trust points on conversation completion |
| `apps/web/app/dashboard/focus/page.tsx` | Full Focus Board page |
| `apps/web/components/dashboard/FocusBoard.tsx` | Full component: 3-week heatmap, points, milestones, history |
| `apps/web/components/dashboard/FocusBoardMini.tsx` | Compact widget for dashboard overview |
| `vercel.json` | Cron schedule for nightly processing |

---

## Wiring Steps

### 1. Run the migration

```bash
supabase db push
# or paste 005_trust_points.sql into the Supabase SQL editor
```

### 2. Patch alertPipeline.ts (2 lines)

Add the import at the top:

```typescript
import { onEventFlagged } from './focusIntegration';
```

Add this right after the event INSERT (step 3), before fetching the partner:

```typescript
// ── 3b. Mark focus segment distracted ──────────────────
try {
  await onEventFlagged(supabase, userId, event.timestamp, event.category);
} catch (e) {
  console.error('Focus segment update failed (non-fatal):', e);
}
```

### 3. Add Focus Board to sidebar nav

In `Sidebar.tsx`, add to NAV_ITEMS array:

```typescript
{ href: '/dashboard/focus', label: 'Focus Board', icon: '🎯' },
```

### 4. Add FocusBoardMini to dashboard overview

In `dashboard/page.tsx`, import and render:

```typescript
import FocusBoardMini from '../../components/dashboard/FocusBoardMini';

// In the render, add alongside existing stat cards:
<FocusBoardMini />
```

### 5. Set CRON_SECRET env var

```bash
# In .env.local and Vercel Environment Variables
CRON_SECRET=your-random-secret-here
```

### 6. Deploy vercel.json

The cron runs nightly at 5:30 AM UTC — scores the previous day's segments for all users.

---

## Points Table

| Action | Points |
|--------|--------|
| Focused Morning | +5 |
| Focused Evening | +5 |
| Both Focused (Full Day Bonus) | +10 |
| Check-in Completed | +5 |
| Conversation Completed | +25 |
| Positive Conversation Bonus | +10 |
| Partner Encouraged | +5 (partner earns) |
| 7-Day Streak Bonus | +30 |
| 30-Day Streak Bonus | +100 |
| 90-Day Streak Bonus | +250 |
| Milestone Unlocked | +50 |

---

## Segment Logic

- **Morning**: 5:00 AM – 4:59 PM in user's local timezone
- **Evening**: 5:00 PM – 4:59 AM in user's local timezone
- Events between midnight–4:59 AM count toward the **previous day's evening**
- A segment with **zero flags** = focused
- A segment with **1+ flags** = distracted
- Both segments focused = full focused day (earns day bonus)
- Consecutive full focused days build the streak

---

## User timezone

Migration adds `timezone` column to `users` table (default: `America/New_York`). Make sure onboarding or settings lets the user set this — the segment boundaries depend on it.
