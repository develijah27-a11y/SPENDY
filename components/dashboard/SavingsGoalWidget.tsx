'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSpendy } from '@/lib/store/spendyStore';
import { formatUGX } from '@/lib/formatters';
import { Target, ArrowRight, Plus, CheckCircle2 } from 'lucide-react';

export function SavingsGoalWidget() {
  const { savingsGoals, contributeToGoal, accounts } = useSpendy();
  const [contributeGoalId, setContributeGoalId] = useState<string | null>(null);
  const [contributeAmount, setContributeAmount] = useState<string>('50000');
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id || '');

  const activeGoals = savingsGoals.slice(0, 3);

  const handleContribute = (goalId: string) => {
    const amt = parseFloat(contributeAmount);
    if (!isNaN(amt) && amt > 0 && accountId) {
      contributeToGoal(goalId, amt, accountId);
      setContributeGoalId(null);
    }
  };

  return (
    <div className="rounded-3xl glass-panel p-5 sm:p-6 border border-black/15 dark:border-white/20 shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/15">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm">
            <Target className="w-5 h-5 font-black" />
          </div>
          <div>
            <h3 className="font-black text-sm text-gray-950 dark:text-white">Savings Goals</h3>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Save towards priorities</p>
          </div>
        </div>
        <Link
          href="/savings"
          className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1 transition-colors"
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="mt-4 space-y-3.5">
        {activeGoals.map((g) => {
          const pct = Math.min(100, (g.current_amount / g.target_amount) * 100);
          const isCompleted = g.current_amount >= g.target_amount;

          return (
            <div key={g.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-950 dark:text-white">{g.name}</h4>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{g.purpose || 'Target goal'}</p>
                </div>
                {isCompleted ? (
                  <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Reached!
                  </span>
                ) : (
                  <button
                    onClick={() => setContributeGoalId(contributeGoalId === g.id ? null : g.id)}
                    className="text-xs font-black px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                )}
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-gray-950 dark:text-white font-mono">{formatUGX(g.current_amount)}</span>
                  <span className="text-slate-700 dark:text-slate-300 font-bold">Target: {formatUGX(g.target_amount)} ({pct.toFixed(0)}%)</span>
                </div>
              </div>

              {/* Inline contribution drawer */}
              {contributeGoalId === g.id && (
                <div className="pt-2.5 mt-2 border-t border-slate-200 dark:border-white/10 flex items-center gap-2 animate-in fade-in duration-150">
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="px-2.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white text-xs font-semibold flex-1"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({formatUGX(a.balance)})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={contributeAmount}
                    onChange={(e) => setContributeAmount(e.target.value)}
                    className="w-28 px-2.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white text-xs font-mono font-bold"
                    placeholder="Amount"
                  />
                  <button
                    onClick={() => handleContribute(g.id)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs cursor-pointer shadow-sm"
                  >
                    Confirm
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
