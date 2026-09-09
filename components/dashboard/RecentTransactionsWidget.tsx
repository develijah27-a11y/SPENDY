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
    <div className="rounded-3xl bg-white dark:bg-[#0B0F19] border border-slate-200/90 dark:border-slate-800/90 p-5 sm:p-6 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-2xs">
            <ReceiptText className="w-5 h-5 font-black" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-black text-sm text-slate-950 dark:text-white">Recent Transactions</h3>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Chronological activity feed</p>
          </div>
        </div>
        <Link
          href="/transactions"
          className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1 transition-colors"
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="py-8 text-center space-y-3">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">No transactions recorded yet.</p>
          <button
            onClick={() => openQuickAdd('expense')}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black cursor-pointer shadow-sm shadow-emerald-600/20 touch-target"
          >
            Record First Transaction
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/70">
          {recent.map((t) => {
            const isExpense = t.type === 'expense';
            return (
              <div
                key={t.id}
                className="py-3 px-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                      isExpense
                        ? 'bg-rose-500/10 text-rose-500'
                        : 'bg-emerald-500/10 text-emerald-500'
                    }`}
                  >
                    {isExpense ? (
                      <ArrowDownRight className="w-4 h-4 font-black" aria-hidden="true" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 font-black" aria-hidden="true" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-950 dark:text-white truncate">
                        {t.merchant_name || t.category?.name || t.description || 'General Transaction'}
                      </p>
                      {t.receipt_number && (
                        <span className="text-[10px] uppercase font-bold font-mono px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          Ref
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {t.account?.name || 'Account'} • {formatDate(t.transaction_date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-xs sm:text-sm font-black font-mono tabular-nums ${
                      isExpense ? 'text-rose-500' : 'text-emerald-500'
                    }`}
                  >
                    {isExpense ? '-' : '+'} {formatUGX(t.amount)}
                  </span>
                  <button
                    onClick={() => deleteTransaction(t.id)}
                    aria-label={`Delete transaction ${t.merchant_name || t.description || ''}`}
                    className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition-all cursor-pointer touch-target flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
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
