'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ReceiptText,
  DollarSign,
  HandCoins,
  Plus,
  MoreHorizontal,
  LineChart,
  PiggyBank,
  Settings,
  X,
  Download,
  Target,
  Calendar,
  Repeat,
} from 'lucide-react';
import { useSpendy } from '@/lib/store/spendyStore';

export function BottomNav() {
  const pathname = usePathname();
  const { openQuickAdd, exportDataCSV } = useSpendy();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const moreItems = [
    { label: 'Savings & Goals', href: '/goals', icon: PiggyBank },
    { label: 'Monthly Budgets', href: '/budgets', icon: Target },
    { label: 'Financial Calendar', href: '/calendar', icon: Calendar },
    { label: 'Loans & Debts', href: '/loans', icon: HandCoins },
    { label: 'Recurring Bills', href: '/recurring', icon: Repeat },
    { label: 'Settings & Data', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Drawer Sheet */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel border-t border-black/20 dark:border-white/20 rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <h3 className="font-black text-base text-gray-950 dark:text-white">More Spendy Options</h3>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 py-4">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMoreMenu(false)}
                    className={cn(
                      'flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center gap-2 shadow-sm',
                      isActive
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold'
                    )}
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs leading-tight">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <button
              onClick={() => {
                exportDataCSV();
                setShowMoreMenu(false);
              }}
              className="w-full mt-2 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV Report</span>
            </button>
          </div>
        </div>
      )}

      {/* Fixed Bottom Navigation Bar - Strict 5-Column Grid */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-black/15 dark:border-white/15 px-2 py-1.5 grid grid-cols-5 items-center shadow-2xl safe-area-pb">
        {/* Tab 1: Dashboard */}
        <Link
          href="/app"
          className={cn(
            'flex flex-col items-center justify-center py-1 rounded-xl transition-all',
            pathname === '/app'
              ? 'text-emerald-600 dark:text-emerald-400 font-black'
              : 'text-slate-700 dark:text-slate-300 hover:text-gray-950 dark:hover:text-white font-semibold'
          )}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-bold truncate">Dashboard</span>
        </Link>

        {/* Tab 2: Transactions */}
        <Link
          href="/spending"
          className={cn(
            'flex flex-col items-center justify-center py-1 rounded-xl transition-all',
            pathname === '/spending' || pathname === '/transactions'
              ? 'text-emerald-600 dark:text-emerald-400 font-black'
              : 'text-slate-700 dark:text-slate-300 hover:text-gray-950 dark:hover:text-white font-semibold'
          )}
        >
          <ReceiptText className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-bold truncate">Activity</span>
        </Link>

        {/* Tab 3: Dedicated Center Floating Action Button (FAB) */}
        <div className="flex items-center justify-center -mt-6">
          <button
            onClick={() => openQuickAdd('expense')}
            aria-label="Quick Add Transaction"
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white flex items-center justify-center shadow-xl shadow-emerald-600/50 active:scale-90 transition-all cursor-pointer ring-4 ring-[#f8fafc] dark:ring-[#070A12]"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* Tab 4: Income */}
        <Link
          href="/income"
          className={cn(
            'flex flex-col items-center justify-center py-1 rounded-xl transition-all',
            pathname === '/income'
              ? 'text-emerald-600 dark:text-emerald-400 font-black'
              : 'text-slate-700 dark:text-slate-300 hover:text-gray-950 dark:hover:text-white font-semibold'
          )}
        >
          <DollarSign className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-bold truncate">Income</span>
        </Link>

        {/* Tab 5: More */}
        <button
          onClick={() => setShowMoreMenu(true)}
          className="flex flex-col items-center justify-center py-1 rounded-xl text-slate-700 dark:text-slate-300 hover:text-gray-950 dark:hover:text-white font-semibold transition-all cursor-pointer"
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-bold truncate">More</span>
        </button>
      </div>
    </>
  );
}
