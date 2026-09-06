'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn, formatSingleName } from '@/lib/utils';
import {
  LayoutDashboard,
  ReceiptText,
  PieChart,
  Target,
  PiggyBank,
  Settings,
  Download,
  LogOut,
  Plus,
  Sun,
  Moon,
  Landmark,
  Scale,
  Repeat,
  Sparkles,
  Calendar,
  CalendarCheck2,
  Tag,
  RotateCcw,
  CheckCircle2,
  WifiOff,
} from 'lucide-react';
import { useSpendy } from '@/lib/store/spendyStore';
import { useAuth } from '@/lib/auth/AuthContext';
import { useTheme } from '@/lib/theme/ThemeContext';
import { formatCurrency } from '@/lib/formatters';
import { SpendyLogo } from '@/components/ui/SpendyLogo';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalBalance, exportDataCSV, openQuickAdd, syncState, pendingSyncCount, triggerManualSync } = useSpendy();
  const { user, profile, signOut } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();

  const navGroups = [
    {
      title: 'Main',
      items: [
        { label: 'Home', href: '/app', icon: LayoutDashboard },
        { label: 'Activity', href: '/transactions', icon: ReceiptText },
        { label: 'Accounts', href: '/accounts', icon: Landmark },
      ],
    },
    {
      title: 'Planning',
      items: [
        { label: 'Budgets', href: '/budgets', icon: PiggyBank },
        { label: 'Goals', href: '/goals', icon: Target },
        { label: 'Recurring', href: '/recurring', icon: Repeat },
        { label: 'Debts & Loans', href: '/debts', icon: Scale },
      ],
    },
    {
      title: 'Intelligence',
      items: [
        { label: 'Analytics', href: '/reports', icon: PieChart },
        { label: 'AI Coach', href: '/coach', icon: Sparkles, badge: 'AI' },
        { label: 'Calendar', href: '/calendar', icon: Calendar },
        { label: 'Monthly Review', href: '/review', icon: CalendarCheck2 },
      ],
    },
    {
      title: 'System',
      items: [
        { label: 'Categories', href: '/categories', icon: Tag },
        { label: 'Settings', href: '/settings', icon: Settings },
      ],
    },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const displayName = formatSingleName(profile?.full_name || user?.user_metadata?.full_name || user?.email, 'User');

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-white dark:bg-[#0B1120] border-r border-slate-200 dark:border-slate-800 p-4 shrink-0 shadow-xs z-30 justify-between overflow-y-auto">
      <div className="space-y-4">
        {/* Brand Header & Theme Toggle */}
        <div className="pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <Link href="/app" className="inline-block cursor-pointer">
            <SpendyLogo size="sm" showTagline={false} />
          </Link>
          <button
            onClick={toggleTheme}
            title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer touch-target flex items-center justify-center active:scale-95"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>
        </div>

        {/* Quick Add Button */}
        <div>
          <button
            onClick={() => openQuickAdd('expense')}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 active:scale-98 transition-all cursor-pointer touch-target"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Transaction</span>
          </button>
        </div>

        {/* Balance Snapshot */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Balance
          </span>
          <p className="text-base font-black text-slate-950 dark:text-white font-mono tabular-nums">
            {formatCurrency(totalBalance)}
          </p>
        </div>

        {/* Cloud Sync Status Indicator */}
        <div className="p-2 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            {syncState === 'syncing' ? (
              <RotateCcw className="w-3.5 h-3.5 animate-spin text-cyan-500 shrink-0" />
            ) : syncState === 'offline' ? (
              <WifiOff className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            )}
            <span className="text-[11px] font-bold truncate text-slate-700 dark:text-slate-300">
              {syncState === 'syncing' ? `Syncing (${pendingSyncCount})` : syncState === 'offline' ? 'Offline' : 'Cloud Synced'}
            </span>
          </div>
          <button
            onClick={triggerManualSync}
            className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 transition-colors cursor-pointer"
          >
            Sync
          </button>
        </div>

        {/* Grouped Navigation Links */}
        <nav className="space-y-4">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2">
                {group.title}
              </span>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== '/app' && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer',
                        isActive
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={cn(
                            'w-4 h-4 shrink-0',
                            isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                          )}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Area: User Profile & Actions */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2 mt-4">
        <button
          onClick={exportDataCSV}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Download CSV</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Export</span>
        </button>

        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-950 dark:text-white truncate">
                {displayName}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {user?.email || 'Authenticated'}
              </p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            title="Log out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
