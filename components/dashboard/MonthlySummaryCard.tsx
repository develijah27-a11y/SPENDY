'use client';

import React from 'react';
import { useSpendy } from '@/lib/store/spendyStore';
import { formatUGX, formatMonthName, getCurrentMonthKey } from '@/lib/formatters';
import { ArrowDownRight, ArrowUpRight, PiggyBank } from 'lucide-react';

export function MonthlySummaryCard() {
  const { monthlyIncome, monthlyExpenses, netSavings } = useSpendy();

  const currentMonthName = formatMonthName(getCurrentMonthKey());
  const savingsRate = monthlyIncome > 0 ? ((netSavings / monthlyIncome) * 100).toFixed(0) : '0';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* Income */}
      <div className="rounded-3xl glass-panel p-4 sm:p-5 border border-black/15 dark:border-white/20 relative overflow-hidden group hover:border-emerald-500/40 transition-colors shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{currentMonthName} Income</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
            <ArrowUpRight className="w-4 h-4 font-black" />
          </div>
        </div>
        <p className="text-xl sm:text-2xl font-black text-gray-950 dark:text-white mt-2 tracking-tight">
          {formatUGX(monthlyIncome)}
        </p>
        <span className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 inline-block font-bold">
          Received this month
        </span>
      </div>

      {/* Expenses */}
      <div className="rounded-3xl glass-panel p-4 sm:p-5 border border-black/15 dark:border-white/20 relative overflow-hidden group hover:border-red-500/40 transition-colors shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{currentMonthName} Spent</span>
          <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center shadow-sm">
            <ArrowDownRight className="w-4 h-4 font-black" />
          </div>
        </div>
        <p className="text-xl sm:text-2xl font-black text-gray-950 dark:text-white mt-2 tracking-tight">
          {formatUGX(monthlyExpenses)}
        </p>
        <span className="text-xs text-red-600 dark:text-red-400 mt-1 inline-block font-bold">
          Total money spent
        </span>
      </div>

      {/* Net Saved */}
      <div className="rounded-3xl glass-panel p-4 sm:p-5 border border-black/15 dark:border-white/20 relative overflow-hidden group hover:border-blue-500/40 transition-colors shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Money Left / Saved</span>
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm">
            <PiggyBank className="w-4 h-4 font-black" />
          </div>
        </div>
        <p className="text-xl sm:text-2xl font-black text-gray-950 dark:text-white mt-2 tracking-tight">
          {formatUGX(netSavings)}
        </p>
        <span className="text-xs text-blue-600 dark:text-blue-400 mt-1 inline-block font-bold">
          {savingsRate}% net savings rate
        </span>
      </div>
    </div>
  );
}
