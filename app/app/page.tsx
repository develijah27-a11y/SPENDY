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
  Trash2,
  PieChart,
  ArrowRight,
  Activity,
} from 'lucide-react';

function DashboardMainContent() {
  const { user, profile } = useAuth();
  const {
    transactions,
    categories,
    budgets,
    savingsGoals,
    totalBalance,
    openQuickAdd,
    deleteTransaction,
    openReceipt,
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
  const expensePercentage = periodIncome > 0 ? (periodExpense / periodIncome) * 100 : 0;

  // Recent 6 transactions
  const recentTransactions = useMemo(() => transactions.slice(0, 6), [transactions]);

  // Greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const cleanFirstName = useMemo(() => {
    if (profile?.full_name && profile.full_name.trim()) {
      return profile.full_name.trim().split(' ')[0];
    }
    if (user?.user_metadata?.full_name && typeof user.user_metadata.full_name === 'string') {
      return user.user_metadata.full_name.trim().split(' ')[0];
    }
    if (user?.email) {
      const raw = user.email.split('@')[0].replace(/[0-9_.-]+$/, '');
      if (raw.length >= 2) return raw.charAt(0).toUpperCase() + raw.slice(1);
      return user.email.split('@')[0];
    }
    return 'there';
  }, [profile, user]);

  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  // Top spending categories in active period
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

  // Overall month budget calculations
  const currentMonthKey = getCurrentMonthKey();
  const monthExpenses = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'expense' && t.transaction_date.startsWith(currentMonthKey))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, currentMonthKey]);

  const overallBudget = useMemo(() => {
    return budgets.find((b) => b.month === currentMonthKey && !b.category_id);
  }, [budgets, currentMonthKey]);

  const budgetLimit = overallBudget?.planned_amount || 0;
  const budgetUsedPct = budgetLimit > 0 ? (monthExpenses / budgetLimit) * 100 : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header with Time Greeting & Reporting Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/10 dark:border-white/10">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            <span>Personal Finance Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-gray-950 dark:text-white tracking-tight mt-0.5">
            {greeting}, {cleanFirstName}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
            {todayFormatted}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 hidden sm:inline">
            Period:
          </label>
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value as PeriodFilter)}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-sm"
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

      {/* 2. Primary Financial Summary Cards (4 KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Balance */}
        <div className="p-5 rounded-2xl glass-panel border border-black/10 dark:border-white/15 space-y-2 relative overflow-hidden group shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Total Net Balance</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
            {formatCurrency(totalBalance)}
          </p>
          <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            {transactions.length === 0
              ? 'Ready to record your first entry'
              : 'Computed from all transactions'}
          </div>
        </div>

        {/* Card 2: Period Income */}
        <div className="p-5 rounded-2xl glass-panel border border-black/10 dark:border-white/15 space-y-2 relative overflow-hidden group shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Total Income</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white font-mono tracking-tight">
            {formatCurrency(periodIncome)}
          </p>
          <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            {periodTransactions.filter((t) => t.type === 'income').length} deposit logs in period
          </div>
        </div>

        {/* Card 3: Period Expenses */}
        <div className="p-5 rounded-2xl glass-panel border border-black/10 dark:border-white/15 space-y-2 relative overflow-hidden group shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Total Expenses</span>
            <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400 font-mono tracking-tight">
            {formatCurrency(periodExpense)}
          </p>
          <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            {periodIncome > 0 ? `${expensePercentage.toFixed(0)}% of income spent` : `${periodTransactions.filter((t) => t.type === 'expense').length} expense logs`}
          </div>
        </div>

        {/* Card 4: Net Savings */}
        <div className="p-5 rounded-2xl glass-panel border border-black/10 dark:border-white/15 space-y-2 relative overflow-hidden group shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Net Period Savings</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${periodSavings >= 0 ? 'text-purple-600 dark:text-purple-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatCurrency(Math.max(0, periodSavings))}
          </p>
          <div className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
            {savingsRate.toFixed(1)}% savings rate
          </div>
        </div>
      </div>

      {/* 3. Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => openQuickAdd('expense')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-black text-xs shadow-md shadow-red-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Expense</span>
          </button>

          <button
            onClick={() => openQuickAdd('income')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Income</span>
          </button>
        </div>

        {/* Secondary Shortcuts */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
          <Link
            href="/budgets"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-gray-950 dark:text-white font-bold border border-slate-200 dark:border-slate-800 transition-all shrink-0 shadow-sm"
          >
            <PiggyBank className="w-3.5 h-3.5 text-amber-500" />
            <span>Budgets</span>
          </Link>

          <Link
            href="/goals"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-gray-950 dark:text-white font-bold border border-slate-200 dark:border-slate-800 transition-all shrink-0 shadow-sm"
          >
            <Target className="w-3.5 h-3.5 text-purple-500" />
            <span>Savings Goals</span>
          </Link>

          <Link
            href="/transactions"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-gray-950 dark:text-white font-bold border border-slate-200 dark:border-slate-800 transition-all shrink-0 shadow-sm"
          >
            <ReceiptText className="w-3.5 h-3.5 text-emerald-500" />
            <span>Activity Ledger</span>
          </Link>

          <Link
            href="/reports"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-gray-950 dark:text-white font-bold border border-slate-200 dark:border-slate-800 transition-all shrink-0 shadow-sm"
          >
            <PieChart className="w-3.5 h-3.5 text-cyan-500" />
            <span>Analytics</span>
          </Link>
        </div>
      </div>

      {/* 4. Main Two-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Recent Transactions & Category Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Activity Card */}
          <div className="rounded-2xl glass-panel p-5 sm:p-6 border border-black/10 dark:border-white/15 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="font-black text-sm text-gray-950 dark:text-white">
                  Recent Transactions
                </h3>
              </div>
              <Link
                href="/transactions"
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>View all activity</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                  <ReceiptText className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-black text-gray-950 dark:text-white">No transactions recorded yet</h4>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Your transaction ledger is completely clean. Click &quot;Add Expense&quot; or &quot;Add Income&quot; above to log your first record.
                </p>
                <div className="pt-2 flex items-center justify-center gap-2">
                  <button
                    onClick={() => openQuickAdd('expense')}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black shadow-sm cursor-pointer"
                  >
                    + Add Expense
                  </button>
                  <button
                    onClick={() => openQuickAdd('income')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-sm cursor-pointer"
                  >
                    + Add Income
                  </button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {recentTransactions.map((t) => {
                  const isExpense = t.type === 'expense';
                  return (
                    <div
                      key={t.id}
                      className="py-3 flex items-center justify-between gap-3 group hover:bg-black/5 dark:hover:bg-white/5 px-2 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isExpense
                              ? 'bg-red-500/15 text-red-600 dark:text-red-400'
                              : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {isExpense ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-gray-950 dark:text-white truncate">
                            {t.description || t.note || (isExpense ? 'Expense' : 'Income')}
                          </p>
                          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            {t.category?.name || (isExpense ? 'General Expense' : 'General Income')} • {formatDate(t.transaction_date)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`text-xs sm:text-sm font-black font-mono ${
                            isExpense ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {isExpense ? '-' : '+'}
                          {formatCurrency(t.amount)}
                        </span>
                        <button
                          onClick={() => deleteTransaction(t.id)}
                          aria-label="Delete transaction"
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-red-500 transition-opacity cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Spending by Category Card */}
          <div className="rounded-2xl glass-panel p-5 sm:p-6 border border-black/10 dark:border-white/15 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-black text-sm text-gray-950 dark:text-white">
                  Spending Overview by Category
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {periodExpense > 0 ? `${formatCurrency(periodExpense)} total` : 'No expenses in period'}
              </span>
            </div>

            {topCategories.length === 0 ? (
              <div className="py-8 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                No expense categories logged for this time period.
              </div>
            ) : (
              <div className="space-y-3.5">
                {topCategories.map((c) => (
                  <div key={c.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-gray-950 dark:text-white flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                        {c.name}
                      </span>
                      <span className="font-mono text-slate-600 dark:text-slate-300 font-semibold">
                        <strong className="text-gray-950 dark:text-white font-black">{formatCurrency(c.amount)}</strong> ({c.pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, c.pct)}%`, backgroundColor: c.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Monthly Budget & Savings Goals */}
        <div className="space-y-6">
          {/* Monthly Budget Widget */}
          <div className="rounded-2xl glass-panel p-5 sm:p-6 border border-black/10 dark:border-white/15 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-amber-500" />
                <h3 className="font-black text-sm text-gray-950 dark:text-white">
                  Monthly Budget
                </h3>
              </div>
              <Link href="/budgets" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                Manage
              </Link>
            </div>

            {budgetLimit === 0 ? (
              <div className="py-6 text-center space-y-2">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  No spending budget set for this month.
                </p>
                <Link
                  href="/budgets"
                  className="inline-block px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm"
                >
                  Set Monthly Budget
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="font-bold text-slate-600 dark:text-slate-300">Spent:</span>
                  <span className="font-mono font-black text-gray-950 dark:text-white text-sm">
                    {formatCurrency(monthExpenses)} / {formatCurrency(budgetLimit)}
                  </span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      budgetUsedPct >= 100
                        ? 'bg-red-500'
                        : budgetUsedPct >= 80
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, budgetUsedPct)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-600 dark:text-slate-400">{budgetUsedPct.toFixed(0)}% used</span>
                  {budgetUsedPct >= 100 ? (
                    <span className="text-red-600 dark:text-red-400 flex items-center gap-1 font-black">
                      <AlertTriangle className="w-3.5 h-3.5" /> Exceeded by {formatUGX(monthExpenses - budgetLimit)}
                    </span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {formatUGX(budgetLimit - monthExpenses)} remaining
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Active Savings Goals Widget */}
          <div className="rounded-2xl glass-panel p-5 sm:p-6 border border-black/10 dark:border-white/15 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-500" />
                <h3 className="font-black text-sm text-gray-950 dark:text-white">
                  Savings Goals
                </h3>
              </div>
              <Link href="/goals" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                All Goals
              </Link>
            </div>

            {savingsGoals.length === 0 ? (
              <div className="py-6 text-center space-y-2">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  No active savings goals created yet.
                </p>
                <Link
                  href="/goals"
                  className="inline-block px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-sm"
                >
                  Create Savings Goal
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {savingsGoals.slice(0, 3).map((g) => {
                  const pct = g.target_amount > 0 ? (g.current_amount / g.target_amount) * 100 : 0;
                  return (
                    <div
                      key={g.id}
                      className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-gray-950 dark:text-white">{g.name}</span>
                        <span className="font-mono text-purple-600 dark:text-purple-400">{pct.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 bg-purple-500"
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 font-mono">
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
      <DashboardMainContent />
    </ProtectedRoute>
  );
}
