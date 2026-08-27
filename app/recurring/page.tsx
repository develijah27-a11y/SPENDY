'use client';

import React, { useState } from 'react';
import { useSpendy } from '@/lib/store/spendyStore';
import { formatUGX } from '@/lib/formatters';
import {
  Repeat,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Trash2,
  X,
  Power,
} from 'lucide-react';

export default function RecurringPage() {
  const { recurringTransactions, accounts, categories, addRecurring, toggleRecurring, deleteRecurring } =
    useSpendy();

  const [showAddModal, setShowAddModal] = useState(false);
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [nextRunDate, setNextRunDate] = useState('');
  const [note, setNote] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmt = parseFloat(amount.replace(/,/g, ''));
    if (!isNaN(parsedAmt) && parsedAmt > 0 && accountId && categoryId && nextRunDate) {
      addRecurring({
        account_id: accountId,
        category_id: categoryId,
        type,
        amount: parsedAmt,
        frequency,
        next_run_date: nextRunDate,
        note: note.trim() || undefined,
      });
      setShowAddModal(false);
      setAmount('');
      setNote('');
    }
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white tracking-tight flex items-center gap-2.5">
            <Repeat className="w-7 h-7 text-emerald-600 dark:text-emerald-400 font-black" />
            <span>Recurring Bills & Incomes</span>
          </h1>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-1">
            Automate recurring commitments (Rent, Umeme Yaka, WiFi, Salary) for accurate Safe-to-Spend calculations
          </p>
        </div>

        <button
          onClick={() => {
            const defaultCat = categories.find((c) => c.type === 'expense');
            if (defaultCat) setCategoryId(defaultCat.id);
            setShowAddModal(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition-all cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add Recurring Bill / Income</span>
        </button>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recurringTransactions.map((r) => {
          const isExpense = r.type === 'expense';
          const cat = categories.find((c) => c.id === r.category_id);
          const acc = accounts.find((a) => a.id === r.account_id);

          return (
            <div
              key={r.id}
              className={`rounded-3xl glass-panel p-5 sm:p-6 border relative group transition-all flex flex-col justify-between shadow-lg ${
                !r.is_active
                  ? 'border-slate-300 dark:border-slate-800 opacity-60'
                  : isExpense
                  ? 'border-red-500/30 hover:border-red-500/50'
                  : 'border-emerald-500/30 hover:border-emerald-500/50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                        isExpense ? 'bg-red-500/20 text-red-600 dark:text-red-400 font-black' : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black'
                      }`}
                    >
                      {isExpense ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>

                    <div>
                      <h3 className="font-black text-base text-gray-950 dark:text-white">{r.note || cat?.name || 'Recurring Item'}</h3>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {acc?.name || 'Account'} • {cat?.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleRecurring(r.id)}
                      className={`p-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        r.is_active
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteRecurring(r.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-xl text-slate-400 hover:text-red-500 transition-opacity cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Amount:</span>
                    <p
                      className={`text-xl sm:text-2xl font-black font-mono ${
                        isExpense ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isExpense ? '-' : '+'} {formatUGX(r.amount)}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs uppercase font-black px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                      {r.frequency}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 pt-2.5 border-t border-slate-200 dark:border-white/10">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Next scheduled date: {r.next_run_date}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl glass-panel p-6 border border-black/20 dark:border-white/20 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <h3 className="font-black text-base text-gray-950 dark:text-white">Add Recurring Entry</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-bold text-gray-900 dark:text-white mb-1">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setType('expense');
                      const exp = categories.find((c) => c.type === 'expense');
                      if (exp) setCategoryId(exp.id);
                    }}
                    className={`py-2.5 rounded-xl font-black transition-all ${
                      type === 'expense' ? 'bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/40 shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Recurring Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setType('income');
                      const inc = categories.find((c) => c.type === 'income');
                      if (inc) setCategoryId(inc.id);
                    }}
                    className={`py-2.5 rounded-xl font-black transition-all ${
                      type === 'income' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Recurring Income
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-900 dark:text-white mb-1">Description / Bill Name</label>
                <input
                  type="text"
                  required
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Rent, Zuku Fiber, Salary"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-900 dark:text-white mb-1">Amount (UGX)</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="450,000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-black text-base"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-900 dark:text-white mb-1">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-bold"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-900 dark:text-white mb-1">Account</label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-bold"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-900 dark:text-white mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-bold"
                  >
                    {filteredCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-900 dark:text-white mb-1">Next Run Date</label>
                <input
                  type="date"
                  required
                  value={nextRunDate}
                  onChange={(e) => setNextRunDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer mt-2"
              >
                Save Recurring Schedule
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
