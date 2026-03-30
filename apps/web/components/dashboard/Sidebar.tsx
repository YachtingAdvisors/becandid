// ============================================================
// components/dashboard/Sidebar.tsx — REWRITE
//
// Accepts navItems from layout (filtered by solo/partner mode).
// Shows solo mode badge. Mobile-responsive with slide-out drawer
// and bottom tab bar for mobile.
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

// Bottom nav tabs for mobile
const MOBILE_TABS_ALL = [
  { id: 'overview', href: '/dashboard', label: 'Dashboard', icon: 'dashboard', solo: true },
  { id: 'activity', href: '/dashboard/activity', label: 'Activity', icon: 'timeline', solo: true },
  { id: 'partner', href: '/dashboard/partner', label: 'Partners', icon: 'handshake', solo: false },
  { id: 'stringer-journal', href: '/dashboard/stringer-journal', label: 'Journal', icon: 'edit_note', solo: true },
];

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
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Be Candid" className="h-12 w-auto" />
        </div>
      </div>

      {/* Mode + monitoring badges */}
      <div className="px-4 space-y-2 pb-2">
        {monitoringEnabled && (
          <div className="px-3 py-2 rounded-2xl bg-primary-container/40 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-primary font-label font-medium">Awareness active</span>
          </div>
        )}
        {soloMode && (
          <div className="px-3 py-2 rounded-2xl bg-tertiary-container/40 flex items-center gap-2">
            <span className="material-symbols-outlined text-xs">explore</span>
            <span className="text-xs text-on-tertiary-container font-label font-medium">Solo mode</span>
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
            className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-medium mb-1 transition-all ${
              isActive(item.href)
                ? 'bg-secondary-container text-on-secondary-container'
                : 'text-on-surface/50 hover:text-primary hover:bg-primary-container/20'
            }`}
          >
            <span className="material-symbols-outlined text-lg w-5 text-center">{item.icon}</span>
            <span className="font-body">{item.label}</span>
          </Link>
        ))}

        {/* Screen Time & Content Filter */}
        <div className="mt-2 pt-2 border-t border-outline-variant/30">
          <Link
            href="/dashboard/screen-time"
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-medium mb-1 transition-all ${
              isActive('/dashboard/screen-time')
                ? 'bg-secondary-container text-on-secondary-container'
                : 'text-on-surface/50 hover:text-primary hover:bg-primary-container/20'
            }`}
          >
            <span className="material-symbols-outlined text-lg w-5 text-center">timer</span>
            <span className="font-body">Screen Time</span>
          </Link>
          <Link
            href="/dashboard/content-filter"
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-medium mb-1 transition-all ${
              isActive('/dashboard/content-filter')
                ? 'bg-secondary-container text-on-secondary-container'
                : 'text-on-surface/50 hover:text-primary hover:bg-primary-container/20'
            }`}
          >
            <span className="material-symbols-outlined text-lg w-5 text-center">filter_alt</span>
            <span className="font-body">Content Filter</span>
          </Link>
        </div>

        {/* Guardian section */}
        <div className="mt-2 pt-2 border-t border-outline-variant/30">
          <Link
            href="/guardian"
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-medium mb-1 transition-all ${
              isActive('/guardian')
                ? 'bg-secondary-container text-on-secondary-container'
                : 'text-on-surface/50 hover:text-primary hover:bg-primary-container/20'
            }`}
          >
            <span className="material-symbols-outlined text-lg w-5 text-center">supervisor_account</span>
            <span className="font-body">Guardian</span>
          </Link>
        </div>
      </nav>

      {/* Upgrade CTA */}
      <div className="px-3 pb-2">
        <Link
          href="/pricing"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-medium text-tertiary hover:bg-tertiary-container/20 transition-colors"
        >
          <span className="material-symbols-outlined text-lg w-5 text-center">auto_awesome</span>
          <span className="font-body">Upgrade Plan</span>
        </Link>
      </div>

      {/* User */}
      <div className="px-5 py-4 border-t border-outline-variant">
        <p className="text-sm font-headline font-bold text-on-surface truncate">{userName}</p>
        <Link href="/dashboard/settings" className="text-xs text-on-surface-variant hover:text-primary font-label">Settings</Link>
      </div>

      {/* Clinical expertise note */}
      <div className="px-5 pb-4">
        <p className="text-[10px] text-on-surface-variant/40 font-label leading-tight">Designed with clinical expertise</p>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 w-10 h-10 rounded-2xl bg-surface-container-lowest/80 backdrop-blur-xl border border-outline-variant shadow-sm flex items-center justify-center"
        aria-label="Open menu">
        <svg className="w-5 h-5 text-on-surface" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Desktop sidebar — glass effect */}
      <aside className="hidden lg:flex w-60 shrink-0 bg-[#fbf9f8]/70 backdrop-blur-xl border-r border-outline-variant flex-col min-h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-[#fbf9f8]/95 backdrop-blur-xl flex flex-col shadow-2xl" style={{ animation: 'slideIn 0.2s ease-out' }}>
            <button onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-container">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Mobile bottom nav bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/80 backdrop-blur-xl border-t border-outline-variant">
        <nav className="flex items-center justify-around px-2 py-1.5">
          {MOBILE_TABS_ALL.filter(tab => !soloMode || tab.solo).map((tab) => {
            const active = isActive(tab.href);
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl min-w-[60px] transition-all ${
                  active
                    ? 'bg-secondary-container text-on-secondary-container'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                <span className="text-[10px] font-label font-medium">{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <style jsx>{`@keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }`}</style>
    </>
  );
}
