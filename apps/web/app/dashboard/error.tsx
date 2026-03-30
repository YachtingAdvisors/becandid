'use client';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-2xl mx-auto py-16 text-center">
      <span className="material-symbols-outlined text-5xl mb-4">warning</span>
      <h2 className="font-display text-2xl font-semibold text-ink mb-3">
        Something went wrong
      </h2>
      <p className="text-sm text-ink-muted mb-6">
        We couldn't load this page. Try refreshing or head back to the overview.
      </p>
      <div className="flex items-center justify-center gap-3">
        <button onClick={reset} className="btn-primary">Try Again</button>
        <a href="/dashboard" className="btn-ghost">Dashboard</a>
      </div>
    </div>
  );
}
