'use client';

import React, { useState } from 'react';
import { useSpendy } from '@/lib/store/spendyStore';
import { formatUGX, formatMonthName, getCurrentMonthKey } from '@/lib/formatters';
import {
  CalendarCheck2,
  TrendingDown,
  TrendingUp,
  PiggyBank,
  Printer,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
} from 'lucide-react';

export default function ReviewPage() {
  const { transactions, budgets, savingsGoals, user } = useSpendy();
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
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <CalendarCheck2 className="w-6 h-6 text-emerald-400" />
            <span>Monthly Financial Review</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Month-end financial debrief, comparison metrics, and improvements for next month
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3.5 py-2 rounded-2xl bg-gray-900 border border-white/15 text-white text-xs font-semibold"
          >
            <option value={currentMonthKey}>{formatMonthName(currentMonthKey)} (Current)</option>
            <option value="2026-07">July 2026</option>
            <option value="2026-06">June 2026</option>
          </select>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Review Statement Card */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-white/15 shadow-2xl space-y-6">
        {/* Title */}
        <div className="border-b border-white/10 pb-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">
              Personal Financial Statement
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              {formatMonthName(selectedMonth)} Review
            </h2>
            <p className="text-xs text-gray-400">Prepared for {user.full_name || 'David Mukasa'}</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              UGX Standard
            </span>
          </div>
        </div>

        {/* 4 Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[11px] text-gray-400">Total Inflow</span>
            <p className="text-lg sm:text-xl font-bold text-emerald-400 font-mono mt-1">
              {formatUGX(currentIncome)}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[11px] text-gray-400">Total Outflow</span>
            <p className="text-lg sm:text-xl font-bold text-red-400 font-mono mt-1">
              {formatUGX(currentExpenses)}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[11px] text-gray-400">Net Retained</span>
            <p className="text-lg sm:text-xl font-bold text-blue-400 font-mono mt-1">
              {formatUGX(currentNetSaved)}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[11px] text-gray-400">Savings Rate</span>
            <p className="text-lg sm:text-xl font-bold text-purple-400 font-mono mt-1">
              {currentSavingsRate}%
            </p>
          </div>
        </div>

        {/* Comparative Trend */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            {Number(expensePctChange) <= 0 ? (
              <TrendingDown className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <TrendingUp className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <div>
              <p className="font-bold text-white">Comparison with {formatMonthName(prevMonthKey)}</p>
              <p className="text-gray-300 mt-0.5">
                {Number(expensePctChange) <= 0
                  ? `Spending decreased by ${Math.abs(Number(expensePctChange))}% compared to last month. Excellent restraint!`
                  : `Spending increased by ${expensePctChange}% compared to last month. Check highest expense drivers below.`}
              </p>
            </div>
          </div>
        </div>

        {/* Top Expenses Distribution */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-white">Top Spending Breakdown</h3>
          <div className="space-y-2">
            {sortedCats.map((cat, idx) => {
              const pct = currentExpenses > 0 ? ((cat.amount / currentExpenses) * 100).toFixed(0) : '0';
              return (
                <div
                  key={cat.name}
                  className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-white/10 text-gray-300 flex items-center justify-center font-bold text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-white">{cat.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white">{formatUGX(cat.amount)}</span>
                    <span className="text-gray-400 text-[11px]">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Month Recommendations */}
        <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-purple-300 font-bold">
            <Sparkles className="w-4 h-4" />
            <span>Next Month Optimization Action Plan</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-gray-300 pl-1">
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
