'use client';

import React, { useState } from 'react';
import { useSpendy } from '@/lib/store/spendyStore';
import { formatUGX, formatMonthName, getCurrentMonthKey } from '@/lib/formatters';
import {
  CalendarCheck2,
  TrendingDown,
  TrendingUp,
  Printer,
  Sparkles,
} from 'lucide-react';

export default function ReviewPage() {
  const { transactions, user } = useSpendy();
  const currentMonthKey = getCurrentMonthKey();

  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey);

  // Parse previous month
  const [year, month] = selectedMonth.split('-').map(Number);
  const prevDate = new Date(year, month - 2, 1);
  const prevMonthKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

  const currentMonthTx = transactions.filter((t) => t.transaction_date.startsWith(selectedMonth));
  const prevMonthTx = transactions.filter((t) => t.transaction_date.startsWith(prevMonthKey));

  const currentIncome = currentMonthTx
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const currentExpenses = currentMonthTx
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const currentNetSaved = Math.max(0, currentIncome - currentExpenses);
  const currentSavingsRate = currentIncome > 0 ? ((currentNetSaved / currentIncome) * 100).toFixed(1) : '0';

  const prevExpenses = prevMonthTx
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0) || 1200000;

  const expenseDiff = currentExpenses - prevExpenses;
  const expensePctChange = prevExpenses > 0 ? ((expenseDiff / prevExpenses) * 100).toFixed(1) : '0';

  // Category totals
  const categoryTotals: Record<string, { name: string; amount: number; color: string }> = {};
  currentMonthTx
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const name = t.category?.name || 'General';
      const color = t.category?.color || '#10B981';
      if (!categoryTotals[name]) categoryTotals[name] = { name, amount: 0, color };
      categoryTotals[name].amount += t.amount;
    });

  const sortedCats = Object.values(categoryTotals).sort((a, b) => b.amount - a.amount);
  const topCategory = sortedCats[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white tracking-tight flex items-center gap-2.5">
            <CalendarCheck2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400 font-black" />
            <span>Monthly Financial Review</span>
          </h1>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-1">
            Month-end financial debrief, comparison metrics, and improvements for next month
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white text-xs font-bold shadow-sm"
          >
            <option value={currentMonthKey}>{formatMonthName(currentMonthKey)} (Current)</option>
            <option value="2026-07">July 2026</option>
            <option value="2026-06">June 2026</option>
          </select>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-gray-950 dark:text-white text-xs font-black border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Review Statement Card */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-black/15 dark:border-white/20 shadow-2xl space-y-6">
        {/* Title */}
        <div className="border-b border-slate-200 dark:border-white/10 pb-4 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-black tracking-widest text-emerald-600 dark:text-emerald-400">
              Personal Financial Statement
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white mt-1">
              {formatMonthName(selectedMonth)} Review
            </h2>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Prepared for {user.full_name || 'David Mukasa'}</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-black px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              UGX Standard
            </span>
          </div>
        </div>

        {/* 4 Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Total Inflow</span>
            <p className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
              {formatUGX(currentIncome)}
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Total Outflow</span>
            <p className="text-lg sm:text-2xl font-black text-red-600 dark:text-red-400 font-mono mt-1">
              {formatUGX(currentExpenses)}
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Net Retained</span>
            <p className="text-lg sm:text-2xl font-black text-blue-600 dark:text-blue-400 font-mono mt-1">
              {formatUGX(currentNetSaved)}
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Savings Rate</span>
            <p className="text-lg sm:text-2xl font-black text-purple-600 dark:text-purple-400 font-mono mt-1">
              {currentSavingsRate}%
            </p>
          </div>
        </div>

        {/* Comparative Trend */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/30 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-md">
          <div className="flex items-center gap-3">
            {Number(expensePctChange) <= 0 ? (
              <TrendingDown className="w-6 h-6 text-emerald-500 shrink-0 font-black" />
            ) : (
              <TrendingUp className="w-6 h-6 text-red-500 shrink-0 font-black" />
            )}
            <div>
              <p className="font-black text-gray-950 dark:text-white text-sm">Comparison with {formatMonthName(prevMonthKey)}</p>
              <p className="text-slate-700 dark:text-slate-200 mt-0.5 font-semibold">
                {Number(expensePctChange) <= 0
                  ? `Spending decreased by ${Math.abs(Number(expensePctChange))}% compared to last month. Excellent restraint!`
                  : `Spending increased by ${expensePctChange}% compared to last month. Check highest expense drivers below.`}
              </p>
            </div>
          </div>
        </div>

        {/* Top Expenses Distribution */}
        <div className="space-y-3">
          <h3 className="font-black text-sm text-gray-950 dark:text-white">Top Spending Breakdown</h3>
          <div className="space-y-2">
            {sortedCats.map((cat, idx) => {
              const pct = currentExpenses > 0 ? ((cat.amount / currentExpenses) * 100).toFixed(0) : '0';
              return (
                <div
                  key={cat.name}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-black text-xs border border-emerald-500/30">
                      {idx + 1}
                    </span>
                    <span className="font-black text-gray-950 dark:text-white">{cat.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-gray-950 dark:text-white text-sm">{formatUGX(cat.amount)}</span>
                    <span className="text-slate-700 dark:text-slate-300 font-bold text-xs">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Month Recommendations */}
        <div className="p-4 sm:p-5 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-2 text-xs shadow-sm">
          <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-black text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Next Month Optimization Action Plan</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-800 dark:text-slate-200 pl-1 font-semibold">
            <li>
              {topCategory
                ? `Set a strict category cap for ${topCategory.name} to keep it under 30% of total outflow.`
                : 'Maintain budget caps across all essential categories.'}
            </li>
            <li>Allocate at least 15% of upcoming income directly into your Emergency Buffer goal.</li>
            <li>Use the Safe-to-Spend daily allowance gauge every morning before making non-essential purchases.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
