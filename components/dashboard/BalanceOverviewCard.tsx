'use client';

import React, { useState } from 'react';
import { useSpendy } from '@/lib/store/spendyStore';
import { formatUGX } from '@/lib/formatters';
import { Eye, EyeOff, Plus, ArrowDownLeft, ArrowUpRight, ArrowRightLeft, CreditCard } from 'lucide-react';

export function BalanceOverviewCard() {
  const { totalBalance, accounts, openQuickAdd } = useSpendy();
  const [showBalance, setShowBalance] = useState(true);

  return (
    <div className="rounded-3xl glass-panel p-6 border border-white/15 relative overflow-hidden shadow-2xl">
      {/* Background subtle gradient glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Total Money Available</span>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="p-1 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Toggle balance visibility"
          >
            {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 font-medium">
          {accounts.length} Accounts
        </span>
      </div>

      {/* Main Balance Display */}
      <div className="mt-2">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {showBalance ? formatUGX(totalBalance) : 'UGX ••••••••'}
        </h1>
        <p className="text-xs text-gray-400 mt-1">Cash, Mobile Money & Bank balances combined</p>
      </div>

      {/* Account Micro-Pills */}
      <div className="flex flex-wrap gap-2 mt-5">
        {accounts.map((acc) => (
          <div
            key={acc.id}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-200"
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: acc.color || '#10B981' }}
            />
            <span className="font-medium">{acc.name}:</span>
            <span className="font-semibold text-white">
              {showBalance ? formatUGX(acc.balance) : '••••'}
            </span>
          </div>
        ))}
      </div>

      {/* Quick Action Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-6 pt-5 border-t border-white/10">
        <button
          onClick={() => openQuickAdd('expense')}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
        >
          <ArrowDownLeft className="w-4 h-4 text-red-400" />
          <span>Add Expense</span>
        </button>

        <button
          onClick={() => openQuickAdd('income')}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
        >
          <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          <span>Add Income</span>
        </button>

        <button
          onClick={() => openQuickAdd('transfer')}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
        >
          <ArrowRightLeft className="w-4 h-4 text-blue-400" />
          <span>Transfer</span>
        </button>

        <button
          onClick={() => openQuickAdd('pay')}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
        >
          <CreditCard className="w-4 h-4 text-purple-400" />
          <span>Pay Merchant</span>
        </button>
      </div>
    </div>
  );
}
