// ============================================================
// components/dashboard/Sidebar.tsx — REWRITE
//
// Accepts navItems from layout (filtered by solo/partner mode).
// Shows solo mode badge. Mobile-responsive with slide-out drawer.
// ============================================================

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  id: string;
  href: string;
  label: string;
  icon: string;
  solo: boolean;
}

interface SidebarProps {
  userName: string;
  monitoringEnabled: boolean;
  navItems: NavItem[];
  soloMode: boolean;
}

export default function Sidebar({ userName, monitoringEnabled, navItems, soloMode }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-5 pt-5 pb-4 border-b border-surface-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
            <span className="text-white text-sm font-bold">C</span>
          </div>
          <span className="font-display font-semibold text-lg text-ink">Be Candid</span>
        </div>
      </div>

      {/* Mode + monitoring badges */}
      <div className="px-3 pt-3 space-y-2">
        {monitoringEnabled && (
          <div className="px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-700 font-medium">Monitoring active</span>
          </div>
        )}
        {soloMode && (
          <div className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-100 flex items-center gap-2">
            <span className="text-xs">🧭</span>
            <span className="text-xs text-amber-700 font-medium">Solo mode</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-2 pb-4 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-colors ${
              isActive(item.href)
                ? 'bg-brand/10 text-brand'
                : 'text-ink-muted hover:bg-gray-50 hover:text-ink'
            }`}
          >
            <span className="text-base w-5 text-center">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Upgrade CTA */}
      <div className="px-3 pb-2">
        <Link
          href="/pricing"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-brand-600 hover:bg-brand-50 transition-colors"
        >
          <span className="text-base w-5 text-center">*</span>
          Upgrade Plan
        </Link>
      </div>

      {/* User */}
      <div className="px-5 py-4 border-t border-surface-border">
        <p className="text-sm font-medium text-ink truncate">{userName}</p>
        <Link href="/dashboard/settings" className="text-xs text-ink-muted hover:text-brand">Settings</Link>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 w-10 h-10 rounded-xl bg-white border border-surface-border shadow-sm flex items-center justify-center"
        aria-label="Open menu">
        <svg className="w-5 h-5 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 bg-white border-r border-surface-border flex-col min-h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white flex flex-col shadow-2xl" style={{ animation: 'slideIn 0.2s ease-out' }}>
            <button onClick={() => setOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-ink-muted hover:bg-gray-100">
              ✕
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      <style jsx>{`@keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }`}</style>
    </>
  );
}
