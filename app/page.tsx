'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSpendy } from '@/lib/store/spendyStore';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { PeriodFilter } from '@/types';
import {
  TrendingDown,
  TrendingUp,
  Wallet,
  HandCoins,
  ReceiptText,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Sparkles,
  Search,
  Eye,
  EyeOff,
  Filter,
  DollarSign,
  Building,
} from 'lucide-react';

export default function DashboardPage() {
  const {
    dashboardMetrics,
    transactions,
    loans,
    periodFilter,
    setPeriodFilter,
    openQuickAdd,
    startingBalance,
  } = useSpendy();

  const [showBalance, setShowBalance] = useState(true);

  const periods: Array<{ label: string; value: PeriodFilter }> = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'this_week' },
    { label: 'This Month', value: 'this_month' },
    { label: 'Last Month', value: 'last_month' },
    { label: 'This Year', value: 'this_year' },
    { label: 'All Time', value: 'all_time' },
  ];

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* 1. Time Period Selector Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Financial Dashboard
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Real-time balance, spending velocity, income flow & loan tracking in UGX
          </p>
        </div>

        {/* Period Filter Selector */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 overflow-x-auto text-xs font-semibold">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriodFilter(p.value)}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                periodFilter === p.value
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Hero Card: Current Balance */}
      <div className="rounded-3xl glass-panel p-6 sm:p-7 border border-emerald-500/20 relative overflow-hidden shadow-2xl bg-gradient-to-tr from-emerald-950/30 via-slate-900/50 to-teal-950/20">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-500 dark:text-emerald-400">
              Current Balance
            </span>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-1 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Toggle balance visibility"
            >
              {showBalance ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <span>Starting:</span>
            <span className="font-mono font-semibold text-gray-300">
              {formatCurrency(startingBalance)}
            </span>
          </div>
        </div>

        <div className="mt-3">
          <h2 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight font-mono">
            {showBalance ? formatCurrency(dashboardMetrics.currentBalance) : 'UGX ••••••••'}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Calculated as (Starting Balance + Total Income) - Total Expenses
          </p>
        </div>

        {/* Action Button Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-6 pt-5 border-t border-black/10 dark:border-white/10">
          <button
            onClick={() => openQuickAdd('expense')}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-600 dark:text-red-300 text-xs font-bold transition-all active:scale-95 cursor-pointer"
          >
            <TrendingDown className="w-4 h-4 text-red-500" />
            <span>Add Expense</span>
          </button>

          <button
            onClick={() => openQuickAdd('income')}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-xs font-bold transition-all active:scale-95 cursor-pointer"
          >
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span>Add Income</span>
          </button>

          <button
            onClick={() => openQuickAdd('loan')}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-600 dark:text-purple-300 text-xs font-bold transition-all active:scale-95 cursor-pointer"
          >
            <HandCoins className="w-4 h-4 text-purple-500" />
            <span>Lend / Borrow</span>
          </button>

          <Link
            href="/spending"
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 border border-black/10 dark:border-white/10 text-gray-800 dark:text-gray-200 text-xs font-bold transition-all cursor-pointer"
          >
            <ReceiptText className="w-4 h-4 text-gray-400" />
            <span>Spending Log</span>
          </Link>
        </div>
      </div>

      {/* 3. Core Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Today's Spending vs Total Spending */}
        <div className="rounded-3xl glass-panel p-5 border border-black/10 dark:border-white/10 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Today&apos;s Spending</span>
            <div className="w-8 h-8 rounded-xl bg-red-500/15 text-red-500 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-red-600 dark:text-red-400 font-mono">
              {formatCurrency(dashboardMetrics.todaySpending)}
            </p>
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-black/5 dark:border-white/5">
              <span>Total in period:</span>
              <span className="font-bold text-gray-800 dark:text-gray-200 font-mono">
                {formatCurrency(dashboardMetrics.totalSpending)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Today's Income vs Total Income */}
        <div className="rounded-3xl glass-panel p-5 border border-black/10 dark:border-white/10 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Today&apos;s Income</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {formatCurrency(dashboardMetrics.todayIncome)}
            </p>
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-black/5 dark:border-white/5">
              <span>Total in period:</span>
              <span className="font-bold text-gray-800 dark:text-gray-200 font-mono">
                {formatCurrency(dashboardMetrics.totalIncome)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Loans Overview (Money Lent & Money Borrowed) */}
        <div className="rounded-3xl glass-panel p-5 border border-black/10 dark:border-white/10 shadow-xl space-y-3 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Loan Balances</span>
            <Link href="/loans" className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Money Lent (To Others):</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {formatCurrency(dashboardMetrics.moneyLent)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-black/5 dark:border-white/5">
              <span className="text-gray-500 dark:text-gray-400">Money Borrowed (Owed):</span>
              <span className="font-bold text-purple-600 dark:text-purple-400 font-mono">
                {formatCurrency(dashboardMetrics.moneyBorrowed)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Recent Activity & Empty State handling */}
      <div className="rounded-3xl glass-panel p-5 sm:p-6 border border-black/10 dark:border-white/10 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
          <div>
            <h3 className="font-bold text-base text-gray-900 dark:text-white">Recent Activity</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Real transaction and loan movements</p>
          </div>

          <Link
            href="/spending"
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>View Full Ledger</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 text-gray-400 mx-auto flex items-center justify-center">
              <ReceiptText className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">
              You haven&apos;t recorded any spending yet.
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              Start building your financial clarity by recording your daily cash, mobile money, or food expenses.
            </p>
            <button
              onClick={() => openQuickAdd('expense')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Record First Transaction</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-black/5 dark:divide-white/5 mt-2">
            {recentTransactions.map((tx) => {
              const isExpense = tx.type === 'expense';
              return (
                <div
                  key={tx.id}
                  className="py-3 px-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isExpense
                          ? 'bg-red-500/15 text-red-500'
                          : 'bg-emerald-500/15 text-emerald-500'
                      }`}
                    >
                      {isExpense ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                          {tx.category?.name || tx.description || 'Transaction'}
                        </p>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-gray-600 dark:text-gray-300">
                          {tx.type === 'expense' ? 'Expense' : 'Income'}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                        {tx.description || tx.note || 'Recorded'} • {formatDate(tx.transaction_date)}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`font-bold font-mono text-sm sm:text-base shrink-0 ${
                      isExpense ? 'text-red-500' : 'text-emerald-500'
                    }`}
                  >
                    {isExpense ? '-' : '+'} {formatCurrency(tx.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
