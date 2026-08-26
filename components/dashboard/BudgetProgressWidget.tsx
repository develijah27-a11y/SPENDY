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
    <div className="rounded-3xl glass-panel p-5 sm:p-6 border border-white/10 shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
            <PiggyBank className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Monthly Budgets</h3>
            <p className="text-[11px] text-gray-400">Track spending vs plan</p>
          </div>
        </div>
        <Link
          href="/budgets"
          className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors"
        >
          <span>All budgets</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Overall Total Budget Meter */}
      {totalPlanned > 0 ? (
        <div className="mt-4 p-3.5 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-gray-200">Overall Month Limit</span>
            <span className="font-mono text-gray-300">
              <strong className="text-white">{formatUGX(totalSpent)}</strong> / {formatUGX(totalPlanned)}
            </span>
          </div>

          <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallPercentage >= 100
                  ? 'bg-red-500'
                  : overallPercentage >= 80
                  ? 'bg-amber-400'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, overallPercentage)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] mt-2">
            <span className="text-gray-400">{overallPercentage.toFixed(0)}% used</span>
            {overallPercentage >= 100 ? (
              <span className="text-red-400 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Exceeded by {formatUGX(totalSpent - totalPlanned)}
              </span>
            ) : overallPercentage >= 80 ? (
              <span className="text-amber-400 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Warning (80%+)
              </span>
            ) : (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {formatUGX(totalPlanned - totalSpent)} remaining
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-4 p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-center text-gray-400">
          No overall budget set yet.{' '}
          <Link href="/budgets" className="text-emerald-400 underline font-medium">
            Set Monthly Budget
          </Link>
        </div>
      )}

      {/* Category Budgets list */}
      <div className="mt-4 space-y-3">
        {categoryBudgets.map((b) => (
          <div key={b.id} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-300 font-medium">{b.categoryName}</span>
              <span className="text-[11px] text-gray-400 font-mono">
                {formatUGX(b.spent)} / {formatUGX(b.planned_amount)} ({b.percentage.toFixed(0)}%)
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, b.percentage)}%`,
                  backgroundColor: b.percentage >= 100 ? '#EF4444' : b.percentage >= 80 ? '#FBBF24' : b.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
