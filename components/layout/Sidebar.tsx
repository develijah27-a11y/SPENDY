'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Wallet,
  ReceiptText,
  Landmark,
  PiggyBank,
  Target,
  Scale,
  LineChart,
  CalendarCheck2,
  Sparkles,
  Repeat,
  Settings,
  Flame,
} from 'lucide-react';
import { useSpendy } from '@/lib/store/spendyStore';

export function Sidebar() {
  const pathname = usePathname();
  const { financialHealth } = useSpendy();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Spendy Wallet', href: '/wallet', icon: Wallet, badge: 'Pay' },
    { label: 'Transactions', href: '/transactions', icon: ReceiptText },
    { label: 'Accounts', href: '/accounts', icon: Landmark },
    { label: 'Monthly Budgets', href: '/budgets', icon: PiggyBank },
    { label: 'Savings Goals', href: '/savings', icon: Target },
    { label: 'Debt Tracker', href: '/debts', icon: Scale },
    { label: 'Financial Goals', href: '/goals', icon: Flame },
    { label: 'Spending Insights', href: '/insights', icon: LineChart },
    { label: 'Monthly Review', href: '/review', icon: CalendarCheck2 },
    { label: 'Recurring Bills', href: '/recurring', icon: Repeat },
    { label: 'AI Money Coach', href: '/coach', icon: Sparkles, badge: 'AI' },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-[calc(100vh-65px)] glass-panel border-r border-white/10 p-4 shrink-0">
      {/* Financial Health Mini Banner */}
      <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-emerald-900/30 to-teal-950/40 border border-emerald-500/20">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-300">Financial Health</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            {financialHealth.overallScore}/100 ({financialHealth.grade})
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-1.5 mt-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${financialHealth.overallScore}%` }}
          />
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group',
                isActive
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'w-4 h-4 transition-colors',
                    isActive ? 'text-emerald-400' : 'text-gray-400 group-hover:text-gray-200'
                  )}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    'text-[10px] uppercase font-bold px-1.5 py-0.5 rounded',
                    item.badge === 'AI'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="pt-4 border-t border-white/10 text-center">
        <p className="text-[11px] text-gray-500">Spendy Uganda • v1.0.0</p>
        <p className="text-[10px] text-gray-600">Built for UGX & East Africa</p>
      </div>
    </aside>
  );
}
