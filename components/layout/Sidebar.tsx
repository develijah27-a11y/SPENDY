'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ReceiptText,
  DollarSign,
  HandCoins,
  LineChart,
  PiggyBank,
  Settings,
  Download,
  LogOut,
  Wallet,
  Calendar,
  Target,
  Repeat,
} from 'lucide-react';
import { useSpendy } from '@/lib/store/spendyStore';
import { formatCurrency } from '@/lib/formatters';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { dashboardMetrics, exportDataCSV, user, signOut } = useSpendy();

  const navItems = [
    { label: 'Dashboard', href: '/app', icon: LayoutDashboard },
    { label: 'Transactions', href: '/spending', icon: ReceiptText },
    { label: 'Income', href: '/income', icon: DollarSign },
    { label: 'Savings', href: '/savings', icon: PiggyBank },
    { label: 'Budgets', href: '/budgets', icon: Target },
    { label: 'Reports', href: '/reports', icon: LineChart },
    { label: 'Calendar', href: '/calendar', icon: Calendar },
    { label: 'Loans & Debts', href: '/loans', icon: HandCoins },
    { label: 'Recurring Bills', href: '/recurring', icon: Repeat },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-[calc(100vh-65px)] glass-panel border-r border-black/15 dark:border-white/15 p-4 shrink-0 shadow-lg">
      {/* Financial Snapshot Card in Sidebar */}
      <div className="mb-4 p-4 rounded-3xl bg-gradient-to-br from-emerald-950/60 via-emerald-900/40 to-teal-950/60 border border-emerald-500/30 shadow-md">
        <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
          Total Net Balance
        </span>
        <p className="text-xl font-black text-white font-mono mt-1">
          {formatCurrency(dashboardMetrics.currentBalance)}
        </p>
        <div className="flex items-center justify-between text-xs text-slate-200 mt-2.5 pt-2.5 border-t border-emerald-500/25">
          <span className="font-semibold">Today Spent:</span>
          <span className="font-black text-red-400 font-mono">
            - {formatCurrency(dashboardMetrics.todaySpending)}
          </span>
        </div>
      </div>

      {/* Navigation Links with unambiguous Icon + Label */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href === '/spending' && pathname === '/transactions');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all group',
                isActive
                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-700 dark:text-slate-200 hover:text-gray-950 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 transition-colors shrink-0',
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-500 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
                )}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Footer Actions */}
      <div className="pt-3 border-t border-slate-200 dark:border-white/10 space-y-2">
        {/* User Card */}
        <div className="flex items-center justify-between p-2 rounded-2xl bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-gray-950 dark:text-white truncate">
                {user?.full_name || 'Spendy User'}
              </p>
              <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                {user?.email || 'user@spendy.ug'}
              </p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            title="Sign Out"
            className="p-1.5 rounded-xl hover:bg-red-500/10 text-slate-500 hover:text-red-500 dark:text-slate-300 dark:hover:text-red-400 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* CSV Export Button */}
        <button
          onClick={exportDataCSV}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Full CSV Report</span>
        </button>

        <p className="text-[10px] font-semibold text-center text-slate-600 dark:text-slate-300">
          Spendy Uganda • UGX Edition
        </p>
      </div>
    </aside>
  );
}
