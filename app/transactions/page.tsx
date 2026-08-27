'use client';

import React, { useState, useMemo } from 'react';
import { useSpendy } from '@/lib/store/spendyStore';
import { formatUGX, formatDate } from '@/lib/formatters';
import {
  ReceiptText,
  Search,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  Trash2,
  Download,
} from 'lucide-react';

export default function TransactionsPage() {
  const { transactions, accounts, categories, deleteTransaction, openQuickAdd, openReceipt } = useSpendy();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const noteMatch = t.note?.toLowerCase().includes(q);
          const merchantMatch = t.merchant_name?.toLowerCase().includes(q);
          const catMatch = t.category?.name?.toLowerCase().includes(q);
          const accMatch = t.account?.name?.toLowerCase().includes(q);
          if (!noteMatch && !merchantMatch && !catMatch && !accMatch) return false;
        }

        // Account filter
        if (selectedAccount !== 'all' && t.account_id !== selectedAccount) return false;

        // Category filter
        if (selectedCategory !== 'all' && t.category_id !== selectedCategory) return false;

        // Type filter
        if (selectedType !== 'all' && t.type !== selectedType) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime();
        if (sortBy === 'oldest') return new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime();
        if (sortBy === 'highest') return b.amount - a.amount;
        if (sortBy === 'lowest') return a.amount - b.amount;
        return 0;
      });
  }, [transactions, searchQuery, selectedAccount, selectedCategory, selectedType, sortBy]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Type', 'Amount (UGX)', 'Category', 'Account', 'Merchant', 'Receipt', 'Note'];
    const rows = filteredTransactions.map((t) => [
      t.transaction_date,
      t.type,
      t.amount,
      t.category?.name || '',
      t.account?.name || '',
      t.merchant_name || '',
      t.receipt_number || '',
      `"${(t.note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `spendy-transactions-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white tracking-tight flex items-center gap-2.5">
            <ReceiptText className="w-7 h-7 text-emerald-600 dark:text-emerald-400 font-black" />
            <span>Transaction Ledger</span>
          </h1>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-1">
            Complete searchable history of all money received, spent, and transferred
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => openQuickAdd('expense')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-black shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-3xl glass-panel p-4 sm:p-5 border border-black/15 dark:border-white/20 shadow-lg space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by note, merchant (e.g. Cafe Kampala, Yaka, SafeBoda), category..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-medium text-gray-950 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          <div>
            <label className="block text-xs font-bold text-gray-900 dark:text-white mb-1">Account</label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-bold"
            >
              <option value="all">All Accounts</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-900 dark:text-white mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-bold"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-900 dark:text-white mb-1">Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-bold"
            >
              <option value="all">All Types</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-900 dark:text-white mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-bold"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="rounded-3xl glass-panel p-4 sm:p-6 border border-black/15 dark:border-white/20 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-300">
          <span>Showing {filteredTransactions.length} transactions</span>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <ReceiptText className="w-12 h-12 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-black text-gray-950 dark:text-white">No matching transactions</p>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Try clearing your filters or record a new transaction.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-white/10">
            {filteredTransactions.map((t) => {
              const isExpense = t.type === 'expense';
              return (
                <div
                  key={t.id}
                  className="py-3.5 px-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl flex items-center justify-between gap-4 transition-colors group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                        isExpense ? 'bg-red-500/20 text-red-600 dark:text-red-400 font-black' : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black'
                      }`}
                    >
                      {isExpense ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-xs sm:text-sm text-gray-950 dark:text-white">
                          {t.merchant_name || t.category?.name || 'Transaction'}
                        </span>
                        {t.receipt_number && (
                          <button
                            onClick={() =>
                              openReceipt({
                                receiptNumber: t.receipt_number!,
                                merchantName: t.merchant_name || 'Merchant',
                                amount: t.amount,
                                currency: 'UGX',
                                date: t.transaction_date,
                                paymentMethod: t.account?.name || 'Spendy Wallet',
                                category: t.category?.name || 'Expense',
                                reference: t.note || 'REF-1234',
                                status: 'SUCCESS',
                              })
                            }
                            className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 cursor-pointer shadow-sm"
                          >
                            Receipt
                          </button>
                        )}
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                          {t.account?.name || 'Account'}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5 truncate">
                        {t.note || (isExpense ? 'Expense logged' : 'Income received')} • {formatDate(t.transaction_date)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-sm sm:text-base font-black font-mono ${
                        isExpense ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isExpense ? '-' : '+'} {formatUGX(t.amount)}
                    </span>
                    <button
                      onClick={() => deleteTransaction(t.id)}
                      aria-label="Delete transaction"
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-red-500 transition-all cursor-pointer"
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
    </div>
  );
}
