import Image from 'next/image';

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      {/* Logo pulse */}
      <div className="mb-10 motion-safe:animate-pulse">
        <Image src="/logo.png" alt="Be Candid" width={120} height={40} className="h-10 w-auto opacity-60" />
      </div>

      {/* Skeleton layout */}
      <div className="w-full max-w-lg space-y-5">
        {/* Title bar skeleton */}
        <div className="h-6 bg-surface-container-low rounded-full w-3/5 motion-safe:animate-pulse" />
        <div className="h-4 bg-surface-container-low rounded-full w-4/5 motion-safe:animate-pulse" />

        {/* Card skeleton */}
        <div className="rounded-2xl bg-surface-container-lowest ring-1 ring-outline-variant/10 p-6 space-y-4 motion-safe:animate-pulse">
          <div className="h-4 bg-surface-container-low rounded-full w-2/3" />
          <div className="h-4 bg-surface-container-low rounded-full w-full" />
          <div className="h-4 bg-surface-container-low rounded-full w-1/2" />
        </div>

        {/* Two-column skeleton */}
        <div className="grid grid-cols-2 gap-4 motion-safe:animate-pulse">
          <div className="h-24 bg-surface-container-low rounded-2xl" />
          <div className="h-24 bg-surface-container-low rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
