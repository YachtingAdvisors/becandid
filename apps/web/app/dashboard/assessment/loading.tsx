export default function Loading() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      <div className="h-8 w-52 bg-surface-container-high rounded-xl mb-8" />
      <div className="grid gap-6">
        <div className="h-48 bg-surface-container rounded-3xl" />
        <div className="h-36 bg-surface-container rounded-3xl" />
        <div className="h-36 bg-surface-container rounded-3xl" />
      </div>
    </div>
  );
}
