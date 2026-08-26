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
} from 'lucide-react';
import { useSpendy } from '@/lib/store/spendyStore';

export function BottomNav() {
  const pathname = usePathname();
  const { openQuickAdd, exportDataCSV } = useSpendy();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const mainTabs = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Spending', href: '/spending', icon: ReceiptText },
    { label: 'Income', href: '/income', icon: DollarSign },
    { label: 'Loans', href: '/loans', icon: HandCoins },
  ];

  const moreItems = [
    { label: 'Reports & Analytics', href: '/insights', icon: LineChart },
    { label: 'Budgets & Goals', href: '/budgets', icon: PiggyBank },
    { label: 'Settings & Data', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Drawer Sheet */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel border-t border-black/10 dark:border-white/15 rounded-t-3xl p-5 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-300 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">More Options</h3>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1.5 rounded-full bg-black/5 dark:bg-white/10 text-gray-500 dark:text-gray-300"
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
                      'flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center gap-2',
                      isActive
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-600 dark:text-emerald-300'
                        : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-gray-700 dark:text-gray-300'
                    )}
                  >
                    <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center text-emerald-500">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold leading-tight">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <button
              onClick={() => {
                exportDataCSV();
                setShowMoreMenu(false);
              }}
              className="w-full mt-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV Report</span>
            </button>
          </div>
        </div>
      )}

      {/* Fixed Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-black/10 dark:border-white/10 px-2 py-2 flex items-center justify-around">
        {mainTabs.slice(0, 2).map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href || (tab.href === '/spending' && pathname === '/transactions');
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all',
                isActive ? 'text-emerald-500 font-bold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-1">{tab.label}</span>
            </Link>
          );
        })}

        {/* Center Quick Add Button */}
        <div className="-mt-6">
          <button
            onClick={() => openQuickAdd('expense')}
            aria-label="Quick Add Money Entry"
            className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/40 active:scale-90 transition-transform cursor-pointer border-2 border-white dark:border-[#0b0f19]"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {mainTabs.slice(2).map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all',
                isActive ? 'text-emerald-500 font-bold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-1">{tab.label}</span>
            </Link>
          );
        })}

        {/* More Button */}
        <button
          onClick={() => setShowMoreMenu(true)}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-all cursor-pointer"
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px] mt-1">More</span>
        </button>
      </div>
    </>
  );
}
