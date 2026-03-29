import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-4">{'\u{1F50D}'}</div>
        <h1 className="font-headline text-3xl font-extrabold text-on-surface mb-3">Page not found</h1>
        <p className="text-sm text-on-surface-variant mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/dashboard" className="btn-primary">Dashboard</Link>
          <Link href="/" className="btn-ghost">Home</Link>
        </div>
      </div>
    </div>
  );
}
