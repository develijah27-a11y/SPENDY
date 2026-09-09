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
    <div className="rounded-3xl bg-white dark:bg-[#0B0F19] border border-slate-200/90 dark:border-slate-800/90 p-5 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <PiggyBank className="w-5 h-5 font-black" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-black text-sm text-slate-950 dark:text-white">Monthly Budgets</h3>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Spending limits &amp; thresholds</p>
          </div>
        </div>
        <Link
          href="/budgets"
          className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1 transition-colors"
        >
          <span>All limits</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>

      {/* Overall Total Budget Meter */}
      {totalPlanned > 0 ? (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800/70 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200">Month Budget Target</span>
            <span className="font-mono text-xs text-slate-600 dark:text-slate-300 font-semibold tabular-nums">
              <strong className="text-slate-950 dark:text-white font-black">{formatUGX(totalSpent)}</strong> / {formatUGX(totalPlanned)}
            </span>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallPercentage >= 100
                  ? 'bg-rose-500'
                  : overallPercentage >= 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, overallPercentage)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-bold pt-0.5">
            <span className="text-slate-600 dark:text-slate-400">{overallPercentage.toFixed(0)}% allocated</span>
            {overallPercentage >= 100 ? (
              <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Over by {formatUGX(totalSpent - totalPlanned)}</span>
              </span>
            ) : overallPercentage >= 80 ? (
              <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Caution (80%+)</span>
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{formatUGX(totalPlanned - totalSpent)} left</span>
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800/70 text-xs text-center font-medium text-slate-500 dark:text-slate-400">
          No monthly limit configured.{' '}
          <Link href="/budgets" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline ml-1">
            Configure Budget
          </Link>
        </div>
      )}

      {/* Category Budgets list */}
      <div className="space-y-2 pt-1">
        {categoryBudgets.map((b) => (
          <div key={b.id} className="space-y-1.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-950 dark:text-white">{b.categoryName}</span>
              <span className="text-xs text-slate-600 dark:text-slate-400 font-mono font-semibold tabular-nums">
                {formatUGX(b.spent)} / {formatUGX(b.planned_amount)} ({b.percentage.toFixed(0)}%)
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, b.percentage)}%`,
                  backgroundColor: b.percentage >= 100 ? '#F43F5E' : b.percentage >= 80 ? '#F59E0B' : b.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
