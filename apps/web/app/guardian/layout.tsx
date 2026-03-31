import Link from 'next/link';

export default function GuardianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="ring-1 ring-outline-variant/10 bg-surface-container-lowest/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary font-label font-medium transition-colors duration-200 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Dashboard
            </Link>
            <span className="text-outline-variant/40">|</span>
            <img src="/logo.png" alt="Be Candid" className="h-10 w-auto" />
            <span className="text-sm text-on-surface-variant font-label">
              Guardian Dashboard
            </span>
          </div>
        </div>
      </header>
      <main className="px-4 py-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
