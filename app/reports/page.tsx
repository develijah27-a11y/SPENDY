'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSpendy } from '@/lib/store/spendyStore';
import { formatCurrency, formatMonthName, isDateInPeriod } from '@/lib/formatters';
import { PeriodFilter } from '@/types';
import {
  PieChart,
  Download,
  ArrowDownRight,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Layers,
  ReceiptText,
  Plus,
  Percent,
} from 'lucide-react';

export default function InsightsPage() {
  const { transactions, categories, exportDataCSV, openQuickAdd } = useSpendy();

  const [period, setPeriod] = useState<PeriodFilter>('this_month');

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

  const netChange = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (Math.max(0, netChange) / totalIncome) * 100 : 0;

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

  const biggestCategory = categoryBreakdown[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-2.5">
            <PieChart className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <span>Insights &amp; Analytics</span>
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
            Factual breakdown of income, expenses, and category allocation
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as PeriodFilter)}
            aria-label="Filter insights period"
            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-sm touch-target"
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
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-sm touch-target"
          >
            <Download className="w-4 h-4" />
            <span>Download Report</span>
          </button>
        </div>
      </div>

      {filteredTx.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-2xl bg-white dark:bg-[#0E1628] border border-slate-200 dark:border-slate-800 text-center max-w-2xl mx-auto space-y-3 my-8">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <PieChart className="w-6 h-6" />
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-950 dark:text-white">
            Add more transactions to unlock spending insights.
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Once you log your income and expenses in this period, Spendy will automatically calculate your spending allocation and trends.
          </p>
          <button
            onClick={() => openQuickAdd('expense')}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      ) : (
        <>
          {/* 2. Financial Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1628] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Income
              </span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                + {formatCurrency(totalIncome).replace('UGX ', 'UGX ')}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1628] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Expenses
              </span>
              <p className="text-2xl font-black text-red-600 dark:text-red-400 font-mono tabular-nums">
                - {formatCurrency(totalExpense).replace('UGX ', 'UGX ')}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1628] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Net Change
              </span>
              <p
                className={`text-2xl font-black font-mono tabular-nums ${
                  netChange >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {netChange >= 0 ? '+' : '-'} {formatCurrency(Math.abs(netChange)).replace('UGX ', 'UGX ')}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1628] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Savings Rate
              </span>
              <p className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono tabular-nums">
                {savingsRate.toFixed(0)}%
              </p>
            </div>
          </div>

          {/* 3. Key Takeaway Highlight */}
          {biggestCategory && (
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>
                <strong>{biggestCategory.name}</strong> is currently your biggest expense at{' '}
                <strong className="font-mono">{formatCurrency(biggestCategory.amount)}</strong> (
                {biggestCategory.percent.toFixed(0)}% of total expenses).
              </span>
            </div>
          )}

          {/* 4. Spending by Category Breakdown Table */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0E1628] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-950 dark:text-white">
              Category Allocation
            </h2>

            <div className="space-y-3">
              {categoryBreakdown.map((cat) => (
                <div key={cat.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800 dark:text-slate-200">{cat.name}</span>
                    <span className="font-mono font-bold text-slate-950 dark:text-white">
                      {formatCurrency(cat.amount)} ({cat.percent.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, Math.max(3, cat.percent))}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
