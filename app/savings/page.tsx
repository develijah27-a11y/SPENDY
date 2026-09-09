'use client';

import React, { useState } from 'react';
import { useSpendy } from '@/lib/store/spendyStore';
import { formatUGX } from '@/lib/formatters';
import {
  Target,
  Plus,
  Sparkles,
  Trash2,
  X,
  PiggyBank,
  Calendar,
} from 'lucide-react';

export default function SavingsPage() {
  const { savingsGoals, accounts, addSavingsGoal, contributeToGoal, deleteSavingsGoal } = useSpendy();

  const [showAddModal, setShowAddModal] = useState(false);
  const [contributeGoalId, setContributeGoalId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [color, setColor] = useState('#10B981');

  // Contribution state
  const [contribAmount, setContribAmount] = useState('50000');
  const [contribAccountId, setContribAccountId] = useState(accounts[0]?.id || '');

  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setShowAddModal(false);
        setContributeGoalId(null);
      }
    }
    if (showAddModal || contributeGoalId) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [showAddModal, contributeGoalId]);

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount.replace(/,/g, ''));
    if (!isNaN(target) && target > 0 && name.trim()) {
      addSavingsGoal({
        name: name.trim(),
        purpose: purpose.trim() || undefined,
        target_amount: target,
        deadline: deadline || undefined,
        color,
      });
      setShowAddModal(false);
      setName('');
      setPurpose('');
      setTargetAmount('');
      setDeadline('');
    }
  };

  const handleContribute = (goalId: string) => {
    const amt = parseFloat(contribAmount);
    if (!isNaN(amt) && amt > 0 && contribAccountId) {
      contributeToGoal(goalId, amt, contribAccountId);
      setContributeGoalId(null);
    }
  };

  const totalSaved = savingsGoals.reduce((sum, g) => sum + g.current_amount, 0);
  const totalTarget = savingsGoals.reduce((sum, g) => sum + g.target_amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white tracking-tight flex items-center gap-2.5">
            <Target className="w-7 h-7 text-emerald-600 dark:text-emerald-400 font-black" />
            <span>Savings Goals</span>
          </h1>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-1">
            Build funds for tuition, emergency buffer, coding equipment, and businesses
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>New Savings Goal</span>
        </button>
      </div>

      {/* Aggregate Savings Banner (One Primary Metric) */}
      <div className="rounded-2xl p-6 sm:p-7 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Total Accumulated in Savings
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Target: {formatUGX(totalTarget)}
          </span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-slate-950 dark:text-white font-mono tabular-nums">{formatUGX(totalSaved)}</h2>
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden mt-3">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${totalTarget > 0 ? Math.min(100, (totalSaved / totalTarget) * 100) : 0}%` }}
          />
        </div>
      </div>

      {/* Goals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {savingsGoals.map((g) => {
          const pct = Math.min(100, (g.current_amount / g.target_amount) * 100);
          const isCompleted = g.current_amount >= g.target_amount;

          return (
            <div
              key={g.id}
              className={`rounded-2xl p-5 sm:p-6 border relative group transition-all flex flex-col justify-between ${
                isCompleted
                  ? 'border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-950/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A]'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 bg-emerald-600"
                    >
                      <PiggyBank className="w-5 h-5 font-bold" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-950 dark:text-white">{g.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{g.purpose || 'Personal priority'}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteSavingsGoal(g.id)}
                    aria-label={`Delete ${g.name} savings goal`}
                    className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 p-2 rounded-xl text-slate-400 hover:text-red-500 transition-all cursor-pointer touch-target flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>

                <div className="mt-5">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Progress:</span>
                  <div className="flex items-baseline justify-between mt-0.5">
                    <p className="text-xl sm:text-2xl font-black font-mono text-slate-950 dark:text-white">{formatUGX(g.current_amount)}</p>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      of {formatUGX(g.target_amount)} ({pct.toFixed(0)}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden mt-2">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {g.deadline && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                    <span>Target deadline: {g.deadline}</span>
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="mt-5 pt-3 border-t border-slate-200 dark:border-white/10">
                {isCompleted ? (
                  <div className="flex items-center justify-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-black text-xs py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                    <Sparkles className="w-4 h-4" aria-hidden="true" />
                    <span>Goal 100% Achieved!</span>
                  </div>
                ) : (
                  <div>
                    {contributeGoalId === g.id ? (
                      <div className="space-y-2 animate-in fade-in duration-150">
                        <div>
                          <label htmlFor={`contrib-acc-${g.id}`} className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Pay From Account
                          </label>
                          <select
                            id={`contrib-acc-${g.id}`}
                            value={contribAccountId}
                            onChange={(e) => setContribAccountId(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          >
                            {accounts.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.name} ({formatUGX(a.balance)})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor={`contrib-amt-${g.id}`} className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Amount (UGX)
                          </label>
                          <div className="flex gap-2">
                            <input
                              id={`contrib-amt-${g.id}`}
                              type="number"
                              min="100"
                              value={contribAmount}
                              onChange={(e) => setContribAmount(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleContribute(g.id)}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md cursor-pointer touch-target flex items-center justify-center"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setContributeGoalId(g.id)}
                        className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md touch-target"
                      >
                        <Plus className="w-4 h-4" aria-hidden="true" />
                        <span>Contribute to Goal</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-savings-goal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <div className="w-full max-w-md rounded-3xl glass-panel p-6 border border-black/20 dark:border-white/20 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <h3 id="create-savings-goal-title" className="font-black text-base text-gray-950 dark:text-white">Create Savings Goal</h3>
              <button
                onClick={() => setShowAddModal(false)}
                aria-label="Close dialog"
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-gray-950 dark:hover:text-white transition-colors touch-target flex items-center justify-center"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label htmlFor="savings-goal-name" className="block font-bold text-gray-900 dark:text-white mb-1">
                  Goal Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="savings-goal-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tuition, New Laptop, Land Deposit"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label htmlFor="savings-goal-purpose" className="block font-bold text-gray-900 dark:text-white mb-1">
                  Purpose / Reason
                </label>
                <input
                  id="savings-goal-purpose"
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Semester 2 school fees at Makerere"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="savings-goal-target" className="block font-bold text-gray-900 dark:text-white mb-1">
                    Target (UGX) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="savings-goal-target"
                    type="number"
                    min="1"
                    required
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="1,500,000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label htmlFor="savings-goal-deadline" className="block font-bold text-gray-900 dark:text-white mb-1">
                    Target Deadline
                  </label>
                  <input
                    id="savings-goal-deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <span className="block font-bold text-gray-900 dark:text-white mb-1">Badge Color</span>
                <div className="flex gap-2" role="radiogroup" aria-label="Goal Badge Color">
                  {['#10B981', '#3B82F6', '#8B5CF6', '#FBBF24', '#EF4444', '#EC4899'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      role="radio"
                      aria-checked={color === c}
                      aria-label={`Select badge color ${c}`}
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full border-2 cursor-pointer touch-target ${
                        color === c ? 'scale-110 border-emerald-500 ring-2 ring-emerald-500/30' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer mt-2 touch-target flex items-center justify-center"
              >
                Create Goal
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
