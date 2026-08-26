'use client';

import React, { useState } from 'react';
import { useSpendy } from '@/lib/store/spendyStore';
import { formatUGX } from '@/lib/formatters';
import { ShieldCheck, Info, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

export function SafeToSpendCard() {
  const { safeToSpend } = useSpendy();
  const [showDetails, setShowDetails] = useState(false);

  const isDanger = safeToSpend.status === 'danger';
  const isCaution = safeToSpend.status === 'caution';

  return (
    <div
      className={`rounded-3xl p-5 sm:p-6 border transition-all relative overflow-hidden shadow-xl ${
        isDanger
          ? 'bg-gradient-to-br from-red-950/40 via-red-900/20 to-neutral-950 border-red-500/30'
          : isCaution
          ? 'bg-gradient-to-br from-amber-950/40 via-amber-900/20 to-neutral-950 border-amber-500/30'
          : 'bg-gradient-to-br from-emerald-950/50 via-teal-900/30 to-slate-950 border-emerald-500/30'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                isDanger
                  ? 'bg-red-500/20 text-red-300 border-red-500/30'
                  : isCaution
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}
            >
              Safe-to-Spend Daily
            </span>
            <span className="text-[11px] text-gray-400">
              {safeToSpend.daysRemainingInMonth} days left in month
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {formatUGX(safeToSpend.safeToSpendDaily)}
            </h2>
            <span className="text-sm font-medium text-gray-400">/ day</span>
          </div>

          <p className="text-xs text-gray-300 mt-1">
            {isDanger
              ? 'Commitments exceed available balance. Pause discretionary expenses.'
              : `You can safely spend ${formatUGX(safeToSpend.safeToSpendDaily)} today without breaking your budgets, bills, or debts.`}
          </p>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-1 text-xs text-gray-300 hover:text-white px-2.5 py-1.5 rounded-xl bg-white/10 border border-white/10 transition-colors cursor-pointer"
        >
          <Info className="w-3.5 h-3.5 text-emerald-400" />
          <span>{showDetails ? 'Hide math' : 'How it works'}</span>
          {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded Breakdown */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-2 text-xs animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-300">
            <div className="flex justify-between p-2 rounded-xl bg-white/5">
              <span className="text-gray-400">Available Liquid Balance:</span>
              <span className="font-semibold text-emerald-400">{formatUGX(safeToSpend.totalAvailableBalance)}</span>
            </div>
            <div className="flex justify-between p-2 rounded-xl bg-white/5">
              <span className="text-gray-400">Upcoming Bills / Recurring:</span>
              <span className="font-semibold text-red-400">- {formatUGX(safeToSpend.upcomingRecurring)}</span>
            </div>
            <div className="flex justify-between p-2 rounded-xl bg-white/5">
              <span className="text-gray-400">Remaining Budget Commitments:</span>
              <span className="font-semibold text-red-400">- {formatUGX(safeToSpend.remainingBudgetCommitments)}</span>
            </div>
            <div className="flex justify-between p-2 rounded-xl bg-white/5">
              <span className="text-gray-400">Pending Debt Repayments:</span>
              <span className="font-semibold text-red-400">- {formatUGX(safeToSpend.pendingDebtsOwed)}</span>
            </div>
            <div className="flex justify-between p-2 rounded-xl bg-white/5">
              <span className="text-gray-400">Emergency Buffer:</span>
              <span className="font-semibold text-amber-400">- {formatUGX(safeToSpend.emergencyBuffer)}</span>
            </div>
            <div className="flex justify-between p-2 rounded-xl bg-white/5">
              <span className="text-gray-400">Safe for Month:</span>
              <span className="font-bold text-white">{formatUGX(safeToSpend.safeToSpendMonth)}</span>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 text-center italic mt-2">
            * Note: Safe-to-spend is calculated from your entered accounts, budgets, and upcoming commitments. It is an estimate and not formal financial advice.
          </p>
        </div>
      )}
    </div>
  );
}
