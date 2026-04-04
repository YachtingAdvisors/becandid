'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import MFAChallenge from '@/components/auth/MFAChallenge';
import { createClient } from '@/lib/supabase';

export default function MFAVerifyPage() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/dashboard';
  const supabase = createClient();

  return (
    <div className="relative min-h-screen bg-[#0f1419] flex items-center justify-center px-4 overflow-hidden">
      {/* Ambient blur backgrounds */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-teal-500/5 blur-[100px]" />

      {/* Fixed top nav */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-[#0f1419]/70 border-b border-white/5">
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

      {/* Card */}
      <div className="relative z-10 w-full max-w-xl">
        <div
          className="rounded-[2rem] shadow-[0_4px_40px_rgba(0,0,0,0.3)] p-10 sm:p-12 transition-all duration-200 hover:ring-white/[0.1]"
          style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.05)' }}
        >
          <MFAChallenge
            redirectTo={redirect}
            onBack={() => {
              supabase.auth.signOut().then(() => {
                window.location.href = '/auth/signin';
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}
