'use client';

import Link from 'next/link';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      {/* Subtle background blobs */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-error-container/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-primary-container/15 blur-3xl" />

      <div className="text-center max-w-sm relative z-10 motion-safe:animate-fade-up">
        <div className="w-20 h-20 rounded-3xl bg-error-container/15 ring-1 ring-outline-variant/10 flex items-center justify-center mx-auto mb-8">
          <span className="material-symbols-outlined text-5xl text-error">warning</span>
        </div>
        <h1 className="font-headline text-3xl font-extrabold text-on-surface mb-3">Something went wrong</h1>
        <p className="text-sm text-on-surface-variant mb-8 leading-relaxed font-body">
          An unexpected error occurred. Please try again or head back to the home page.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dim text-on-primary font-headline font-bold py-3 px-6 rounded-full transition-all duration-200 shadow-lg shadow-primary/10 cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">refresh</span>
            Try Again
          </button>
          <Link href="/" className="btn-ghost cursor-pointer">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
