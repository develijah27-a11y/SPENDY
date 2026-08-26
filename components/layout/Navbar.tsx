'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSpendy } from '@/lib/store/spendyStore';
import { formatUGX } from '@/lib/formatters';
import {
  Wallet,
  Bell,
  Plus,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ChevronDown,
  X,
  CreditCard,
} from 'lucide-react';

export function Navbar() {
  const { totalBalance, openQuickAdd, notifications, resetToDemoData, user } = useSpendy();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  Spendy
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  UG 🇺🇬
                </span>
              </div>
              <p className="text-[11px] text-gray-400 hidden sm:block">Know your money. Control your spending.</p>
            </div>
          </Link>
        </div>

        {/* Quick Balance & Action Center */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Total balance quick pill */}
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs">
            <span className="text-gray-400">Total Money:</span>
            <span className="font-semibold text-emerald-400">{formatUGX(totalBalance)}</span>
          </div>

          {/* Quick Action Button */}
          <button
            onClick={() => openQuickAdd('expense')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm shadow-md shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Expense</span>
            <span className="sm:hidden">Add</span>
          </button>

          {/* Pay Action Button */}
          <button
            onClick={() => openQuickAdd('pay')}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600/80 hover:bg-purple-600 text-white font-medium text-xs sm:text-sm border border-purple-500/30 shadow-md shadow-purple-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <CreditCard className="w-4 h-4 text-purple-200" />
            <span>Pay Merchant</span>
          </button>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              aria-label="Notifications"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 relative transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl glass-panel shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <h4 className="text-sm font-semibold text-white">Notifications</h4>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-gray-400 hover:text-white text-xs p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs transition-colors">
                      <p className="font-medium text-white">{n.title}</p>
                      <p className="text-gray-400 mt-0.5">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User profile / Quick menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center border border-emerald-500/30">
                {user.full_name?.charAt(0) || 'D'}
              </div>
              <span className="hidden sm:inline font-medium text-gray-200">{user.full_name || 'David Mukasa'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="p-2 border-b border-white/10">
                  <p className="text-xs font-semibold text-white">{user.full_name}</p>
                  <p className="text-[11px] text-gray-400">{user.email}</p>
                </div>
                <div className="mt-2 space-y-1 text-xs">
                  <Link
                    href="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Settings & Currency</span>
                  </Link>
                  <Link
                    href="/coach"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>AI Money Coach</span>
                  </Link>
                  <button
                    onClick={() => {
                      resetToDemoData();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-amber-300 hover:bg-amber-500/10 transition-colors text-left"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset Uganda Demo Data</span>
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
