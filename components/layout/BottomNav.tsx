'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Wallet,
  Plus,
  PiggyBank,
  MoreHorizontal,
  ReceiptText,
  Landmark,
  Target,
  Scale,
  LineChart,
  CalendarCheck2,
  Sparkles,
  Repeat,
  Settings,
  X,
} from 'lucide-react';
import { useSpendy } from '@/lib/store/spendyStore';

export function BottomNav() {
  const pathname = usePathname();
  const { openQuickAdd } = useSpendy();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const mainTabs = [
    { label: 'Home', href: '/', icon: LayoutDashboard },
    { label: 'Wallet', href: '/wallet', icon: Wallet },
    { label: 'Budgets', href: '/budgets', icon: PiggyBank },
    { label: 'More', href: '#more', icon: MoreHorizontal, isAction: true },
  ];

  const moreItems = [
    { label: 'Transactions', href: '/transactions', icon: ReceiptText },
    { label: 'Accounts', href: '/accounts', icon: Landmark },
    { label: 'Savings Goals', href: '/savings', icon: Target },
    { label: 'Debt Tracker', href: '/debts', icon: Scale },
    { label: 'Insights & Analytics', href: '/insights', icon: LineChart },
    { label: 'Monthly Review', href: '/review', icon: CalendarCheck2 },
    { label: 'Recurring Bills', href: '/recurring', icon: Repeat },
    { label: 'AI Money Coach', href: '/coach', icon: Sparkles },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* More Drawer Sheet on Mobile */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel border-t border-white/15 rounded-t-3xl p-5 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-300 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-base text-white">More Spendy Features</h3>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1.5 rounded-full bg-white/10 text-gray-300 hover:text-white"
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
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                    )}
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium leading-tight">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-white/10 px-4 py-2 flex items-center justify-around">
        {/* Left Tabs */}
        {mainTabs.slice(0, 2).map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all',
                isActive ? 'text-emerald-400 font-semibold' : 'text-gray-400 hover:text-gray-200'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[11px] mt-1">{tab.label}</span>
            </Link>
          );
        })}

        {/* Center Floating Add Button */}
        <div className="-mt-6">
          <button
            onClick={() => openQuickAdd('expense')}
            aria-label="Quick Add Expense or Income"
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 active:scale-90 transition-transform cursor-pointer border-2 border-[#0b0f19]"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
        </div>

        {/* Right Tabs */}
        {mainTabs.slice(2).map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;

          if (tab.isAction) {
            return (
              <button
                key={tab.label}
                onClick={() => setShowMoreMenu(true)}
                className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-gray-400 hover:text-gray-200 transition-all cursor-pointer"
              >
                <Icon className="w-5 h-5" />
                <span className="text-[11px] mt-1">{tab.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all',
                isActive ? 'text-emerald-400 font-semibold' : 'text-gray-400 hover:text-gray-200'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[11px] mt-1">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
