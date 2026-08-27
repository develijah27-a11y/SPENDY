'use client';

import React from 'react';
import Link from 'next/link';
import { useSpendy } from '@/lib/store/spendyStore';
import { formatUGX, formatDate } from '@/lib/formatters';
import {
  ArrowDownRight,
  ArrowUpRight,
  ReceiptText,
  ArrowRight,
  Trash2,
} from 'lucide-react';

export function RecentTransactionsWidget() {
  const { transactions, deleteTransaction, openQuickAdd } = useSpendy();

  const recent = transactions.slice(0, 5);

  return (
    <div className="rounded-3xl glass-panel p-5 sm:p-6 border border-black/15 dark:border-white/20 shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/15">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
            <ReceiptText className="w-5 h-5 font-black" />
          </div>
          <div>
            <h3 className="font-black text-sm text-gray-950 dark:text-white">Recent Transactions</h3>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Latest money in & out</p>
          </div>
        </div>
        <Link
          href="/spending"
          className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1 transition-colors"
        >
          <span>See all</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="py-8 text-center space-y-3">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No transactions recorded yet.</p>
          <button
            onClick={() => openQuickAdd('expense')}
            className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black cursor-pointer shadow-md shadow-emerald-600/30"
          >
            Add First Expense
          </button>
        </div>
      ) : (
        <div className="mt-3 divide-y divide-slate-200 dark:divide-white/10">
          {recent.map((t) => {
            const isExpense = t.type === 'expense';
            return (
              <div
                key={t.id}
                className="py-3 flex items-center justify-between gap-3 group hover:bg-black/5 dark:hover:bg-white/5 px-2.5 rounded-2xl transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                      isExpense ? 'bg-red-500/20 text-red-600 dark:text-red-400' : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {isExpense ? <ArrowDownRight className="w-4 h-4 font-black" /> : <ArrowUpRight className="w-4 h-4 font-black" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-gray-950 dark:text-white truncate">
                        {t.merchant_name || t.category?.name || t.description || 'General Transaction'}
                      </p>
                      {t.receipt_number && (
                        <span className="text-[10px] uppercase font-bold font-mono px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                          Receipt
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate mt-0.5">
                      {t.account?.name || 'Account'} • {formatDate(t.transaction_date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span
                    className={`text-xs sm:text-sm font-black font-mono ${
                      isExpense ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {isExpense ? '-' : '+'} {formatUGX(t.amount)}
                  </span>
                  <button
                    onClick={() => deleteTransaction(t.id)}
                    aria-label="Delete transaction"
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
