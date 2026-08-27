'use client';

import React, { useState } from 'react';
import { useSpendy } from '@/lib/store/spendyStore';
import { formatUGX } from '@/lib/formatters';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';

export function SafeToSpendCard() {
  const { safeToSpend } = useSpendy();
  const [showDetails, setShowDetails] = useState(false);

  const isDanger = safeToSpend.status === 'danger';
  const isCaution = safeToSpend.status === 'caution';

  return (
    <div
      className={`rounded-3xl p-5 sm:p-6 border transition-all relative overflow-hidden shadow-xl ${
        isDanger
          ? 'bg-gradient-to-br from-red-950/60 via-red-900/40 to-neutral-950 border-red-500/40'
          : isCaution
          ? 'bg-gradient-to-br from-amber-950/60 via-amber-900/40 to-neutral-950 border-amber-500/40'
          : 'bg-gradient-to-br from-emerald-950/70 via-teal-900/40 to-slate-950 border-emerald-500/40'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                isDanger
                  ? 'bg-red-500/30 text-red-200 border-red-400'
                  : isCaution
                  ? 'bg-amber-500/30 text-amber-200 border-amber-400'
                  : 'bg-emerald-500/30 text-emerald-200 border-emerald-400'
              }`}
            >
              Safe-to-Spend Daily
            </span>
            <span className="text-xs font-bold text-slate-200">
              {safeToSpend.daysRemainingInMonth} days left in month
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {formatUGX(safeToSpend.safeToSpendDaily)}
            </h2>
            <span className="text-sm font-bold text-slate-200">/ day</span>
          </div>

          <p className="text-xs font-semibold text-slate-100 mt-1.5">
            {isDanger
              ? 'Commitments exceed available balance. Pause discretionary expenses.'
              : `You can safely spend ${formatUGX(safeToSpend.safeToSpendDaily)} today without breaking your budgets, bills, or debts.`}
          </p>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-1 text-xs font-bold text-white px-3 py-2 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 transition-colors cursor-pointer shadow-sm"
        >
          <Info className="w-4 h-4 text-emerald-400" />
          <span>{showDetails ? 'Hide math' : 'How it works'}</span>
          {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Breakdown */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-white/20 space-y-2 text-xs animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-100">
            <div className="flex justify-between p-2.5 rounded-2xl bg-white/10 border border-white/10">
              <span className="text-slate-200 font-semibold">Available Liquid Balance:</span>
              <span className="font-black text-emerald-300">{formatUGX(safeToSpend.totalAvailableBalance)}</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-2xl bg-white/10 border border-white/10">
              <span className="text-slate-200 font-semibold">Upcoming Bills / Recurring:</span>
              <span className="font-black text-red-300">- {formatUGX(safeToSpend.upcomingRecurring)}</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-2xl bg-white/10 border border-white/10">
              <span className="text-slate-200 font-semibold">Remaining Budget Commitments:</span>
              <span className="font-black text-red-300">- {formatUGX(safeToSpend.remainingBudgetCommitments)}</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-2xl bg-white/10 border border-white/10">
              <span className="text-slate-200 font-semibold">Pending Debt Repayments:</span>
              <span className="font-black text-red-300">- {formatUGX(safeToSpend.pendingDebtsOwed)}</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-2xl bg-white/10 border border-white/10">
              <span className="text-slate-200 font-semibold">Emergency Buffer:</span>
              <span className="font-black text-amber-300">- {formatUGX(safeToSpend.emergencyBuffer)}</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-2xl bg-white/10 border border-white/10">
              <span className="text-slate-200 font-semibold">Safe for Month:</span>
              <span className="font-black text-white">{formatUGX(safeToSpend.safeToSpendMonth)}</span>
            </div>
          </div>
          <p className="text-[11px] font-medium text-slate-300 text-center italic mt-2">
            * Note: Safe-to-spend is calculated from your entered accounts, budgets, and upcoming commitments. It is an estimate and not formal financial advice.
          </p>
        </div>
      )}
    </div>
  );
}
