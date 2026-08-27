'use client';

import React, { useState } from 'react';
import { useSpendy } from '@/lib/store/spendyStore';
import { formatUGX, formatMonthName, getCurrentMonthKey } from '@/lib/formatters';
import {
  PiggyBank,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  X,
} from 'lucide-react';

export default function BudgetsPage() {
  const { budgets, transactions, categories, setBudget } = useSpendy();
  const currentMonthKey = getCurrentMonthKey();

  const [showModal, setShowModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('overall');
  const [plannedAmount, setPlannedAmount] = useState<string>('');

  // Transactions for current month
  const monthTx = transactions.filter((t) => t.type === 'expense' && t.transaction_date.startsWith(currentMonthKey));
  const totalSpent = monthTx.reduce((sum, t) => sum + t.amount, 0);

  // Overall budget
  const overallBudget = budgets.find((b) => b.month === currentMonthKey && !b.category_id);
  const overallPlanned = overallBudget?.planned_amount || 0;
  const overallPercentage = overallPlanned > 0 ? (totalSpent / overallPlanned) * 100 : 0;

  // Category budgets
  const categoryBudgets = categories
    .filter((c) => c.type === 'expense')
    .map((cat) => {
      const budget = budgets.find((b) => b.month === currentMonthKey && b.category_id === cat.id);
      const spent = monthTx.filter((t) => t.category_id === cat.id).reduce((sum, t) => sum + t.amount, 0);
      const planned = budget?.planned_amount || 0;
      const percentage = planned > 0 ? (spent / planned) * 100 : 0;
      return {
        category: cat,
        budgetId: budget?.id,
        planned,
        spent,
        remaining: Math.max(0, planned - spent),
        percentage,
        isOverBudget: planned > 0 && spent > planned,
      };
    })
    .filter((b) => b.planned > 0 || b.spent > 0);

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(plannedAmount.replace(/,/g, ''));
    if (!isNaN(amt) && amt >= 0) {
      setBudget({
        category_id: selectedCategoryId === 'overall' ? null : selectedCategoryId,
        planned_amount: amt,
        month: currentMonthKey,
      });
      setShowModal(false);
      setPlannedAmount('');
    }
  };

  const openSetModal = (catId: string = 'overall', currentAmt: number = 0) => {
    setSelectedCategoryId(catId);
    setPlannedAmount(currentAmt ? currentAmt.toString() : '');
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white tracking-tight flex items-center gap-2.5">
            <PiggyBank className="w-7 h-7 text-emerald-600 dark:text-emerald-400 font-black" />
            <span>Monthly Budgets</span>
          </h1>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-1">
            Plan your spending for {formatMonthName(currentMonthKey)} and prevent overspending
          </p>
        </div>

        <button
          onClick={() => openSetModal('overall', overallPlanned)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition-all cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Set Category / Total Budget</span>
        </button>
      </div>

      {/* Overall Month Budget Card */}
      <div className="rounded-3xl glass-panel p-6 sm:p-7 border border-black/15 dark:border-white/20 relative overflow-hidden shadow-2xl space-y-4">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Total Monthly Spending Limit
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-3xl sm:text-5xl font-black text-gray-950 dark:text-white font-mono">{formatUGX(totalSpent)}</h2>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                / {formatUGX(overallPlanned || 0)}
              </span>
            </div>
          </div>

          <button
            onClick={() => openSetModal('overall', overallPlanned)}
            className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-gray-950 dark:text-white text-xs font-bold border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer shadow-sm"
          >
            {overallPlanned > 0 ? 'Edit Limit' : 'Set Limit'}
          </button>
        </div>

        {/* Big Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden shadow-inner">
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

          <div className="flex items-center justify-between text-xs font-bold pt-1">
            <span className="text-slate-700 dark:text-slate-300">{overallPercentage.toFixed(0)}% of month limit used</span>
            {overallPercentage >= 100 ? (
              <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> Exceeded by {formatUGX(totalSpent - overallPlanned)}
              </span>
            ) : overallPercentage >= 80 ? (
              <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> High spending warning (80%+)
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> {formatUGX(overallPlanned - totalSpent)} remaining
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div>
        <h3 className="font-black text-base text-gray-950 dark:text-white mb-3">Category Budgets</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryBudgets.map((b) => (
            <div
              key={b.category.id}
              className="rounded-3xl glass-panel p-5 sm:p-6 border border-black/15 dark:border-white/20 relative group hover:border-emerald-500/40 transition-all flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: b.category.color }}
                    />
                    <h4 className="font-black text-sm text-gray-950 dark:text-white">{b.category.name}</h4>
                  </div>

                  <button
                    onClick={() => openSetModal(b.category.id, b.planned)}
                    aria-label="Edit budget"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-gray-950 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Spent:</span>
                    <p className="text-xl sm:text-2xl font-black font-mono text-gray-950 dark:text-white">{formatUGX(b.spent)}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Budget:</span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {b.planned > 0 ? formatUGX(b.planned) : 'Unbudgeted'}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                {b.planned > 0 && (
                  <div className="mt-3 space-y-1.5">
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden shadow-inner">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          b.percentage >= 100
                            ? 'bg-red-500'
                            : b.percentage >= 80
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, b.percentage)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-700 dark:text-slate-300">{b.percentage.toFixed(0)}% used</span>
                      {b.percentage >= 100 ? (
                        <span className="text-red-600 dark:text-red-400">Exceeded</span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400">{formatUGX(b.remaining)} left</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl glass-panel p-6 border border-black/20 dark:border-white/20 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <h3 className="font-black text-base text-gray-950 dark:text-white">Set Budget Target</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-gray-900 dark:text-white mb-1">Target Category</label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-bold"
                >
                  <option value="overall">⭐ Overall Total Monthly Budget</option>
                  {categories
                    .filter((c) => c.type === 'expense')
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-900 dark:text-white mb-1">Planned Budget (UGX)</label>
                <input
                  type="number"
                  required
                  value={plannedAmount}
                  onChange={(e) => setPlannedAmount(e.target.value)}
                  placeholder="e.g. 450,000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-black text-base"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                Save Budget Target
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
