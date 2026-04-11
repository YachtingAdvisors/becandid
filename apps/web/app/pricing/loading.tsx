export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 animate-pulse">
      <div className="w-full max-w-screen-xl space-y-10">
        <div className="text-center space-y-4">
          <div className="h-10 w-56 bg-white/10 rounded-xl mx-auto" />
          <div className="h-4 w-80 bg-white/5 rounded-lg mx-auto" />
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="h-80 bg-white/10 rounded-3xl" />
          <div className="h-80 bg-white/10 rounded-3xl" />
          <div className="h-80 bg-white/10 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
