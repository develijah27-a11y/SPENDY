'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ReceiptText,
  DollarSign,
  LineChart,
  Target,
  PiggyBank,
  Settings,
  Download,
  LogOut,
  Plus,
} from 'lucide-react';
import { useSpendy } from '@/lib/store/spendyStore';
import { useAuth } from '@/lib/auth/AuthContext';
import { formatCurrency } from '@/lib/formatters';
import { SpendyLogo } from '@/components/ui/SpendyLogo';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { dashboardMetrics, exportDataCSV, openQuickAdd } = useSpendy();
  const { user, profile, signOut } = useAuth();

  const navItems = [
    { label: 'Dashboard', href: '/app', icon: LayoutDashboard },
    { label: 'Activity', href: '/transactions', icon: ReceiptText },
    { label: 'Income', href: '/income', icon: DollarSign },
    { label: 'Budgets', href: '/budgets', icon: PiggyBank },
    { label: 'Goals', href: '/goals', icon: Target },
    { label: 'Analytics', href: '/reports', icon: LineChart },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 glass-panel border-r border-black/10 dark:border-white/10 p-5 shrink-0 shadow-lg z-30">
      {/* Brand Header */}
      <div className="pb-5 border-b border-black/10 dark:border-white/10">
        <Link href="/app" className="inline-block cursor-pointer">
          <SpendyLogo size="sm" showTagline={false} />
        </Link>
      </div>

      {/* Quick Add Button */}
      <div className="py-4">
        <button
          onClick={() => openQuickAdd('expense')}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md shadow-emerald-600/25 active:scale-98 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Record Transaction</span>
        </button>
      </div>

      {/* Total Balance Snapshot */}
      <div className="mb-4 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 space-y-1">
        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          Total Net Balance
        </span>
        <p className="text-xl font-black text-gray-950 dark:text-white font-mono">
          {formatCurrency(dashboardMetrics.currentBalance)}
        </p>
        <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
          UGX Account Ledger
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href === '/transactions' && (pathname === '/transactions' || pathname === '/spending')) ||
            (item.href === '/goals' && (pathname === '/goals' || pathname === '/savings'));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all group cursor-pointer',
                isActive
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 shadow-sm font-black'
                  : 'text-slate-600 dark:text-slate-300 hover:text-gray-950 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 transition-colors shrink-0',
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
                )}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Footer & CSV Export */}
      <div className="pt-4 border-t border-black/10 dark:border-white/10 space-y-2.5">
        <div className="flex items-center justify-between p-2 rounded-xl bg-black/5 dark:bg-white/5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-gray-950 dark:text-white truncate">
                {displayName}
              </p>
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                {user?.email || 'Active Account'}
              </p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            title="Sign Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={exportDataCSV}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-gray-950 dark:text-white text-xs font-bold border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export CSV</span>
        </button>
      </div>
    </aside>
  );
}
