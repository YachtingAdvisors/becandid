export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 animate-pulse">
      <div className="w-full max-w-screen-xl space-y-8">
        <div className="h-8 w-56 bg-white/10 rounded-xl" />
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="h-32 bg-white/10 rounded-3xl" />
          <div className="h-32 bg-white/10 rounded-3xl" />
          <div className="h-32 bg-white/10 rounded-3xl" />
        </div>
        <div className="h-64 bg-white/10 rounded-3xl" />
      </div>
    </div>
  );
}
