'use client';

import Image from 'next/image';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Subtle background blobs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary-container/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full bg-tertiary-container/15 blur-3xl" />

      <div className="text-center max-w-sm relative z-10 motion-safe:animate-fade-up">
        {/* Logo */}
        <div className="mb-8">
          <Image src="/logo.png" alt="Be Candid" width={120} height={40} className="mx-auto dark:brightness-[10]" />
        </div>

        {/* Offline icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-surface-container">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant">cloud_off</span>
        </div>

        <h1 className="font-headline text-3xl font-extrabold text-on-surface mb-3">
          You&apos;re offline
        </h1>

        <p className="text-sm text-on-surface-variant mb-2 leading-relaxed font-body">
          It looks like you&apos;ve lost your internet connection.
        </p>

        <p className="text-sm text-on-surface-variant mb-8 leading-relaxed font-body">
          Don&apos;t worry — your journal entries and progress are safe. They&apos;ll sync as soon as you&apos;re back online.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dim text-on-primary font-headline font-bold py-3 px-6 rounded-full transition-all duration-200 shadow-lg shadow-primary/10 cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">refresh</span>
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
