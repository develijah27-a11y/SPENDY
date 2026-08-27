'use client';

import React from 'react';
import Link from 'next/link';
import { useSpendy } from '@/lib/store/spendyStore';
import { formatUGX, getCurrentMonthKey } from '@/lib/formatters';
import { PiggyBank, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function BudgetProgressWidget() {
  const { budgets, transactions, categories } = useSpendy();
  const currentMonthKey = getCurrentMonthKey();

  const monthTx = transactions.filter((t) => t.type === 'expense' && t.transaction_date.startsWith(currentMonthKey));

  // Overall Budget
  const totalBudget = budgets.find((b) => b.month === currentMonthKey && !b.category_id);
  const totalSpent = monthTx.reduce((sum, t) => sum + t.amount, 0);

  const totalPlanned = totalBudget ? totalBudget.planned_amount : 0;
  const overallPercentage = totalPlanned > 0 ? (totalSpent / totalPlanned) * 100 : 0;

  // Category Budgets
  const categoryBudgets = budgets
    .filter((b) => b.month === currentMonthKey && b.category_id)
    .map((b) => {
      const category = categories.find((c) => c.id === b.category_id);
      const catSpent = monthTx
        .filter((t) => t.category_id === b.category_id)
        .reduce((sum, t) => sum + t.amount, 0);
      const percentage = b.planned_amount > 0 ? (catSpent / b.planned_amount) * 100 : 0;
      return {
        ...b,
        categoryName: category?.name || 'Category',
        color: category?.color || '#10B981',
        spent: catSpent,
        percentage,
      };
    })
    .slice(0, 4);

  return (
    <div className="rounded-3xl glass-panel p-5 sm:p-6 border border-black/15 dark:border-white/20 shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/15">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-sm">
            <PiggyBank className="w-5 h-5 font-black" />
          </div>
          <div>
            <h3 className="font-black text-sm text-gray-950 dark:text-white">Monthly Budgets</h3>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Track spending vs plan</p>
          </div>
        </div>
        <Link
          href="/budgets"
          className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1 transition-colors"
        >
          <span>All budgets</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Overall Total Budget Meter */}
      {totalPlanned > 0 ? (
        <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">Overall Month Limit</span>
            <span className="font-mono text-xs text-slate-700 dark:text-slate-300 font-semibold">
              <strong className="text-gray-950 dark:text-white font-black">{formatUGX(totalSpent)}</strong> / {formatUGX(totalPlanned)}
            </span>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallPercentage >= 100
                  ? 'bg-red-500'
                  : overallPercentage >= 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, overallPercentage)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-bold mt-2.5">
            <span className="text-slate-700 dark:text-slate-300">{overallPercentage.toFixed(0)}% used</span>
            {overallPercentage >= 100 ? (
              <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Exceeded by {formatUGX(totalSpent - totalPlanned)}
              </span>
            ) : overallPercentage >= 80 ? (
              <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Warning (80%+)
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {formatUGX(totalPlanned - totalSpent)} remaining
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-center font-bold text-slate-700 dark:text-slate-300">
          No overall budget set yet.{' '}
          <Link href="/budgets" className="text-emerald-600 dark:text-emerald-400 underline ml-1">
            Set Monthly Budget
          </Link>
        </div>
      )}

      {/* Category Budgets list */}
      <div className="mt-4 space-y-3">
        {categoryBudgets.map((b) => (
          <div key={b.id} className="space-y-1.5 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-gray-950 dark:text-white">{b.categoryName}</span>
              <span className="text-xs text-slate-700 dark:text-slate-300 font-mono font-semibold">
                {formatUGX(b.spent)} / {formatUGX(b.planned_amount)} ({b.percentage.toFixed(0)}%)
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, b.percentage)}%`,
                  backgroundColor: b.percentage >= 100 ? '#EF4444' : b.percentage >= 80 ? '#F59E0B' : b.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
