'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  LogOut,
  LogIn,
  UserPlus,
  User,
  Calendar,
  LineChart,
} from 'lucide-react';

export function Navbar() {
  const router = useRouter();
  const { totalBalance, openQuickAdd, notifications, clearAllData } = useSpendy();
  const { user, profile, isAuthenticated, signOut } = useAuth();
  const { theme, toggleTheme, isOnline } = useTheme();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navRef = useRef<HTMLElement>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Click outside to close dropdowns
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

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <header ref={navRef} className="sticky top-0 z-40 w-full glass-panel border-b border-black/15 dark:border-white/15 px-3 sm:px-6 lg:px-8 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo - Compact & Proportional */}
        <Link href={isAuthenticated ? '/app' : '/'} className="group cursor-pointer shrink-0">
          <div className="hidden sm:block">
            <SpendyLogo size="sm" showTagline={false} />
          </div>
          <div className="sm:hidden">
            <SpendyLogo size="xs" showTagline={false} />
          </div>
        </Link>

        {/* Action Center & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Connection Status Pill (Medium+ Screens) */}
          <div
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
              isOnline
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
            }`}
          >
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span className="truncate">{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          {/* Current Balance Pill (Extra Large Screens) */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-xs shadow-inner">
            <span className="font-bold text-slate-700 dark:text-slate-300">Balance:</span>
            <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono text-xs">
              {formatCurrency(totalBalance)}
            </span>
          </div>

          {/* Dark / Light Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 sm:p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 transition-colors cursor-pointer shadow-sm shrink-0"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Quick Add Expense Action Button */}
          <button
            onClick={() => openQuickAdd('expense')}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-xs shadow-md shadow-emerald-600/25 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden md:inline">Record Spending</span>
            <span className="md:hidden">Add</span>
          </button>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              aria-label="Notifications"
              className="p-2 sm:p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 relative transition-colors cursor-pointer shadow-sm shrink-0"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-3xl glass-panel shadow-2xl p-4 z-50 border border-black/15 dark:border-white/20 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
                  <h4 className="text-sm font-black text-gray-950 dark:text-white">Notifications</h4>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-500 hover:text-gray-950 dark:hover:text-white p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-700 dark:text-slate-300 text-center py-4">
                      No new notifications
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 text-xs space-y-0.5">
                        <p className="font-bold text-gray-950 dark:text-white">{n.title}</p>
                        <p className="text-slate-700 dark:text-slate-300 font-medium">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-xs transition-colors cursor-pointer shadow-sm shrink-0"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white font-black flex items-center justify-center shadow-sm text-xs sm:text-sm shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:flex flex-col text-left max-w-[100px]">
                <span className="font-bold text-gray-950 dark:text-white leading-tight truncate">
                  {displayName}
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                  {profile?.currency || 'UGX'} Account
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300 hidden sm:block shrink-0" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-60 sm:w-64 rounded-3xl glass-panel shadow-2xl p-3 z-50 border border-black/15 dark:border-white/20 animate-in fade-in zoom-in-95 duration-150">
                <div className="p-2.5 border-b border-slate-200 dark:border-white/10">
                  <p className="text-xs font-black text-gray-950 dark:text-white truncate">{displayName}</p>
                  <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">{user?.email || 'Active Session'}</p>
                  {profile?.phone_number && (
                    <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{profile.phone_number}</p>
                  )}
                </div>

                <div className="mt-2 space-y-1 text-xs font-semibold">
                  <Link
                    href="/app/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <User className="w-4 h-4 text-emerald-500" />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    href="/spending"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ReceiptText className="w-4 h-4 text-red-500" />
                    <span>Transactions</span>
                  </Link>

                  <Link
                    href="/reports"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <LineChart className="w-4 h-4 text-purple-500" />
                    <span>Reports & Analytics</span>
                  </Link>

                  <Link
                    href="/calendar"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Calendar className="w-4 h-4 text-amber-500" />
                    <span>Activity Calendar</span>
                  </Link>

                  <Link
                    href="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-500" />
                    <span>Settings & Security</span>
                  </Link>

                  <div className="pt-1 border-t border-slate-200 dark:border-white/10 space-y-1">
                    <button
                      onClick={() => {
                        clearAllData();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors text-left cursor-pointer font-bold"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Clear Mock Data</span>
                    </button>

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors text-left cursor-pointer font-bold"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
