import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Downloads',
  description: 'Download Be Candid for desktop, browser, and mobile.',
};

/* ── Chrome Web Store URL (update once published) ────────────── */
const CHROME_STORE_URL = 'https://chromewebstore.google.com'; // TODO: Replace with actual listing URL

function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>;
}

export default function DownloadsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <p className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-widest">Get the App</p>
        <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface mb-1">Downloads</h1>
        <p className="text-sm text-on-surface-variant font-body">
          Install Be Candid on your devices for continuous awareness.
        </p>
      </div>

      {/* Desktop App — Recommended */}
      <section className="bg-surface-container-lowest rounded-3xl p-6 ring-2 ring-primary/20 shadow-sm relative">
        <div className="absolute top-4 right-4">
          <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-label text-[10px] font-bold uppercase tracking-wider">
            Recommended
          </span>
        </div>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <Icon name="desktop_windows" className="text-primary text-2xl" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-headline text-lg font-bold text-on-surface">Desktop App</h2>
            <p className="text-xs text-on-surface-variant font-body mt-1 mb-4">
              Full screen capture with background heartbeat monitoring. Runs quietly in your menu bar.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {['Screenshot analysis', 'Background heartbeat', 'System tray'].map((f) => (
                <span key={f} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-container/30 text-xs font-label font-medium text-primary">
                  <Icon name="check" className="text-xs" />
                  {f}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface-container rounded-2xl font-label font-medium text-sm text-on-surface-variant/50 cursor-default">
                <Icon name="pause_circle" className="text-lg" />
                macOS — Temporarily Unavailable
              </span>
              <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface-container rounded-2xl font-label font-medium text-sm text-on-surface-variant/50 cursor-default">
                <Icon name="desktop_windows" className="text-lg" />
                Windows — coming soon
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Chrome Extension */}
      <section className="bg-surface-container-lowest rounded-3xl p-6 ring-1 ring-outline-variant/10 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <Icon name="language" className="text-primary text-2xl" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-headline text-lg font-bold text-on-surface">Chrome Extension</h2>
            <p className="text-xs text-on-surface-variant font-body mt-1 mb-4">
              Real-time web monitoring with AI content filtering. Works with Chrome, Edge, Brave, and Arc.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {['Screen awareness', 'Content filter', '5-min sync'].map((f) => (
                <span key={f} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-container/30 text-xs font-label font-medium text-primary">
                  <Icon name="check" className="text-xs" />
                  {f}
                </span>
              ))}
            </div>
            <a
              href={CHROME_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-2xl font-label font-bold text-sm hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Icon name="add_circle" className="text-lg" />
              Add to Chrome
            </a>
          </div>
        </div>
      </section>

      {/* Mobile App */}
      <section className="bg-surface-container-lowest rounded-3xl p-6 ring-1 ring-outline-variant/10 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <Icon name="phone_android" className="text-primary text-2xl" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-headline text-lg font-bold text-on-surface">Mobile App</h2>
            <p className="text-xs text-on-surface-variant font-body mt-1 mb-4">
              On-the-go awareness with usage tracking. Android gets full app monitoring; iOS uses check-in mode.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {['App usage stats', 'Push notifications', 'Journal on the go'].map((f) => (
                <span key={f} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-container/30 text-xs font-label font-medium text-primary">
                  <Icon name="check" className="text-xs" />
                  {f}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <span
                aria-disabled="true"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface-container rounded-2xl font-label font-medium text-sm text-on-surface-variant/50 cursor-default select-none"
              >
                App Store — coming soon
              </span>
              <span
                aria-disabled="true"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface-container rounded-2xl font-label font-medium text-sm text-on-surface-variant/50 cursor-default select-none"
              >
                Play Store — coming soon
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* PWA Install */}
      <section className="bg-surface-container-lowest rounded-3xl p-6 ring-1 ring-outline-variant/10 shadow-sm">
        <h2 className="font-headline text-lg font-bold text-on-surface mb-3">Install as Web App (PWA)</h2>
        <p className="text-xs text-on-surface-variant font-body mb-4">
          No app store needed. Add Be Candid to your home screen for an app-like experience.
        </p>
        <ol className="space-y-3">
          {[
            { step: '1', text: 'Visit becandid.io on your phone\'s browser' },
            { step: '2', text: 'Tap the share button (iOS) or menu icon (Android)' },
            { step: '3', text: 'Select "Add to Home Screen" and confirm' },
          ].map((item) => (
            <li key={item.step} className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                {item.step}
              </span>
              <span className="text-sm text-on-surface font-body">{item.text}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Help */}
      <div className="text-center pb-4">
        <p className="text-xs text-on-surface-variant font-body">
          Having trouble? Check <Link href="/dashboard/settings" className="text-primary hover:underline">Settings</Link> for connection troubleshooting.
        </p>
      </div>
    </div>
  );
}
