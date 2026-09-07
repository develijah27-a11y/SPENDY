'use client';

import React, { useMemo } from 'react';
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
    <div className="space-y-6 max-w-7xl mx-auto pb-6">
      {/* 1. Top Header with Greeting & Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
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
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-2xs touch-target"
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
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 transition-all active:scale-98 cursor-pointer touch-target shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {/* 2. Zero-Data Onboarding Card */}
      {transactions.length === 0 ? (
        <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-[#0E1628] border border-slate-200 dark:border-slate-800 shadow-sm text-center max-w-2xl mx-auto space-y-4 my-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto font-bold shadow-xs">
            <Wallet className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">
              Your financial picture starts here.
            </h2>
            <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Add your first income or expense to activate your Uganda multi-account balances, Safe-to-Spend calculations, and budgets.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <button
              onClick={() => openQuickAdd('income')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all active:scale-98 cursor-pointer touch-target flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Record First Income</span>
            </button>
            <button
              onClick={() => openQuickAdd('expense')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all cursor-pointer touch-target flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Record Expense</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* 3. Hero Financial Cards: Balance Overview & Safe to Spend */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7">
              <BalanceOverviewCard />
            </div>
            <div className="lg:col-span-5">
              <SafeToSpendCard />
            </div>
          </div>

          {/* 4. Secondary Metrics (Income, Expense, Net Savings, Rate in selected period) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Income in period */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0E1628] border border-slate-200/90 dark:border-slate-800/90 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Income
                </span>
                <span className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                + {formatCurrency(periodIncome)}
              </p>
              <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {periodTransactions.filter((t) => t.type === 'income').length} entries in period
              </p>
            </div>

            {/* Expenses in period */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0E1628] border border-slate-200/90 dark:border-slate-800/90 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Expenses
                </span>
                <span className="p-1 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-red-600 dark:text-red-400 font-mono tabular-nums">
                - {formatCurrency(periodExpense)}
              </p>
              <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {periodTransactions.filter((t) => t.type === 'expense').length} entries in period
              </p>
            </div>

            {/* Net Savings in period */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0E1628] border border-slate-200/90 dark:border-slate-800/90 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Net Cashflow
                </span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white font-mono tabular-nums">
                {formatCurrency(periodSavings)}
              </p>
              <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Inflow minus outflow
              </p>
            </div>

            {/* Savings Rate */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0E1628] border border-slate-200/90 dark:border-slate-800/90 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Savings Rate
                </span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 font-mono tabular-nums">
                {savingsRate.toFixed(0)}%
              </p>
              <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Portion of income preserved
              </p>
            </div>
          </div>

          {/* East Africa Smart Financial Suite */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0E1628] border border-slate-200/90 dark:border-slate-800/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Uganda Smart Financial Suite
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    East Africa localized tools &amp; intelligence simulators
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
              <Link
                href="/sms-parser"
                prefetch={true}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/80 hover:border-teal-500/50 hover:bg-white dark:hover:bg-slate-900 hover:shadow-xs transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="p-2 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-teal-500/15 text-teal-700 dark:text-teal-300">
                    AI
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white">SMS Parser</h3>
                  <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">MTN &amp; Airtel texts</p>
                </div>
              </Link>

              <Link
                href="/sacco"
                prefetch={true}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/80 hover:border-emerald-500/50 hover:bg-white dark:hover:bg-slate-900 hover:shadow-xs transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                    <Users className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                    New
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white">SACCO &amp; Chamas</h3>
                  <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">Shares &amp; dividends</p>
                </div>
              </Link>

              <Link
                href="/commute"
                prefetch={true}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/80 hover:border-blue-500/50 hover:bg-white dark:hover:bg-slate-900 hover:shadow-xs transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="p-2 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    <Navigation className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-blue-500/15 text-blue-700 dark:text-blue-300">
                    New
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white">Commute Meter</h3>
                  <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">Boda &amp; taxi burner</p>
                </div>
              </Link>

              <Link
                href="/runway"
                prefetch={true}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/80 hover:border-amber-500/50 hover:bg-white dark:hover:bg-slate-900 hover:shadow-xs transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                    <Clock className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300">
                    New
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white">Survival Runway</h3>
                  <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">Liquid buffer days</p>
                </div>
              </Link>

              <Link
                href="/inflation"
                prefetch={true}
                className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/80 hover:border-rose-500/50 hover:bg-white dark:hover:bg-slate-900 hover:shadow-xs transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="p-2 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
                    <TrendingDown className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-rose-500/15 text-rose-700 dark:text-rose-300">
                    New
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white">Inflation Shield</h3>
                  <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">Purchasing power</p>
                </div>
              </Link>
            </div>
          </div>

          {/* 5. Main Dashboard Feed: 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (7 cols): Transactions Activity & Spending Breakdown */}
            <div className="lg:col-span-7 space-y-6">
              {/* Recent Transactions Widget */}
              <RecentTransactionsWidget />

              {/* Spending by Category Breakdown */}
              <div className="p-5 rounded-3xl glass-panel border border-black/15 dark:border-white/20 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                      <PieChart className="w-5 h-5 font-black" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-950 dark:text-white">
                        Spending by Category
                      </h2>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Allocation in selected period
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/reports"
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>Insights</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {topCategories.length === 0 ? (
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 py-6 text-center">
                    No expense records in this period.
                  </p>
                ) : (
                  <div className="space-y-3.5 pt-1">
                    {topCategories.map((cat) => (
                      <div key={cat.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {cat.name}
                          </span>
                          <span className="font-mono font-bold text-slate-950 dark:text-white tabular-nums">
                            {formatCurrency(cat.amount)} ({cat.pct.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800/90 rounded-full h-2 overflow-hidden">
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
            </div>

            {/* Right Column (5 cols): Financial Health, Budgets & Goals */}
            <div className="lg:col-span-5 space-y-6">
              {/* Ugandan Financial Health Wellness Rating */}
              <FinancialHealthWidget />

              {/* Monthly Budgets Widget */}
              <BudgetProgressWidget />

              {/* Active Savings Goals Widget */}
              <SavingsGoalWidget />
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
