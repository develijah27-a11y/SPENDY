'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useSpendy } from '@/lib/store/spendyStore';
import { useAuth } from '@/lib/auth/AuthContext';
import { useTheme } from '@/lib/theme/ThemeContext';
import { SpendyLogo } from '@/components/ui/SpendyLogo';
import { formatSingleName } from '@/lib/utils';
import {
  Plus,
  RotateCcw,
  ChevronDown,
  Sun,
  Moon,
  WifiOff,
  Settings,
  LineChart,
  LogOut,
  CheckCircle2,
} from 'lucide-react';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    openQuickAdd,
    syncState,
    pendingSyncCount,
    triggerManualSync,
  } = useSpendy();
  const { user, profile, isAuthenticated, signOut } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
    router.push('/login');
  };

  const getDisplayName = () => {
    const raw = profile?.full_name || user?.user_metadata?.full_name || user?.email;
    return formatSingleName(raw, 'User');
  };

  const displayName = getDisplayName();

  const navItems = [
    { href: '/app', label: 'Dashboard' },
    { href: '/transactions', label: 'Activity' },
    { href: '/income', label: 'Income' },
    { href: '/budgets', label: 'Budgets' },
    { href: '/goals', label: 'Goals' },
    { href: '/reports', label: 'Analytics' },
    { href: '/settings', label: 'Settings' },
  ];

  return (
    <header ref={navRef} className="sticky top-0 z-40 w-full glass-panel border-b border-black/10 dark:border-white/10 px-3 sm:px-6 py-2.5 transition-all bg-[#f8fafc]/90 dark:bg-[#070A12]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href={isAuthenticated ? '/app' : '/'} className="group cursor-pointer shrink-0">
            <SpendyLogo size="sm" showTagline={false} />
          </Link>

          {/* Desktop Top Links */}
          {isAuthenticated && (
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href === '/transactions' && (pathname === '/transactions' || pathname === '/spending')) ||
                  (item.href === '/goals' && (pathname === '/goals' || pathname === '/savings'));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    className={`px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-black border border-emerald-500/30 shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-gray-950 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 font-bold border border-transparent'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* Action Center */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Cloud Sync Status Indicator */}
          {isAuthenticated && (
            <button
              onClick={triggerManualSync}
              title={
                syncState === 'syncing'
                  ? `Syncing ${pendingSyncCount} changes with cloud`
                  : syncState === 'offline'
                  ? 'Offline mode (saved in IndexedDB). Tap to retry connection.'
                  : 'Cloud Synced with PostgreSQL. Tap to refresh.'
              }
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer touch-target active:scale-95 ${
                syncState === 'syncing'
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400'
                  : syncState === 'offline'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
              }`}
            >
              {syncState === 'syncing' ? (
                <RotateCcw className="w-3.5 h-3.5 animate-spin text-cyan-500" />
              ) : syncState === 'offline' ? (
                <WifiOff className="w-3.5 h-3.5 text-amber-500" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              )}
              <span className="hidden sm:inline text-[11px]">
                {syncState === 'syncing' ? 'Syncing...' : syncState === 'offline' ? 'Offline' : 'Synced'}
              </span>
            </button>
          )}

          {/* Theme Quick Toggle (Visible on top navbar for easy access) */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
            className="p-2 sm:p-2.5 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 border border-black/10 dark:border-white/15 text-slate-700 dark:text-slate-200 transition-all cursor-pointer shrink-0 active:scale-95 shadow-sm touch-target flex items-center justify-center"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-label="User Account Menu"
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 border border-black/10 dark:border-white/15 text-xs transition-all cursor-pointer shadow-sm shrink-0 active:scale-95"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black flex items-center justify-center shadow-sm text-xs shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="font-black text-gray-950 dark:text-white text-xs leading-none truncate max-w-[90px]">
                  {displayName}
                </span>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                  Account
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl glass-panel shadow-2xl p-4 z-50 border border-black/15 dark:border-white/20 animate-in fade-in zoom-in-95 duration-150 space-y-3 bg-white/95 dark:bg-[#090E1A]/95 backdrop-blur-2xl">
                {/* Header */}
                <div className="pb-3 border-b border-black/10 dark:border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black flex items-center justify-center shadow-md text-sm">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-black text-sm text-gray-950 dark:text-white truncate">
                        {displayName}
                      </p>
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                        {user?.email || 'Active Account'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cloud Sync Status */}
                <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    {syncState === 'syncing' ? (
                      <RotateCcw className="w-4 h-4 animate-spin text-cyan-500" />
                    ) : syncState === 'offline' ? (
                      <WifiOff className="w-4 h-4 text-amber-500" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    )}
                    <div>
                      <p className="font-bold text-gray-950 dark:text-white leading-tight">
                        {syncState === 'syncing'
                          ? `Syncing (${pendingSyncCount})`
                          : syncState === 'offline'
                          ? 'Offline Mode'
                          : 'Cloud Synced'}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {syncState === 'offline' ? 'Saved locally in IndexedDB' : 'PostgreSQL connected'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={triggerManualSync}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-[11px] font-black border border-emerald-500/30 transition-all cursor-pointer"
                  >
                    Sync
                  </button>
                </div>

                {/* Links */}
                <div className="space-y-1 pt-1 text-xs">
                  <Link
                    href="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-950 dark:text-white hover:bg-black/5 dark:hover:bg-white/10 font-bold transition-all"
                  >
                    <Settings className="w-4 h-4 text-slate-500" />
                    <span>Settings &amp; Preferences</span>
                  </Link>

                  <Link
                    href="/reports"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-950 dark:text-white hover:bg-black/5 dark:hover:bg-white/10 font-bold transition-all"
                  >
                    <LineChart className="w-4 h-4 text-slate-500" />
                    <span>Financial Analytics</span>
                  </Link>
                </div>

                {/* Sign Out */}
                <div className="pt-2 border-t border-black/10 dark:border-white/10">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-black text-xs transition-all cursor-pointer border border-red-500/20"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
