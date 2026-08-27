'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { useSpendy } from '@/lib/store/spendyStore';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { formatCurrency, formatUGX, formatDate, isDateInPeriod, getCurrentMonthKey } from '@/lib/formatters';
import { PeriodFilter } from '@/types';
import {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  TrendingUp,
  ReceiptText,
  DollarSign,
  PiggyBank,
  Target,
  Calendar,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Percent,
  SlidersHorizontal,
  ArrowRight,
} from 'lucide-react';

function MasterDashboardContent() {
  const { user, profile } = useAuth();
  const {
    transactions,
    categories,
    budgets,
    savingsGoals,
    totalBalance,
    openQuickAdd,
    deleteTransaction,
    startingBalance,
    financialHealth,
    insights,
  } = useSpendy();

  const [period, setPeriod] = useState<PeriodFilter>('this_month');

  // Filter transactions according to selected period
  const periodTransactions = useMemo(() => {
    return transactions.filter((t) => isDateInPeriod(t.transaction_date, period));
  }, [transactions, period]);

  // Aggregate Metrics for the selected period
  const periodIncome = periodTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const periodExpense = periodTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const periodSavings = periodIncome - periodExpense;
  const savingsRate = periodIncome > 0 ? (Math.max(0, periodSavings) / periodIncome) * 100 : 0;
  const expensePercentageOfIncome = periodIncome > 0 ? (periodExpense / periodIncome) * 100 : 0;

  // Recent 5 transactions
  const recentTransactions = transactions.slice(0, 5);

  // Time of day greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  // Top spending categories in period
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
          name: cat?.name || 'Category',
          color: cat?.color || '#10B981',
          amount,
          pct,
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4);
  }, [periodTransactions, categories, periodExpense]);

  // Overall month budget
  const currentMonthKey = getCurrentMonthKey();
  const monthExpenses = transactions
    .filter((t) => t.type === 'expense' && t.transaction_date.startsWith(currentMonthKey))
    .reduce((sum, t) => sum + t.amount, 0);

  const overallBudget = budgets.find((b) => b.month === currentMonthKey && !b.category_id);
  const budgetLimit = overallBudget?.planned_amount || 0;
  const budgetUsedPct = budgetLimit > 0 ? (monthExpenses / budgetLimit) * 100 : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header with Time Greeting & Reporting Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/15 dark:border-white/15">
        <div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Personal Finance Dashboard
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-gray-950 dark:text-white tracking-tight">
            {greeting}, {profile?.full_name || user?.email?.split('@')[0] || 'User'}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
            {todayFormatted}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Reporting Period Selector */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as PeriodFilter)}
            className="px-4 py-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/15 dark:border-white/20 text-xs font-bold text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-sm"
          >
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="this_year">This Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* 2. Quick Actions Toolbar */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <button
          onClick={() => openQuickAdd('expense')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-black text-xs shadow-md shadow-red-600/20 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>

        <button
          onClick={() => openQuickAdd('income')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Income</span>
        </button>

        <Link
          href="/goals"
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-md shadow-purple-600/20 active:scale-95 transition-all"
        >
          <Target className="w-4 h-4" />
          <span>Create Goal</span>
        </Link>

        <Link
          href="/budgets"
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-gray-950 dark:text-white font-bold text-xs border border-black/15 dark:border-white/20 transition-all"
        >
          <PiggyBank className="w-4 h-4 text-amber-500" />
          <span>Set Budget</span>
        </Link>

        <Link
          href="/calendar"
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-gray-950 dark:text-white font-bold text-xs border border-black/15 dark:border-white/20 transition-all ml-auto"
        >
          <Calendar className="w-4 h-4 text-emerald-500" />
          <span>Calendar</span>
        </Link>
      </div>

      {/* 3. Four Primary Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Balance */}
        <div className="p-5 sm:p-6 rounded-3xl glass-panel border border-black/15 dark:border-white/20 shadow-xl space-y-2 relative overflow-hidden bg-gradient-to-br from-emerald-950/20 to-teal-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Current Balance</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
            {formatCurrency(totalBalance)}
          </p>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>Net position across all accounts</span>
          </div>
        </div>

        {/* Card 2: Income */}
        <div className="p-5 sm:p-6 rounded-3xl glass-panel border border-black/15 dark:border-white/20 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Income</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white font-mono tracking-tight">
            {formatCurrency(periodIncome)}
          </p>
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {periodTransactions.filter((t) => t.type === 'income').length} credit logs in period
          </div>
        </div>

        {/* Card 3: Expenses */}
        <div className="p-5 sm:p-6 rounded-3xl glass-panel border border-black/15 dark:border-white/20 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Expenses</span>
            <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center font-black">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400 font-mono tracking-tight">
            {formatCurrency(periodExpense)}
          </p>
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {expensePercentageOfIncome.toFixed(0)}% of income spent
          </div>
        </div>

        {/* Card 4: Savings */}
        <div className="p-5 sm:p-6 rounded-3xl glass-panel border border-black/15 dark:border-white/20 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Savings</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${periodSavings >= 0 ? 'text-purple-600 dark:text-purple-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatCurrency(Math.max(0, periodSavings))}
          </p>
          <div className="text-xs font-bold text-purple-600 dark:text-purple-400">
            {savingsRate.toFixed(1)}% savings rate
          </div>
        </div>
      </div>

      {/* 4. Financial Health Bar */}
      <div className="rounded-3xl glass-panel p-5 sm:p-6 border border-black/15 dark:border-white/20 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="font-black text-sm text-gray-950 dark:text-white">
              Financial Health Overview
            </h3>
          </div>
          <Link href="/reports" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
            <span>View Full Report</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-bold">
          <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-1">
            <span className="text-slate-700 dark:text-slate-300">Savings Rate</span>
            <p className="text-base font-black text-purple-600 dark:text-purple-400 font-mono">
              {savingsRate.toFixed(0)}%
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-1">
            <span className="text-slate-700 dark:text-slate-300">Budget Utilization</span>
            <p className={`text-base font-black font-mono ${budgetUsedPct >= 100 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {budgetLimit > 0 ? `${budgetUsedPct.toFixed(0)}%` : 'No limit set'}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-1">
            <span className="text-slate-700 dark:text-slate-300">Monthly Cash Flow</span>
            <p className={`text-base font-black font-mono ${periodSavings >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {periodSavings >= 0 ? '+' : ''}{formatCurrency(periodSavings)}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-1">
            <span className="text-slate-700 dark:text-slate-300">Active Goals</span>
            <p className="text-base font-black text-gray-950 dark:text-white font-mono">
              {savingsGoals.filter((g) => g.status === 'active').length} In Progress
            </p>
          </div>
        </div>
      </div>

      {/* 5. Main Dashboard Split: Recent Transactions & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Transactions */}
        <div className="lg:col-span-2 rounded-3xl glass-panel p-5 sm:p-6 border border-black/15 dark:border-white/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
                <ReceiptText className="w-4 h-4" />
              </div>
              <h3 className="font-black text-sm text-gray-950 dark:text-white">
                Recent Transactions
              </h3>
            </div>
            <Link
              href="/spending"
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>See all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="py-10 text-center space-y-3">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                No transactions recorded yet.
              </p>
              <button
                onClick={() => openQuickAdd('expense')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md cursor-pointer"
              >
                Log First Expense
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-white/10">
              {recentTransactions.map((t) => {
                const isExpense = t.type === 'expense';
                return (
                  <div
                    key={t.id}
                    className="py-3 flex items-center justify-between gap-3 group hover:bg-black/5 dark:hover:bg-white/5 px-2 rounded-2xl transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isExpense
                            ? 'bg-red-500/20 text-red-600 dark:text-red-400'
                            : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {isExpense ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-gray-950 dark:text-white truncate">
                          {t.description || t.note || (isExpense ? 'Expense' : 'Income')}
                        </p>
                        <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                          {formatDate(t.transaction_date)}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-black font-mono shrink-0 ${
                        isExpense ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isExpense ? '-' : '+'}
                      {formatCurrency(t.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Spending Categories & Savings Goals */}
        <div className="space-y-6">
          {/* Spending by Category */}
          <div className="rounded-3xl glass-panel p-5 sm:p-6 border border-black/15 dark:border-white/20 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <h3 className="font-black text-sm text-gray-950 dark:text-white">
                Category Spending
              </h3>
              <Link href="/categories" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                Manage
              </Link>
            </div>

            {topCategories.length === 0 ? (
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 text-center py-6">
                No expense categories in this period.
              </p>
            ) : (
              <div className="space-y-3">
                {topCategories.map((c) => (
                  <div key={c.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-gray-950 dark:text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                        {c.name}
                      </span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">
                        {formatCurrency(c.amount)} ({c.pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, c.pct)}%`, backgroundColor: c.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Goals Preview */}
          <div className="rounded-3xl glass-panel p-5 sm:p-6 border border-black/15 dark:border-white/20 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <h3 className="font-black text-sm text-gray-950 dark:text-white">
                Savings Goals
              </h3>
              <Link href="/goals" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                All Goals
              </Link>
            </div>

            {savingsGoals.length === 0 ? (
              <div className="py-6 text-center space-y-2">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  No active goals set yet.
                </p>
                <Link
                  href="/goals"
                  className="inline-block px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold"
                >
                  Create First Goal
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {savingsGoals.slice(0, 2).map((g) => {
                  const pct = g.target_amount > 0 ? (g.current_amount / g.target_amount) * 100 : 0;
                  return (
                    <div key={g.id} className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-gray-950 dark:text-white">{g.name}</span>
                        <span className="font-mono text-purple-600 dark:text-purple-400">{pct.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300 bg-purple-500"
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300 font-mono">
                        <span>Saved: {formatUGX(g.current_amount)}</span>
                        <span>Target: {formatUGX(g.target_amount)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MasterDashboardPage() {
  return (
    <ProtectedRoute>
      <MasterDashboardContent />
    </ProtectedRoute>
  );
}
