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
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Scale className="w-6 h-6 text-emerald-400" />
            <span>Debt & Loan Tracker</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Track money you owe and money people owe you with repayment histories
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Debt / Loan</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Money I Owe */}
        <div className="rounded-3xl glass-panel p-5 border border-red-500/20 bg-gradient-to-br from-red-950/20 to-slate-900 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-300">Money I Owe (To Repay)</span>
            <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-white mt-2">{formatUGX(totalIOweRemaining)}</h2>
          <p className="text-[11px] text-gray-400 mt-1">Across {debtsIOwe.length} active commitments</p>
        </div>

        {/* Money Owed To Me */}
        <div className="rounded-3xl glass-panel p-5 border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 to-slate-900 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-300">Money Owed To Me (To Collect)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-white mt-2">{formatUGX(totalOwedToMeRemaining)}</h2>
          <p className="text-[11px] text-gray-400 mt-1">Across {debtsOwedToMe.length} active loans given</p>
        </div>
      </div>

      {/* Tab Filter */}
      <div className="flex gap-2 text-xs">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
            activeTab === 'all' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-white/5 text-gray-400 hover:text-white'
          }`}
        >
          All Debts ({debts.length})
        </button>
        <button
          onClick={() => setActiveTab('i_owe')}
          className={`px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
            activeTab === 'i_owe' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-white/5 text-gray-400 hover:text-white'
          }`}
        >
          Money I Owe ({debtsIOwe.length})
        </button>
        <button
          onClick={() => setActiveTab('owed_to_me')}
          className={`px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
            activeTab === 'owed_to_me' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-white/5 text-gray-400 hover:text-white'
          }`}
        >
          Owed To Me ({debtsOwedToMe.length})
        </button>
      </div>

      {/* Debts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDebts.map((d) => {
          const isIOwe = d.type === 'i_owe';
          const isPaid = d.remaining_amount === 0 || d.status === 'paid';
          const paidAmount = d.total_amount - d.remaining_amount;
          const progressPct = Math.min(100, (paidAmount / d.total_amount) * 100);

          return (
            <div
              key={d.id}
              className={`rounded-3xl glass-panel p-5 border relative group transition-all flex flex-col justify-between ${
                isPaid ? 'border-white/10 opacity-75' : isIOwe ? 'border-red-500/20' : 'border-emerald-500/20'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span
                      className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full border ${
                        isIOwe ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {isIOwe ? 'I Owe' : 'Owed to Me'}
                    </span>
                    <h3 className="font-bold text-base text-white mt-1.5">{d.counterparty}</h3>
                    <p className="text-xs text-gray-400">{d.note || 'No notes added'}</p>
                  </div>

                  <div className="flex items-center gap-1">
                    {isPaid && (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Settled
                      </span>
                    )}
                    <button
                      onClick={() => deleteDebt(d.id)}
                      aria-label="Delete debt"
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-500 hover:text-red-400 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Amount Progress */}
                <div className="mt-4">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[11px] text-gray-400">Remaining:</span>
                      <p className="text-xl font-bold font-mono text-white">
                        {formatUGX(d.remaining_amount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-gray-400">Total:</span>
                      <p className="text-xs font-semibold text-gray-300">{formatUGX(d.total_amount)}</p>
                    </div>
                  </div>

                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden mt-2">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isIOwe ? 'bg-red-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {d.due_date && (
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-gray-400">
                    <Calendar className="w-3.5 h-3.5 text-gray-500" />
                    <span>Due Date: {d.due_date}</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              {!isPaid && (
                <div className="mt-4 pt-3 border-t border-white/10">
                  <button
                    onClick={() => {
                      setPaymentDebtId(d.id);
                      setPayAmount(d.remaining_amount.toString());
                    }}
                    className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Record Repayment</span>
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
          <div className="w-full max-w-md rounded-3xl glass-panel p-6 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-base text-white">Record Debt Repayment</h3>
              <button onClick={() => setPaymentDebtId(null)} className="p-1.5 rounded-full bg-white/10 text-gray-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-300 mb-1">Repayment Amount (UGX)</label>
                <input
                  type="number"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-bold text-base"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-1">Deduct / Credit Account (Optional)</label>
                <select
                  value={payAccountId}
                  onChange={(e) => setPayAccountId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-white/15 text-white"
                >
                  <option value="">Do not adjust account balance</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({formatUGX(a.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-1">Payment Note</label>
                <input
                  type="text"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  placeholder="e.g. Paid via MTN MoMo"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer mt-2"
              >
                Confirm Repayment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Debt Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl glass-panel p-6 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-base text-white">Record Debt / Loan</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-full bg-white/10 text-gray-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDebt} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-300 mb-1">Debt Direction</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDebtType('i_owe')}
                    className={`py-2 rounded-xl font-bold transition-all cursor-pointer ${
                      debtType === 'i_owe' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-white/5 text-gray-400'
                    }`}
                  >
                    Money I Owe
                  </button>
                  <button
                    type="button"
                    onClick={() => setDebtType('owed_to_me')}
                    className={`py-2 rounded-xl font-bold transition-all cursor-pointer ${
                      debtType === 'owed_to_me' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-white/5 text-gray-400'
                    }`}
                  >
                    Owed To Me
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-1">Counterparty (Person or Bank)</label>
                <input
                  type="text"
                  required
                  value={counterparty}
                  onChange={(e) => setCounterparty(e.target.value)}
                  placeholder="e.g. Uncle Patrick, Stanbic Quick Loan, Sarah"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Total Amount (UGX)</label>
                  <input
                    type="number"
                    required
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    placeholder="200,000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-1">Note (Optional)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Emergency loan for car repair"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer mt-2"
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
