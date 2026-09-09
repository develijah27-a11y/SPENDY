'use client';

import React, { useState } from 'react';
import { useSpendy } from '@/lib/store/spendyStore';
import { formatUGX } from '@/lib/formatters';
import { Info, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';

export function SafeToSpendCard() {
  const { safeToSpend } = useSpendy();
  const [showDetails, setShowDetails] = useState(false);

  const isDanger = safeToSpend.status === 'danger';
  const isCaution = safeToSpend.status === 'caution';

  return (
    <div className="rounded-3xl bg-white dark:bg-[#0B0F19] border border-slate-200/90 dark:border-slate-800/90 p-6 sm:p-7 shadow-lg relative flex flex-col justify-between h-full transition-all">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                isDanger
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                  : isCaution
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              }`}
            >
              {isDanger ? (
                <AlertTriangle className="w-3 h-3 shrink-0" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="w-3 h-3 shrink-0" aria-hidden="true" />
              )}
              <span>Safe-to-Spend</span>
            </span>
          </div>

          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
            {safeToSpend.daysRemainingInMonth} days left in month
          </span>
        </div>

        {/* Daily Allowance */}
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight font-mono">
              {formatUGX(safeToSpend.safeToSpendDaily)}
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">/ day</span>
          </div>
          <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
            {isDanger
              ? 'Active commitments exceed liquid balance. Defer discretionary expenses.'
              : `Discretionary spending limit today after honoring bills, budgets, and savings.`}
          </p>
        </div>
      </div>

      {/* Math Breakdown Toggle & Drawer */}
      <div className="mt-5 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer py-1"
          aria-expanded={showDetails}
        >
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
            <span>Calculation Breakdown</span>
          </span>
          <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
            <span>{showDetails ? 'Hide' : 'Inspect'}</span>
            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </span>
        </button>

        {showDetails && (
          <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 space-y-2 text-xs animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800/70">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Liquid Balance:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatUGX(safeToSpend.totalAvailableBalance)}
                </span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800/70">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Recurring Bills:</span>
                <span className="font-bold text-rose-500 font-mono">
                  - {formatUGX(safeToSpend.upcomingRecurring)}
                </span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800/70">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Budget Commitments:</span>
                <span className="font-bold text-rose-500 font-mono">
                  - {formatUGX(safeToSpend.remainingBudgetCommitments)}
                </span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800/70">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Debts Owed:</span>
                <span className="font-bold text-rose-500 font-mono">
                  - {formatUGX(safeToSpend.pendingDebtsOwed)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300">Remaining Monthly Safe Pool:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono font-black">
                {formatUGX(safeToSpend.safeToSpendMonth)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
