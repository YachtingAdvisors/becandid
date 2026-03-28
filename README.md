# Be Candid

**Accountability that heals.**

Be Candid is a full-stack accountability app that monitors device screen activity, detects concerning behavior across 16 categories, alerts an accountability partner, and generates AI-powered conversation guides grounded in Motivational Interviewing. No shame, by design.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS
- **Database**: Supabase (Postgres + Auth + RLS)
- **AI**: Anthropic Claude (conversation guide generation)
- **Email**: Resend
- **SMS**: Twilio
- **Deployment**: Vercel (cron jobs via vercel.json)
- **Mobile**: Expo / React Native (separate repo)

## Features

### Core
- **16 rival categories** across 8 groups: Sexual Content, Compulsive Consumption (Social Media & News, Binge Watching, Impulse Shopping), Substances & Recovery, Body Image & Eating Disorders, Gambling & Financial, Dating Apps, Gaming, Rage Content
- **Morning/Evening focus segments** (5AM–5PM / 5PM–5AM) — each day tracked as focused or distracted
- **AI conversation guides** — Claude generates personalized guides for both user and partner with category-specific sensitivity (clinical handling for eating disorders, recovery-informed language for substances)
- **Alert pipeline** — Event → Focus segment update → AI guide → Email + SMS to partner → Self-notification to user

### Gamification
- **Trust points** — Earn points for focused segments (+5 each), full days (+10 bonus), conversations (+25), check-ins (+5), milestones (+50)
- **19 milestones** across focus, points, conversations, and streak categories
- **Badges page** with bronze/silver/gold/platinum tiers
- **Growth Journal** — narrative summary, mood timeline, morning vs evening comparison, reflection history

### Check-ins
- **Dual confirmation** — both user and partner must confirm for a check-in to count
- **Configurable frequency** — daily, every 2 days, every 3 days, weekly, every 2 weeks
- **Grace periods** scale with frequency (24h–3 days)
- **Expiration** — unconfirmed check-ins auto-expire

### Proactive Support
- **Vulnerability windows** — schedule risky times, get nudges when they start, partner notified
- **Pattern detector** — analyzes 90 days of history for time clustering, frequency spikes, streak-at-risk, missed check-ins
- **Nudge system** — info/warning/urgent banners on dashboard, dismissable

### Partner Experience
- **Partner onboarding** — 4-screen walkthrough explaining the partner role, conversation guide usage, and what NOT to do
- **Mutual accountability** — both users monitor each other via a single partnership (opt-in by partner)
- **Partner layout** with top nav (Focus Board, Check-ins, Conversations, Encourage)
- **Focus Board view** — see monitored user's 3-week heatmap, trust points, milestones
- **Check-in confirmation** — partner-side mood assessment (confident, hopeful, concerned, worried)
- **Encouragement** — emoji picker, quick messages, custom text
- **Conversation guides** — partner-specific AI guidance with "what NOT to say" lists
- **Regenerate guide** — request a fresh AI guide if the first attempt at conversation didn't go well

### Retention
- **Contextual check-in prompts** — Claude generates personalized prompts based on streak status, recent events, mood trends, and day of week
- **Re-engagement emails** — dormant users (7+ days inactive) receive a "we miss you" email with stats context (max once per 14 days)
- **Notification preferences** — granular control over email, SMS, and push for alerts, check-ins, digest, nudges, and encouragement

### Monetization
- **Free / Pro / Team plans** with Stripe integration
- Free plan: 3 AI guides/month, 3 regenerations/month, 1 partner, 3 vulnerability windows
- Pro plan: unlimited guides, unlimited regenerations, 3 partners, 10 vulnerability windows, pattern detection
- **Stripe Checkout** for upgrades, **Billing Portal** for subscription management

### Security
- **Security headers** — CSP, HSTS, X-Frame-Options DENY, nosniff, strict referrer
- **Timing-safe cron authentication** — prevents timing attacks on Bearer tokens
- **Per-IP rate limiting** — 120 requests/min at middleware level
- **Per-user rate limiting** — route-specific (30 events/min, 20 AI guides/hour, 3 account ops/hour)
- **Input sanitization** — HTML stripping, JS protocol removal, name/email/phone validation
- **Safe error responses** — full stack traces logged server-side, generic messages to client
- **Immutable audit log** — every security-relevant action logged with user, timestamp, metadata
- **Session tracking** — login activity page showing device, IP, location, and last seen (like Google/GitHub)
- **Session revocation** — revoke individual sessions from the security page
- **Account deletion requires re-authentication** — password verified before data removal
- **Client error reporting** — errors captured and sent to `/api/errors` with Sentry integration ready
- **Activity tracking** — `last_active_at` updated via cookie-debounced middleware (every 5 min)
- **Invite tokens use `crypto.randomUUID()`**

