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

const GROUP_LABELS: Record<string, { label: string; icon: string }> = {
  growth: { label: 'Growth Tools', icon: 'trending_up' },
  community: { label: 'Community', icon: 'groups' },
  other: { label: 'More', icon: 'more_horiz' },
};

/* ------------------------------------------------------------------ */
/*  Nav link styles (new design)                                       */
/* ------------------------------------------------------------------ */
const navLinkBase =
  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium font-headline cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#276772]/30';

const navLinkActive =
  'text-[#276772] dark:text-cyan-300 font-bold border-r-4 border-[#276772] dark:border-cyan-400 bg-white/50 dark:bg-white/10';

const navLinkInactive =
  'text-[#2b3435] dark:text-stone-300 opacity-70 hover:bg-[#e2e9ea] dark:hover:bg-white/10';

function NavGroupedItems({ navItems, isActive, onNavigate }: {
  navItems: Array<{ id: string; href: string; label: string; icon: string; group?: string }>;
  isActive: (href: string) => boolean;
  onNavigate: () => void;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Split items into ungrouped (core) and grouped
  const core = navItems.filter(item => !item.group);
  const groups: Record<string, typeof navItems> = {};
  for (const item of navItems) {
    if (item.group) {
      if (!groups[item.group]) groups[item.group] = [];
      groups[item.group].push(item);
    }
  }

  // Auto-expand a group if it contains the active page
  const expandedWithActive = { ...expanded };
  for (const [groupId, items] of Object.entries(groups)) {
    if (items.some(item => isActive(item.href))) {
      expandedWithActive[groupId] = true;
    }
  }

  function renderItem(item: typeof navItems[0]) {
    const active = isActive(item.href);
    return (
      <Link
        key={item.id}
        href={item.href}
        onClick={onNavigate}
        {...(item.id === 'stringer-journal' ? { 'data-tour': 'journal' } : {})}
        {...(item.id === 'checkins' ? { 'data-tour': 'checkins' } : {})}
        {...(item.id === 'invite-partner' || item.id === 'conversations' ? { 'data-tour': 'partner' } : {})}
        className={`${navLinkBase} ${active ? navLinkActive : navLinkInactive}`}
      >
        <span className="material-symbols-outlined text-lg w-5 text-center">{item.icon}</span>
        <span className="font-headline">{item.label}</span>
      </Link>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {core.map(renderItem)}
      {Object.entries(groups).map(([groupId, items]) => {
        const meta = GROUP_LABELS[groupId] ?? { label: groupId, icon: 'folder' };
        const isOpen = expandedWithActive[groupId] ?? false;
        return (
          <div key={groupId} className="mt-2">
            <button
              onClick={() => setExpanded(prev => ({ ...prev, [groupId]: !prev[groupId] }))}
              className="flex items-center gap-3 px-4 py-2 w-full text-left rounded-xl text-[11px] font-headline font-semibold uppercase tracking-widest text-[#2b3435]/50 dark:text-stone-500 hover:text-[#2b3435]/80 dark:hover:text-stone-300 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm w-5 text-center">{meta.icon}</span>
              <span className="flex-1">{meta.label}</span>
              <span className={`material-symbols-outlined text-sm transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>expand_more</span>
            </button>
            {isOpen && (
              <div className="ml-2 flex flex-col gap-1">
                {items.map(renderItem)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Sidebar({ userName, userEmail, avatarUrl, monitoringEnabled, hasGoals, navItems, soloMode }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [appRunning, setAppRunning] = useState<boolean | null>(null); // null = loading
  const [mismatch, setMismatch] = useState(false);
  const [isolationOnly, setIsolationOnly] = useState(false);
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
          setIsolationOnly(d.isolation_only === true);
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
    <div className="flex flex-col h-full">
      {/* ---- Logo area ---- */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Be Candid" className="h-10 w-auto" />
          <span className="font-headline font-bold text-lg text-[#276772] dark:text-cyan-300">Be Candid</span>
        </div>
        <p className="mt-1 pl-[3.25rem] text-[10px] uppercase tracking-widest text-[#2b3435]/40 dark:text-stone-500 font-headline font-medium">
          Mental Sanctuary
        </p>
      </div>

      {/* ---- Mode + monitoring badges ---- */}
      <div className="px-4 space-y-2 pb-2">
        {/* Combined monitoring + connection status */}
        {!hasGoals ? (
          <Link href="/dashboard/settings" onClick={() => setOpen(false)}
            className="block px-3 py-2 rounded-xl bg-red-50 ring-1 ring-red-200/50 flex items-center gap-2 hover:bg-red-100/60 cursor-pointer transition-colors">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-xs text-red-700 font-headline font-bold flex-1 text-left">No Rivals Identified</span>
            <span className="material-symbols-outlined text-red-400 text-sm">arrow_forward</span>
          </Link>
        ) : !monitoringEnabled ? (
          <Link href="/dashboard/settings" onClick={() => setOpen(false)}
            className="block px-3 py-2 rounded-xl bg-red-50 ring-1 ring-red-200/50 flex items-center gap-2 hover:bg-red-100/60 cursor-pointer transition-colors">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-xs text-red-700 font-headline font-bold flex-1 text-left">Monitoring Inactive</span>
            <span className="material-symbols-outlined text-red-400 text-sm">arrow_forward</span>
          </Link>
        ) : appRunning === true ? (
          <button
            onClick={checkConnection}
            className="w-full px-3 py-2 rounded-xl bg-emerald-500/10 flex items-center gap-2 cursor-pointer hover:bg-emerald-500/15 transition-colors"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-700 font-headline font-bold flex-1 text-left">
              {checking ? 'Checking...' : 'Monitoring Active'}
            </span>
            <span className="material-symbols-outlined text-emerald-400 text-sm">refresh</span>
          </button>
        ) : appRunning === null ? (
          <div className="px-3 py-2 rounded-xl bg-[#e2e9ea] flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#2b3435]/30" />
            <span className="text-xs text-[#2b3435]/60 font-headline font-medium">Checking connection...</span>
          </div>
        ) : isolationOnly ? (
          <div className="px-3 py-2 rounded-xl bg-violet-50 ring-1 ring-violet-200/50 flex items-center gap-2">
            <span className="material-symbols-outlined text-violet-600 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>door_open</span>
            <span className="text-xs text-violet-700 font-headline font-bold flex-1 text-left">Isolation Mode</span>
            <span className="text-[9px] text-violet-500 font-headline">No scan needed</span>
          </div>
        ) : (
          <div>
            <button
              onClick={() => setShowTroubleshoot(!showTroubleshoot)}
              aria-expanded={showTroubleshoot}
              className="w-full px-3 py-2 rounded-xl bg-amber-50 ring-1 ring-amber-200/50 flex items-center gap-2 cursor-pointer hover:bg-amber-100/50 transition-colors"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="text-xs text-amber-700 font-headline font-medium flex-1 text-left">Desktop App Not Connected</span>
              <span className="material-symbols-outlined text-amber-400 text-sm">{showTroubleshoot ? 'expand_less' : 'help'}</span>
            </button>
            {showTroubleshoot && (
              <div className="mt-2 px-3 py-3 rounded-xl bg-white ring-1 ring-[#2b3435]/10 space-y-2.5">
                <button
                  onClick={checkConnection}
                  className="w-full flex items-center justify-center gap-2 py-2 text-[11px] font-headline font-semibold text-[#276772] bg-[#276772]/[0.06] rounded-xl hover:bg-[#276772]/[0.12] cursor-pointer transition-all"
                >
                  <span className={`material-symbols-outlined text-sm ${checking ? 'animate-spin' : ''}`}>refresh</span>
                  {checking ? 'Checking...' : 'Check Connection'}
                </button>
                <p className="text-[10px] font-headline font-bold uppercase tracking-wider text-[#2b3435]/60">Troubleshoot</p>
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
                        <Link href={step.href} onClick={() => setOpen(false)} className="text-[11px] text-[#276772] font-headline hover:underline cursor-pointer">
                          {step.text}
                        </Link>
                      ) : (
                        <span className="text-[11px] text-[#2b3435]/60 font-headline">{step.text}</span>
                      )}
                    </li>
                  ))}
                </ol>
                <Link
                  href="/download"
                  onClick={() => setOpen(false)}
                  className="block w-full text-center py-2 text-[11px] font-headline font-semibold text-white bg-red-500 rounded-xl hover:brightness-110 cursor-pointer transition-all"
                >
                  Download App
                </Link>
              </div>
            )}
          </div>
        )}
        {/* Account mismatch warning */}
        {mismatch && !appRunning && (
          <button
            onClick={() => router.push('/dashboard/settings')}
            className="w-full text-left px-3 py-2.5 rounded-xl bg-orange-50 ring-1 ring-orange-200/50 space-y-1 hover:bg-orange-100 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-600 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                <span className="text-[11px] text-orange-800 font-headline font-bold">Account Mismatch</span>
              </div>
              <span className="material-symbols-outlined text-orange-400 text-sm">arrow_forward</span>
            </div>
            <p className="text-[10px] text-orange-700 font-headline leading-relaxed">
              Your desktop app may be signed into a different account. Tap to resolve.
            </p>
          </button>
        )}
        {soloMode && (
          <div className="px-3 py-2 rounded-xl bg-[#276772]/10 flex items-center gap-2">
            <span className="material-symbols-outlined text-xs text-[#276772]">explore</span>
            <span className="text-xs text-[#276772] font-headline font-medium">Solo mode</span>
          </div>
        )}
      </div>

      {/* ---- Nav ---- */}
      <nav className="flex-1 px-3 pt-2 pb-4 overflow-y-auto">
        <NavGroupedItems navItems={navItems} isActive={isActive} onNavigate={() => setOpen(false)} />

        {/* Tools section */}
        <div className="mt-3 pt-3 border-t border-[#2b3435]/10 dark:border-white/10">
          <span className="px-4 text-[10px] font-headline font-semibold uppercase tracking-widest text-[#2b3435]/40 dark:text-stone-500 mb-1 block">Tools</span>
          <div className="flex flex-col gap-1 mt-1">
            <Link
              href="/dashboard/screen-time"
              onClick={() => setOpen(false)}
              className={`${navLinkBase} ${
                isActive('/dashboard/screen-time') ? navLinkActive : navLinkInactive
              }`}
            >
              <span className="material-symbols-outlined text-lg w-5 text-center">timer</span>
              <span className="font-headline">Screen Time</span>
            </Link>
            <Link
              href="/dashboard/content-filter"
              onClick={() => setOpen(false)}
              className={`${navLinkBase} ${
                isActive('/dashboard/content-filter') ? navLinkActive : navLinkInactive
              }`}
            >
              <span className="material-symbols-outlined text-lg w-5 text-center">filter_alt</span>
              <span className="font-headline">Content Filter</span>
            </Link>
          </div>
        </div>

        {/* Guardian section */}
        <div className="mt-3 pt-3 border-t border-[#2b3435]/10 dark:border-white/10">
          <div className="flex flex-col gap-1">
            <Link
              href="/guardian"
              onClick={() => setOpen(false)}
              className={`${navLinkBase} ${
                isActive('/guardian') ? navLinkActive : navLinkInactive
              }`}
            >
              <span className="material-symbols-outlined text-lg w-5 text-center">supervisor_account</span>
              <span className="font-headline">Guardian</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ---- Upgrade CTA ---- */}
      <div className="px-3 pb-2">
        <Link
          href="/pricing"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-headline font-semibold text-[#276772] bg-gradient-to-r from-[#276772]/10 to-[#276772]/5 ring-1 ring-[#276772]/15 cursor-pointer hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#276772]/30"
        >
          <span className="material-symbols-outlined text-lg w-5 text-center">auto_awesome</span>
          <span>Upgrade Plan</span>
        </Link>
      </div>

      {/* ---- Discord link ---- */}
      <div className="px-3 pb-2">
        <a
          href="https://discord.gg/sCkyPuqf6"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-headline font-semibold text-[#5865F2] bg-[#5865F2]/10 ring-1 ring-[#5865F2]/20 cursor-pointer hover:bg-[#5865F2]/20 hover:ring-[#5865F2]/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#5865F2]/30"
        >
          <span className="material-symbols-outlined text-lg w-5 text-center">forum</span>
          <span>Discord</span>
        </a>
      </div>

      {/* ---- Theme toggle ---- */}
      <div className="px-4 py-2">
        <DarkModeToggle />
      </div>

      {/* ---- User profile + logout ---- */}
      <div className="px-3 py-3 border-t border-[#2b3435]/10 dark:border-white/10 relative">
        <div className="flex items-center gap-1 mb-1 px-2">
          <div className="flex-1" />
          <NotificationCenter />
        </div>
        <button
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          aria-expanded={showProfileMenu}
          aria-label="Profile menu"
          className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-[#e2e9ea] dark:hover:bg-white/10 cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#276772]/30"
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={`${userName}'s avatar`} className="w-9 h-9 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#276772]/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-headline font-bold text-[#276772]">{userName.charAt(0).toUpperCase()}</span>
            </div>
          )}
          <div className="min-w-0 flex-1 text-left">
            <p className="text-sm font-headline font-bold text-[#2b3435] dark:text-white truncate">{userName}</p>
            <p className="text-[10px] text-[#2b3435]/50 dark:text-stone-500 font-headline tracking-wide truncate">Pro Member</p>
          </div>
          <span className="material-symbols-outlined text-[#2b3435]/40 dark:text-stone-500 text-base">
            {showProfileMenu ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        {/* Profile dropdown menu */}
        {showProfileMenu && (
          <div className="absolute bottom-full left-3 right-3 mb-1 bg-white dark:bg-[#1e2e30] rounded-xl shadow-lg ring-1 ring-[#2b3435]/10 dark:ring-white/10 overflow-hidden z-50">
            <Link
              href="/dashboard/settings"
              onClick={() => { setShowProfileMenu(false); setOpen(false); }}
              className="flex items-center gap-3 px-4 py-3 text-sm font-headline text-[#2b3435] dark:text-stone-200 hover:bg-[#e2e9ea] dark:hover:bg-white/10 cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-base text-[#2b3435]/60">settings</span>
              Settings
            </Link>
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-headline text-[#2b3435] dark:text-stone-200 hover:bg-[#e2e9ea] dark:hover:bg-white/10 cursor-pointer transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base text-[#2b3435]/60">photo_camera</span>
              {uploadingAvatar ? 'Uploading...' : 'Change avatar'}
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <div className="border-t border-[#2b3435]/10 dark:border-white/10" />
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
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-headline text-red-600 hover:bg-red-50 cursor-pointer transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              {loggingOut ? 'Signing out...' : 'Sign out'}
            </button>
          </div>
        )}
      </div>

      {/* ---- Clinical expertise note ---- */}
      <div className="px-5 pb-4">
        <p className="text-[10px] text-[#2b3435]/30 dark:text-stone-600 font-headline leading-tight">Designed with clinical expertise</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 w-11 h-11 rounded-xl bg-white/80 dark:bg-[#1a2526]/80 backdrop-blur-xl border border-[#2b3435]/10 dark:border-white/10 shadow-sm flex items-center justify-center cursor-pointer transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#276772]/30"
        aria-label="Open menu">
        <svg className="w-5 h-5 text-[#2b3435]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Desktop sidebar */}
      <aside aria-label="Main navigation" className="hidden lg:flex w-64 shrink-0 bg-[#f7fafa] dark:bg-[#1a2526] border-r border-[#2b3435]/10 dark:border-white/10 flex-col min-h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-[#2b3435]/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-[#f7fafa] dark:bg-[#1a2526] flex flex-col shadow-2xl" style={{ animation: 'slideIn 0.2s ease-out' }}>
            <button onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center text-[#2b3435]/60 hover:bg-[#e2e9ea] cursor-pointer transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#276772]/30">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Mobile bottom nav bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-[#1a2526]/90 backdrop-blur-xl border-t border-[#2b3435]/10 dark:border-white/10">
        <nav aria-label="Mobile navigation" className="flex items-center justify-around px-2 py-1">
          {MOBILE_TABS_ALL.filter(tab => !soloMode || tab.solo).map((tab) => {
            const active = isActive(tab.href);
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`relative flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-xl min-w-[60px] cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#276772]/30 ${
                  active
                    ? 'bg-[#276772]/10 text-[#276772]'
                    : 'text-[#2b3435]/50 hover:text-[#276772]'
                }`}
              >
                {active && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[#276772]" />}
                <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                <span className="text-[10px] font-headline font-medium">{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <style jsx>{`@keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }`}</style>
    </>
  );
}
