'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Landmark,
  Scale,
  Repeat,
  Sparkles,
  Calendar,
  CalendarCheck2,
  Tag,
  ArrowUpRight,
  ChevronRight,
  Users,
  Navigation,
  Clock,
  TrendingDown,
  TrendingUp,
  FileText,
  MessageSquare,
} from 'lucide-react';
import { useSpendy } from '@/lib/store/spendyStore';

export function BottomNav() {
  const pathname = usePathname();
  const { openQuickAdd, exportDataCSV } = useSpendy();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setShowMoreMenu(false);
      }
    }
    if (showMoreMenu) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [showMoreMenu]);

  // Sections of features for the mobile drawer
  const featureSections = [
    {
      title: 'Money Operations',
      items: [
        { label: 'Accounts & Wallets', href: '/accounts', icon: Landmark, desc: 'MTN MoMo, Airtel & Banks', badge: null },
        { label: 'Income Inflows', href: '/income', icon: ArrowUpRight, desc: 'Track salaries & business earnings', badge: null },
        { label: 'Transaction Logs', href: '/transactions', icon: ReceiptText, desc: 'Search & filter history', badge: null },
      ],
    },
    {
      title: 'Planning & Commitments',
      items: [
        { label: 'Investments', href: '/investments', icon: TrendingUp, desc: 'Unit trusts, T-bills & land', badge: 'New' },
        { label: 'Monthly Budgets', href: '/budgets', icon: PiggyBank, desc: 'Category spending caps', badge: null },
        { label: 'Savings Milestones', href: '/goals', icon: Target, desc: 'Emergency funds & goals', badge: null },
        { label: 'SACCO & Chamas', href: '/sacco', icon: Users, desc: 'Group shares, pool & dividends', badge: 'New' },
        { label: 'Commute Meter', href: '/commute', icon: Navigation, desc: 'Daily Boda & taxi fuel burner', badge: 'New' },
        { label: 'Recurring Subscriptions', href: '/recurring', icon: Repeat, desc: 'Rent, Yaka, WiFi & bills', badge: null },
        { label: 'Debt & Loan Tracker', href: '/debts', icon: Scale, desc: 'Track owed money & repayments', badge: null },
      ],
    },
    {
      title: 'Intelligence & Review',
      items: [
        { label: 'Survival Runway', href: '/runway', icon: Clock, desc: 'Emergency survival calculator', badge: 'New' },
        { label: 'Inflation Shield', href: '/inflation', icon: TrendingDown, desc: 'Uganda purchasing power hedger', badge: 'New' },
        { label: 'SMS Auto-Parser', href: '/sms-parser', icon: MessageSquare, desc: 'MTN & Airtel SMS to activity', badge: 'AI' },
        { label: 'AI Financial Coach', href: '/coach', icon: Sparkles, desc: 'Personalized spending advice', badge: 'AI' },
        { label: 'Cashflow Calendar', href: '/calendar', icon: Calendar, desc: 'Daily income & expense matrix', badge: null },
        { label: 'Insights & Analytics', href: '/reports', icon: PieChart, desc: 'Category distribution & trends', badge: null },
        { label: 'Monthly Debrief', href: '/review', icon: CalendarCheck2, desc: 'Month-end financial review', badge: null },
      ],
    },
    {
      title: 'System & Tools',
      items: [
        { label: 'Spending Categories', href: '/categories', icon: Tag, desc: 'Uganda taxonomy setup', badge: null },
        { label: 'Settings & Security', href: '/settings', icon: Settings, desc: 'Preferences, profile & PIN', badge: null },
      ],
    },
  ];

  const isMoreActive = [
    '/goals',
    '/reports',
    '/settings',
    '/accounts',
    '/debts',
    '/recurring',
    '/coach',
    '/calendar',
    '/review',
    '/categories',
    '/income',
  ].some((path) => pathname.startsWith(path));

  return (
    <>
      {/* Mobile Drawer Sheet */}
      {showMoreMenu && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Spendy Navigation Hub"
          className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowMoreMenu(false);
          }}
        >
          <div
            ref={drawerRef}
            className="bg-white dark:bg-[#0F172A] border-t border-slate-200 dark:border-slate-800 rounded-t-[28px] max-h-[88vh] flex flex-col animate-in slide-in-from-bottom duration-200 shadow-2xl"
          >
            {/* Grab handle & header */}
            <div className="pt-3 pb-3 px-5 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3" />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-base text-slate-950 dark:text-white flex items-center gap-2">
                    <span>Feature Hub</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Spendy
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    All financial tools and operations
                  </p>
                </div>
                <button
                  onClick={() => setShowMoreMenu(false)}
                  aria-label="Close menu"
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white cursor-pointer touch-target flex items-center justify-center active:scale-95 transition-transform"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Hub Content */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-5 pb-safe">
              {featureSections.map((section) => (
                <div key={section.title} className="space-y-2">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
                    {section.title}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href || (item.href !== '/app' && pathname.startsWith(item.href));
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          prefetch={true}
                          onClick={() => setShowMoreMenu(false)}
                          className={cn(
                            'flex items-center justify-between p-3 rounded-2xl border transition-all text-left shadow-2xs cursor-pointer touch-target active:scale-[0.98]',
                            isActive
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold'
                              : 'bg-slate-50/80 dark:bg-[#0B101D] border-slate-200/80 dark:border-slate-800/80 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={cn(
                                'p-2 rounded-xl shrink-0',
                                isActive
                                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                              )}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold leading-tight truncate text-slate-950 dark:text-white">
                                {item.label}
                              </p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                {item.desc}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            {item.badge && (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                {item.badge}
                              </span>
                            )}
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Data Export Button */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <Link
                  href="/review"
                  onClick={() => setShowMoreMenu(false)}
                  className="w-full py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 cursor-pointer touch-target active:scale-98 transition-transform"
                >
                  <FileText className="w-4 h-4 text-emerald-500" />
                  <span>Monthly Financial Statement (PDF)</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Navigation Bar - Mobile Thumb Zone */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#090D16]/95 border-t border-slate-200/90 dark:border-slate-800/90 px-2 pt-1 pb-[calc(env(safe-area-inset-bottom,0px)+0.35rem)] grid grid-cols-5 items-center shadow-lg backdrop-blur-xl"
      >
        {/* Tab 1: Home */}
        <Link
          href="/app"
          prefetch={true}
          className={cn(
            'flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer touch-target select-none',
            pathname === '/app'
              ? 'text-emerald-600 dark:text-emerald-400 font-black'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white font-semibold'
          )}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Home</span>
        </Link>

        {/* Tab 2: Transactions */}
        <Link
          href="/transactions"
          prefetch={true}
          className={cn(
            'flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer touch-target select-none',
            pathname.startsWith('/transactions')
              ? 'text-emerald-600 dark:text-emerald-400 font-black'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white font-semibold'
          )}
        >
          <ReceiptText className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Activity</span>
        </Link>

        {/* Tab 3: Quick Add (+) Thumb Button */}
        <div className="flex items-center justify-center">
          <button
            onClick={() => openQuickAdd('expense')}
            aria-label="Add transaction"
            className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer touch-target"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* Tab 4: Budgets */}
        <Link
          href="/budgets"
          prefetch={true}
          className={cn(
            'flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer touch-target select-none',
            pathname.startsWith('/budgets')
              ? 'text-emerald-600 dark:text-emerald-400 font-black'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white font-semibold'
          )}
        >
          <PiggyBank className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Budgets</span>
        </Link>

        {/* Tab 5: Feature Hub ("More") */}
        <button
          onClick={() => setShowMoreMenu(true)}
          aria-label="Open More navigation tools"
          aria-expanded={showMoreMenu}
          className={cn(
            'flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer touch-target select-none',
            isMoreActive
              ? 'text-emerald-600 dark:text-emerald-400 font-black'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white font-semibold'
          )}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Hub</span>
        </button>
      </nav>
    </>
  );
}
