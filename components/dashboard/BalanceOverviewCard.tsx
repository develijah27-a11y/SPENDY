'use client';

import React, { useState } from 'react';
import { useSpendy } from '@/lib/store/spendyStore';
import { formatUGX } from '@/lib/formatters';
import { Eye, EyeOff, ArrowDownLeft, ArrowUpRight, ArrowRightLeft, CreditCard } from 'lucide-react';

export function BalanceOverviewCard() {
  const { totalBalance, accounts, openQuickAdd } = useSpendy();
  const [showBalance, setShowBalance] = useState(true);

  return (
    <div className="rounded-3xl glass-panel p-6 border border-black/15 dark:border-white/20 relative overflow-hidden shadow-2xl">
      {/* Background subtle gradient glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Total Money Available
          </span>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:text-gray-950 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Toggle balance visibility"
          >
            {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold shadow-sm">
          {accounts.length} Active Accounts
        </span>
      </div>

      {/* Main Balance Display */}
      <div className="mt-3">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-950 dark:text-white tracking-tight">
          {showBalance ? formatUGX(totalBalance) : 'UGX ••••••••'}
        </h1>
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-1">
          Cash in Pocket, MTN MoMo, Airtel Money & Bank balances combined
        </p>
      </div>

      {/* Account Micro-Pills */}
      <div className="flex flex-wrap gap-2.5 mt-5">
        {accounts.map((acc) => (
          <div
            key={acc.id}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-xs text-gray-950 dark:text-white shadow-sm"
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: acc.color || '#10B981' }}
            />
            <span className="font-bold">{acc.name}:</span>
            <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {showBalance ? formatUGX(acc.balance) : '••••'}
            </span>
          </div>
        ))}
      </div>

      {/* Quick Action Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-6 pt-5 border-t border-slate-200 dark:border-white/15">
        <button
          onClick={() => openQuickAdd('expense')}
          className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-700 dark:text-red-300 text-xs font-black transition-all active:scale-95 cursor-pointer shadow-sm"
        >
          <ArrowDownLeft className="w-4 h-4 text-red-600 dark:text-red-400" />
          <span>Add Expense</span>
        </button>

        <button
          onClick={() => openQuickAdd('income')}
          className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-black transition-all active:scale-95 cursor-pointer shadow-sm"
        >
          <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Add Income</span>
        </button>

        <button
          onClick={() => openQuickAdd('transfer')}
          className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs font-black transition-all active:scale-95 cursor-pointer shadow-sm"
        >
          <ArrowRightLeft className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Transfer</span>
        </button>

        <button
          onClick={() => openQuickAdd('pay')}
          className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-black transition-all active:scale-95 cursor-pointer shadow-sm"
        >
          <CreditCard className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>Pay Merchant</span>
        </button>
      </div>
    </div>
  );
}
