// ============================================================
// app/legal/therapist-dpa/page.tsx
//
// Data Processing Agreement template for therapist portal.
// This is a starting point — not a finalized legal document.
// Required when therapist partnerships involve PHI.
// ============================================================

export const metadata = {
  title: 'Therapist Data Processing Agreement — Be Candid',
  description: 'Data processing terms for therapists using the Be Candid portal.',
};

export default function TherapistDPA() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <p className="text-sm text-primary font-label font-medium uppercase tracking-wider mb-2">Legal</p>
          <h1 className="text-3xl font-headline font-bold text-on-surface mb-2">Therapist Data Processing Agreement</h1>
          <p className="text-sm text-on-surface-variant font-body">Template — requires legal review before use</p>
        </div>

        <div className="prose prose-sm max-w-none text-on-surface leading-relaxed font-body
          prose-headings:font-headline prose-headings:text-on-surface prose-headings:font-semibold
          prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:pt-6 prose-h2:border-t prose-h2:border-outline-variant/50
          prose-h3:text-base prose-h3:mt-6 prose-h3:mb-3
          prose-p:mb-4 prose-li:mb-1
          prose-strong:text-on-surface">

          <p>
            This Data Processing Agreement (&ldquo;DPA&rdquo;) is entered into between the therapist
            (&ldquo;Therapist&rdquo; or &ldquo;Data Recipient&rdquo;) and the Be Candid user
            (&ldquo;Client&rdquo; or &ldquo;Data Subject&rdquo;) who has granted portal access, with
            Be Candid (Be Candid LLC) acting as the technology platform (&ldquo;Data Processor&rdquo;).
          </p>

          <h2>1. Purpose</h2>
          <p>
            This DPA governs the Therapist&rsquo;s access to and use of Client data made available through
            the Be Candid Therapist Portal. The purpose of data sharing is to support the therapeutic
            relationship by providing the Therapist with structured client self-report data between sessions.
          </p>

          <h2>2. Data Shared</h2>
          <p>
            The Therapist receives read-only access to the following data categories, each independently
            controlled by the Client through consent toggles:
          </p>
          <ul>
            <li><strong>Journal Entries:</strong> Client&rsquo;s written reflections, including freewrite text, guided prompt responses, mood ratings, and tags. Entries are decrypted by the platform and served to the Therapist portal in real time.</li>
            <li><strong>Mood Timeline:</strong> Aggregated mood data from journal entries and check-ins.</li>
            <li><strong>Focus Streaks:</strong> Streak history, milestone achievements, and trust point totals.</li>
            <li><strong>Conversation Outcomes:</strong> Client&rsquo;s self-ratings and feeling words from accountability conversations.</li>
            <li><strong>Pattern Analysis:</strong> Time clustering, frequency data, and vulnerability window information.</li>
          </ul>
          <p>
            The Therapist does <strong>not</strong> receive: raw screen activity events, URLs, screenshots,
            partner information, push notification content, or data from any user other than the consenting Client.
          </p>

          <h2>3. Consent and Revocation</h2>
          <p>
            Data access is initiated by the Client&rsquo;s explicit invitation and governed by five
            independent consent toggles the Client controls at all times. The Client may modify or
            revoke any consent toggle at any time from their Settings page. Revocation takes effect
            immediately — the Therapist loses access to the revoked data category on their next portal request.
          </p>

          <h2>4. Therapist Obligations</h2>
          <p>The Therapist agrees to:</p>
          <ul>
            <li>Access Client data only for the purpose of supporting the therapeutic relationship.</li>
            <li>Not share, copy, export, print, or transmit Client data to any third party without the Client&rsquo;s written consent, except as required by law or mandatory reporting obligations.</li>
            <li>Maintain the confidentiality of portal access credentials.</li>
            <li>Comply with all applicable professional ethics codes and licensing regulations regarding client data.</li>
            <li>Notify Be Candid immediately if their portal access credentials are compromised.</li>
            <li>Delete any locally stored or cached Client data within 30 days of the Client revoking access.</li>
          </ul>

          <h2>5. Be Candid&rsquo;s Obligations</h2>
          <p>Be Candid agrees to:</p>
          <ul>
            <li>Enforce consent toggles at the API level, serving only data the Client has explicitly consented to share.</li>
            <li>Encrypt data at rest and in transit using industry-standard methods (AES-256-GCM, TLS 1.2+).</li>
            <li>Log all Therapist portal access for audit purposes.</li>
            <li>Not use Client data shared through the Therapist portal for any purpose other than serving it to the authorized Therapist.</li>
            <li>Promptly revoke Therapist access when the Client requests it.</li>
          </ul>

          <h2>6. Data Retention</h2>
          <p>
            Data is retained per the Client&rsquo;s retention settings (configurable 30-365 days). Data
            purged by the Client is no longer available through the Therapist portal. Be Candid does not
            maintain separate copies of data for the Therapist portal.
          </p>

          <h2>7. Mandatory Reporting</h2>
          <p>
            Nothing in this DPA limits the Therapist&rsquo;s obligations under mandatory reporting laws.
            If the Therapist is required by law to report information obtained through the portal (e.g.,
            imminent danger to self or others, child abuse), they may do so in accordance with their
            professional and legal obligations.
          </p>

          <h2>8. Limitation of Liability</h2>
          <p>
            Be Candid provides the Therapist portal as a technology platform. Be Candid is not a party
            to the therapist-client relationship and bears no liability for clinical decisions made using
            portal data, the Therapist&rsquo;s use or misuse of Client data, or any breach of
            confidentiality by the Therapist.
          </p>

          <h2>9. Term and Termination</h2>
          <p>
            This DPA is effective upon the Client&rsquo;s invitation and the Therapist&rsquo;s acceptance.
            It terminates when: the Client revokes access, the Therapist&rsquo;s account is deleted, or
            the Client&rsquo;s account is deleted. Upon termination, the Therapist must delete any locally
            stored Client data within 30 days.
          </p>

          <h2>10. Contact</h2>
          <p>
            For questions about this DPA: legal@becandid.io
          </p>
        </div>
      </div>
    </div>
  );
}
