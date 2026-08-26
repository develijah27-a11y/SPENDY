'use client';

import React, { useState, useMemo } from 'react';
import { useSpendy } from '@/lib/store/spendyStore';
import { formatCurrency, formatDate, formatDateGroup } from '@/lib/formatters';
import { Transaction } from '@/types';
import {
  DollarSign,
  TrendingUp,
  Search,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  X,
  Check,
  Briefcase,
  Sprout,
  Gift,
  ArrowUpRight,
  PieChart,
} from 'lucide-react';

export default function IncomePage() {
  const { transactions, categories, editTransaction, deleteTransaction, openQuickAdd } = useSpendy();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // Edit Modal State
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editNote, setEditNote] = useState('');

  // Filter only income transactions
  const incomeTransactions = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'income')
      .filter((t) => {
        if (selectedCategory !== 'all' && t.category_id !== selectedCategory) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const noteMatch = (t.description || t.note || '').toLowerCase().includes(q);
          const catMatch = (t.category?.name || '').toLowerCase().includes(q);
          if (!noteMatch && !catMatch) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime();
        if (sortBy === 'oldest') return new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime();
        if (sortBy === 'highest') return b.amount - a.amount;
        if (sortBy === 'lowest') return a.amount - b.amount;
        return 0;
      });
  }, [transactions, selectedCategory, searchQuery, sortBy]);

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, { dateLabel: string; total: number; items: Transaction[] }> = {};

    for (const tx of incomeTransactions) {
      const groupKey = new Date(tx.transaction_date).toISOString().slice(0, 10);
      const dateLabel = formatDateGroup(tx.transaction_date);

      if (!groups[groupKey]) {
        groups[groupKey] = {
          dateLabel,
          total: 0,
          items: [],
        };
      }

      groups[groupKey].items.push(tx);
      groups[groupKey].total += tx.amount;
    }

    return Object.values(groups);
  }, [incomeTransactions]);

  const totalFilteredIncome = useMemo(() => {
    return incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [incomeTransactions]);

  // Top income source
  const topIncomeSource = useMemo(() => {
    const map: Record<string, number> = {};
    for (const tx of incomeTransactions) {
      const name = tx.category?.name || 'General Income';
      map[name] = (map[name] || 0) + tx.amount;
    }
    const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);
    return entries.length > 0 ? { name: entries[0][0], amount: entries[0][1] } : null;
  }, [incomeTransactions]);

  const openEditModal = (tx: Transaction) => {
    setEditingTx(tx);
    setEditAmount(tx.amount.toString());
    setEditCategory(tx.category_id);
    setEditNote(tx.description || tx.note || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;
    const parsedAmount = Math.round(parseFloat(editAmount));
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    editTransaction(editingTx.id, {
      amount: parsedAmount,
      category_id: editCategory,
      description: editNote.trim(),
      note: editNote.trim(),
    });

    setEditingTx(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <DollarSign className="w-6 h-6 text-emerald-500" />
            <span>Income Management</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Track, categorize, and grow your salary, business profits, farming, and side hustles
          </p>
        </div>

        <button
          onClick={() => openQuickAdd('income')}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Record Income</span>
        </button>
      </div>

      {/* Aggregate Header KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-3xl glass-panel p-5 border border-emerald-500/20 shadow-xl bg-gradient-to-tr from-emerald-950/20 via-slate-900/40 to-teal-950/10">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Total Income in View
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
            {formatCurrency(totalFilteredIncome)}
          </h2>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
            Across {incomeTransactions.length} recorded inflow{incomeTransactions.length === 1 ? '' : 's'}
          </p>
        </div>

        <div className="rounded-3xl glass-panel p-5 border border-black/10 dark:border-white/10 shadow-xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Top Income Source
          </span>
          <h3 className="text-lg font-black text-gray-900 dark:text-white mt-0.5 truncate">
            {topIncomeSource ? topIncomeSource.name : 'None yet'}
          </h3>
          <p className="text-xs font-bold text-emerald-500 font-mono mt-1">
            {topIncomeSource ? formatCurrency(topIncomeSource.amount) : 'UGX 0'}
          </p>
        </div>

        <div className="rounded-3xl glass-panel p-5 border border-black/10 dark:border-white/10 shadow-xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Average Inflow
          </span>
          <h3 className="text-lg font-black text-gray-900 dark:text-white font-mono mt-0.5">
            {incomeTransactions.length > 0
              ? formatCurrency(Math.round(totalFilteredIncome / incomeTransactions.length))
              : 'UGX 0'}
          </h3>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
            Per recorded transaction
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="rounded-3xl glass-panel p-4 border border-black/10 dark:border-white/10 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search income by description, source or category..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/15 text-xs text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Income Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-gray-900 border border-black/10 dark:border-white/15 text-gray-900 dark:text-white"
            >
              <option value="all">All Income Streams</option>
              {categories
                .filter((c) => c.type === 'income')
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-gray-900 border border-black/10 dark:border-white/15 text-gray-900 dark:text-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Daily Grouped Income Timeline */}
      <div className="space-y-4">
        {groupedTransactions.length === 0 ? (
          <div className="rounded-3xl glass-panel p-12 text-center border border-black/10 dark:border-white/10 space-y-2">
            <TrendingUp className="w-10 h-10 text-gray-400 mx-auto" />
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">No income records found</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Record your salary, side-hustle earnings, or business revenue to see them here.
            </p>
            <button
              onClick={() => openQuickAdd('income')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer inline-flex items-center gap-1.5 mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Record First Income</span>
            </button>
          </div>
        ) : (
          groupedTransactions.map((group, idx) => (
            <div
              key={idx}
              className="rounded-3xl glass-panel p-4 sm:p-5 border border-black/10 dark:border-white/10 shadow-xl space-y-3"
            >
              {/* Group Header with Date & Daily Total */}
              <div className="flex items-center justify-between pb-2 border-b border-black/10 dark:border-white/10">
                <span className="text-xs font-black text-gray-900 dark:text-white tracking-wide">
                  {group.dateLabel}
                </span>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">Day Inflow:</span>
                  <span className="font-bold text-emerald-500 font-mono">
                    + {formatCurrency(group.total)}
                  </span>
                </div>
              </div>

              {/* Items in this Day */}
              <div className="divide-y divide-black/5 dark:divide-white/5">
                {group.items.map((tx) => (
                  <div
                    key={tx.id}
                    className="py-2.5 px-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl flex items-center justify-between gap-3 transition-colors group"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                          {tx.category?.name || 'Income'}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                          Inflow
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {tx.description || tx.note || 'Income deposit'} • {formatDate(tx.transaction_date)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm sm:text-base font-bold font-mono text-emerald-500">
                        + {formatCurrency(tx.amount)}
                      </span>

                      <button
                        onClick={() => openEditModal(tx)}
                        aria-label="Edit income"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        aria-label="Delete income"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl glass-panel p-6 border border-white/20 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Edit Income Record</h3>
              <button onClick={() => setEditingTx(null)} className="p-1.5 rounded-full bg-black/5 dark:bg-white/10 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Amount (UGX)</label>
                <input
                  type="number"
                  required
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/15 text-gray-900 dark:text-white font-bold text-base"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/5 dark:bg-gray-900 border border-black/10 dark:border-white/15 text-gray-900 dark:text-white"
                >
                  {categories
                    .filter((c) => c.type === 'income')
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Description / Note</label>
                <input
                  type="text"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/15 text-gray-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer mt-2"
              >
                Update Income
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
