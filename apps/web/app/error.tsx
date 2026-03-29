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
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-error-container/20 flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl text-error">!</span>
        </div>
        <h1 className="font-headline text-3xl font-extrabold text-on-surface mb-3">Something went wrong</h1>
        <p className="text-sm text-on-surface-variant mb-8 leading-relaxed">
          An unexpected error occurred. Please try again or head back to the home page.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={reset} className="btn-primary">
            Try Again
          </button>
          <Link href="/" className="btn-ghost">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
