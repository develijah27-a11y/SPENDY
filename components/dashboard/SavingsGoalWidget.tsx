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
    <div className="rounded-3xl bg-white dark:bg-[#0B0F19] border border-slate-200/90 dark:border-slate-800/90 p-5 sm:p-6 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-2xs">
            <Target className="w-5 h-5 font-black" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-black text-sm text-slate-950 dark:text-white">Savings Goals</h3>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Target funds &amp; reserves</p>
          </div>
        </div>
        <Link
          href="/goals"
          className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1 transition-colors"
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>

      <div className="space-y-3 pt-1">
        {activeGoals.length === 0 ? (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800/70 text-xs text-center font-medium text-slate-500 dark:text-slate-400">
            No savings goals yet.{' '}
            <Link href="/savings" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline ml-1">
              Create Goal
            </Link>
          </div>
        ) : (
          activeGoals.map((g) => {
            const pct = Math.min(100, (g.current_amount / g.target_amount) * 100);
            const isCompleted = g.current_amount >= g.target_amount;

            return (
              <div
                key={g.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800/70 space-y-2.5 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-950 dark:text-white">{g.name}</h4>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{g.purpose || 'Priority goal'}</p>
                  </div>
                  {isCompleted ? (
                    <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" aria-hidden="true" /> Reached
                    </span>
                  ) : (
                    <button
                      onClick={() => setContributeGoalId(contributeGoalId === g.id ? null : g.id)}
                      className="text-xs font-bold px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white text-slate-800 dark:text-slate-200 flex items-center gap-1 cursor-pointer transition-colors border border-slate-200 dark:border-slate-700 touch-target"
                    >
                      <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Save</span>
                    </button>
                  )}
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-950 dark:text-white font-mono tabular-nums">{formatUGX(g.current_amount)}</span>
                    <span className="text-slate-500 dark:text-slate-400 font-semibold text-[11px]">
                      Target: {formatUGX(g.target_amount)} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                </div>

                {/* Inline contribution drawer */}
                {contributeGoalId === g.id && (
                  <div className="pt-2.5 mt-2 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center gap-2 animate-in fade-in duration-150">
                    <select
                      value={accountId}
                      onChange={(e) => setAccountId(e.target.value)}
                      aria-label="Account to save from"
                      className="px-2.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white text-xs font-bold flex-1"
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
                      aria-label="Contribution amount in UGX"
                      className="w-24 px-2.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white text-xs font-mono font-bold"
                      placeholder="Amount"
                    />
                    <button
                      onClick={() => handleContribute(g.id)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-sm touch-target"
                    >
                      Confirm
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
