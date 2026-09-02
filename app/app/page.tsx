'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { useSpendy } from '@/lib/store/spendyStore';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { formatCurrency, formatUGX, formatCompactUGX, formatDate, isDateInPeriod, getCurrentMonthKey } from '@/lib/formatters';
import { PeriodFilter, Transaction } from '@/types';
import {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  ReceiptText,
  PiggyBank,
  Target,
  ShieldCheck,
  ChevronRight,
  PieChart,
  Trash2,
  Edit2,
  Calendar,
  Layers,
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
    editTransaction,
    periodFilter,
    setPeriodFilter,
  } = useSpendy();

  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isDeletingTxId, setIsDeletingTxId] = useState<string | null>(null);

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

  // Current Month Budgets Progress
  const currentMonthKey = getCurrentMonthKey();
  const activeBudgets = useMemo(() => {
    return budgets
      .filter((b) => b.month === currentMonthKey && b.category_id)
      .map((b) => {
        const cat = categories.find((c) => c.id === b.category_id);
        const spent = transactions
          .filter(
            (t) =>
              t.type === 'expense' &&
              t.category_id === b.category_id &&
              t.transaction_date.startsWith(currentMonthKey)
          )
          .reduce((sum, t) => sum + t.amount, 0);

        const pct = b.planned_amount > 0 ? (spent / b.planned_amount) * 100 : 0;
        return {
          ...b,
          categoryName: cat?.name || 'General',
          categoryColor: cat?.color || '#10B981',
          spent,
          pct,
          remaining: b.planned_amount - spent,
        };
      });
  }, [budgets, currentMonthKey, categories, transactions]);

  // Active Savings Goals
  const activeGoals = useMemo(() => {
    return savingsGoals.map((g) => {
      const pct = g.target_amount > 0 ? Math.min(100, (g.current_amount / g.target_amount) * 100) : 0;
      return {
        ...g,
        pct,
        remaining: Math.max(0, g.target_amount - g.current_amount),
      };
    });
  }, [savingsGoals]);

  const handleDelete = async (id: string) => {
    await deleteTransaction(id);
    setIsDeletingTxId(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Top Header with Greeting & Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
            {greeting}, {cleanFirstName}
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
            {todayFormatted}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 hidden sm:inline">
              Period:
            </span>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value as PeriodFilter)}
              aria-label="Select reporting time period"
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-sm touch-target"
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
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all active:scale-98 cursor-pointer touch-target shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* 2. Zero-Data Experience (Onboarding when brand new) */}
      {transactions.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-2xl bg-white dark:bg-[#0E1628] border border-slate-200 dark:border-slate-800 shadow-sm text-center max-w-2xl mx-auto space-y-4 my-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto font-bold">
            <Wallet className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">
              Your financial picture starts here.
            </h2>
            <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Add your first income or expense to start seeing your money clearly.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
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
          {/* 3. Primary Financial Metric Cards (Total Balance, Income, Expenses, Savings) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Balance */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1628] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Balance
              </span>
              <p className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white font-mono tabular-nums">
                {formatCurrency(totalBalance)}
              </p>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Net available funds
              </p>
            </div>

            {/* Total Income */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1628] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Income
              </span>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                + {formatCurrency(periodIncome).replace('UGX ', 'UGX ')}
              </p>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {periodTransactions.filter((t) => t.type === 'income').length} entries in period
              </p>
            </div>

            {/* Total Expenses */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1628] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Expenses
              </span>
              <p className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400 font-mono tabular-nums">
                - {formatCurrency(periodExpense).replace('UGX ', 'UGX ')}
              </p>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {periodTransactions.filter((t) => t.type === 'expense').length} entries in period
              </p>
            </div>

            {/* Net Savings */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1628] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Savings
              </span>
              <p className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 font-mono tabular-nums">
                {formatCurrency(periodSavings)}
              </p>
              <p className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 font-bold">
                {savingsRate.toFixed(0)}% savings rate
              </p>
            </div>
          </div>

          {/* 4. Two-Column Dashboard Content Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (7 cols): Recent Transactions & Spending Breakdown */}
            <div className="lg:col-span-7 space-y-6">
              {/* Recent Activity List */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1628] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-950 dark:text-white">
                      Recent Transactions
                    </h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Latest activity across your accounts
                    </p>
                  </div>
                  <Link
                    href="/transactions"
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>View all</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="space-y-2">
                  {recentTransactions.map((tx) => {
                    const isIncome = tx.type === 'income';
                    return (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold ${
                              isIncome
                                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400'
                                : 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-400'
                            }`}
                          >
                            {isIncome ? (
                              <ArrowUpRight className="w-4 h-4" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-950 dark:text-white truncate">
                              {tx.description || tx.note || (isIncome ? 'Income' : 'Expense')}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                              {tx.category?.name || 'General'} • {formatDate(tx.transaction_date)}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0 ml-3">
                          <p
                            className={`text-xs font-black font-mono tabular-nums ${
                              isIncome
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Spending by Category Breakdown */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1628] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-950 dark:text-white">
                    Spending by Category
                  </h2>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Selected period
                  </span>
                </div>

                {topCategories.length === 0 ? (
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 py-4 text-center">
                    No expense records in this period.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {topCategories.map((cat) => (
                      <div key={cat.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {cat.name}
                          </span>
                          <span className="font-mono font-bold text-slate-950 dark:text-white tabular-nums">
                            {formatCurrency(cat.amount)} ({cat.pct.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
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

            {/* Right Column (5 cols): Monthly Budgets & Savings Goals */}
            <div className="lg:col-span-5 space-y-6">
              {/* Monthly Budget Progress */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1628] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-950 dark:text-white">
                      Budget Progress
                    </h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      This month&apos;s spending limits
                    </p>
                  </div>
                  <Link
                    href="/budgets"
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>Manage</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {activeBudgets.length === 0 ? (
                  <div className="py-6 text-center space-y-2">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      No category budgets set for this month.
                    </p>
                    <Link
                      href="/budgets"
                      className="inline-block text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      + Set your first budget
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {activeBudgets.slice(0, 4).map((b) => (
                      <div key={b.id} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-800 dark:text-slate-200">
                            {b.categoryName}
                          </span>
                          <span className="font-mono font-bold text-slate-950 dark:text-white">
                            {b.pct.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              b.pct > 100
                                ? 'bg-red-500'
                                : b.pct > 80
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(3, b.pct))}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          <span>Spent: {formatCurrency(b.spent)}</span>
                          <span>Limit: {formatCurrency(b.planned_amount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Savings Goals */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1628] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-950 dark:text-white">
                      Savings Goals
                    </h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Milestones &amp; savings targets
                    </p>
                  </div>
                  <Link
                    href="/goals"
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>View all</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {activeGoals.length === 0 ? (
                  <div className="py-6 text-center space-y-2">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      No active savings goals.
                    </p>
                    <Link
                      href="/goals"
                      className="inline-block text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      + Create a savings target
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {activeGoals.slice(0, 3).map((g) => (
                      <div key={g.id} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-800 dark:text-slate-200">{g.name}</span>
                          <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                            {g.pct.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-purple-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, Math.max(3, g.pct))}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          <span>Saved: {formatCurrency(g.current_amount)}</span>
                          <span>Target: {formatCurrency(g.target_amount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
