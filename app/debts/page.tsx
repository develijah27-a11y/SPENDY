'use client';

import React, { useState } from 'react';
import { useSpendy } from '@/lib/store/spendyStore';
import { formatUGX, formatDate } from '@/lib/formatters';
import { DebtType } from '@/types';
import {
  Scale,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  X,
  CreditCard,
} from 'lucide-react';

export default function DebtsPage() {
  const { debts, accounts, addDebt, recordDebtPayment, deleteDebt } = useSpendy();

  const [activeTab, setActiveTab] = useState<'all' | 'i_owe' | 'owed_to_me'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [paymentDebtId, setPaymentDebtId] = useState<string | null>(null);

  // Form states for new debt
  const [debtType, setDebtType] = useState<DebtType>('i_owe');
  const [counterparty, setCounterparty] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');

  // Payment form states
  const [payAmount, setPayAmount] = useState('');
  const [payAccountId, setPayAccountId] = useState(accounts[0]?.id || '');
  const [payNote, setPayNote] = useState('');

  const debtsIOwe = debts.filter((d) => d.type === 'i_owe');
  const debtsOwedToMe = debts.filter((d) => d.type === 'owed_to_me');

  const totalIOweRemaining = debtsIOwe
    .filter((d) => d.status !== 'paid')
    .reduce((sum, d) => sum + d.remaining_amount, 0);

  const totalOwedToMeRemaining = debtsOwedToMe
    .filter((d) => d.status !== 'paid')
    .reduce((sum, d) => sum + d.remaining_amount, 0);

  const filteredDebts = debts.filter((d) => (activeTab === 'all' ? true : d.type === activeTab));

  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmt = parseFloat(totalAmount.replace(/,/g, ''));
    if (!isNaN(parsedAmt) && parsedAmt > 0 && counterparty.trim()) {
      addDebt({
        type: debtType,
        counterparty: counterparty.trim(),
        total_amount: parsedAmt,
        remaining_amount: parsedAmt,
        due_date: dueDate || undefined,
        note: note.trim() || undefined,
      });
      setShowAddModal(false);
      setCounterparty('');
      setTotalAmount('');
      setDueDate('');
      setNote('');
    }
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(payAmount.replace(/,/g, ''));
    if (!isNaN(amt) && amt > 0 && paymentDebtId) {
      recordDebtPayment(paymentDebtId, amt, payAccountId || undefined, payNote.trim() || undefined);
      setPaymentDebtId(null);
      setPayAmount('');
      setPayNote('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white tracking-tight flex items-center gap-2.5">
            <Scale className="w-7 h-7 text-emerald-600 dark:text-emerald-400 font-black" />
            <span>Debt & Loan Tracker</span>
          </h1>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-1">
            Track money you owe and money people owe you with repayment histories
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition-all cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Debt / Loan</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Money I Owe */}
        <div className="rounded-3xl glass-panel p-5 sm:p-6 border border-red-500/30 bg-gradient-to-br from-red-950/40 to-slate-900 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-red-600 dark:text-red-300">Money I Owe (To Repay)</span>
            <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center font-black">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-950 dark:text-white mt-2 font-mono">{formatUGX(totalIOweRemaining)}</h2>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">Across {debtsIOwe.length} active commitments</p>
        </div>

        {/* Money Owed To Me */}
        <div className="rounded-3xl glass-panel p-5 sm:p-6 border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 to-slate-900 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-300">Money Owed To Me (To Collect)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-950 dark:text-white mt-2 font-mono">{formatUGX(totalOwedToMeRemaining)}</h2>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">Across {debtsOwedToMe.length} active loans given</p>
        </div>
      </div>

      {/* Tab Filter */}
      <div className="flex gap-2 text-xs">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2.5 rounded-2xl font-black transition-all cursor-pointer shadow-sm ${
            activeTab === 'all' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          All Debts ({debts.length})
        </button>
        <button
          onClick={() => setActiveTab('i_owe')}
          className={`px-4 py-2.5 rounded-2xl font-black transition-all cursor-pointer shadow-sm ${
            activeTab === 'i_owe' ? 'bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/40' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          I Owe ({debtsIOwe.length})
        </button>
        <button
          onClick={() => setActiveTab('owed_to_me')}
          className={`px-4 py-2.5 rounded-2xl font-black transition-all cursor-pointer shadow-sm ${
            activeTab === 'owed_to_me' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          Owed to Me ({debtsOwedToMe.length})
        </button>
      </div>

      {/* Debts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDebts.map((d) => {
          const isIOwe = d.type === 'i_owe';
          const isPaid = d.status === 'paid';
          const pctPaid = d.total_amount > 0 ? ((d.total_amount - d.remaining_amount) / d.total_amount) * 100 : 0;

          return (
            <div
              key={d.id}
              className={`rounded-3xl glass-panel p-5 sm:p-6 border relative transition-all shadow-lg ${
                isPaid ? 'border-emerald-500/30 opacity-80' : isIOwe ? 'border-red-500/30 hover:border-red-500/50' : 'border-emerald-500/30 hover:border-emerald-500/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs uppercase font-black px-2.5 py-0.5 rounded-full border ${
                        isIOwe ? 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30' : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {isIOwe ? 'You Owe' : 'Owes You'}
                    </span>
                    {isPaid && (
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        Paid Off
                      </span>
                    )}
                  </div>
                  <h3 className="font-black text-base text-gray-950 dark:text-white mt-1.5">{d.counterparty}</h3>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{d.note || 'No notes'}</p>
                </div>

                <button
                  onClick={() => deleteDebt(d.id)}
                  aria-label="Delete debt"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Remaining:</span>
                  <p className="text-2xl font-black font-mono text-gray-950 dark:text-white">{formatUGX(d.remaining_amount)}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Original Total:</span>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{formatUGX(d.total_amount)}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3 space-y-1.5">
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${isIOwe ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${pctPaid}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>{pctPaid.toFixed(0)}% Repaid</span>
                  {d.due_date && <span>Due: {d.due_date}</span>}
                </div>
              </div>

              {/* Payment Action */}
              {!isPaid && (
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10">
                  <button
                    onClick={() => {
                      setPaymentDebtId(d.id);
                      setPayAmount(d.remaining_amount.toString());
                    }}
                    className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-colors cursor-pointer"
                  >
                    Record Installment Payment
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Record Payment Modal */}
      {paymentDebtId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl glass-panel p-6 border border-black/20 dark:border-white/20 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <h3 className="font-black text-base text-gray-950 dark:text-white">Record Debt Repayment</h3>
              <button onClick={() => setPaymentDebtId(null)} className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-bold text-gray-900 dark:text-white mb-1">Payment Amount (UGX)</label>
                <input
                  type="number"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-black text-base"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-900 dark:text-white mb-1">Account Used</label>
                <select
                  value={payAccountId}
                  onChange={(e) => setPayAccountId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-bold"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({formatUGX(a.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-900 dark:text-white mb-1">Note (Optional)</label>
                <input
                  type="text"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  placeholder="e.g. Paid via Airtel Money installment"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer mt-2"
              >
                Confirm Payment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Debt Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl glass-panel p-6 border border-black/20 dark:border-white/20 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <h3 className="font-black text-base text-gray-950 dark:text-white">Record New Debt / Loan</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDebt} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-bold text-gray-900 dark:text-white mb-1">Direction</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDebtType('i_owe')}
                    className={`py-2 rounded-xl font-black border ${
                      debtType === 'i_owe'
                        ? 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/40 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    I Owe Money (Debt)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDebtType('owed_to_me')}
                    className={`py-2 rounded-xl font-black border ${
                      debtType === 'owed_to_me'
                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Owed to Me (Loan)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-900 dark:text-white mb-1">
                  {debtType === 'i_owe' ? 'Lender Name / Entity' : 'Borrower / Friend Name'}
                </label>
                <input
                  type="text"
                  required
                  value={counterparty}
                  onChange={(e) => setCounterparty(e.target.value)}
                  placeholder="e.g. Stanbic Bank, Sarah, John"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-900 dark:text-white mb-1">Total Amount (UGX)</label>
                <input
                  type="number"
                  required
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  placeholder="e.g. 500,000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-black text-base"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-900 dark:text-white mb-1">Due Date (Optional)</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-900 dark:text-white mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Emergency medical expenses"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer mt-2"
              >
                Save Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
