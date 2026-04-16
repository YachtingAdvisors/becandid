import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Mac App Setup Guide',
  description: 'How to authorize Be Candid on your Mac. Step-by-step guide for macOS security settings.',
};

const STEPS = [
  {
    number: 1,
    title: 'Download the App',
    icon: 'download',
    content: 'Download Be Candid for Mac from your dashboard or becandid.io/download. The file will be a .dmg installer.',
  },
  {
    number: 2,
    title: 'Open the Installer',
    icon: 'folder_open',
    content: 'Double-click the .dmg file. Drag the Be Candid icon into your Applications folder.',
  },
  {
    number: 3,
    title: 'First Launch — You\'ll See a Warning',
    icon: 'warning',
    content: 'When you first open Be Candid, macOS will show a warning: "Be Candid can\'t be opened because Apple cannot check it for malicious software." This is normal — it happens because we\'re not yet on the Mac App Store.',
    highlight: true,
  },
  {
    number: 4,
    title: 'Open System Settings',
    icon: 'settings',
    content: 'Open System Settings (Apple menu → System Settings). Navigate to Privacy & Security. Scroll down to the Security section.',
  },
  {
    number: 5,
    title: 'Allow Be Candid',
    icon: 'verified_user',
    content: 'You\'ll see a message: "Be Candid was blocked from use because it is not from an identified developer." Click "Open Anyway". You may need to enter your Mac password or use Touch ID.',
    highlight: true,
  },
  {
    number: 6,
    title: 'Confirm the Launch',
    icon: 'check_circle',
    content: 'macOS will ask one more time if you\'re sure. Click "Open". Be Candid will launch and appear in your menu bar (top-right, near the clock).',
  },
  {
    number: 7,
    title: 'Grant Accessibility Permission (Optional)',
    icon: 'accessibility_new',
    content: 'For full monitoring features, Be Candid may request Accessibility access. Go to System Settings → Privacy & Security → Accessibility, and toggle Be Candid on. This allows the app to detect which apps are in focus.',
  },
  {
    number: 8,
    title: 'Sign In',
    icon: 'login',
    content: 'Click the Be Candid icon in your menu bar and sign in with the same email you use on becandid.io. Your desktop app and web dashboard will sync automatically.',
  },
];

export default function MacSetupGuide() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary/[0.06] to-transparent">
        <div className="max-w-2xl mx-auto px-4 pt-12 pb-8">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-primary font-label font-medium mb-6 hover:underline">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Be Candid
          </Link>
          <Image src="/logo.png" alt="Be Candid" width={96} height={32} className="h-8 w-auto mb-6" />
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface mb-3">
            Mac App Setup Guide
          </h1>
          <p className="text-base text-on-surface-variant font-body leading-relaxed max-w-lg">
            Because Be Candid isn&apos;t on the Mac App Store yet, macOS requires a few extra steps to authorize it. This takes about 2 minutes.
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="max-w-2xl mx-auto px-4 pb-16 space-y-4 stagger">
        {STEPS.map((step) => (
          <div
            key={step.number}
            className={`bg-surface-container-lowest rounded-3xl border p-6 ${
              step.highlight
                ? 'border-primary/30 ring-1 ring-primary/10'
                : 'border-outline-variant'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                step.highlight
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface-variant'
              }`}>
                <span className="material-symbols-outlined text-lg">{step.icon}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-wider">
                    Step {step.number}
                  </span>
                </div>
                <h2 className="font-headline text-base font-bold text-on-surface mb-1.5">
                  {step.title}
                </h2>
                <p className="text-sm text-on-surface-variant font-body leading-relaxed">
                  {step.content}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Troubleshooting */}
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 mt-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-lg text-tertiary">help</span>
            <h2 className="font-headline text-base font-bold text-on-surface">Still Having Trouble?</h2>
          </div>
          <div className="space-y-3 text-sm text-on-surface-variant font-body leading-relaxed">
            <p>
              <strong className="text-on-surface">App won&apos;t open at all?</strong> Right-click (or Control-click) the app icon and select &ldquo;Open&rdquo; from the menu. This bypasses Gatekeeper for that specific launch.
            </p>
            <p>
              <strong className="text-on-surface">Don&apos;t see &ldquo;Open Anyway&rdquo; in Settings?</strong> Make sure you tried to open the app first. The button only appears after a blocked launch attempt.
            </p>
            <p>
              <strong className="text-on-surface">Running macOS Ventura or later?</strong> The path is: System Settings → Privacy &amp; Security → scroll to bottom of the page.
            </p>
            <p>
              <strong className="text-on-surface">Need help?</strong> Email us at{' '}
              <a href="mailto:support@becandid.io" className="text-primary hover:underline">support@becandid.io</a> and we&apos;ll walk you through it.
            </p>
          </div>
        </div>

        {/* Notice */}
        <div className="text-center pt-4 px-4 py-3 rounded-2xl bg-amber-50 border border-amber-200">
          <p className="text-sm text-amber-800 font-body">
            The macOS desktop app is temporarily unavailable while we complete Apple notarization. Check back soon.
          </p>
        </div>
      </div>
    </div>
  );
}
