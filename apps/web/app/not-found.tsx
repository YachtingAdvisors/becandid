import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      {/* Subtle background blobs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary-container/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full bg-tertiary-container/15 blur-3xl" />

      <div className="text-center max-w-sm relative z-10 motion-safe:animate-fade-up">
        <div className="w-20 h-20 rounded-3xl bg-surface-container-low ring-1 ring-outline-variant/10 flex items-center justify-center mx-auto mb-8">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant">explore_off</span>
        </div>
        <h1 className="font-headline text-3xl font-extrabold text-on-surface mb-3">Page not found</h1>
        <p className="text-sm text-on-surface-variant mb-8 leading-relaxed font-body">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dim text-on-primary font-headline font-bold py-3 px-6 rounded-full transition-all duration-200 shadow-lg shadow-primary/10 cursor-pointer">
            <span className="material-symbols-outlined text-lg">home</span>
            Go Home
          </Link>
          <Link href="/dashboard" className="btn-ghost cursor-pointer">Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