### Privacy & GDPR
- **Data export** — full JSON download with data manifest explaining every category stored
- **Complete deletion** — removes all data, revokes sessions, clears partner references, deletes auth user
- **Notification opt-out** — unsubscribe from any notification type without disabling monitoring

## Project Structure

```
be-candid/
├── apps/web/
│   ├── app/
│   │   ├── api/                    # 21 API routes
│   │   │   ├── account/            # Data export + account deletion
│   │   │   ├── alerts/             # List alerts
│   │   │   ├── auth/profile/       # GET/PATCH/POST profile
│   │   │   ├── auth/timezone/      # Update timezone
│   │   │   ├── check-ins/          # List + confirm check-ins
│   │   │   ├── conversations/      # Create + list conversations
│   │   │   ├── cron/               # checkin, digest, focus-segments, patterns
│   │   │   ├── events/             # Log + list events
│   │   │   ├── nudges/             # List + dismiss nudges
│   │   │   ├── partner/            # Focus view + alerts for partner
│   │   │   ├── partners/           # CRUD + invite + accept + reinvite
│   │   │   ├── trust-points/       # Stats + earn points
│   │   │   └── vulnerability-windows/
│   │   ├── auth/                   # Sign in, sign up, reset, update password
│   │   ├── checkin/[id]/           # Check-in response page
│   │   ├── conversation/[alertId]/ # AI guide viewer
│   │   ├── dashboard/              # 10 pages + layout + loading + error
│   │   ├── invite/[token]/         # Partner invite acceptance
│   │   ├── onboarding/             # 5-step flow
│   │   ├── partner/                # 4 pages + layout
│   │   └── page.tsx                # Landing page
│   ├── components/
│   │   ├── dashboard/              # 12 components
│   │   └── onboarding/             # GoalSelector
│   ├── lib/                        # 13 service modules
│   └── middleware.ts               # Auth + security + rate limiting
├── packages/shared/                # Types, schemas, utilities
└── supabase/migrations/            # 6 migrations (005–010)
```

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn (workspaces)
- Supabase project (supabase.com)
- Anthropic API key (console.anthropic.com)
- Resend account (resend.com)
- Twilio account (twilio.com)

### Install

```bash
git clone <repo> && cd be-candid
yarn install
```

### Configure

```bash
cp apps/web/.env.example apps/web/.env.local
# Fill in all values
```

### Run Migrations

```bash
supabase login
supabase link --project-ref your-project-ref
supabase db push
```

Migrations run in order: 005 → 006 → 007 → 008 → 009 → 010

Note: migrations 001–004 were from the original v1–v3 builds and should already be applied if upgrading.

### Supabase Auth Setup

In Supabase dashboard → Authentication → URL Configuration:
- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/**`

### Run

```bash
yarn web
```

## Cron Schedule (Vercel)

| Endpoint | Schedule | Purpose |
|----------|----------|---------|
| `/api/cron/focus-segments` | 5:30 AM UTC daily | Score yesterday's focus segments, award points |
| `/api/cron/checkin` | Every hour | Send contextual check-ins at user's preferred time + frequency |
| `/api/cron/patterns` | 6:00 AM UTC daily | Run pattern detection, fire nudges |
| `/api/cron/digest` | 9:00 AM UTC Mondays | Weekly summary email to user + partner |
| `/api/cron/reengagement` | 3:00 PM UTC daily | Send re-engagement emails to users inactive 7+ days |

All cron endpoints require `CRON_SECRET` header.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server only) |
| `NEXT_PUBLIC_APP_URL` | Yes | Deployed app URL |
| `ANTHROPIC_API_KEY` | Yes | Claude API key |
| `RESEND_API_KEY` | Yes | Resend email API key |
| `RESEND_FROM_EMAIL` | Yes | Verified sender email |
| `TWILIO_ACCOUNT_SID` | Yes | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Yes | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | Yes | Twilio phone number |
| `CRON_SECRET` | Yes | Secret for cron authentication |
| `STRIPE_SECRET_KEY` | No | Stripe API key (billing) |
| `STRIPE_PRO_PRICE_ID` | No | Stripe Price ID for Pro plan |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe webhook signing secret |
| `NEXT_PUBLIC_SENTRY_DSN` | No | Sentry DSN for error reporting |

## Transparency Commitment

- Monitoring indicator is always visible
- User can pause/disable monitoring at any time
- URLs are never stored — only SHA-256 hashes if needed
- AI guides are accessible to both user and partner
- No hidden surveillance
- Data export available at any time
- Account deletion is permanent and complete

## License

MIT
