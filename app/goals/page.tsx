'use client';

import React, { useState } from 'react';
import { useSpendy } from '@/lib/store/spendyStore';
import { formatUGX } from '@/lib/formatters';
import {
  Flame,
  Plus,
  Trash2,
  Calendar,
  X,
  TrendingUp,
} from 'lucide-react';

export default function GoalsPage() {
  const { financialGoals, addFinancialGoal, deleteFinancialGoal } = useSpendy();

  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount.replace(/,/g, ''));
    if (!isNaN(target) && target > 0 && title.trim()) {
      addFinancialGoal({
        title: title.trim(),
        description: description.trim() || undefined,
        target_amount: target,
        current_amount: 0,
        target_date: targetDate || undefined,
      });
      setShowAddModal(false);
      setTitle('');
      setDescription('');
      setTargetAmount('');
      setTargetDate('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white tracking-tight flex items-center gap-2.5">
            <Flame className="w-7 h-7 text-amber-500 font-black" />
            <span>Financial Milestones</span>
          </h1>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-1">
            Plan multi-year financial goals (starting a business, buying land, commercial boda)
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition-all cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>New Financial Milestone</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {financialGoals.map((fg) => {
          const pct = Math.min(100, (fg.current_amount / fg.target_amount) * 100);

          return (
            <div
              key={fg.id}
              className="rounded-3xl glass-panel p-6 border border-black/15 dark:border-white/20 relative group hover:border-amber-500/40 transition-all flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30 shadow-sm">
                      <TrendingUp className="w-5 h-5 font-black" />
                    </div>
                    <div>
                      <h3 className="font-black text-base text-gray-950 dark:text-white">{fg.title}</h3>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{fg.description || 'Long term dream'}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteFinancialGoal(fg.id)}
                    aria-label="Delete milestone"
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-red-500 transition-opacity cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-5">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-slate-700 dark:text-slate-300 font-bold">Target Capital:</span>
                    <span className="font-black font-mono text-gray-950 dark:text-white text-base">
                      {formatUGX(fg.target_amount)}
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden mt-2 shadow-inner">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mt-2">
                    <span>Allocated: {formatUGX(fg.current_amount)}</span>
                    <span>{pct.toFixed(0)}% ready</span>
                  </div>
                </div>

                {fg.target_date && (
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 pt-3 border-t border-slate-200 dark:border-white/10">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span>Target Achievement Date: {fg.target_date}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl glass-panel p-6 border border-black/20 dark:border-white/20 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <h3 className="font-black text-base text-gray-950 dark:text-white">Create Financial Milestone</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-bold text-gray-900 dark:text-white mb-1">Milestone Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Start Mukono Poultry Farm, Buy Plot in Gayaza"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-900 dark:text-white mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 500 layers chicks & land lease"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-900 dark:text-white mb-1">Target Capital (UGX)</label>
                  <input
                    type="number"
                    required
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="6,000,000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-black text-base"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-900 dark:text-white mb-1">Target Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer mt-2"
              >
                Create Milestone
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
