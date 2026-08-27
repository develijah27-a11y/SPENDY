'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSpendy } from '@/lib/store/spendyStore';
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
} from 'lucide-react';

export function Navbar() {
  const router = useRouter();
  const { totalBalance, openQuickAdd, notifications, user, isAuthenticated, signOut, clearAllData } = useSpendy();
  const { theme, toggleTheme, isOnline } = useTheme();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-black/15 dark:border-white/15 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Official Logo */}
        <Link href="/" className="group cursor-pointer">
          <SpendyLogo size="md" showTagline={true} />
        </Link>

        {/* Action Center & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Offline / Online Indicator */}
          <div
            className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              isOnline
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
            }`}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isOnline ? 'Live Online' : 'Offline Mode'}</span>
          </div>

          {/* Current Balance Pill */}
          <div className="hidden lg:flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-xs shadow-inner">
            <span className="font-bold text-slate-700 dark:text-slate-300">Balance:</span>
            <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono text-sm">
              {formatCurrency(totalBalance)}
            </span>
          </div>

          {/* Dark / Light Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 transition-colors cursor-pointer shadow-sm"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Quick Add Expense Action */}
          <button
            onClick={() => openQuickAdd('expense')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Record Spending</span>
            <span className="sm:hidden">Add</span>
          </button>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              aria-label="Notifications"
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 relative transition-colors cursor-pointer shadow-sm"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-3xl glass-panel shadow-2xl p-4 z-50 border border-black/15 dark:border-white/20 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
                  <h4 className="text-sm font-black text-gray-950 dark:text-white">Notifications</h4>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-500 hover:text-gray-950 dark:hover:text-white p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 text-xs">
                      <p className="font-bold text-gray-950 dark:text-white">{n.title}</p>
                      <p className="text-slate-700 dark:text-slate-300 font-medium mt-0.5">{n.message}</p>
                    </div>
                  ))}
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
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-xs transition-colors cursor-pointer shadow-sm"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white font-black flex items-center justify-center shadow-sm">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="font-bold text-gray-950 dark:text-white leading-tight">
                  {user?.full_name || 'My Spendy'}
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {user?.email ? 'Authenticated' : 'UGX Account'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300 hidden sm:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-3xl glass-panel shadow-2xl p-3 z-50 border border-black/15 dark:border-white/20 animate-in fade-in zoom-in-95 duration-150">
                <div className="p-2.5 border-b border-slate-200 dark:border-white/10">
                  <p className="text-xs font-black text-gray-950 dark:text-white">{user?.full_name || 'User'}</p>
                  <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">{user?.email || 'user@spendi.ug'}</p>
                  {user?.phone_number && (
                    <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{user.phone_number}</p>
                  )}
                </div>

                <div className="mt-2 space-y-1 text-xs font-semibold">
                  <Link
                    href="/spending"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ReceiptText className="w-4 h-4 text-red-500" />
                    <span>Spending Log</span>
                  </Link>

                  <Link
                    href="/income"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                    <span>Income Manager</span>
                  </Link>

                  <Link
                    href="/loans"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <HandCoins className="w-4 h-4 text-purple-500" />
                    <span>Loans (Lent & Borrowed)</span>
                  </Link>

                  <Link
                    href="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-500" />
                    <span>Settings & Export</span>
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
                      <span>Reset Demo Data</span>
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
