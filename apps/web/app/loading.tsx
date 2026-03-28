export default function Loading() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center animate-pulse">
          <span className="text-white text-lg font-bold">C</span>
        </div>
        <div className="text-sm text-ink-muted">Loading…</div>
      </div>
    </div>
  );
}
