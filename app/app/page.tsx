'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { useSpendy } from '@/lib/store/spendyStore';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { formatCurrency, isDateInPeriod } from '@/lib/formatters';
import { formatSingleName } from '@/lib/utils';
import { PeriodFilter } from '@/types';
import {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  ChevronRight,
  PieChart,
  Users,
  Navigation,
  Clock,
  TrendingDown,
  MessageSquare,
  Sparkles,
  ReceiptText,
  PiggyBank,
  Target,
} from 'lucide-react';
import { BalanceOverviewCard } from '@/components/dashboard/BalanceOverviewCard';
import { SafeToSpendCard } from '@/components/dashboard/SafeToSpendCard';
import { FinancialHealthWidget } from '@/components/dashboard/FinancialHealthWidget';
import { BudgetProgressWidget } from '@/components/dashboard/BudgetProgressWidget';
import { RecentTransactionsWidget } from '@/components/dashboard/RecentTransactionsWidget';
import { SavingsGoalWidget } from '@/components/dashboard/SavingsGoalWidget';

function DashboardMainContent() {
  const { user, profile } = useAuth();
  const {
    transactions,
    categories,
    openQuickAdd,
    periodFilter,
    setPeriodFilter,
  } = useSpendy();

  const [activeTab, setActiveTab] = useState<'activity' | 'breakdown' | 'budgets' | 'goals'>('activity');

  // Filter transactions according to selected period
  const periodTransactions = useMemo(() => {
    return transactions.filter((t) => isDateInPeriod(t.transaction_date, periodFilter));
  }, [transactions, periodFilter]);

  // Aggregate Metrics for the selected period
  const periodIncome = useMemo(() => {
    return periodTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [periodTransactions]);

  const periodExpense = useMemo(() => {
    return periodTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [periodTransactions]);

  const periodSavings = periodIncome - periodExpense;
  const savingsRate = periodIncome > 0 ? (Math.max(0, periodSavings) / periodIncome) * 100 : 0;

  // Greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const cleanFirstName = useMemo(() => {
    const raw = profile?.full_name || user?.user_metadata?.full_name || user?.email;
    return formatSingleName(raw, 'Friend');
  }, [profile, user]);

  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  // Category spending aggregation in active period
  const topCategories = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of periodTransactions.filter((x) => x.type === 'expense')) {
      map[t.category_id] = (map[t.category_id] || 0) + t.amount;
    }

    return Object.entries(map)
      .map(([catId, amount]) => {
        const cat = categories.find((c) => c.id === catId);
        const pct = periodExpense > 0 ? (amount / periodExpense) * 100 : 0;
        return {
          id: catId,
          name: cat?.name || 'Uncategorized',
          color: cat?.color || '#10B981',
          amount,
          pct,
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [periodTransactions, categories, periodExpense]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* 1. Top Header with Greeting & Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
            {greeting}, {cleanFirstName}
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
            {todayFormatted}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 hidden sm:inline">
              Period:
            </span>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value as PeriodFilter)}
              aria-label="Select reporting time period"
              className="px-3 py-2 rounded-xl bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer touch-target"
            >
              <option value="today">Today</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="this_year">This Year</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <button
            onClick={() => openQuickAdd('expense')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all active:scale-98 cursor-pointer touch-target shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
            <span>Record Activity</span>
          </button>
        </div>
      </div>

      {/* 2. Zero-Data Onboarding State */}
      {transactions.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#0B0F19] border border-slate-200/90 dark:border-slate-800/90 text-center max-w-2xl mx-auto space-y-4 my-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto font-bold">
            <Wallet className="w-7 h-7" aria-hidden="true" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">
              Your financial picture starts here.
            </h2>
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Record your initial cash, bank, or mobile money balance to activate multi-account tracking and Safe-to-Spend limits.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <button
              onClick={() => openQuickAdd('income')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all active:scale-98 cursor-pointer touch-target flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Record First Income</span>
            </button>
            <button
              onClick={() => openQuickAdd('expense')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all cursor-pointer touch-target flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Record Expense</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* 3. Hero Financial Command Center (7 / 5 Grid) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            <div className="lg:col-span-7">
              <BalanceOverviewCard />
            </div>
            <div className="lg:col-span-5">
              <SafeToSpendCard />
            </div>
          </div>

          {/* 4. Financial Vitals Ticker (Clean Neutral Slate Surface) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Income in period */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0B0F19] border border-slate-200/90 dark:border-slate-800/90 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Total Inflow
                </span>
                <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white font-mono tabular-nums">
                + {formatCurrency(periodIncome)}
              </p>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {periodTransactions.filter((t) => t.type === 'income').length} entries in period
              </p>
            </div>

            {/* Expenses in period */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0B0F19] border border-slate-200/90 dark:border-slate-800/90 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Total Outflow
                </span>
                <span className="p-1 rounded-lg bg-rose-500/10 text-rose-500">
                  <ArrowDownRight className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white font-mono tabular-nums">
                - {formatCurrency(periodExpense)}
              </p>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {periodTransactions.filter((t) => t.type === 'expense').length} entries in period
              </p>
            </div>

            {/* Net Cashflow in period */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0B0F19] border border-slate-200/90 dark:border-slate-800/90 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Net Cashflow
                </span>
              </div>
              <p
                className={`text-xl sm:text-2xl font-black font-mono tabular-nums ${
                  periodSavings >= 0 ? 'text-slate-950 dark:text-white' : 'text-rose-500'
                }`}
              >
                {formatCurrency(periodSavings)}
              </p>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Inflow minus outflow
              </p>
            </div>

            {/* Savings Rate */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0B0F19] border border-slate-200/90 dark:border-slate-800/90 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Savings Rate
                </span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                {savingsRate.toFixed(0)}%
              </p>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Portion of income retained
              </p>
            </div>
          </div>

          {/* 5. Focused Workspace: One Focused View at a Time Instead of Cluttered Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 space-y-4">
              {/* Clean Segmented Tab Switcher */}
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'activity'
                      ? 'bg-white dark:bg-[#0B0F19] text-emerald-600 dark:text-emerald-400 border border-slate-200/80 dark:border-slate-800'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  <ReceiptText className="w-3.5 h-3.5" />
                  <span>Recent Activity</span>
                </button>

                <button
                  onClick={() => setActiveTab('breakdown')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'breakdown'
                      ? 'bg-white dark:bg-[#0B0F19] text-emerald-600 dark:text-emerald-400 border border-slate-200/80 dark:border-slate-800'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  <PieChart className="w-3.5 h-3.5" />
                  <span>Category Breakdown</span>
                </button>

                <button
                  onClick={() => setActiveTab('budgets')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'budgets'
                      ? 'bg-white dark:bg-[#0B0F19] text-emerald-600 dark:text-emerald-400 border border-slate-200/80 dark:border-slate-800'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  <PiggyBank className="w-3.5 h-3.5" />
                  <span>Budgets</span>
                </button>

                <button
                  onClick={() => setActiveTab('goals')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'goals'
                      ? 'bg-white dark:bg-[#0B0F19] text-emerald-600 dark:text-emerald-400 border border-slate-200/80 dark:border-slate-800'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Savings Goals</span>
                </button>
              </div>

              {/* Render Selected View */}
              {activeTab === 'activity' && <RecentTransactionsWidget />}

              {activeTab === 'breakdown' && (
                <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0B0F19] border border-slate-200/90 dark:border-slate-800/90 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <PieChart className="w-5 h-5 font-black" aria-hidden="true" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-slate-950 dark:text-white">
                          Spending by Category
                        </h2>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          Allocation in selected period
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/reports"
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <span>Reports</span>
                      <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </Link>
                  </div>

                  {topCategories.length === 0 ? (
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 py-6 text-center">
                      No expense records in this period.
                    </p>
                  ) : (
                    <div className="space-y-3 pt-1">
                      {topCategories.map((cat) => (
                        <div key={cat.id} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {cat.name}
                            </span>
                            <span className="font-mono font-bold text-slate-950 dark:text-white tabular-nums">
                              {formatCurrency(cat.amount)} ({cat.pct.toFixed(0)}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.min(100, Math.max(4, cat.pct))}%`,
                                backgroundColor: cat.color,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'budgets' && <BudgetProgressWidget />}

              {activeTab === 'goals' && <SavingsGoalWidget />}
            </div>

            {/* Right Column (4 cols): Financial Health Assessment */}
            <div className="lg:col-span-4 space-y-4">
              <FinancialHealthWidget />
            </div>
          </div>

          {/* 6. Regional Intelligence & East Africa Suite (Refined Monochromatic Dock) */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0B0F19] border border-slate-200/90 dark:border-slate-800/90 space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Regional Financial Intelligence
                  </h2>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Localized tools for Ugandan Mobile Money, SACCOs, and inflation resilience
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
              <Link
                href="/sms-parser"
                prefetch={true}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500/40 hover:bg-slate-100 dark:hover:bg-slate-850 transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="p-2 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:text-emerald-500 transition-colors">
                    <MessageSquare className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    Smart
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">SMS Parser</h3>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">MTN &amp; Airtel text sync</p>
                </div>
              </Link>

              <Link
                href="/sacco"
                prefetch={true}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500/40 hover:bg-slate-100 dark:hover:bg-slate-850 transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="p-2 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:text-emerald-500 transition-colors">
                    <Users className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    Chamas
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">SACCO Hub</h3>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">Shares &amp; group loans</p>
                </div>
              </Link>

              <Link
                href="/commute"
                prefetch={true}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500/40 hover:bg-slate-100 dark:hover:bg-slate-850 transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="p-2 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:text-emerald-500 transition-colors">
                    <Navigation className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    Transit
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">Commute Meter</h3>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">Boda &amp; taxi cost burner</p>
                </div>
              </Link>

              <Link
                href="/runway"
                prefetch={true}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500/40 hover:bg-slate-100 dark:hover:bg-slate-850 transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="p-2 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:text-emerald-500 transition-colors">
                    <Clock className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    Buffer
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">Liquid Runway</h3>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">Emergency survival days</p>
                </div>
              </Link>

              <Link
                href="/inflation"
                prefetch={true}
                className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500/40 hover:bg-slate-100 dark:hover:bg-slate-850 transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="p-2 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:text-emerald-500 transition-colors">
                    <TrendingDown className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    Purchasing
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">Inflation Shield</h3>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">Erosion simulator</p>
                </div>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardMainContent />
    </ProtectedRoute>
  );
}
