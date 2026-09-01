'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ReceiptText,
  DollarSign,
  Plus,
  MoreHorizontal,
  LineChart,
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
    { label: 'Budgets', href: '/budgets', icon: PiggyBank, desc: 'Spending limits' },
    { label: 'Savings Goals', href: '/goals', icon: Target, desc: 'Target milestones' },
    { label: 'Analytics', href: '/reports', icon: LineChart, desc: 'Reports & trends' },
    { label: 'Settings', href: '/settings', icon: Settings, desc: 'Preferences & account' },
  ];

  return (
    <>
      {/* Mobile Drawer Sheet */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel border-t border-black/15 dark:border-white/15 rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <h3 className="font-black text-sm text-gray-950 dark:text-white">More Options</h3>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-gray-950 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 py-4">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href === '/goals' && pathname === '/savings');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMoreMenu(false)}
                    className={cn(
                      'flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left shadow-sm cursor-pointer',
                      isActive
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                    )}
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
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
              className="w-full mt-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV Report</span>
            </button>
          </div>
        </div>
      )}

      {/* Fixed Bottom Navigation Bar - Strict 5-Column Grid */}
      <nav aria-label="Mobile Navigation" className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-black/10 dark:border-white/10 px-2 py-1.5 grid grid-cols-5 items-center shadow-2xl safe-area-pb bg-[#f8fafc]/95 dark:bg-[#070A12]/95 backdrop-blur-xl">
        {/* Tab 1: Dashboard */}
        <Link
          href="/app"
          className={cn(
            'flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer',
            pathname === '/app'
              ? 'text-emerald-600 dark:text-emerald-400 font-black'
              : 'text-slate-500 dark:text-slate-400 hover:text-gray-950 dark:hover:text-white font-semibold'
          )}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-bold truncate">Dashboard</span>
        </Link>

        {/* Tab 2: Activity */}
        <Link
          href="/transactions"
          className={cn(
            'flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer',
            pathname === '/transactions' || pathname === '/spending'
              ? 'text-emerald-600 dark:text-emerald-400 font-black'
              : 'text-slate-500 dark:text-slate-400 hover:text-gray-950 dark:hover:text-white font-semibold'
          )}
        >
          <ReceiptText className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-bold truncate">Activity</span>
        </Link>

        {/* Tab 3: Dedicated Center Floating Action Button (FAB) */}
        <div className="flex items-center justify-center -mt-5">
          <button
            onClick={() => openQuickAdd('expense')}
            aria-label="Add Transaction"
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-600/40 active:scale-90 transition-all cursor-pointer ring-4 ring-[#f8fafc] dark:ring-[#070A12]"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* Tab 4: Income */}
        <Link
          href="/income"
          className={cn(
            'flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer',
            pathname === '/income'
              ? 'text-emerald-600 dark:text-emerald-400 font-black'
              : 'text-slate-500 dark:text-slate-400 hover:text-gray-950 dark:hover:text-white font-semibold'
          )}
        >
          <DollarSign className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-bold truncate">Income</span>
        </Link>

        {/* Tab 5: More */}
        <button
          onClick={() => setShowMoreMenu(true)}
          className="flex flex-col items-center justify-center py-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-gray-950 dark:hover:text-white font-semibold transition-all cursor-pointer"
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-bold truncate">More</span>
        </button>
      </nav>
    </>
  );
}
