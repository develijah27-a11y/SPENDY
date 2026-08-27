'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSpendy } from '@/lib/store/spendyStore';
import { formatCurrency, formatUGX, formatDate, isDateInPeriod, getCurrentMonthKey } from '@/lib/formatters';
import { PeriodFilter } from '@/types';
import {
  LineChart,
  Calendar,
  Download,
  ArrowDownRight,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  PieChart,
  Percent,
  Layers,
  ArrowRight,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';

export default function ReportsPage() {
  const { transactions, categories, exportDataCSV, budgets, savingsGoals, startingBalance } = useSpendy();

  const [period, setPeriod] = useState<PeriodFilter>('this_month');
  const [reportType, setReportType] = useState<'summary' | 'monthly' | 'yearly'>('summary');

  // Filter transactions by active period
  const filteredTx = useMemo(() => {
    return transactions.filter((t) => isDateInPeriod(t.transaction_date, period));
  }, [transactions, period]);

  // Aggregate metrics
  const totalIncome = filteredTx
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTx
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (Math.max(0, netSavings) / totalIncome) * 100 : 0;

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of filteredTx.filter((x) => x.type === 'expense')) {
      map[t.category_id] = (map[t.category_id] || 0) + t.amount;
    }

    return Object.entries(map)
      .map(([catId, amount]) => {
        const cat = categories.find((c) => c.id === catId);
        const percent = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
        return {
          id: catId,
          name: cat?.name || 'Uncategorized',
          color: cat?.color || '#10B981',
          amount,
          percent,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTx, categories, totalExpense]);

  const largestCategory = categoryBreakdown[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/15 dark:border-white/15">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
            <LineChart className="w-4 h-4" />
            <span>Financial Statements & Reports</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white tracking-tight">
            Financial Reports & Analytics
          </h1>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Comprehensive audit of income, expenditures, savings rate, and category breakdowns.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period Filter Dropdown */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as PeriodFilter)}
            className="px-3.5 py-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/15 dark:border-white/20 text-xs font-bold text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="this_year">This Year</option>
            <option value="all">All Time</option>
          </select>

          <button
            onClick={exportDataCSV}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="p-5 rounded-3xl glass-panel border border-black/15 dark:border-white/20 shadow-lg space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Total Income</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {formatCurrency(totalIncome)}
          </p>
          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            {filteredTx.filter((t) => t.type === 'income').length} income records
          </span>
        </div>

        {/* Total Expense */}
        <div className="p-5 rounded-3xl glass-panel border border-black/15 dark:border-white/20 shadow-lg space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Total Expenses</span>
            <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-red-600 dark:text-red-400 font-mono">
            {formatCurrency(totalExpense)}
          </p>
          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            {filteredTx.filter((t) => t.type === 'expense').length} expense logs
          </span>
        </div>

        {/* Net Savings */}
        <div className="p-5 rounded-3xl glass-panel border border-black/15 dark:border-white/20 shadow-lg space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Net Period Savings</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-black font-mono ${netSavings >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {netSavings >= 0 ? '+' : ''}{formatCurrency(netSavings)}
          </p>
          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            Income minus expenses
          </span>
        </div>

        {/* Savings Rate */}
        <div className="p-5 rounded-3xl glass-panel border border-black/15 dark:border-white/20 shadow-lg space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Savings Rate</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {savingsRate.toFixed(1)}%
          </p>
          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            Target recommended: 20%+
          </span>
        </div>
      </div>

      {/* Main Report Sections: Category Breakdown & Spending Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown (2 cols) */}
        <div className="lg:col-span-2 rounded-3xl glass-panel p-6 border border-black/15 dark:border-white/20 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
                <PieChart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm text-gray-950 dark:text-white">
                  Spending by Category
                </h3>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Where your money went during this period
                </p>
              </div>
            </div>

            {largestCategory && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-full">
                Largest: {largestCategory.name} ({largestCategory.percent.toFixed(0)}%)
              </span>
            )}
          </div>

          {categoryBreakdown.length === 0 ? (
            <div className="py-12 text-center text-xs font-bold text-slate-700 dark:text-slate-300">
              No expense records found in this time period.
            </div>
          ) : (
            <div className="space-y-4">
              {categoryBreakdown.map((cat) => (
                <div key={cat.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-gray-950 dark:text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      {cat.name}
                    </span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">
                      <strong className="text-gray-950 dark:text-white font-black">{formatCurrency(cat.amount)}</strong>{' '}
                      ({cat.percent.toFixed(1)}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, cat.percent)}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Financial Review & Smart Highlights (1 col) */}
        <div className="rounded-3xl glass-panel p-6 border border-black/15 dark:border-white/20 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-white/10">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="font-black text-sm text-gray-950 dark:text-white">
              Statement Summary
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-1">
              <span className="font-bold text-slate-700 dark:text-slate-300">Period Ratio</span>
              <p className="font-black text-gray-950 dark:text-white text-sm">
                {totalIncome > 0 ? ((totalExpense / totalIncome) * 100).toFixed(1) : 0}% Spent vs Earned
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-1">
              <span className="font-bold text-slate-700 dark:text-slate-300">Total Transactions</span>
              <p className="font-black text-gray-950 dark:text-white text-sm">
                {filteredTx.length} records processed
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
              <span className="font-bold text-emerald-700 dark:text-emerald-300">Cash Flow Status</span>
              <p className="font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
                {netSavings >= 0
                  ? `You retained ${formatCurrency(netSavings)} of cash in this period.`
                  : `Expenses exceeded income by ${formatCurrency(Math.abs(netSavings))}. Consider reviewing non-essential budgets.`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
