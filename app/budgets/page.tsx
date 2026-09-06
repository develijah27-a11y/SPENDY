'use client';

import React, { useState } from 'react';
import { useSpendy } from '@/lib/store/spendyStore';
import { formatCurrency, formatMonthName, getCurrentMonthKey } from '@/lib/formatters';
import {
  PiggyBank,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Trash2,
  X,
  Layers,
} from 'lucide-react';

export default function BudgetsPage() {
  const { budgets, transactions, categories, setBudget, deleteBudget } = useSpendy();
  const currentMonthKey = getCurrentMonthKey();

  const [showModal, setShowModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('overall');
  const [plannedAmount, setPlannedAmount] = useState<string>('');

  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setShowModal(false);
    }
    if (showModal) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [showModal]);

  // Transactions for current month
  const monthTx = transactions.filter(
    (t) => t.type === 'expense' && t.transaction_date.startsWith(currentMonthKey)
  );
  const totalSpent = monthTx.reduce((sum, t) => sum + t.amount, 0);

  // Overall budget
  const overallBudget = budgets.find((b) => b.month === currentMonthKey && !b.category_id);
  const overallPlanned = overallBudget?.planned_amount || 0;
  const overallPercentage = overallPlanned > 0 ? (totalSpent / overallPlanned) * 100 : 0;
  const overallRemaining = overallPlanned - totalSpent;

  // Category budgets
  const categoryBudgets = categories
    .filter((c) => c.type === 'expense')
    .map((cat) => {
      const budget = budgets.find((b) => b.month === currentMonthKey && b.category_id === cat.id);
      const spent = monthTx
        .filter((t) => t.category_id === cat.id)
        .reduce((sum, t) => sum + t.amount, 0);
      const planned = budget?.planned_amount || 0;
      const percentage = planned > 0 ? (spent / planned) * 100 : 0;
      const remaining = planned - spent;
      return {
        category: cat,
        budgetId: budget?.id,
        planned,
        spent,
        remaining,
        percentage,
        isOverBudget: planned > 0 && spent > planned,
      };
    })
    .filter((b) => b.planned > 0 || b.spent > 0);

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(plannedAmount.replace(/[^0-9]/g, ''));
    if (!isNaN(amt) && amt > 0) {
      await setBudget({
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-2.5">
            <PiggyBank className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <span>Budgets</span>
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
            Set monthly category spending limits for {formatMonthName(currentMonthKey)}
          </p>
        </div>

        <button
          onClick={() => openSetModal('overall', overallPlanned)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all active:scale-98 cursor-pointer touch-target w-fit"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Set Budget Limit</span>
        </button>
      </div>

      {/* 2. Total Monthly Spending Overview Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0E1628] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Monthly Spending Limit
            </span>
            <p className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white font-mono tabular-nums mt-1">
              {overallPlanned > 0 ? formatCurrency(overallPlanned) : 'No Overall Limit Set'}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Spent this Month
            </span>
            <p className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white font-mono tabular-nums mt-1">
              {formatCurrency(totalSpent)}
            </p>
          </div>
        </div>

        {overallPlanned > 0 && (
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300">
                {overallPercentage.toFixed(0)}% used
              </span>
              <span
                className={`font-mono ${
                  overallRemaining < 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {overallRemaining < 0
                  ? `Exceeded by ${formatCurrency(Math.abs(overallRemaining))}`
                  : `${formatCurrency(overallRemaining)} remaining`}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  overallRemaining < 0
                    ? 'bg-red-500'
                    : overallPercentage > 80
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(2, overallPercentage))}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Category Budgets Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-950 dark:text-white">
            Category Budgets
          </h2>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {categoryBudgets.length} active budgets
          </span>
        </div>

        {categoryBudgets.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-[#0E1628] border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              No category budgets set for this month. Set budgets to keep your food, transport, and bills on track.
            </p>
            <button
              onClick={() => openSetModal('cat-food', 300000)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Category Budget</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryBudgets.map((b) => (
              <div
                key={b.category.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#0E1628] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs"
                      style={{
                        backgroundColor: `${b.category.color}20`,
                        color: b.category.color,
                      }}
                    >
                      {b.category.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-950 dark:text-white leading-tight">
                        {b.category.name}
                      </h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {formatCurrency(b.planned)} / month
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => openSetModal(b.category.id, b.planned)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                    title="Edit budget"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">
                      Spent: {formatCurrency(b.spent)}
                    </span>
                    <span className="font-mono font-bold text-slate-950 dark:text-white">
                      {b.percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        b.isOverBudget
                          ? 'bg-red-500'
                          : b.percentage > 80
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(3, b.percentage))}%` }}
                    />
                  </div>
                </div>

                {/* Feedback message */}
                {b.isOverBudget ? (
                  <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-[11px] font-semibold text-red-700 dark:text-red-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>You&apos;ve exceeded this budget by {formatCurrency(Math.abs(b.remaining))}.</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 font-mono">
                    <span>Remaining</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {formatCurrency(b.remaining)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Set Budget Modal */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div className="w-full max-w-md rounded-t-[28px] sm:rounded-3xl bg-white dark:bg-[#0E1628] border-t sm:border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 space-y-4 pb-safe">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-black text-slate-950 dark:text-white">
                Set Monthly Budget
              </h2>
              <button
                onClick={() => setShowModal(false)}
                aria-label="Close dialog"
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors touch-target flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">
                  Budget Target
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="overall">Overall Total Monthly Spending Limit</option>
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
                <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">
                  Monthly Limit (UGX)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 300000"
                  value={plannedAmount}
                  onChange={(e) => setPlannedAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm font-black font-mono text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-sm cursor-pointer"
                >
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
