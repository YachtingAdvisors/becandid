# Be Candid — Play Store Screenshot Spec

> Detailed specifications for the designer. Eight screenshots total.
> All screenshots use Pixel 8 device frame unless noted otherwise.
> Export at 1080x1920 px (9:16), PNG, sRGB.

---

## Global Design Guidelines

- **Device frame:** Google Pixel 8, angled 3-5 degrees for depth. Consistent
  across all screenshots.
- **Text overlay font:** The app's headline font (same as DashboardHero heading).
  White or off-white (#F5F5F5) with a subtle drop shadow for legibility.
- **Text placement:** Top 20% of the canvas. Large headline, optional one-line
  subtitle beneath it in the body font at reduced opacity.
- **Background treatment:** Each screenshot has a unique gradient that matches
  the emotional tone. Gradients use the app's teal/slate palette unless a
  specific color is noted.
- **Status bar:** Show realistic Android status bar (time, battery, signal).
  Keep it subtle — do not draw attention away from the content.
- **No watermarks, no "NEW" badges, no price callouts.** Let the UI speak.
- **Accessibility:** All text overlays must pass WCAG AA contrast against their
  background gradient. Minimum 18px equivalent at export resolution.

---

## Screenshot 1: "Your Journey at a Glance"

**Purpose:** Establish credibility and show the product's flagship surface.

### Text Overlay

- **Headline:** "Track your progress, not your browsing"
- **Subtitle:** "Momentum, streaks, and mood — all in one place"

### Screen Content

Show the Dashboard home screen with:
- **DashboardHero** component visible: momentum score ring (show score around
  72-78 to feel realistic and aspirational without looking fake), active streak
  counter (e.g. "14 days"), and the small mood trajectory sparkline trending
  upward.
- Below the hero: the daily check-in card in "ready" state (not yet completed
  for the day).
- Show 2-3 rival category chips at the bottom edge of the visible area to hint
  at breadth without overwhelming.

### Background

Teal-to-dark-slate gradient (top-left to bottom-right).
`linear-gradient(135deg, #0D9488 0%, #1E293B 100%)`

### Mood / Tone

Calm, encouraging, forward-looking. This is the "home base" screenshot.

---

## Screenshot 2: "Guided Self-Reflection"

**Purpose:** Show the Conversation Coach as a warm, intelligent dialogue — not
a chatbot gimmick.

### Text Overlay

- **Headline:** "A coach who understands — with curiosity, not judgment"
- **Subtitle:** "Guided by Motivational Interviewing"

### Screen Content

Show the Conversation Coach chat interface mid-conversation with 3-4 visible
messages:

1. **Coach (AI):** "You mentioned the urge hit hardest around 11 PM. What was
   happening right before that?"
2. **User:** "I was just bored, scrolling, everyone else was asleep."
3. **Coach (AI):** "That window between boredom and action — that's where the
   real work happens. What would it look like to have a plan for that moment?"
4. (User typing indicator active, suggesting an engaged conversation.)

Show the **phase breadcrumbs** at the top of the chat:
`Tributaries → Longing → Roadmap` with "Longing" highlighted as the current
phase.

### Background

Warm slate-to-teal gradient (bottom-left to top-right).
`linear-gradient(315deg, #1E293B 0%, #115E59 100%)`

### Mood / Tone

Intimate, non-clinical, human. The coach feels like a wise friend, not a
therapist robot.

---

## Screenshot 3: "Journal Your Way to Freedom"

**Purpose:** Demonstrate the Stringer Journal's guided structure — this is not a
blank diary.

### Text Overlay

- **Headline:** "Understand what drives your patterns"
- **Subtitle:** "Stringer journaling — structured, not empty"

### Screen Content

Show the Stringer Journal entry screen with:
- A visible **Stringer prompt** at the top (e.g. "What were you feeling in the
  hour before the urge? Not the urge itself — the feeling underneath it.")
- A partially completed **freewrite area** with 3-4 lines of realistic user
  text. Do not use lorem ipsum. Use something like: "I think I was feeling
  disconnected. The kids went to bed and Sarah was on her phone and I just felt
  like nobody needed me for anything..."
- The **mood selector** visible (show 5 mood options: great, good, okay,
  struggling, crisis — with "struggling" selected).
- 2-3 **tags** visible below the entry (e.g. "loneliness", "evening",
  "boredom").
- Show the **guided prompts toggle** in the toolbar, set to ON.

### Background

Deep indigo-to-slate gradient.
`linear-gradient(180deg, #312E81 0%, #1E293B 100%)`

### Mood / Tone

Reflective, introspective, safe. The journal feels like a private space with
guardrails.

---

## Screenshot 4: "Your Partner Sees Clarity, Not Content"

**Purpose:** Directly address the #1 objection — "I don't want someone seeing
my browsing history." Show exactly what the partner sees and does not see.

### Text Overlay

- **Headline:** "Accountability without surveillance"
- **Subtitle:** "Your partner sees momentum — never your screen"

### Screen Content

Use a **split-screen or side-by-side comparison** layout within the device
frame:

**Left half (or top section) — "What your partner sees":**
- Momentum score (76)
- Streak count (14 days)
- Mood trend (upward arrow, labeled "improving")
- Last check-in time ("Today, 8:14 AM")
- A green "On Track" status badge

**Right half (or bottom section) — "What your partner never sees":**
- Show redacted/blurred placeholders with lock icons over:
  - "Browsing history" (crossed out or behind a lock)
  - "Screenshots" (crossed out or behind a lock)
  - "App activity" (crossed out or behind a lock)
  - "Journal entries" (crossed out or behind a lock)

Use a visual divider between the two halves — a subtle dashed line or gradient
fade. The "never sees" side should feel definitively locked, not ambiguous.

### Background

Teal-to-emerald gradient (horizontal).
`linear-gradient(90deg, #0D9488 0%, #059669 100%)`

### Mood / Tone

Trustworthy, transparent, reassuring. This screenshot sells the privacy
promise.

---

## Screenshot 5: "17 Rivals, One App"

**Purpose:** Show the breadth of categories Be Candid supports. Differentiate
from single-purpose apps.

### Text Overlay

- **Headline:** "Not just porn. Gambling. Social media. Isolation. Gaming."
- **Subtitle:** "17 categories. One accountability partner."

### Screen Content

Show the **GoalSelector** grid from onboarding with 6-8 categories visibly
selected (use the bento grid layout from the actual component):
- Pornography (selected, red glow)
- Social Media & News (selected, blue glow)
- Gambling (selected, amber glow)
- Excessive Gaming (selected, violet glow)
- Isolation & Withdrawal (selected, violet glow)
- Impulse Shopping (selected, emerald glow)
- Alcohol & Drugs (visible but not selected)
- Binge Watching (visible but not selected)

Show the **counter badge** at top: "6 rivals selected"

Ensure the grid is scrollable — show partial cards at the bottom edge to
suggest more categories below the fold.

### Background

Dark slate-to-violet gradient.
`linear-gradient(135deg, #1E293B 0%, #4C1D95 100%)`

### Mood / Tone

Empowering, expansive, validating. "Whatever you're facing, we cover it."

---

## Screenshot 6: "Dark Mode. Late Night Protection."

**Purpose:** Show dark mode polish and position it as intentional design for
the moments users need help most.

### Text Overlay

- **Headline:** "Built for the moments that matter most"
- **Subtitle:** "Dark mode, designed for late nights"

### Screen Content

Show the full Dashboard in **dark mode**:
- Same general layout as Screenshot 1 (DashboardHero with momentum ring,
  streak, mood sparkline).
- Dark surfaces should feel rich and intentional — not just "inverted colors."
  Show the true dark theme with proper contrast, teal accent glow on the
  momentum ring, and subtle surface layering.
- Show the time in the status bar as **11:47 PM** to reinforce the "late night"
  narrative.
- If the app has an ambient glow or reduced-brightness mode indicator, show it.

### Background

Near-black to dark teal gradient.
`linear-gradient(180deg, #0F172A 0%, #134E4A 100%)`

### Mood / Tone

Calm, protective, ambient. This screenshot says "we thought about the 11 PM
moment."

---

## Screenshot 7: "Your Therapist, Connected"

**Purpose:** Show the Therapist Portal as a premium, professional feature.
Targets users already in therapy who want continuity between sessions.

### Text Overlay

- **Headline:** "Give your therapist real-time insight"
- **Subtitle:** "Structured data between sessions — Therapy tier"

### Screen Content

Show the **Therapist Portal** view (from the therapist's perspective):
- A client card showing: name (use "Alex M."), momentum trend (small sparkline),
  streak status, and last journal date.
- Below the card: a **clinical summary panel** showing:
  - "Patterns detected: evening triggers, isolation-linked urges"
  - "Journal frequency: 5/7 days this week"
  - "Mood trajectory: gradual improvement over 3 weeks"
  - A "Prepare for Session" button or section header.
- Show the Therapy tier badge subtly in the header to communicate this is a
  premium feature.

### Background

Warm gray-to-teal gradient.
`linear-gradient(135deg, #374151 0%, #115E59 100%)`

### Mood / Tone

Professional, clinical-but-warm, premium. This screenshot speaks to therapists
and therapy-committed users.

---

## Screenshot 8: "Join a Group. Break the Isolation."

**Purpose:** Show group accountability as a social feature. Reference the
"cord of three strands" (Ecclesiastes 4:12) to resonate with faith-based
recovery communities without being preachy.

### Text Overlay

- **Headline:** "A cord of three strands is not easily broken"
- **Subtitle:** "Private groups for shared accountability"

### Screen Content

Show the **Group Accountability** page:
- A group card with a name (e.g. "Tuesday Night Guys" or "Morning Check-In
  Circle") showing 4-5 member avatars (use diverse, abstract avatar icons —
  not photos).
- Group stats visible: "4 members · 12-day group streak · 92% check-in rate"
- A recent activity feed showing:
  - "Jordan completed their check-in" (2h ago)
  - "Marcus hit a 30-day streak" (5h ago, with a small celebration icon)
  - "Group encouragement: 3 messages today"
- Show a "Share Encouragement" button at the bottom.

### Background

Violet-to-teal gradient.
`linear-gradient(135deg, #5B21B6 0%, #0D9488 100%)`

### Mood / Tone

Connected, communal, hopeful. This screenshot answers the loneliness that
drives relapse.

---

## Screenshot Order Rationale

| Position | Screenshot | Why This Order |
|----------|-----------|----------------|
| 1 | Dashboard | First impression — show the product |
| 2 | Coach | Core feature — emotional hook |
| 3 | Journal | Depth feature — shows seriousness |
| 4 | Partner Privacy | Overcomes #1 objection |
| 5 | 17 Rivals | Broadens appeal beyond single category |
| 6 | Dark Mode | Visual polish, late-night relevance |
| 7 | Therapist | Premium tier, professional credibility |
| 8 | Groups | Community, closing with connection |

---

## Asset Delivery Checklist

For each screenshot, the designer delivers:

- [ ] 1080x1920 PNG (phone, required)
- [ ] 1200x1920 PNG (7-inch tablet, optional but recommended)
- [ ] 1600x2560 PNG (10-inch tablet, optional)
- [ ] Source file (Figma frame link or PSD)
- [ ] Dark/light variant if applicable (screenshots 1 and 6 are the pair)

Total required assets: **8 phone PNGs minimum.**
