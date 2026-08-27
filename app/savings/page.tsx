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
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition-all cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>New Savings Goal</span>
        </button>
      </div>

      {/* Aggregate Savings Banner */}
      <div className="rounded-3xl p-6 sm:p-7 glass-panel border border-black/15 dark:border-white/20 relative overflow-hidden shadow-2xl space-y-2 bg-gradient-to-tr from-emerald-950/40 via-slate-900/60 to-teal-950/20">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Total Accumulated in Savings
          </span>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Target: {formatUGX(totalTarget)}
          </span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-gray-950 dark:text-white font-mono">{formatUGX(totalSaved)}</h2>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden mt-3 shadow-inner">
          <div
            className="bg-gradient-to-r from-blue-500 via-teal-400 to-emerald-400 h-full rounded-full transition-all duration-500"
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
              className={`rounded-3xl glass-panel p-5 sm:p-6 border relative group transition-all flex flex-col justify-between shadow-lg ${
                isCompleted ? 'border-emerald-500/50 bg-emerald-500/10 dark:bg-emerald-950/30' : 'border-black/15 dark:border-white/20 hover:border-emerald-500/40'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md"
                      style={{ backgroundColor: g.color || '#10B981' }}
                    >
                      <PiggyBank className="w-5 h-5 font-black" />
                    </div>
                    <div>
                      <h3 className="font-black text-base text-gray-950 dark:text-white">{g.name}</h3>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{g.purpose || 'Personal priority'}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteSavingsGoal(g.id)}
                    aria-label="Delete goal"
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-red-500 transition-opacity cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Progress:</span>
                  <div className="flex items-baseline justify-between mt-0.5">
                    <p className="text-xl sm:text-2xl font-black font-mono text-gray-950 dark:text-white">{formatUGX(g.current_amount)}</p>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      of {formatUGX(g.target_amount)} ({pct.toFixed(0)}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden mt-2 shadow-inner">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {g.deadline && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Target deadline: {g.deadline}</span>
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="mt-5 pt-3 border-t border-slate-200 dark:border-white/10">
                {isCompleted ? (
                  <div className="flex items-center justify-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-black text-xs py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                    <Sparkles className="w-4 h-4" />
                    <span>Goal 100% Achieved!</span>
                  </div>
                ) : (
                  <div>
                    {contributeGoalId === g.id ? (
                      <div className="space-y-2 animate-in fade-in duration-150">
                        <select
                          value={contribAccountId}
                          onChange={(e) => setContribAccountId(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white text-xs font-bold"
                        >
                          {accounts.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.name} ({formatUGX(a.balance)})
                            </option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={contribAmount}
                            onChange={(e) => setContribAmount(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white text-xs font-mono font-bold"
                          />
                          <button
                            onClick={() => handleContribute(g.id)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setContributeGoalId(g.id)}
                        className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <Plus className="w-4 h-4" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl glass-panel p-6 border border-black/20 dark:border-white/20 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <h3 className="font-black text-base text-gray-950 dark:text-white">Create Savings Goal</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-bold text-gray-900 dark:text-white mb-1">Goal Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tuition, New Laptop, Land Deposit"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-900 dark:text-white mb-1">Purpose / Reason</label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Semester 2 school fees at Makerere"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-900 dark:text-white mb-1">Target (UGX)</label>
                  <input
                    type="number"
                    required
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="1,500,000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-black"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-900 dark:text-white mb-1">Target Deadline</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-900 dark:text-white mb-1">Badge Color</label>
                <div className="flex gap-2">
                  {['#10B981', '#3B82F6', '#8B5CF6', '#FBBF24', '#EF4444', '#EC4899'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full border-2 cursor-pointer ${
                        color === c ? 'scale-110 border-emerald-500' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer mt-2"
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
