'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ReceiptText,
  Plus,
  MoreHorizontal,
  PieChart,
  Target,
  PiggyBank,
  Settings,
  X,
  Download,
} from 'lucide-react';
import { useSpendy } from '@/lib/store/spendyStore';

export function BottomNav() {
  const pathname = usePathname();
  const { openQuickAdd, exportDataCSV } = useSpendy();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const moreItems = [
    { label: 'Goals', href: '/goals', icon: Target, desc: 'Target milestones' },
    { label: 'Insights', href: '/reports', icon: PieChart, desc: 'Spending allocation' },
    { label: 'Settings', href: '/settings', icon: Settings, desc: 'Preferences & profile' },
  ];

  return (
    <>
      {/* Mobile Drawer Sheet */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#0E1628] border-t border-slate-200 dark:border-slate-800 rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-150 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-950 dark:text-white">More Options</h3>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white cursor-pointer touch-target flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMoreMenu(false)}
                    className={cn(
                      'flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left shadow-xs cursor-pointer touch-target',
                      isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    )}
                  >
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold leading-tight truncate">{item.label}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{item.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>

            <button
              onClick={() => {
                exportDataCSV();
                setShowMoreMenu(false);
              }}
              className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 cursor-pointer touch-target"
            >
              <Download className="w-4 h-4" />
              <span>Download Report</span>
            </button>
          </div>
        </div>
      )}

      {/* Fixed Bottom Navigation Bar - Strict 5-Column Grid */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#070A12]/95 border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 grid grid-cols-5 items-center shadow-lg backdrop-blur-xl"
      >
        {/* Tab 1: Home */}
        <Link
          href="/app"
          className={cn(
            'flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer touch-target',
            pathname === '/app'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white font-medium'
          )}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Home</span>
        </Link>

        {/* Tab 2: Transactions */}
        <Link
          href="/transactions"
          className={cn(
            'flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer touch-target',
            pathname.startsWith('/transactions')
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white font-medium'
          )}
        >
          <ReceiptText className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">History</span>
        </Link>

        {/* Tab 3: Quick Add (+) */}
        <div className="flex items-center justify-center">
          <button
            onClick={() => openQuickAdd('expense')}
            aria-label="Add transaction"
            className="w-11 h-11 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer touch-target"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab 4: Budgets */}
        <Link
          href="/budgets"
          className={cn(
            'flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer touch-target',
            pathname.startsWith('/budgets')
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white font-medium'
          )}
        >
          <PiggyBank className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Budgets</span>
        </Link>

        {/* Tab 5: More Options */}
        <button
          onClick={() => setShowMoreMenu(true)}
          className={cn(
            'flex flex-col items-center justify-center py-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white font-medium transition-all cursor-pointer touch-target',
            pathname === '/goals' || pathname === '/reports' || pathname === '/settings'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : ''
          )}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">More</span>
        </button>
      </nav>
    </>
  );
}
