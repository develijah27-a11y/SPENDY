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
    <div className="rounded-3xl glass-panel p-5 sm:p-6 border border-white/10 shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Savings Goals</h3>
            <p className="text-[11px] text-gray-400">Save towards priorities</p>
          </div>
        </div>
        <Link
          href="/savings"
          className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors"
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
            <div key={g.id} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-white">{g.name}</h4>
                  <p className="text-[11px] text-gray-400">{g.purpose || 'Target goal'}</p>
                </div>
                {isCompleted ? (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Reached!
                  </span>
                ) : (
                  <button
                    onClick={() => setContributeGoalId(contributeGoalId === g.id ? null : g.id)}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Save</span>
                  </button>
                )}
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-white">{formatUGX(g.current_amount)}</span>
                  <span className="text-gray-400">Target: {formatUGX(g.target_amount)} ({pct.toFixed(0)}%)</span>
                </div>
              </div>

              {/* Inline contribution drawer */}
              {contributeGoalId === g.id && (
                <div className="pt-2 mt-2 border-t border-white/10 flex items-center gap-2 animate-in fade-in duration-150">
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="px-2 py-1.5 rounded-lg bg-gray-900 border border-white/15 text-white text-[11px] flex-1"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={contributeAmount}
                    onChange={(e) => setContributeAmount(e.target.value)}
                    className="w-24 px-2 py-1.5 rounded-lg bg-white/10 border border-white/15 text-white text-xs font-mono"
                    placeholder="Amount"
                  />
                  <button
                    onClick={() => handleContribute(g.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs cursor-pointer"
                  >
                    Save
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
