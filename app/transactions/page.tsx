'use client';

import React, { useState, useMemo } from 'react';
import { useSpendy } from '@/lib/store/spendyStore';
import { formatUGX, formatDate } from '@/lib/formatters';
import {
  ReceiptText,
  Search,
  Filter,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  Trash2,
  Download,
  Calendar,
  Store,
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
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ReceiptText className="w-6 h-6 text-emerald-400" />
            <span>Transaction Ledger</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Complete searchable history of all money received, spent, and transferred
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => openQuickAdd('expense')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-3xl glass-panel p-4 sm:p-5 border border-white/10 space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by note, merchant (e.g. Cafe Kampala, Yaka, SafeBoda), category..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div>
            <label className="block text-[11px] text-gray-400 mb-1">Account</label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-white/15 text-white"
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
            <label className="block text-[11px] text-gray-400 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-white/15 text-white"
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
            <label className="block text-[11px] text-gray-400 mb-1">Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-white/15 text-white"
            >
              <option value="all">All Types</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-gray-400 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-white/15 text-white"
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
      <div className="rounded-3xl glass-panel p-4 sm:p-6 border border-white/10 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs text-gray-400">
          <span>Showing {filteredTransactions.length} transactions</span>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center">
            <ReceiptText className="w-12 h-12 text-gray-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-300">No matching transactions</p>
            <p className="text-xs text-gray-500 mt-1">Try clearing your filters or record a new transaction.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredTransactions.map((t) => {
              const isExpense = t.type === 'expense';
              return (
                <div
                  key={t.id}
                  className="py-3.5 px-2 hover:bg-white/5 rounded-2xl flex items-center justify-between gap-4 transition-colors group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        isExpense ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'
                      }`}
                    >
                      {isExpense ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-white">
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
                            className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 cursor-pointer"
                          >
                            Receipt
                          </button>
                        )}
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-300 border border-white/10">
                          {t.account?.name || 'Account'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {t.note || (isExpense ? 'Expense logged' : 'Income received')} • {formatDate(t.transaction_date)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-sm sm:text-base font-bold font-mono ${
                        isExpense ? 'text-red-400' : 'text-emerald-400'
                      }`}
                    >
                      {isExpense ? '-' : '+'} {formatUGX(t.amount)}
                    </span>
                    <button
                      onClick={() => deleteTransaction(t.id)}
                      aria-label="Delete transaction"
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
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
