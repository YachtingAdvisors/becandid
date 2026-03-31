import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — Be Candid',
  description: 'How Be Candid collects, uses, and protects your data.',
};

function MaterialIcon({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>;
}

const LAST_UPDATED = 'March 30, 2026';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* Nav */}
      <header className="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-xl">
        <nav className="flex justify-between items-center px-6 lg:px-12 py-6 max-w-screen-2xl mx-auto">
          <Link href="/" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Be Candid" className="h-12 w-auto object-contain" />
          </Link>
          <div className="hidden md:flex items-center gap-10 font-body text-base tracking-tight">
            <Link href="/#features" className="text-on-surface opacity-80 hover:text-primary transition-colors duration-300 cursor-pointer">Features</Link>
            <Link href="/pricing" className="text-on-surface opacity-80 hover:text-primary transition-colors duration-300 cursor-pointer">Pricing</Link>
            <Link href="/download" className="text-on-surface opacity-80 hover:text-primary transition-colors duration-300 cursor-pointer">Download</Link>
            <Link href="/families" className="text-on-surface opacity-80 hover:text-primary transition-colors duration-300 cursor-pointer">Families</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/signin" className="text-on-surface opacity-80 hover:text-primary transition-colors duration-300 font-label text-sm font-semibold cursor-pointer">Log in</Link>
            <Link href="/auth/signup" className="px-8 py-3 bg-primary text-on-primary rounded-full font-label text-sm font-semibold tracking-wide shadow-lg shadow-primary/20 hover:shadow-xl hover:brightness-110 active:scale-95 transition-all duration-200 cursor-pointer">Get Started</Link>
          </div>
        </nav>
      </header>

      <main className="pt-32 pb-24 px-6 lg:px-12 max-w-3xl mx-auto">
        <h1 className="font-headline text-4xl lg:text-5xl font-extrabold text-on-surface tracking-tight mb-4">
          Privacy Policy
        </h1>
        <p className="font-label text-sm text-on-surface-variant mb-12">
          Last updated: {LAST_UPDATED}
        </p>

        <div className="prose-candid space-y-10">
          {/* Intro */}
          <section className="space-y-4">
            <p className="font-body text-on-surface-variant leading-relaxed">
              Be Candid (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is committed to protecting your privacy. This policy explains what data we collect through our web application, browser extensions (Chrome and Safari), and Progressive Web App (PWA), how we use it, and your rights.
            </p>
          </section>

          {/* What We Collect */}
          <section className="space-y-4">
            <h2 className="font-headline text-2xl font-bold text-on-surface flex items-center gap-3">
              <MaterialIcon name="database" className="text-primary" />
              What We Collect
            </h2>

            <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-6 space-y-4">
              <h3 className="font-label text-sm font-bold uppercase tracking-wider text-primary">Browser Extension</h3>
              <ul className="space-y-2 font-body text-sm text-on-surface-variant leading-relaxed">
                <li className="flex items-start gap-2">
                  <MaterialIcon name="check_circle" className="text-primary text-base mt-0.5 flex-shrink-0" />
                  <span><strong className="text-on-surface">Domain names only</strong> &mdash; we track which websites you visit (e.g. &ldquo;youtube.com&rdquo;), never full URLs, page content, or form data.</span>
                </li>
                <li className="flex items-start gap-2">
                  <MaterialIcon name="check_circle" className="text-primary text-base mt-0.5 flex-shrink-0" />
                  <span><strong className="text-on-surface">SHA-256 hashing</strong> &mdash; domain names are cryptographically hashed before transmission. We cannot reverse hashes back to the original domain.</span>
                </li>
                <li className="flex items-start gap-2">
                  <MaterialIcon name="check_circle" className="text-primary text-base mt-0.5 flex-shrink-0" />
                  <span><strong className="text-on-surface">Time spent</strong> &mdash; duration of active browsing sessions per domain, aggregated in 30-minute windows.</span>
                </li>
                <li className="flex items-start gap-2">
                  <MaterialIcon name="check_circle" className="text-primary text-base mt-0.5 flex-shrink-0" />
                  <span><strong className="text-on-surface">Category classification</strong> &mdash; domains are categorized locally on your device (e.g. social media, streaming). Classification happens client-side; raw browsing data is never sent to our servers for classification.</span>
                </li>
              </ul>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl ring-1 ring-outline-variant/10 p-6 space-y-4">
              <h3 className="font-label text-sm font-bold uppercase tracking-wider text-primary">Web App & PWA</h3>
              <ul className="space-y-2 font-body text-sm text-on-surface-variant leading-relaxed">
                <li className="flex items-start gap-2">
                  <MaterialIcon name="check_circle" className="text-primary text-base mt-0.5 flex-shrink-0" />
                  <span><strong className="text-on-surface">Account information</strong> &mdash; email address and display name for authentication.</span>
                </li>
                <li className="flex items-start gap-2">
                  <MaterialIcon name="check_circle" className="text-primary text-base mt-0.5 flex-shrink-0" />
                  <span><strong className="text-on-surface">Self-reported data</strong> &mdash; journal entries, mood check-ins, focus sessions, and goals you manually enter.</span>
                </li>
                <li className="flex items-start gap-2">
                  <MaterialIcon name="check_circle" className="text-primary text-base mt-0.5 flex-shrink-0" />
                  <span><strong className="text-on-surface">Session duration</strong> &mdash; time spent in the Be Candid app (PWA tracking), with sessions under 30 seconds discarded.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* What We Don't Collect */}
          <section className="space-y-4">
            <h2 className="font-headline text-2xl font-bold text-on-surface flex items-center gap-3">
              <MaterialIcon name="block" className="text-error" />
              What We Never Collect
            </h2>
            <div className="bg-error/[0.04] rounded-2xl ring-1 ring-error/10 p-6">
              <ul className="space-y-2 font-body text-sm text-on-surface-variant leading-relaxed">
                <li className="flex items-start gap-2">
                  <MaterialIcon name="close" className="text-error text-base mt-0.5 flex-shrink-0" />
                  Full URLs, search queries, or page content
                </li>
                <li className="flex items-start gap-2">
                  <MaterialIcon name="close" className="text-error text-base mt-0.5 flex-shrink-0" />
                  Passwords, form inputs, or autofill data
                </li>
                <li className="flex items-start gap-2">
                  <MaterialIcon name="close" className="text-error text-base mt-0.5 flex-shrink-0" />
                  Screenshots, keystrokes, or screen recordings
                </li>
                <li className="flex items-start gap-2">
                  <MaterialIcon name="close" className="text-error text-base mt-0.5 flex-shrink-0" />
                  Browsing history from incognito/private mode
                </li>
                <li className="flex items-start gap-2">
                  <MaterialIcon name="close" className="text-error text-base mt-0.5 flex-shrink-0" />
                  Data from other browser extensions
                </li>
              </ul>
            </div>
          </section>

          {/* How We Store Data */}
          <section className="space-y-4">
            <h2 className="font-headline text-2xl font-bold text-on-surface flex items-center gap-3">
              <MaterialIcon name="encrypted" className="text-primary" />
              How We Store & Protect Data
            </h2>
            <ul className="space-y-3 font-body text-on-surface-variant leading-relaxed">
              <li className="flex items-start gap-2">
                <MaterialIcon name="shield" className="text-primary text-base mt-0.5 flex-shrink-0" />
                <span>Data is stored in Supabase with PostgreSQL row-level security (RLS). Each user can only access their own data.</span>
              </li>
              <li className="flex items-start gap-2">
                <MaterialIcon name="shield" className="text-primary text-base mt-0.5 flex-shrink-0" />
                <span>All data in transit is encrypted with TLS 1.3. Data at rest is encrypted with AES-256.</span>
              </li>
              <li className="flex items-start gap-2">
                <MaterialIcon name="shield" className="text-primary text-base mt-0.5 flex-shrink-0" />
                <span>Authentication tokens are stored locally on your device (browser extension local storage) and never shared with third parties.</span>
              </li>
              <li className="flex items-start gap-2">
                <MaterialIcon name="shield" className="text-primary text-base mt-0.5 flex-shrink-0" />
                <span>Failed event uploads are queued locally for up to 7 days, then permanently deleted.</span>
              </li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section className="space-y-4">
            <h2 className="font-headline text-2xl font-bold text-on-surface flex items-center gap-3">
              <MaterialIcon name="share" className="text-primary" />
              Data Sharing
            </h2>
            <ul className="space-y-3 font-body text-on-surface-variant leading-relaxed">
              <li className="flex items-start gap-2">
                <MaterialIcon name="group" className="text-primary text-base mt-0.5 flex-shrink-0" />
                <span><strong className="text-on-surface">Accountability partners</strong> &mdash; if you choose to add a partner, they receive alerts about high-severity events. They see the category (e.g. &ldquo;social media&rdquo;) and severity, never raw domains or URLs.</span>
              </li>
              <li className="flex items-start gap-2">
                <MaterialIcon name="family_restroom" className="text-primary text-base mt-0.5 flex-shrink-0" />
                <span><strong className="text-on-surface">Family/Guardian accounts</strong> &mdash; guardians see summary dashboards with category-level data. Detailed browsing data is never shared.</span>
              </li>
              <li className="flex items-start gap-2">
                <MaterialIcon name="block" className="text-error text-base mt-0.5 flex-shrink-0" />
                <span><strong className="text-on-surface">We never sell your data.</strong> No advertising, no analytics brokers, no third-party data sharing for monetization.</span>
              </li>
            </ul>
          </section>

          {/* Your Rights */}
          <section className="space-y-4">
            <h2 className="font-headline text-2xl font-bold text-on-surface flex items-center gap-3">
              <MaterialIcon name="gavel" className="text-primary" />
              Your Rights
            </h2>
            <ul className="space-y-3 font-body text-on-surface-variant leading-relaxed">
              <li className="flex items-start gap-2">
                <MaterialIcon name="download" className="text-primary text-base mt-0.5 flex-shrink-0" />
                <span><strong className="text-on-surface">Export your data</strong> &mdash; request a full export of your data at any time from Settings &gt; Privacy &gt; Export Data.</span>
              </li>
              <li className="flex items-start gap-2">
                <MaterialIcon name="delete" className="text-primary text-base mt-0.5 flex-shrink-0" />
                <span><strong className="text-on-surface">Delete your account</strong> &mdash; permanently delete all your data from Settings &gt; Privacy &gt; Delete Account. This is irreversible and removes all events, journals, check-ins, and partner connections.</span>
              </li>
              <li className="flex items-start gap-2">
                <MaterialIcon name="pause_circle" className="text-primary text-base mt-0.5 flex-shrink-0" />
                <span><strong className="text-on-surface">Pause monitoring</strong> &mdash; toggle monitoring off at any time from the extension popup. No data is collected while paused.</span>
              </li>
            </ul>
          </section>

          {/* Contact */}
          <section className="space-y-4">
            <h2 className="font-headline text-2xl font-bold text-on-surface flex items-center gap-3">
              <MaterialIcon name="mail" className="text-primary" />
              Contact
            </h2>
            <p className="font-body text-on-surface-variant leading-relaxed">
              Questions about this policy? Email us at{' '}
              <a href="mailto:privacy@becandid.io" className="text-primary font-semibold hover:underline">
                privacy@becandid.io
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
