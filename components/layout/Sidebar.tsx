'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ReceiptText,
  DollarSign,
  HandCoins,
  LineChart,
  PiggyBank,
  Settings,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { useSpendy } from '@/lib/store/spendyStore';
import { formatCurrency } from '@/lib/formatters';

export function Sidebar() {
  const pathname = usePathname();
  const { dashboardMetrics, exportDataCSV } = useSpendy();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Spending Log', href: '/spending', icon: ReceiptText },
    { label: 'Income', href: '/income', icon: DollarSign },
    { label: 'Loans (Lent & Borrowed)', href: '/loans', icon: HandCoins },
    { label: 'Reports & Analytics', href: '/insights', icon: LineChart },
    { label: 'Budgets & Goals', href: '/budgets', icon: PiggyBank },
    { label: 'Settings & Data', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-[calc(100vh-65px)] glass-panel border-r border-black/10 dark:border-white/10 p-4 shrink-0">
      {/* Financial Snapshot Card in Sidebar */}
      <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-emerald-900/30 to-teal-950/40 border border-emerald-500/20">
        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
          Current Balance
        </span>
        <p className="text-lg font-black text-white font-mono mt-0.5">
          {formatCurrency(dashboardMetrics.currentBalance)}
        </p>
        <div className="flex items-center justify-between text-[10px] text-gray-400 mt-2 pt-2 border-t border-emerald-500/20">
          <span>Today:</span>
          <span className="font-semibold text-red-400 font-mono">
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
                'flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all group',
                isActive
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-black/5 dark:hover:bg-white/5'
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 transition-colors shrink-0',
                  isActive ? 'text-emerald-500' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200'
                )}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Fast CSV Export */}
      <div className="pt-3 border-t border-black/10 dark:border-white/10 space-y-2">
        <button
          onClick={exportDataCSV}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-medium border border-black/10 dark:border-white/10 transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV Report</span>
        </button>
        <p className="text-[10px] text-center text-gray-400">
          Spendy Uganda • UGX Edition
        </p>
      </div>
    </aside>
  );
}
