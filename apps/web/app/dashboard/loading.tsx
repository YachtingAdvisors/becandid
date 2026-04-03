export default function DashboardLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero skeleton */}
      <div className="skeleton-shimmer h-36 rounded-3xl ring-1 ring-outline-variant/10" />

      {/* Nudge banner skeleton */}
      <div className="skeleton-shimmer h-14 rounded-2xl ring-1 ring-outline-variant/10" />

      {/* Quick mood + Quote skeletons */}
      <div className="skeleton-shimmer h-24 rounded-2xl ring-1 ring-outline-variant/10" />
      <div className="skeleton-shimmer h-20 rounded-2xl ring-1 ring-outline-variant/10" />

      {/* Featured cards grid skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Crisis detection — full width */}
        <div className="col-span-2 lg:col-span-3 skeleton-shimmer h-40 rounded-2xl ring-1 ring-outline-variant/10" />

        {/* Small cards */}
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="skeleton-shimmer rounded-2xl ring-1 ring-outline-variant/10 p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 bg-surface-container rounded-lg" />
              <div className="w-12 h-5 bg-surface-container rounded" />
            </div>
            <div className="bg-surface-container rounded-xl p-4 space-y-2">
              <div className="h-6 bg-surface-container-high rounded-full w-16 mx-auto" />
              <div className="h-3 bg-surface-container-high rounded-full w-20 mx-auto" />
            </div>
            <div className="h-4 bg-surface-container rounded-full w-24" />
            <div className="h-3 bg-surface-container rounded-full w-32" />
          </div>
        ))}
      </div>

      {/* Bottom widgets skeleton */}
      <div className="grid grid-cols-2 gap-4">
        <div className="skeleton-shimmer h-32 rounded-2xl ring-1 ring-outline-variant/10" />
        <div className="skeleton-shimmer h-32 rounded-2xl ring-1 ring-outline-variant/10" />
      </div>
    </div>
  );
}
