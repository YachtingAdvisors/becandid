# Be Candid — Launch Checklist

## Phase 1: Assembly (Claude Code session)
- [ ] Unzip all 9 packages into `/packages-raw/`
- [ ] Run `scripts/assemble.sh`
- [ ] Paste `CLAUDE-CODE-PROMPT.md` into Claude Code
- [ ] Fix imports until `next build` passes
- [ ] Create any missing stubs (security.ts, etc.)
- [ ] Wire relationship hooks into existing routes
- [ ] Wire crisis detection into journal page
- [ ] Wire spouse detection into alert pipeline
- [ ] Add widgets to dashboard overview
- [ ] Add settings panels to settings page
- [ ] Verify all 6 cron routes return 401 without secret
- [ ] Run through verification checklist

## Phase 2: Infrastructure
- [ ] Create Supabase project
- [ ] Run all migrations (005-017) in order
- [ ] Verify all tables exist with correct RLS
- [ ] Create Vercel project, connect repo
- [ ] Set all environment variables in Vercel
- [ ] Verify cron jobs are configured in vercel.json
- [ ] Set up Resend domain + verify DNS
- [ ] Set up Twilio number
- [ ] Set up Anthropic API billing
- [ ] Generate ENCRYPTION_MASTER_KEY and set in env
- [ ] Generate CRON_SECRET and set in env
- [ ] Configure Supabase Auth redirect URLs:
  - Site URL: https://becandid.io
  - Redirect URLs: https://becandid.io/**
- [ ] Deploy to Vercel, verify production build
- [ ] Test signup → onboarding → dashboard flow in production

## Phase 3: Legal
- [ ] Privacy policy (REQUIRED before app store submission)
  - What data is collected (screen activity categories, journal entries, mood)
  - How data is encrypted (AES-256-GCM app-layer)
  - Who can see what (user, partner, therapist — with consent model)
  - Data retention (configurable 30-365 days)
  - Data export and deletion rights
  - COPPA: age gate (must be 18+)
  - Third-party processors (Supabase, Anthropic, Resend, Twilio, Vercel)
- [ ] Terms of service
  - App is not therapy / not a substitute for professional help
  - Crisis resources disclaimer
  - User responsibility for partner relationships
  - Subscription terms and cancellation
- [ ] COPPA compliance
  - Age verification at signup (checkbox or date of birth)
  - Block under-18 users
  - No data collection from minors
- [ ] Cookie policy (if applicable for web)
- [ ] Therapist portal data processing agreement template

## Phase 4: Stripe Integration
- [ ] Create Stripe account
- [ ] Create 3 Products: Free, Pro ($9.99/mo), Therapy ($19.99/mo)
- [ ] Create annual Price variants ($99/yr, $179/yr)
- [ ] Build webhook handler (/api/webhooks/stripe)
  - Handle: checkout.session.completed
  - Handle: customer.subscription.updated
  - Handle: customer.subscription.deleted
  - Handle: invoice.payment_failed
- [ ] Build checkout flow (Stripe Checkout with Link enabled)
- [ ] Build customer portal link (for managing subscription)
- [ ] Add paywall logic:
  - Free users: 3 AI guides/month, 1 partner, no journal reminders
  - Pro users: unlimited guides, 3 partners, all features
  - Therapy users: Pro + therapist portal
- [ ] 14-day free trial of Pro for new signups
- [ ] Test upgrade/downgrade/cancel flows
- [ ] Test failed payment → dunning → eventual downgrade

## Phase 5: App Store Prep (iOS)
- [ ] Apple Developer account ($99/yr)
- [ ] Apply for Family Controls entitlement (takes weeks)
- [ ] App icon (1024x1024)
- [ ] Screenshots (6.7", 6.5", 5.5" sizes)
- [ ] App Store description
- [ ] Privacy nutrition labels:
  - Data Used to Track You: None
  - Data Linked to You: email, name, usage data
  - Data Not Linked to You: crash logs
  - Sensitive data handling disclosure
- [ ] Age rating: 17+ (references sexual content categories)
- [ ] Submit for review
  - Note to reviewer explaining monitoring features
  - Demo account credentials for review team
  - Explain Family Controls usage

## Phase 6: App Store Prep (Android)
- [ ] Google Play Developer account ($25 one-time)
- [ ] App icon + feature graphic
- [ ] Screenshots (phone + tablet)
- [ ] Play Store listing
- [ ] Privacy policy URL (required)
- [ ] Data safety section:
  - Data collected and shared disclosures
  - Encryption disclosure
  - Data deletion mechanism
- [ ] Content rating questionnaire
- [ ] Target audience: 18+
- [ ] Submit for review

## Phase 7: Monitoring & Analytics
- [ ] Sentry error tracking (web + mobile)
- [ ] PostHog or Mixpanel analytics:
  - Onboarding funnel (% completing each step)
  - Solo vs partner mode split
  - Journal entries per user per week
  - Conversation completion rate
  - Free → Pro conversion rate
  - Churn rate by cohort
- [ ] Uptime monitoring (Better Uptime, Checkly)
- [ ] Stripe revenue dashboard
- [ ] Supabase usage monitoring (stay under Pro limits)

## Phase 8: Launch
- [ ] Soft launch to 10-20 beta users (friends, church group)
- [ ] Gather feedback for 2 weeks
- [ ] Fix critical bugs
- [ ] Public launch
- [ ] Post on Product Hunt
- [ ] Share in relevant communities (church groups, men's groups, recovery forums)
- [ ] Reach out to Jay Stringer's community (his courses reference accountability)
