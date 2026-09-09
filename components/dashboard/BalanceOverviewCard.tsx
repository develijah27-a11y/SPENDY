'use client';

import React, { useState } from 'react';
import { useSpendy } from '@/lib/store/spendyStore';
import { formatUGX } from '@/lib/formatters';
import {
  Eye,
  EyeOff,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  Store,
  ShieldCheck,
} from 'lucide-react';

export function BalanceOverviewCard() {
  const { totalBalance, accounts, openQuickAdd } = useSpendy();
  const [showBalance, setShowBalance] = useState(true);

  return (
    <div className="rounded-3xl bg-white dark:bg-[#0B0F19] border border-slate-200/90 dark:border-slate-800/90 p-6 sm:p-7 shadow-lg relative flex flex-col justify-between h-full transition-all">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Liquid Portfolio
            </span>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer touch-target flex items-center justify-center"
              aria-label="Toggle balance visibility"
            >
              {showBalance ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 text-[11px] font-bold">
            <ShieldCheck className="w-3 h-3 text-emerald-500" aria-hidden="true" />
            <span>{accounts.length} Wallets Active</span>
          </div>
        </div>

        {/* Main Balance */}
        <div className="mt-3">
          <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 dark:text-white tracking-tight font-mono">
            {showBalance ? formatUGX(totalBalance) : 'UGX ••••••••'}
          </div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
            Cash in pocket, mobile money &amp; bank accounts combined
          </p>
        </div>

        {/* Account Micro-Pills */}
        <div className="flex flex-wrap gap-2 mt-5">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-900 dark:text-white shadow-2xs"
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: acc.color || '#10B981' }}
                aria-hidden="true"
              />
              <span className="font-semibold text-slate-600 dark:text-slate-300">{acc.name}</span>
              <span className="font-black text-slate-900 dark:text-white font-mono">
                {showBalance ? formatUGX(acc.balance) : '••••'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Unified Fintech Quick Action Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-6 pt-5 border-t border-slate-200/80 dark:border-slate-800/80">
        <button
          onClick={() => openQuickAdd('expense')}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white text-xs font-bold transition-all active:scale-98 cursor-pointer touch-target shadow-2xs hover:border-rose-500/40"
        >
          <ArrowDownLeft className="w-4 h-4 text-rose-500 shrink-0" aria-hidden="true" />
          <span>Expense</span>
        </button>

        <button
          onClick={() => openQuickAdd('income')}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white text-xs font-bold transition-all active:scale-98 cursor-pointer touch-target shadow-2xs hover:border-emerald-500/40"
        >
          <ArrowUpRight className="w-4 h-4 text-emerald-500 shrink-0" aria-hidden="true" />
          <span>Income</span>
        </button>

        <button
          onClick={() => openQuickAdd('transfer')}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white text-xs font-bold transition-all active:scale-98 cursor-pointer touch-target shadow-2xs hover:border-blue-500/40"
        >
          <ArrowRightLeft className="w-4 h-4 text-blue-500 shrink-0" aria-hidden="true" />
          <span>Transfer</span>
        </button>

        <button
          onClick={() => openQuickAdd('pay')}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white text-xs font-bold transition-all active:scale-98 cursor-pointer touch-target shadow-2xs hover:border-emerald-500/40"
        >
          <Store className="w-4 h-4 text-emerald-500 shrink-0" aria-hidden="true" />
          <span>Pay Bill</span>
        </button>
      </div>
    </div>
  );
}
