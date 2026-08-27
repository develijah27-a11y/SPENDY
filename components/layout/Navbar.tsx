'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useSpendy } from '@/lib/store/spendyStore';
import { useAuth } from '@/lib/auth/AuthContext';
import { useTheme } from '@/lib/theme/ThemeContext';
import { formatCurrency } from '@/lib/formatters';
import { SpendyLogo } from '@/components/ui/SpendyLogo';
import {
  Bell,
  Plus,
  RotateCcw,
  Sparkles,
  ChevronDown,
  X,
  Sun,
  Moon,
  Wifi,
  WifiOff,
  Settings,
  ReceiptText,
  HandCoins,
  DollarSign,
  Calendar,
  LineChart,
  LogOut,
  User,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    totalBalance,
    openQuickAdd,
    notifications,
    clearAllData,
    syncState,
    pendingSyncCount,
    lastSyncTime,
    triggerManualSync,
  } = useSpendy();
  const { user, profile, isAuthenticated, signOut } = useAuth();
  const { theme, resolvedTheme, toggleTheme, isOnline } = useTheme();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navRef = useRef<HTMLElement>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
    router.push('/login');
  };

  // Section 5: Clean display name formatting
  const getDisplayName = () => {
    if (profile?.full_name && profile.full_name.trim()) {
      return profile.full_name.trim();
    }
    if (user?.user_metadata?.full_name && typeof user.user_metadata.full_name === 'string' && user.user_metadata.full_name.trim()) {
      return user.user_metadata.full_name.trim();
    }
    if (user?.email) {
      const rawUser = user.email.split('@')[0];
      const cleaned = rawUser.replace(/[0-9_.-]+$/, '');
      if (cleaned.length >= 2) {
        return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
      }
      return rawUser.charAt(0).toUpperCase() + rawUser.slice(1);
    }
    return 'User';
  };

  const displayName = getDisplayName();

  const navItems = [
    { href: '/app', label: 'Dashboard' },
    { href: '/spending', label: 'Transactions' },
    { href: '/income', label: 'Income' },
    { href: '/budgets', label: 'Budgets' },
    { href: '/goals', label: 'Goals' },
    { href: '/reports', label: 'Reports' },
    { href: '/calendar', label: 'Calendar' },
  ];

  return (
    <header ref={navRef} className="sticky top-0 z-40 w-full glass-panel border-b border-black/15 dark:border-white/15 px-3 sm:px-6 lg:px-8 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo - Compact & Proportional */}
        <div className="flex items-center gap-6">
          <Link href={isAuthenticated ? '/app' : '/'} className="group cursor-pointer shrink-0">
            <div className="hidden sm:block">
              <SpendyLogo size="sm" showTagline={false} />
            </div>
            <div className="sm:hidden">
              <SpendyLogo size="xs" showTagline={false} />
            </div>
          </Link>

          {/* Top Navigation Links (Desktop) */}
          {isAuthenticated && (
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/app' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-1.5 rounded-2xl text-xs transition-all ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-black border border-emerald-500/30 shadow-sm'
                        : 'text-slate-700 dark:text-slate-300 hover:text-gray-950 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 font-bold border border-transparent'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* Action Center (Decluttered Section 2: + Add & Avatar Menu) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Add Action Button (Primary) */}
          <button
            onClick={() => openQuickAdd('expense')}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-xs shadow-md shadow-emerald-600/25 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 shrink-0 stroke-[3]" />
            <span className="hidden sm:inline">Record Entry</span>
            <span className="sm:hidden">Add</span>
          </button>

          {/* Avatar-Tap Menu (Folds all secondary tools into a single menu) */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              aria-label="User Account Menu"
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-2xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 border border-black/10 dark:border-white/15 text-xs transition-all cursor-pointer shadow-sm shrink-0 active:scale-95"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black flex items-center justify-center shadow-sm text-xs sm:text-sm shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="font-black text-gray-950 dark:text-white text-xs leading-none truncate max-w-[90px]">
                  {displayName}
                </span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                  UGX
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
            </button>

            {/* Avatar Dropdown Drawer Sheet */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-3xl glass-panel shadow-2xl p-4 z-50 border border-black/15 dark:border-white/20 animate-in fade-in zoom-in-95 duration-150 space-y-3">
                {/* User Identity Header */}
                <div className="pb-3 border-b border-black/10 dark:border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black flex items-center justify-center shadow-md text-base">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-black text-sm text-gray-950 dark:text-white truncate">
                        {displayName}
                      </p>
                      <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">
                        {user?.email || 'Authenticated User'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cloud Sync Status & Retry */}
                <div className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    {syncState === 'syncing' ? (
                      <RotateCcw className="w-4 h-4 animate-spin text-cyan-500" />
                    ) : syncState === 'offline' ? (
                      <WifiOff className="w-4 h-4 text-amber-500" />
                    ) : pendingSyncCount > 0 ? (
                      <RotateCcw className="w-4 h-4 text-purple-500" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    )}
                    <div>
                      <p className="font-bold text-gray-950 dark:text-white leading-tight">
                        {syncState === 'syncing'
                          ? `Syncing (${pendingSyncCount})`
                          : syncState === 'offline'
                          ? 'Offline Mode'
                          : pendingSyncCount > 0
                          ? `${pendingSyncCount} Pending Sync`
                          : 'Cloud Synced'}
                      </p>
                      <p className="text-[10px] text-slate-700 dark:text-slate-300">
                        {syncState === 'offline' ? 'Saved locally in IndexedDB' : 'Supabase connected'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={triggerManualSync}
                    className="px-2.5 py-1 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-[11px] font-black border border-emerald-500/30 transition-all cursor-pointer"
                  >
                    Sync
                  </button>
                </div>

                {/* Quick Controls: Dark/Light Mode & Currency */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Theme Switch */}
                  <button
                    onClick={toggleTheme}
                    className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 flex items-center justify-between font-bold text-gray-950 dark:text-white transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      {resolvedTheme === 'dark' ? (
                        <Sun className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Moon className="w-4 h-4 text-indigo-600" />
                      )}
                      <span>{resolvedTheme === 'dark' ? 'Dark' : 'Light'}</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black">Mode</span>
                  </button>

                  {/* Currency Badge */}
                  <div className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-between font-bold text-gray-950 dark:text-white">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Currency</span>
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-black text-[11px]">
                      UGX
                    </span>
                  </div>
                </div>

                {/* Menu Navigation Links */}
                <div className="space-y-1 pt-1 text-xs">
                  <Link
                    href="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-950 dark:text-white hover:bg-black/5 dark:hover:bg-white/10 font-bold transition-all"
                  >
                    <Settings className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                    <span>App Settings & Offline Center</span>
                  </Link>

                  <Link
                    href="/reports"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-950 dark:text-white hover:bg-black/5 dark:hover:bg-white/10 font-bold transition-all"
                  >
                    <LineChart className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                    <span>Financial Analytics & CSV</span>
                  </Link>
                </div>

                {/* Sign Out Button */}
                <div className="pt-2 border-t border-black/10 dark:border-white/10">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-black text-xs transition-all cursor-pointer border border-red-500/20"
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
