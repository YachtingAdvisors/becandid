// ============================================================
// app/legal/terms/page.tsx
//
// Terms of Service for Be Candid.
// Covers: subscriptions, not-therapy disclaimer, crisis
// resources, user responsibilities, partner relationships,
// cancellation, limitation of liability.
//
// IMPORTANT: Have a lawyer review before launch.
// ============================================================

export const metadata = {
  title: 'Terms of Service — Be Candid',
  description: 'Terms and conditions for using Be Candid.',
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <p className="text-sm text-brand font-medium uppercase tracking-wider mb-2">Legal</p>
          <h1 className="text-3xl font-display font-bold text-ink mb-2">Terms of Service</h1>
          <p className="text-sm text-ink-muted">Last updated: March 28, 2026 &middot; Effective: March 28, 2026</p>
        </div>

        <div className="prose prose-sm prose-gray max-w-none text-ink leading-relaxed
          prose-headings:font-display prose-headings:text-ink prose-headings:font-semibold
          prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4
          prose-h3:text-base prose-h3:mt-6 prose-h3:mb-3
          prose-p:mb-4 prose-li:mb-1
          prose-a:text-brand prose-a:no-underline hover:prose-a:underline">

          <p>
            These Terms of Service (&ldquo;Terms&rdquo;) govern your use of Be Candid, including the mobile
            application and website at becandid.io (the &ldquo;Service&rdquo;), operated by Be Candid LLC
            (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). By creating an account or using the
            Service, you agree to these Terms.
          </p>

          <h2>1. Eligibility</h2>
          <p>
            You must be at least 18 years old to use Be Candid. By creating an account, you represent
            that you are at least 18 years of age. We reserve the right to terminate accounts and delete
            data associated with users who are found to be under 18.
          </p>

          <h2>2. The Service</h2>
          <p>
            Be Candid is an accountability and personal reflection application. It monitors device screen
            activity for content matching user-selected categories, notifies designated accountability
            partners, generates AI-powered conversation guides, and provides structured journaling tools
            grounded in Jay Stringer&rsquo;s &ldquo;Unwanted&rdquo; framework.
          </p>

          <h3>2.1 Be Candid Is Not Therapy</h3>
          <p>
            <strong>Be Candid is not a substitute for professional mental health treatment.</strong> The
            Service does not provide therapy, counseling, psychiatric services, crisis intervention, medical
            advice, or diagnosis. AI-generated conversation guides are informational aids — not clinical
            recommendations. The Stringer Journal prompts are reflection tools — not therapeutic interventions.
          </p>
          <p>
            If you are experiencing a mental health crisis, please contact the 988 Suicide &amp; Crisis
            Lifeline (call or text 988), the Crisis Text Line (text HOME to 741741), or your local
            emergency services (911).
          </p>
          <p>
            The therapist portal feature provides your therapist with read-only access to your app data.
            The therapist-client relationship exists between you and your therapist, not between you and
            Be Candid. We are not a party to, and bear no responsibility for, the therapeutic relationship
            or any clinical decisions made using data from the Service.
          </p>

          <h3>2.2 Accountability Partner Relationships</h3>
          <p>
            When you invite an accountability partner, you are choosing to share certain information about
            your screen activity with that person. You are responsible for selecting a partner you trust.
            We facilitate the sharing of information as described in our Privacy Policy, but we are not
            responsible for how your partner uses that information, how they conduct conversations with you,
            or any consequences arising from the accountability relationship.
          </p>
          <p>
            If your accountability partner is your spouse, additional features are available that handle
            the unique dynamics of that relationship (see Privacy Policy Section 4.2). These features are
            informed by research on betrayal trauma and are designed to support — not replace — professional
            couples counseling.
          </p>

          <h3>2.3 Crisis Resources</h3>
          <p>
            Be Candid includes a crisis detection feature that displays mental health resources when
            distress language is detected in journal entries. This feature runs entirely on your device
            and is not monitored by us or shared with anyone. The display of crisis resources does not
            constitute a clinical assessment. If you are in crisis, please use the resources provided or
            contact emergency services directly.
          </p>

          <h2>3. Accounts</h2>

          <h3>3.1 Account Security</h3>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and for all
            activity that occurs under your account. You must notify us immediately at support@becandid.io
            if you believe your account has been compromised. We implement brute force protection, session
            management, and new-device alerts to help protect your account.
          </p>

          <h3>3.2 Account Deletion</h3>
          <p>
            You may delete your account at any time from Settings. Account deletion is permanent and will
            result in the irreversible removal of all associated data, including journal entries, events,
            alerts, conversation guides, and relationship data. Data deletion is completed within 30 days
            of your request. Active subscriptions will be canceled but no refund will be issued for the
            remaining period.
          </p>

          <h2>4. Subscriptions and Payment</h2>

          <h3>4.1 Plans</h3>
          <p>
            Be Candid offers Free, Pro, and Therapy subscription plans. Feature availability varies by plan
            as described on our pricing page. We reserve the right to modify plan features and pricing with
            at least 30 days&rsquo; notice to active subscribers.
          </p>

          <h3>4.2 Billing</h3>
          <p>
            Paid subscriptions are billed in advance on a monthly or annual basis through Stripe. By
            subscribing, you authorize us to charge your payment method on a recurring basis until you
            cancel. All amounts are in US dollars unless otherwise specified.
          </p>

          <h3>4.3 Free Trial</h3>
          <p>
            New users may receive a 14-day free trial of the Pro plan. You will not be charged during the
            trial period. At the end of the trial, your subscription will automatically convert to a paid
            subscription unless you cancel or downgrade before the trial expires.
          </p>

          <h3>4.4 Cancellation</h3>
          <p>
            You may cancel your subscription at any time from Settings or through the Stripe customer portal.
            Cancellation takes effect at the end of your current billing period. You will retain access to
            paid features until the end of the period you have already paid for. No partial refunds are
            issued for unused time within a billing period.
          </p>

          <h3>4.5 Refunds</h3>
          <p>
            Refund requests may be submitted to support@becandid.io within 14 days of your most recent
            charge. Refunds are issued at our discretion and are generally granted for first-time
            subscribers who experienced technical issues preventing use of the Service.
          </p>

          <h2>5. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Service if you are under 18 years of age.</li>
            <li>Use the Service to monitor another person without their knowledge and explicit consent.</li>
            <li>Share your accountability partner&rsquo;s private data with third parties without their consent.</li>
            <li>Attempt to circumvent the app&rsquo;s security measures, encryption, or access controls.</li>
            <li>Use the AI conversation guide content for any purpose other than personal accountability conversations.</li>
            <li>Use the Service to harass, stalk, intimidate, or coerce another person, including your accountability partner or spouse.</li>
            <li>Reverse engineer, decompile, or attempt to extract the source code of the Service.</li>
            <li>Use automated systems (bots, scrapers) to access the Service.</li>
            <li>Interfere with the operation of the Service or impose unreasonable load on our infrastructure.</li>
          </ul>
          <p>
            Violation of these terms may result in immediate account suspension or termination without refund.
          </p>

          <h2>6. Intellectual Property</h2>
          <p>
            The Service, including its design, code, AI prompts, conversation guide frameworks, and the
            Stringer Journal prompt system, is the intellectual property of Be Candid LLC. The
            &ldquo;Unwanted&rdquo; framework referenced in the app is the intellectual property of Jay
            Stringer and is used with attribution as an informational framework — not a licensed clinical
            tool. Your journal entries, personal data, and uploaded content remain your property.
          </p>

          <h2>7. AI-Generated Content</h2>
          <p>
            Be Candid uses Anthropic&rsquo;s Claude API to generate conversation guides, weekly reflections,
            and other AI-powered features. AI-generated content is provided &ldquo;as is&rdquo; and may
            contain inaccuracies. AI content is not clinical advice, therapeutic guidance, or a substitute
            for professional judgment. You should use AI-generated content as a starting point for
            conversations — not as prescriptive instructions.
          </p>

          <h2>8. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, BE CANDID AND ITS OFFICERS, DIRECTORS, EMPLOYEES,
            AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
            PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE, INCLUDING BUT NOT LIMITED TO:
          </p>
          <ul>
            <li>Emotional distress arising from accountability conversations or partner interactions.</li>
            <li>Relationship consequences resulting from alert notifications or shared data.</li>
            <li>Reliance on AI-generated content for decisions about personal behavior, relationships, or health.</li>
            <li>Failure of the monitoring system to detect specific content or categories.</li>
            <li>Data loss due to encryption key management, server failure, or account deletion.</li>
            <li>Actions taken by your accountability partner, spouse, or therapist based on information received through the Service.</li>
          </ul>
          <p>
            OUR TOTAL LIABILITY FOR ANY CLAIMS ARISING FROM YOUR USE OF THE SERVICE SHALL NOT EXCEED THE
            AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING THE CLAIM.
          </p>

          <h2>9. Disclaimer of Warranties</h2>
          <p>
            THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES
            OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF
            MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WE DO NOT WARRANT THAT
            THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR COMPLETELY SECURE. WE DO NOT WARRANT THAT
            THE MONITORING SYSTEM WILL DETECT ALL CONTENT IN ALL CATEGORIES ON ALL DEVICES.
          </p>

          <h2>10. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless Be Candid and its officers, directors, employees, and
            agents from any claims, damages, losses, or expenses (including reasonable attorney&rsquo;s fees)
            arising from your use of the Service, your violation of these Terms, or your violation of any
            rights of another person.
          </p>

          <h2>11. Modifications to the Service</h2>
          <p>
            We may modify, suspend, or discontinue any part of the Service at any time. If we make material
            changes that reduce the functionality of your current plan, we will notify you at least 30 days
            in advance and offer the option to cancel your subscription for a prorated refund.
          </p>

          <h2>12. Governing Law and Disputes</h2>
          <p>
            These Terms are governed by the laws of the State of Florida, without regard to conflict of law
            principles. Any disputes arising from these Terms or the Service shall be resolved through
            binding arbitration under the rules of the American Arbitration Association, conducted in
            [County to be provided], Florida. You waive any right to a jury trial or to participate in a class
            action lawsuit.
          </p>

          <h2>13. Severability</h2>
          <p>
            If any provision of these Terms is found to be unenforceable, the remaining provisions will
            continue in full force and effect.
          </p>

          <h2>14. Changes to These Terms</h2>
          <p>
            We may update these Terms from time to time. If we make material changes, we will notify you
            by email and/or by posting a notice in the app at least 14 days before the changes take effect.
            Your continued use of the Service after the effective date constitutes your acceptance of the
            updated Terms.
          </p>

          <h2>15. Contact Us</h2>
          <p>
            If you have questions about these Terms, contact us at:
          </p>
          <ul>
            <li>Email: legal@becandid.io</li>
            <li>Mailing address: [Address to be provided]</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
