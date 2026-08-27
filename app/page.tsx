'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSpendy } from '@/lib/store/spendyStore';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { PeriodFilter } from '@/types';
import { BalanceOverviewCard } from '@/components/dashboard/BalanceOverviewCard';
import { SafeToSpendCard } from '@/components/dashboard/SafeToSpendCard';
import { MonthlySummaryCard } from '@/components/dashboard/MonthlySummaryCard';
import { RecentTransactionsWidget } from '@/components/dashboard/RecentTransactionsWidget';
import { BudgetProgressWidget } from '@/components/dashboard/BudgetProgressWidget';
import { SavingsGoalWidget } from '@/components/dashboard/SavingsGoalWidget';
import { FinancialHealthWidget } from '@/components/dashboard/FinancialHealthWidget';
import {
  TrendingDown,
  TrendingUp,
  HandCoins,
  ReceiptText,
  Plus,
  ArrowUpRight,
  Sparkles,
  DollarSign,
} from 'lucide-react';

export default function DashboardPage() {
  const {
    dashboardMetrics,
    transactions,
    periodFilter,
    setPeriodFilter,
    openQuickAdd,
    user,
  } = useSpendy();

  const periods: Array<{ label: string; value: PeriodFilter }> = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'this_week' },
    { label: 'This Month', value: 'this_month' },
    { label: 'Last Month', value: 'last_month' },
    { label: 'This Year', value: 'this_year' },
    { label: 'All Time', value: 'all_time' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar with Welcome & Time Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white tracking-tight">
              Hello, {user?.full_name?.split(' ')[0] || 'David'}!
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-500/30">
              UGX Live
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-1">
            Real-time balance, spending velocity, income flow & loan tracking
          </p>
        </div>

        {/* Period Filter Selector */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 overflow-x-auto text-xs font-bold shadow-sm">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriodFilter(p.value)}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                periodFilter === p.value
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-200 hover:text-gray-950 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Top Tier: Balance Overview & Safe to Spend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <BalanceOverviewCard />
        <SafeToSpendCard />
      </div>

      {/* 3. Monthly Summary Cards (Income, Expense, Net Saved) */}
      <MonthlySummaryCard />

      {/* 4. Core Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Today's Spending vs Total Spending */}
        <div className="rounded-3xl glass-panel p-5 border border-black/15 dark:border-white/20 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Today&apos;s Spending</span>
            <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center font-black">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-red-600 dark:text-red-400 font-mono">
              {formatCurrency(dashboardMetrics.todaySpending)}
            </p>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mt-2 pt-2 border-t border-slate-200 dark:border-white/10">
              <span>Total in period:</span>
              <span className="font-black text-gray-950 dark:text-white font-mono">
                {formatCurrency(dashboardMetrics.totalSpending)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Today's Income vs Total Income */}
        <div className="rounded-3xl glass-panel p-5 border border-black/15 dark:border-white/20 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Today&apos;s Income</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {formatCurrency(dashboardMetrics.todayIncome)}
            </p>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mt-2 pt-2 border-t border-slate-200 dark:border-white/10">
              <span>Total in period:</span>
              <span className="font-black text-gray-950 dark:text-white font-mono">
                {formatCurrency(dashboardMetrics.totalIncome)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Loans Overview (Money Lent & Money Borrowed) */}
        <div className="rounded-3xl glass-panel p-5 border border-black/15 dark:border-white/20 shadow-xl space-y-3 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Active Loan Balances</span>
            <Link href="/loans" className="text-xs font-black text-purple-600 dark:text-purple-400 hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-700 dark:text-slate-300">Money Lent (To Others):</span>
              <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {formatCurrency(dashboardMetrics.moneyLent)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold pt-1 border-t border-slate-200 dark:border-white/10">
              <span className="text-slate-700 dark:text-slate-300">Money Borrowed (Owed):</span>
              <span className="font-black text-purple-600 dark:text-purple-400 font-mono">
                {formatCurrency(dashboardMetrics.moneyBorrowed)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Middle Tier: Recent Activity & Budgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <RecentTransactionsWidget />
        <BudgetProgressWidget />
      </div>

      {/* 6. Lower Tier: Savings Goals & Deterministic Financial Health Score */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SavingsGoalWidget />
        <FinancialHealthWidget />
      </div>
    </div>
  );
}
