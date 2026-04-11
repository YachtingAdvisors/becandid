export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 animate-pulse">
      <div className="w-full max-w-lg space-y-8">
        <div className="h-8 w-48 bg-white/10 rounded-xl mx-auto" />
        <div className="h-4 w-64 bg-white/5 rounded-lg mx-auto" />
        <div className="space-y-4">
          <div className="h-36 bg-white/10 rounded-3xl" />
          <div className="h-36 bg-white/10 rounded-3xl" />
          <div className="h-36 bg-white/10 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
