'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <span className="material-symbols-outlined text-5xl text-error/60 mb-4">error_outline</span>
      <h2 className="font-headline text-xl font-bold text-white mb-2">
        Something went wrong
      </h2>
      <p className="text-stone-400 text-sm mb-6 max-w-md">
        We hit an unexpected error. Please try again, and if the problem persists, contact support.
      </p>
      <button
        onClick={reset}
        className="px-6 py-2.5 bg-primary text-on-primary rounded-full font-label font-semibold text-sm hover:opacity-90 transition-opacity"
      >
        Try again
      </button>
    </div>
  );
}
