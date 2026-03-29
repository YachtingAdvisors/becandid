// ============================================================
// app/legal/privacy/page.tsx
//
// Production-ready privacy policy for Be Candid.
// Covers: all data types, encryption, consent model,
// third-party processors, COPPA, retention, export, deletion.
//
// IMPORTANT: Have a lawyer review before launch.
// This is comprehensive but not legal advice.
// ============================================================

export const metadata = {
  title: 'Privacy Policy — Be Candid',
  description: 'How Be Candid collects, uses, protects, and shares your data.',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <p className="text-sm text-primary font-label font-medium uppercase tracking-wider mb-2">Legal</p>
          <h1 className="text-3xl font-headline font-bold text-on-surface mb-2">Privacy Policy</h1>
          <p className="text-sm text-on-surface-variant font-body">Last updated: March 28, 2026 &middot; Effective: March 28, 2026</p>
        </div>

        <div className="prose prose-sm max-w-none text-on-surface leading-relaxed font-body
          prose-headings:font-headline prose-headings:text-on-surface prose-headings:font-semibold
          prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:pt-6 prose-h2:border-t prose-h2:border-outline-variant/50
          prose-h3:text-base prose-h3:mt-6 prose-h3:mb-3
          prose-p:mb-4 prose-li:mb-1
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline
          prose-strong:text-on-surface">

          <p>
            Be Candid (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates the Be Candid mobile application and website
            at becandid.io (collectively, the &ldquo;Service&rdquo;). We are committed to protecting the privacy and
            security of your personal information. This Privacy Policy describes what information we collect,
            how we use it, who can access it, and the choices you have.
          </p>

          <p>
            Be Candid handles sensitive personal data related to behavioral health and intimate relationships.
            We treat this responsibility with the seriousness it deserves. Your journal entries are encrypted
            before they reach our database. Your partner never sees your browsing history. Your therapist only
            sees what you explicitly consent to share.
          </p>

          <h2>1. Information We Collect</h2>

          <h3>1.1 Account Information</h3>
          <p>
            When you create an account, we collect your email address, display name, and password (hashed,
            never stored in plain text). You may optionally provide a phone number for SMS notifications and
            a timezone for scheduling.
          </p>

          <h3>1.2 Screen Activity Categories</h3>
          <p>
            Be Candid monitors your device screen activity to detect content that matches the accountability
            categories you selected during onboarding (e.g., &ldquo;Pornography,&rdquo; &ldquo;Social Media,&rdquo;
            &ldquo;Gambling&rdquo;). We record the <strong>category</strong> and <strong>severity level</strong> of
            detected activity, along with a timestamp and the platform (iOS, Android, or web).
          </p>
          <p>
            <strong>We do NOT collect:</strong> URLs visited, screenshots, screen recordings, browsing history,
            app usage logs, or the specific content you viewed. Our on-device detection identifies the category
            of content without transmitting the content itself to our servers.
          </p>

          <h3>1.3 Journal Entries</h3>
          <p>
            You may write journal entries using our Candid Journal feature. Journal content — including
            freewrite text, guided prompt responses (tributaries, longings, roadmap), mood ratings, and tags —
            is encrypted using AES-256-GCM encryption with per-user derived keys <strong>before</strong> it
            is stored in our database. This means even our database administrators cannot read your journal
            entries without your encryption key.
          </p>

          <h3>1.4 Check-In and Conversation Data</h3>
          <p>
            We store check-in responses (mood ratings, self-assessments), conversation outcome ratings (1-5 scale,
            feeling words), and AI-generated conversation guides. Conversation guides and outcome notes are
            encrypted before storage.
          </p>

          <h3>1.5 Partner and Relationship Data</h3>
          <p>
            When you invite an accountability partner, we store their name, email address, phone number (optional),
            and relationship type (friend, spouse, mentor, coach, therapist, pastor). We track relationship-level
            XP and engagement metrics to power the relationship level system.
          </p>

          <h3>1.6 Spouse-Specific Data</h3>
          <p>
            If your accountability partner is your spouse, additional data is collected with their explicit
            consent: spouse journal entries (encrypted, separate from the monitored user&rsquo;s journal),
            impact check-in responses (feelings, trust meter, safety assessment), and Committed Contender
            milestone progress. See Section 4 for the spouse consent model.
          </p>

          <h3>1.7 Therapist Portal Data</h3>
          <p>
            If you connect a therapist, we serve them a read-only view of your data based on five independent
            consent toggles you control (journal, moods, streaks, outcomes, patterns). See Section 4.3.
          </p>

          <h3>1.8 Device and Technical Data</h3>
          <p>
            We collect device identifiers for push notification delivery, session information for security
            (device fingerprint, IP address, login timestamps), and basic usage analytics. We use this data
            for security (detecting unauthorized access), improving the Service, and delivering notifications.
          </p>

          <h3>1.9 Payment Information</h3>
          <p>
            Payment processing is handled entirely by Stripe, Inc. We store your Stripe customer ID,
            subscription plan, and subscription status. We do <strong>not</strong> store credit card numbers,
            bank account details, or other payment credentials. See Stripe&rsquo;s privacy policy at
            stripe.com/privacy.
          </p>

          <h2>2. How We Use Your Information</h2>

          <p>We use your information to:</p>
          <ul>
            <li>Operate the Service — detecting flagged content, generating AI conversation guides, delivering notifications, and processing journal entries.</li>
            <li>Generate AI-powered content — your flagged categories, severity, and timing are sent to the Anthropic Claude API to generate personalized conversation guides and weekly reflections. Journal content is sent to Claude only for the weekly reflection feature, and only from entries made during the relevant week.</li>
            <li>Send notifications — push notifications, email alerts, and SMS messages related to your accountability activity, check-in reminders, and journal prompts.</li>
            <li>Improve the Service — aggregated, de-identified usage patterns help us improve features. We never sell or share individual-level data for this purpose.</li>
            <li>Prevent abuse — brute force protection, session monitoring, and rate limiting protect your account.</li>
          </ul>

          <h2>3. Encryption and Security</h2>

          <h3>3.1 App-Layer Encryption</h3>
          <p>
            Journal entries, conversation guides, conversation outcome notes, spouse journal entries, and
            weekly reflections are encrypted using AES-256-GCM with per-user keys derived via HKDF from a
            master encryption key. This encryption occurs in our application layer <strong>before</strong>
            data reaches the database. Even if the database were compromised, encrypted fields would be
            unreadable without the application-layer keys.
          </p>

          <h3>3.2 Infrastructure Security</h3>
          <p>
            Our database (hosted by Supabase on AWS) encrypts all data at rest using AES-256 and all data
            in transit using TLS 1.2+. Row Level Security (RLS) policies enforce that each user can only
            access their own data at the database level. Authentication is handled by Supabase Auth with
            bcrypt password hashing.
          </p>

          <h3>3.3 Push Notification Privacy</h3>
          <p>
            Push notifications displayed on your lock screen are sanitized to remove sensitive details.
            Partner alert notifications say &ldquo;Your partner could use your support&rdquo; — not the
            category name or any identifying information. This prevents accidental disclosure if someone
            else sees your lock screen.
          </p>

          <h3>3.4 Session Security</h3>
          <p>
            We track active sessions and limit concurrent sessions to five per account. New device logins
            trigger a push notification to your existing devices. You can view and revoke sessions from
            Settings, and &ldquo;Log out everywhere&rdquo; is available for emergencies.
          </p>

          <h2>4. Who Can See Your Data</h2>

          <h3>4.1 Your Accountability Partner</h3>
          <p>Your accountability partner can see:</p>
          <ul>
            <li>That a flag was triggered (category and severity)</li>
            <li>When it happened (date and time)</li>
            <li>An AI-generated conversation guide</li>
            <li>Your focus streak length</li>
            <li>How many journal entries you wrote that week (the count, not the content)</li>
            <li>Conversation outcome ratings (after both sides submit)</li>
            <li>Relationship level and XP</li>
          </ul>
          <p>Your accountability partner <strong>cannot</strong> see:</p>
          <ul>
            <li>URLs or websites you visited</li>
            <li>Screenshots or screen recordings</li>
            <li>Your journal entry content (unless spouse and explicitly shared)</li>
            <li>Your mood or check-in responses</li>
            <li>The content of push notifications you receive</li>
          </ul>

          <h3>4.2 Spouse-Specific Consent</h3>
          <p>
            If your partner is your spouse, they have their own private journal that you cannot access unless
            they explicitly share a specific entry using a per-entry toggle. Spouse impact check-ins (feelings,
            trust meter) are only visible to you if the spouse enables the &ldquo;Share with partner&rdquo;
            toggle on each individual check-in. The default is private.
          </p>

          <h3>4.3 Therapist Access</h3>
          <p>
            If you connect a therapist, you control their access through five independent consent toggles:
            journal entries, mood timeline, focus streaks, conversation outcomes, and pattern analysis. Each
            toggle can be changed or revoked at any time from Settings. The therapist portal is read-only —
            therapists cannot modify, delete, or add to your data. When you revoke access, the therapist
            loses access immediately.
          </p>

          <h3>4.4 Crisis Detection</h3>
          <p>
            Our crisis language detection scans your journal freewrite text for distress indicators (e.g.,
            expressions of self-harm or suicidal ideation). This detection runs <strong>entirely on your
            device (client-side)</strong>. If detected, a resource banner is displayed privately to you
            with contact information for crisis helplines. This detection is <strong>never</strong> sent
            to our servers, <strong>never</strong> shared with your partner or therapist, <strong>never</strong>
            stored, and <strong>never</strong> blocks you from saving your journal entry.
          </p>

          <h2>5. Third-Party Service Providers</h2>
          <p>We use the following third-party services to operate Be Candid:</p>
          <ul>
            <li><strong>Supabase</strong> (database, authentication, file storage) — SOC 2 Type II compliant. Data stored in AWS US regions.</li>
            <li><strong>Anthropic</strong> (AI conversation guides and weekly reflections via Claude API) — data sent to Claude is not used to train AI models. See anthropic.com/privacy.</li>
            <li><strong>Resend</strong> (transactional email) — sends alert emails, journal reminders, and weekly digests.</li>
            <li><strong>Twilio</strong> (SMS notifications) — sends text-based alerts and check-in reminders.</li>
            <li><strong>Vercel</strong> (web hosting and serverless functions) — hosts the web application and API.</li>
            <li><strong>Stripe</strong> (payment processing) — handles subscription billing. We never store payment card details.</li>
            <li><strong>Expo</strong> (mobile push notifications) — delivers push notifications to iOS and Android devices.</li>
          </ul>
          <p>
            We do not sell, rent, or trade your personal information to third parties for marketing or
            advertising purposes. We do not display ads in Be Candid.
          </p>

          <h2>6. Data Retention</h2>
          <p>
            You control your data retention period through Settings (configurable from 30 to 365 days).
            Events, journal entries, alerts, and conversation data older than your retention period are
            automatically purged. You can also manually purge specific data types at any time from Settings.
          </p>
          <p>
            Account data (email, name, preferences) is retained as long as your account exists. When you
            delete your account, all associated data is permanently deleted within 30 days.
          </p>

          <h2>7. Your Rights and Choices</h2>
          <ul>
            <li><strong>Data Export:</strong> You can export all your data (events, journal entries, alerts, check-ins, conversation outcomes) as a JSON file from Settings at any time.</li>
            <li><strong>Data Deletion:</strong> You can selectively purge events, journal entries, or alerts from Settings. You can delete your account entirely, which permanently removes all associated data.</li>
            <li><strong>Consent Management:</strong> You can adjust therapist consent toggles, partner visibility settings, and journal reminder preferences at any time from Settings.</li>
            <li><strong>Notification Preferences:</strong> You can control push notification, email, and SMS preferences from Settings.</li>
            <li><strong>Account Portability:</strong> The data export feature provides your data in a portable JSON format.</li>
          </ul>

          <h2>8. Children&rsquo;s Privacy (COPPA)</h2>
          <p>
            Be Candid is designed for users aged 18 and older. We do not knowingly collect personal information
            from anyone under 18 years of age. Users must confirm they are at least 18 years old during account
            creation. If we learn that we have collected personal information from a person under 18, we will
            delete that information and terminate the associated account.
          </p>
          <p>
            If you are a parent or guardian and believe your child has provided us with personal information,
            please contact us at privacy@becandid.io.
          </p>

          <h2>9. Law Enforcement and Legal Disclosures</h2>
          <p>
            We may disclose your information if required by law, subpoena, court order, or other legal process.
            We may also disclose information if we believe in good faith that disclosure is necessary to protect
            the safety of any person or to prevent illegal activity. We will notify you of such requests unless
            we are legally prohibited from doing so.
          </p>
          <p>
            <strong>Important:</strong> Because journal entries and conversation data are encrypted at the
            application layer, a database-level subpoena would return encrypted data that cannot be read
            without our application-layer decryption process. We will respond to valid legal process but
            cannot decrypt data that has been purged per your retention settings.
          </p>

          <h2>10. International Users</h2>
          <p>
            Be Candid is operated from the United States. If you access the Service from outside the United
            States, your data will be transferred to and processed in the United States. By using the Service,
            you consent to this transfer.
          </p>

          <h2>11. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. If we make material changes, we will notify
            you by email and/or by posting a notice in the app at least 14 days before the changes take effect.
            Your continued use of the Service after the effective date constitutes your acceptance of the
            updated policy.
          </p>

          <h2>12. Contact Us</h2>
          <p>
            If you have questions or concerns about this Privacy Policy or your data, contact us at:
          </p>
          <ul>
            <li>Email: privacy@becandid.io</li>
            <li>Mailing address: [Address to be provided]</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
