export default function DashboardLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-48" />
      <div className="h-4 bg-gray-100 rounded w-32" />

      <div className="card p-6">
        <div className="h-24 bg-gray-100 rounded" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="card px-4 py-5">
            <div className="h-6 bg-gray-200 rounded w-12 mx-auto mb-2" />
            <div className="h-3 bg-gray-100 rounded w-16 mx-auto" />
          </div>
        ))}
      </div>

      <div className="card p-4">
        <div className="h-4 bg-gray-200 rounded w-28 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-32 mb-1" />
                <div className="h-3 bg-gray-100 rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
