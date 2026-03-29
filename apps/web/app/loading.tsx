export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center animate-pulse">
          <span className="text-on-primary text-lg font-bold">C</span>
        </div>
        <div className="text-sm text-on-surface-variant font-body">Loading&hellip;</div>
      </div>
    </div>
  );
}
