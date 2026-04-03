// ============================================================
// components/dashboard/Sidebar.tsx — REWRITE
//
// Accepts navItems from layout (filtered by solo/partner mode).
// Shows solo mode badge. Mobile-responsive with slide-out drawer
// and bottom tab bar for mobile.
// ============================================================

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import DarkModeToggle from '@/components/DarkModeToggle';
import NotificationCenter from '@/components/dashboard/NotificationCenter';

interface NavItem {
  id: string;
  href: string;
  label: string;
  icon: string;
  solo: boolean;
}

interface SidebarProps {
  userName: string;
  userEmail: string;
  avatarUrl: string | null;
  monitoringEnabled: boolean;
  hasGoals: boolean;
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

export default function Sidebar({ userName, userEmail, avatarUrl, monitoringEnabled, hasGoals, navItems, soloMode }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [appRunning, setAppRunning] = useState<boolean | null>(null); // null = loading
  const [mismatch, setMismatch] = useState(false);
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);
  const [checking, setChecking] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await fetch('/api/auth/avatar', { method: 'POST', body: formData });
      if (res.ok) {
        setShowProfileMenu(false);
        router.refresh();
      }
    } catch {
      // silently fail
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const checkConnection = () => {
    setChecking(true);
    fetch('/api/heartbeat')
      .then(r => {
        if (!r.ok) {
          console.warn('[heartbeat] Response not ok:', r.status);
          setAppRunning(false);
          return null;
        }
        return r.json();
      })
      .then(d => {
        if (d) {
          setAppRunning(d.app_running === true);
          setMismatch(d.mismatch === true);
        }
      })
      .catch((e) => {
        console.warn('[heartbeat] Fetch failed:', e);
        setAppRunning(false);
      })
      .finally(() => setTimeout(() => setChecking(false), 500));
  };

  // Check heartbeat every 30 seconds
  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

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
        {/* Combined monitoring + connection status */}
        {!hasGoals ? (
          <Link href="/dashboard/settings" onClick={() => setOpen(false)}
            className="block px-3 py-2 rounded-2xl bg-red-50 ring-1 ring-red-200/50 flex items-center gap-2 hover:bg-red-100/60 cursor-pointer transition-colors">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-xs text-red-700 font-label font-bold flex-1 text-left">No Rivals Identified</span>
            <span className="material-symbols-outlined text-red-400 text-sm">arrow_forward</span>
          </Link>
        ) : !monitoringEnabled ? (
          <Link href="/dashboard/settings" onClick={() => setOpen(false)}
            className="block px-3 py-2 rounded-2xl bg-red-50 ring-1 ring-red-200/50 flex items-center gap-2 hover:bg-red-100/60 cursor-pointer transition-colors">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-xs text-red-700 font-label font-bold flex-1 text-left">Monitoring Inactive</span>
            <span className="material-symbols-outlined text-red-400 text-sm">arrow_forward</span>
          </Link>
        ) : appRunning === true ? (
          <button
            onClick={checkConnection}
            className="w-full px-3 py-2 rounded-2xl bg-emerald-500/10 flex items-center gap-2 cursor-pointer hover:bg-emerald-500/15 transition-colors"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-700 font-label font-bold flex-1 text-left">
              {checking ? 'Checking...' : 'Monitoring Active'}
            </span>
            <span className="material-symbols-outlined text-emerald-400 text-sm">refresh</span>
          </button>
        ) : appRunning === null ? (
          <div className="px-3 py-2 rounded-2xl bg-surface-container flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/30" />
            <span className="text-xs text-on-surface-variant font-label font-medium">Checking connection...</span>
          </div>
        ) : (
          <div>
            <button
              onClick={() => setShowTroubleshoot(!showTroubleshoot)}
              aria-expanded={showTroubleshoot}
              className="w-full px-3 py-2 rounded-2xl bg-amber-50 ring-1 ring-amber-200/50 flex items-center gap-2 cursor-pointer hover:bg-amber-100/50 transition-colors"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="text-xs text-amber-700 font-label font-medium flex-1 text-left">Desktop App Not Connected</span>
              <span className="material-symbols-outlined text-amber-400 text-sm">{showTroubleshoot ? 'expand_less' : 'help'}</span>
            </button>
            {showTroubleshoot && (
              <div className="mt-2 px-3 py-3 rounded-2xl bg-surface-container-lowest ring-1 ring-outline-variant/10 space-y-2.5">
                <button
                  onClick={checkConnection}
                  className="w-full flex items-center justify-center gap-2 py-2 text-[11px] font-label font-semibold text-primary bg-primary/[0.06] rounded-xl hover:bg-primary/[0.12] cursor-pointer transition-all"
                >
                  <span className={`material-symbols-outlined text-sm ${checking ? 'animate-spin' : ''}`}>refresh</span>
                  {checking ? 'Checking...' : 'Check Connection'}
                </button>
                <p className="text-[10px] font-label font-bold uppercase tracking-wider text-on-surface-variant">Troubleshoot</p>
                <ol className="space-y-2">
                  {[
                    { icon: 'download', text: 'Download the desktop app', href: '/download' },
                    { icon: 'install_desktop', text: 'Open the app and sign in' },
                    { icon: 'security', text: 'Grant screen recording permission' },
                    { icon: 'check_circle', text: 'Keep the app running in your menu bar' },
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-4 h-4 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-[9px] font-bold mt-0.5">{i + 1}</span>
                      {step.href ? (
                        <Link href={step.href} onClick={() => setOpen(false)} className="text-[11px] text-primary font-body hover:underline cursor-pointer">
                          {step.text}
                        </Link>
                      ) : (
                        <span className="text-[11px] text-on-surface-variant font-body">{step.text}</span>
                      )}
                    </li>
                  ))}
                </ol>
                <Link
                  href="/download"
                  onClick={() => setOpen(false)}
                  className="block w-full text-center py-2 text-[11px] font-label font-semibold text-white bg-red-500 rounded-xl hover:brightness-110 cursor-pointer transition-all"
                >
                  Download App
                </Link>
              </div>
            )}
          </div>
        )}
        {/* Account mismatch warning */}
        {mismatch && !appRunning && (
          <div className="px-3 py-2.5 rounded-2xl bg-orange-50 ring-1 ring-orange-200/50 space-y-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-600 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              <span className="text-[11px] text-orange-800 font-label font-bold">Account Mismatch</span>
            </div>
            <p className="text-[10px] text-orange-700 font-body leading-relaxed">
              Your desktop app may be signed into a different account. Sign into the same account on both to sync monitoring.
            </p>
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
      <nav className="px-3 pt-2 pb-4 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            onClick={() => setOpen(false)}
            {...(item.id === 'stringer-journal' ? { 'data-tour': 'journal' } : {})}
            {...(item.id === 'checkins' ? { 'data-tour': 'checkins' } : {})}
            {...(item.id === 'invite-partner' || item.id === 'conversations' ? { 'data-tour': 'partner' } : {})}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-medium mb-1 cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
              isActive(item.href)
                ? 'bg-secondary-container text-on-secondary-container border-l-2 border-primary'
                : 'text-on-surface/50 hover:text-primary hover:bg-primary-container/20 hover:translate-x-0.5 transition-transform'
            }`}
          >
            <span className="material-symbols-outlined text-lg w-5 text-center">{item.icon}</span>
            <span className="font-body">{item.label}</span>
          </Link>
        ))}

        {/* Tools section */}
        <div className="mt-2 pt-2 border-t border-outline-variant/30">
          <span className="px-4 text-[10px] font-label font-semibold uppercase tracking-widest text-on-surface-variant/50 mb-1 block">Tools</span>
          <Link
            href="/dashboard/screen-time"
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-medium mb-1 cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
              isActive('/dashboard/screen-time')
                ? 'bg-secondary-container text-on-secondary-container border-l-2 border-primary'
                : 'text-on-surface/50 hover:text-primary hover:bg-primary-container/20 hover:translate-x-0.5 transition-transform'
            }`}
          >
            <span className="material-symbols-outlined text-lg w-5 text-center">timer</span>
            <span className="font-body">Screen Time</span>
          </Link>
          <Link
            href="/dashboard/content-filter"
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-medium mb-1 cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
              isActive('/dashboard/content-filter')
                ? 'bg-secondary-container text-on-secondary-container border-l-2 border-primary'
                : 'text-on-surface/50 hover:text-primary hover:bg-primary-container/20 hover:translate-x-0.5 transition-transform'
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
            className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-medium mb-1 cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
              isActive('/guardian')
                ? 'bg-secondary-container text-on-secondary-container border-l-2 border-primary'
                : 'text-on-surface/50 hover:text-primary hover:bg-primary-container/20 hover:translate-x-0.5 transition-transform'
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
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-tertiary bg-gradient-to-r from-primary/10 to-tertiary/10 ring-1 ring-primary/15 cursor-pointer hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <span className="material-symbols-outlined text-lg w-5 text-center">auto_awesome</span>
          <span className="font-body font-semibold">Upgrade Plan</span>
        </Link>
      </div>

      {/* Theme toggle */}
      <div className="px-4 py-2">
        <DarkModeToggle />
      </div>

      {/* User profile + logout */}
      <div className="px-3 py-3 border-t border-outline-variant relative">
        <div className="flex items-center gap-1 mb-1 px-2">
          <div className="flex-1" />
          <NotificationCenter />
        </div>
        <button
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          aria-expanded={showProfileMenu}
          aria-label="Profile menu"
          className="w-full flex items-center gap-3 px-2 py-2 rounded-2xl hover:bg-surface-container cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={`${userName}'s avatar`} className="w-9 h-9 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-headline font-bold text-primary">{userName.charAt(0).toUpperCase()}</span>
            </div>
          )}
          <div className="min-w-0 flex-1 text-left">
            <p className="text-sm font-headline font-bold text-on-surface truncate">{userName}</p>
            <p className="text-[10px] text-on-surface-variant font-label truncate">{userEmail}</p>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant/40 text-base">
            {showProfileMenu ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        {/* Profile dropdown menu */}
        {showProfileMenu && (
          <div className="absolute bottom-full left-3 right-3 mb-1 bg-surface-container-lowest rounded-2xl shadow-lg ring-1 ring-outline-variant/20 overflow-hidden z-50">
            <Link
              href="/dashboard/settings"
              onClick={() => { setShowProfileMenu(false); setOpen(false); }}
              className="flex items-center gap-3 px-4 py-3 text-sm font-body text-on-surface hover:bg-surface-container cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-base text-on-surface-variant">settings</span>
              Settings
            </Link>
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-body text-on-surface hover:bg-surface-container cursor-pointer transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base text-on-surface-variant">photo_camera</span>
              {uploadingAvatar ? 'Uploading...' : 'Change avatar'}
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <div className="border-t border-outline-variant/20" />
            <button
              onClick={async () => {
                setLoggingOut(true);
                try {
                  await fetch('/api/auth/signout', { method: 'POST' });
                  window.location.href = '/auth/signin';
                } catch {
                  setLoggingOut(false);
                }
              }}
              disabled={loggingOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-body text-error hover:bg-error/5 cursor-pointer transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              {loggingOut ? 'Signing out...' : 'Sign out'}
            </button>
          </div>
        )}
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
        className="lg:hidden fixed top-4 left-4 z-40 w-11 h-11 rounded-2xl bg-surface-container-lowest/80 backdrop-blur-xl border border-outline-variant shadow-sm flex items-center justify-center cursor-pointer transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/30"
        aria-label="Open menu">
        <svg className="w-5 h-5 text-on-surface" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Desktop sidebar — glass effect */}
      <aside aria-label="Main navigation" className="hidden lg:flex w-60 shrink-0 bg-[#fbf9f8]/70 backdrop-blur-xl border-r border-outline-variant flex-col min-h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-[#fbf9f8]/95 backdrop-blur-xl flex flex-col shadow-2xl" style={{ animation: 'slideIn 0.2s ease-out' }}>
            <button onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-container cursor-pointer transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/30">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Mobile bottom nav bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/80 backdrop-blur-xl border-t border-outline-variant">
        <nav aria-label="Mobile navigation" className="flex items-center justify-around px-2 py-1">
          {MOBILE_TABS_ALL.filter(tab => !soloMode || tab.solo).map((tab) => {
            const active = isActive(tab.href);
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`relative flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-2xl min-w-[60px] cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                  active
                    ? 'bg-secondary-container text-on-secondary-container'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {active && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-primary" />}
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
