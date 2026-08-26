'use client';

import React from 'react';
import { useSpendy } from '@/lib/store/spendyStore';
import { formatUGX, formatMonthName, getCurrentMonthKey } from '@/lib/formatters';
import { ArrowDownRight, ArrowUpRight, PiggyBank, Sparkles } from 'lucide-react';

export function MonthlySummaryCard() {
  const { monthlyIncome, monthlyExpenses, netSavings } = useSpendy();

  const currentMonthName = formatMonthName(getCurrentMonthKey());
  const savingsRate = monthlyIncome > 0 ? ((netSavings / monthlyIncome) * 100).toFixed(0) : '0';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* Income */}
      <div className="rounded-3xl glass-panel p-4 sm:p-5 border border-white/10 relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400">{currentMonthName} Income</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <p className="text-xl sm:text-2xl font-bold text-white mt-2 tracking-tight">
          {formatUGX(monthlyIncome)}
        </p>
        <span className="text-[11px] text-emerald-400 mt-1 inline-block font-medium">
          Received this month
        </span>
      </div>

      {/* Expenses */}
      <div className="rounded-3xl glass-panel p-4 sm:p-5 border border-white/10 relative overflow-hidden group hover:border-red-500/30 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400">{currentMonthName} Spent</span>
          <div className="w-8 h-8 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center">
            <ArrowDownRight className="w-4 h-4" />
          </div>
        </div>
        <p className="text-xl sm:text-2xl font-bold text-white mt-2 tracking-tight">
          {formatUGX(monthlyExpenses)}
        </p>
        <span className="text-[11px] text-red-400 mt-1 inline-block font-medium">
          Total money spent
        </span>
      </div>

      {/* Net Saved */}
      <div className="rounded-3xl glass-panel p-4 sm:p-5 border border-white/10 relative overflow-hidden group hover:border-blue-500/30 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400">Money Left / Saved</span>
          <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
            <PiggyBank className="w-4 h-4" />
          </div>
        </div>
        <p className="text-xl sm:text-2xl font-bold text-white mt-2 tracking-tight">
          {formatUGX(netSavings)}
        </p>
        <span className="text-[11px] text-blue-400 mt-1 inline-block font-medium">
          {savingsRate}% savings rate
        </span>
      </div>
    </div>
  );
}
