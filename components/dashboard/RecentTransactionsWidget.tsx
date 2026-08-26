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
  Store,
  Trash2,
} from 'lucide-react';

export function RecentTransactionsWidget() {
  const { transactions, deleteTransaction, openQuickAdd } = useSpendy();

  const recent = transactions.slice(0, 5);

  return (
    <div className="rounded-3xl glass-panel p-5 sm:p-6 border border-white/10 shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
            <ReceiptText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Recent Transactions</h3>
            <p className="text-[11px] text-gray-400">Latest money in & out</p>
          </div>
        </div>
        <Link
          href="/transactions"
          className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors"
        >
          <span>See all</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-xs text-gray-400">No transactions recorded yet.</p>
          <button
            onClick={() => openQuickAdd('expense')}
            className="mt-3 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
          >
            Add First Expense
          </button>
        </div>
      ) : (
        <div className="mt-3 divide-y divide-white/5">
          {recent.map((t) => {
            const isExpense = t.type === 'expense';
            return (
              <div
                key={t.id}
                className="py-3 flex items-center justify-between gap-3 group hover:bg-white/5 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isExpense ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'
                    }`}
                  >
                    {isExpense ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold text-white truncate">
                        {t.merchant_name || t.category?.name || 'General Transaction'}
                      </p>
                      {t.receipt_number && (
                        <span className="text-[9px] uppercase font-mono px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          Paid
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 truncate">
                      {t.account?.name || 'Account'} • {formatDate(t.transaction_date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-xs font-bold font-mono ${
                      isExpense ? 'text-red-400' : 'text-emerald-400'
                    }`}
                  >
                    {isExpense ? '-' : '+'} {formatUGX(t.amount)}
                  </span>
                  <button
                    onClick={() => deleteTransaction(t.id)}
                    aria-label="Delete transaction"
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
