import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Subtle background blobs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary-container/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full bg-tertiary-container/15 blur-3xl" />

      <div className="text-center max-w-sm relative z-10 motion-safe:animate-fade-up">
        {/* Logo */}
        <div className="mb-8">
          <Image src="/logo.png" alt="Be Candid" width={120} height={40} className="mx-auto dark:brightness-[10]" />
        </div>

        {/* Large faded 404 */}
        <p className="font-headline text-[8rem] sm:text-[10rem] font-black leading-none text-on-surface/[0.06] dark:text-on-surface/[0.08] select-none -mb-8">
          404
        </p>

        <h1 className="font-headline text-3xl font-extrabold text-on-surface mb-3">Page not found</h1>
        <p className="text-sm text-on-surface-variant mb-8 leading-relaxed font-body">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/dashboard" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dim text-on-primary font-headline font-bold py-3 px-6 rounded-full transition-all duration-200 shadow-lg shadow-primary/10 cursor-pointer">
            <span className="material-symbols-outlined text-lg">dashboard</span>
            Go to Dashboard
          </Link>
          <Link href="/" className="btn-ghost cursor-pointer inline-flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">home</span>
            Go Home
          </Link>
          <a href="mailto:support@becandid.io" className="btn-ghost cursor-pointer inline-flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">support_agent</span>
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
