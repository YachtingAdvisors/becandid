'use client';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-2xl mx-auto py-16 text-center motion-safe:animate-fade-up">
      <div className="w-20 h-20 rounded-3xl bg-error-container/15 ring-1 ring-outline-variant/10 flex items-center justify-center mx-auto mb-8">
        <span className="material-symbols-outlined text-5xl text-error">warning</span>
      </div>
      <h2 className="font-headline text-2xl font-bold text-on-surface mb-3">
        Something went wrong
      </h2>
      <p className="text-sm text-on-surface-variant mb-8 leading-relaxed font-body">
        We couldn&apos;t load this page. Try refreshing or head back to the overview.
      </p>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dim text-on-primary font-headline font-bold py-3 px-6 rounded-full transition-all duration-200 shadow-lg shadow-primary/10 cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">refresh</span>
          Try Again
        </button>
        <a href="/dashboard" className="btn-ghost cursor-pointer">Dashboard</a>
      </div>
    </div>
  );
}
