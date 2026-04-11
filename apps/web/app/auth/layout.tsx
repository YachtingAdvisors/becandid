// Force all auth pages to render dynamically (they need Supabase at runtime)
export const dynamic = 'force-dynamic';

import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-dark-auth flex items-center justify-center px-4 overflow-hidden">
      {/* Ambient blur backgrounds */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-teal-500/5 blur-[100px]" />

      {/* Fixed top nav */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-dark-auth/70 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-primary/30 rounded-lg">
            <img src="/logo.png" alt="Be Candid" className="h-10 w-auto brightness-[10]" />
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-[13px] font-label text-stone-500 hover:text-stone-300 cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-primary/30 rounded-md px-2 py-1">Privacy</Link>
            <Link href="/security" className="text-[13px] font-label text-stone-500 hover:text-stone-300 cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-primary/30 rounded-md px-2 py-1">Security</Link>
          </div>
        </div>
      </nav>

      {/* Centered content area */}
      <div className="relative z-10 w-full max-w-xl">
        {children}
      </div>
    </div>
  );
}
