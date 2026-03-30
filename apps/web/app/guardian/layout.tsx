import Link from 'next/link';

export default function GuardianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-outline-variant bg-surface-container-lowest">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm text-on-surface-variant hover:text-primary font-label font-medium"
            >
              &larr; Dashboard
            </Link>
            <span className="text-outline-variant">|</span>
            <img src="/logo.png" alt="Be Candid" className="h-12 w-auto" />
            <span className="text-sm text-on-surface-variant font-label">
              &mdash; Guardian Dashboard
            </span>
          </div>
        </div>
      </header>
      <main className="px-4 py-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
