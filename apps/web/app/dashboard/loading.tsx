export default function DashboardLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 motion-safe:animate-pulse">
      {/* Hero skeleton */}
      <div className="h-36 bg-surface-container-low rounded-3xl ring-1 ring-outline-variant/10" />

      {/* Pulse cards skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-surface-container-low rounded-2xl px-4 py-5 ring-1 ring-outline-variant/10">
            <div className="h-6 bg-surface-container rounded-full w-12 mx-auto mb-2" />
            <div className="h-3 bg-surface-container rounded-full w-16 mx-auto" />
          </div>
        ))}
      </div>

      {/* Quick actions skeleton */}
      <div className="grid grid-cols-2 gap-3">
        <div className="h-28 bg-surface-container-low rounded-3xl ring-1 ring-outline-variant/10" />
        <div className="h-28 bg-surface-container-low rounded-3xl ring-1 ring-outline-variant/10" />
      </div>

      {/* Events skeleton */}
      <div className="bg-surface-container-lowest rounded-3xl ring-1 ring-outline-variant/10 p-5">
        <div className="h-4 bg-surface-container rounded-full w-28 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-surface-container-low rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-surface-container rounded-full w-32 mb-1" />
                <div className="h-3 bg-surface-container-low rounded-full w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
