export default function ClientDetailLoading() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back + Header */}
      <div>
        <div className="skeleton-shimmer h-5 w-28 rounded-full mb-3" />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full skeleton-shimmer" />
          <div className="skeleton-shimmer h-7 w-40 rounded-full" />
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="skeleton-shimmer h-9 w-24 rounded-full flex-shrink-0" />
        ))}
      </div>

      {/* Summary grid skeleton */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="skeleton-shimmer rounded-3xl border border-outline-variant p-5 space-y-2"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 bg-surface-container rounded" />
              <div className="h-3 bg-surface-container rounded-full w-20" />
            </div>
            <div className="h-8 bg-surface-container rounded-full w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
