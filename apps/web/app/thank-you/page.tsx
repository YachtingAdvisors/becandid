import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Welcome to Be Candid Pro',
  robots: { index: false, follow: false },
};

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-dark-sanctuary flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        {/* Success icon */}
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-8">
          <span
            className="material-symbols-outlined text-emerald-400 text-4xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
        </div>

        <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight text-slate-100 mb-4">
          You&apos;re in. Welcome to Be Candid.
        </h1>

        <p className="font-body text-lg text-slate-400 mb-8 leading-relaxed">
          Your account is set up and ready to go. The next step is the most important one — showing up.
        </p>

        {/* Quick start steps */}
        <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl ring-1 ring-white/10 p-6 text-left mb-8">
          <h2 className="font-headline text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">
            Get started in 3 steps
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-primary font-headline font-bold text-xs">1</span>
              </div>
              <div>
                <p className="font-headline font-bold text-slate-200 text-sm">Identify your rivals</p>
                <p className="font-body text-xs text-slate-400">Set up the digital patterns you want to become aware of.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-primary font-headline font-bold text-xs">2</span>
              </div>
              <div>
                <p className="font-headline font-bold text-slate-200 text-sm">Invite an accountability partner</p>
                <p className="font-body text-xs text-slate-400">Real change happens in relationship. Invite someone you trust.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-primary font-headline font-bold text-xs">3</span>
              </div>
              <div>
                <p className="font-headline font-bold text-slate-200 text-sm">Write your first journal entry</p>
                <p className="font-body text-xs text-slate-400">The guided prompts will meet you where you are. No pressure.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-label font-bold text-base hover:brightness-110 transition-all shadow-lg shadow-primary/20"
        >
          Go to your dashboard
          <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </Link>

        <p className="font-body text-xs text-slate-600 mt-6">
          Questions? Reach out at{' '}
          <a href="mailto:support@becandid.io" className="text-cyan-400 hover:underline">
            support@becandid.io
          </a>
        </p>
      </div>
    </div>
  );
}
