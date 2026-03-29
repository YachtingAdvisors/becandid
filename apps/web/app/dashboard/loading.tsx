export default function DashboardLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
      {/* Hero skeleton */}
      <div className="h-36 bg-primary-container/30 rounded-3xl" />

      {/* Pulse cards skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-surface-container-low rounded-2xl px-4 py-5">
            <div className="h-6 bg-surface-container rounded w-12 mx-auto mb-2" />
            <div className="h-3 bg-surface-container rounded w-16 mx-auto" />
          </div>
        ))}
      </div>

      {/* Quick actions skeleton */}
      <div className="grid grid-cols-2 gap-3">
        <div className="h-28 bg-secondary-container/30 rounded-3xl" />
        <div className="h-28 bg-tertiary-container/30 rounded-3xl" />
      </div>

      {/* Events skeleton */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-5">
        <div className="h-4 bg-surface-container rounded w-28 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-surface-container rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-surface-container rounded w-32 mb-1" />
                <div className="h-3 bg-surface-container-low rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
