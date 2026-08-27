'use client';

import React, { useState, useMemo } from 'react';
import { useSpendy } from '@/lib/store/spendyStore';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Loan, LoanType } from '@/types';
import {
  HandCoins,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  X,
  Check,
  Search,
} from 'lucide-react';

export default function LoansPage() {
  const {
    loans,
    dashboardMetrics,
    addLoan,
    recordLoanRepayment,
    deleteLoan,
  } = useSpendy();

  const [activeTab, setActiveTab] = useState<'all' | 'lent' | 'borrowed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Repayment Modal State
  const [repaymentLoan, setRepaymentLoan] = useState<Loan | null>(null);
  const [repayAmount, setRepayAmount] = useState('');
  const [repayNote, setRepayNote] = useState('');

  // Add Loan Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLoanType, setNewLoanType] = useState<LoanType>('lent');
  const [newCounterparty, setNewCounterparty] = useState('');
  const [newPrincipal, setNewPrincipal] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const filteredLoans = useMemo(() => {
    return loans
      .filter((loan) => {
        if (activeTab !== 'all' && loan.loan_type !== activeTab) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const nameMatch = loan.counterparty.toLowerCase().includes(q);
          const noteMatch = (loan.notes || '').toLowerCase().includes(q);
          if (!nameMatch && !noteMatch) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [loans, activeTab, searchQuery]);

  const activeLentCount = loans.filter((l) => l.loan_type === 'lent' && l.status !== 'paid').length;
  const activeBorrowedCount = loans.filter((l) => l.loan_type === 'borrowed' && l.status !== 'paid').length;

  const handleOpenRepayment = (loan: Loan) => {
    setRepaymentLoan(loan);
    setRepayAmount(loan.remaining_balance.toString());
    setRepayNote('');
  };

  const handleRecordRepayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repaymentLoan) return;

    const amt = Math.round(parseFloat(repayAmount));
    if (isNaN(amt) || amt <= 0) return;

    recordLoanRepayment(repaymentLoan.id, amt, repayNote.trim() || undefined);
    setRepaymentLoan(null);
  };

  const handleCreateLoan = (e: React.FormEvent) => {
    e.preventDefault();
    const principal = Math.round(parseFloat(newPrincipal));
    if (isNaN(principal) || principal <= 0 || !newCounterparty.trim()) return;

    addLoan({
      loan_type: newLoanType,
      counterparty: newCounterparty.trim(),
      principal_amount: principal,
      due_date: newDueDate || undefined,
      notes: newNotes.trim() || undefined,
    });

    setShowAddModal(false);
    setNewCounterparty('');
    setNewPrincipal('');
    setNewDueDate('');
    setNewNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white tracking-tight flex items-center gap-2.5">
            <HandCoins className="w-7 h-7 text-purple-600 dark:text-purple-400 font-black" />
            <span>Loans & Borrowing Tracker</span>
          </h1>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-1">
            Manage money you lent to friends/family and money you borrowed with installment histories
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-purple-600/30 transition-all cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>New Loan Record</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Money Lent (Asset) */}
        <div className="rounded-3xl glass-panel p-5 border border-emerald-500/30 shadow-xl bg-gradient-to-tr from-emerald-950/40 via-slate-900/60 to-teal-950/20 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Money Lent (To Collect)
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
            {formatCurrency(dashboardMetrics.moneyLent)}
          </p>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {activeLentCount} active loan{activeLentCount === 1 ? '' : 's'} to collect
          </p>
        </div>

        {/* Money Borrowed (Liability) */}
        <div className="rounded-3xl glass-panel p-5 border border-purple-500/30 shadow-xl bg-gradient-to-tr from-purple-950/40 via-slate-900/60 to-indigo-950/20 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Money Borrowed (You Owe)
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 font-mono mt-1">
            {formatCurrency(dashboardMetrics.moneyBorrowed)}
          </p>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {activeBorrowedCount} active debt{activeBorrowedCount === 1 ? '' : 's'} to repay
          </p>
        </div>

        {/* Net Position */}
        <div className="rounded-3xl glass-panel p-5 border border-black/15 dark:border-white/20 shadow-xl space-y-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Net Loan Position
          </span>
          <p
            className={`text-2xl sm:text-3xl font-black font-mono mt-1 ${
              dashboardMetrics.moneyLent >= dashboardMetrics.moneyBorrowed
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-purple-600 dark:text-purple-400'
            }`}
          >
            {dashboardMetrics.moneyLent >= dashboardMetrics.moneyBorrowed ? '+' : ''}
            {formatCurrency(dashboardMetrics.moneyLent - dashboardMetrics.moneyBorrowed)}
          </p>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {dashboardMetrics.moneyLent >= dashboardMetrics.moneyBorrowed
              ? 'You are net positive in receivables'
              : 'You have net outstanding liabilities'}
          </p>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="rounded-3xl glass-panel p-4 sm:p-5 border border-black/15 dark:border-white/20 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tab Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-bold shadow-inner">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-purple-600 text-white shadow-md font-black'
                  : 'text-slate-700 dark:text-slate-300 hover:text-gray-950 dark:hover:text-white'
              }`}
            >
              All Loans ({loans.length})
            </button>

            <button
              onClick={() => setActiveTab('lent')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'lent'
                  ? 'bg-emerald-600 text-white shadow-md font-black'
                  : 'text-slate-700 dark:text-slate-300 hover:text-gray-950 dark:hover:text-white'
              }`}
            >
              Money Lent ({loans.filter((l) => l.loan_type === 'lent').length})
            </button>

            <button
              onClick={() => setActiveTab('borrowed')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'borrowed'
                  ? 'bg-purple-600 text-white shadow-md font-black'
                  : 'text-slate-700 dark:text-slate-300 hover:text-gray-950 dark:hover:text-white'
              }`}
            >
              Money Borrowed ({loans.filter((l) => l.loan_type === 'borrowed').length})
            </button>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search person or note..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-medium text-gray-950 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Loans Grid List */}
      <div className="space-y-4">
        {filteredLoans.length === 0 ? (
          <div className="rounded-3xl glass-panel p-12 text-center border border-black/15 dark:border-white/20 space-y-3">
            <HandCoins className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-sm font-black text-gray-950 dark:text-white">No loan records in this view</h3>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 max-w-sm mx-auto">
              Keep track of money you lend out or borrow so you never lose track of balances.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-md transition-colors cursor-pointer inline-flex items-center gap-1.5 mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Record First Loan</span>
            </button>
          </div>
        ) : (
          filteredLoans.map((loan) => {
            const isLent = loan.loan_type === 'lent';
            const isPaid = loan.status === 'paid';
            const pctPaid = loan.principal_amount > 0 ? Math.min(100, (loan.amount_paid / loan.principal_amount) * 100) : 0;
            const isOverdue = loan.due_date && new Date(loan.due_date) < new Date() && !isPaid;

            return (
              <div
                key={loan.id}
                className="rounded-3xl glass-panel p-5 sm:p-6 border border-black/15 dark:border-white/20 shadow-xl space-y-4"
              >
                {/* Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 font-black shadow-sm ${
                        isLent
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                          : 'bg-purple-500/20 text-purple-700 dark:text-purple-300'
                      }`}
                    >
                      {isLent ? <ArrowUpRight className="w-6 h-6 font-black" /> : <ArrowDownLeft className="w-6 h-6 font-black" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-black text-base text-gray-950 dark:text-white">
                          {loan.counterparty}
                        </h3>
                        <span
                          className={`text-xs uppercase font-black px-2.5 py-0.5 rounded-full border ${
                            isLent
                              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                              : 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30'
                          }`}
                        >
                          {isLent ? 'Money Lent' : 'Money Borrowed'}
                        </span>

                        {isPaid && (
                          <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Fully Paid</span>
                          </span>
                        )}

                        {isOverdue && (
                          <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Overdue</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                        {loan.notes || 'No notes'} • Created {formatDate(loan.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Top Action Buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {!isPaid && (
                      <button
                        onClick={() => handleOpenRepayment(loan)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Record Repayment</span>
                      </button>
                    )}

                    <button
                      onClick={() => deleteLoan(loan.id)}
                      aria-label="Delete loan"
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-500/20 text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Amount Matrix & Progress */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-700 dark:text-slate-300 font-bold block mb-0.5">Principal Amount:</span>
                    <span className="font-black text-gray-950 dark:text-white font-mono text-sm sm:text-base">
                      {formatCurrency(loan.principal_amount)}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-700 dark:text-slate-300 font-bold block mb-0.5">Amount Repaid:</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono text-sm sm:text-base">
                      {formatCurrency(loan.amount_paid)}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-700 dark:text-slate-300 font-bold block mb-0.5">Remaining Balance:</span>
                    <span
                      className={`font-black font-mono text-sm sm:text-base ${
                        isPaid ? 'text-slate-400' : isLent ? 'text-emerald-600 dark:text-emerald-400' : 'text-purple-600 dark:text-purple-400'
                      }`}
                    >
                      {formatCurrency(loan.remaining_balance)}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-700 dark:text-slate-300 font-bold block mb-0.5">Due Date:</span>
                    <span className="font-bold text-gray-950 dark:text-white">
                      {loan.due_date ? new Date(loan.due_date).toLocaleDateString('en-GB') : 'No due date'}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>Repayment Progress</span>
                    <span className="font-black font-mono">{pctPaid.toFixed(0)}% Repaid</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isPaid ? 'bg-emerald-500' : isLent ? 'bg-emerald-500' : 'bg-purple-500'
                      }`}
                      style={{ width: `${pctPaid}%` }}
                    />
                  </div>
                </div>

                {/* Repayment History Snippet */}
                {loan.repayments && loan.repayments.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 dark:border-white/10 space-y-2">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Repayment Log ({loan.repayments.length}):
                    </span>
                    <div className="space-y-1.5">
                      {loan.repayments.map((rep) => (
                        <div
                          key={rep.id}
                          className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700"
                        >
                          <span className="text-gray-950 dark:text-white font-semibold">
                            {formatDate(rep.payment_date)} • {rep.note || 'Repayment'}
                          </span>
                          <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono">
                            + {formatCurrency(rep.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Record Repayment Modal */}
      {repaymentLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl glass-panel p-6 border border-black/20 dark:border-white/20 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div>
                <h3 className="font-black text-base text-gray-950 dark:text-white">Record Repayment</h3>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                  {repaymentLoan.counterparty} ({repaymentLoan.loan_type === 'lent' ? 'Money Lent' : 'Money Borrowed'})
                </p>
              </div>
              <button onClick={() => setRepaymentLoan(null)} className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordRepayment} className="space-y-3.5 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-gray-900 dark:text-white">Repayment Amount (UGX)</label>
                  <button
                    type="button"
                    onClick={() => setRepayAmount(repaymentLoan.remaining_balance.toString())}
                    className="text-xs font-black text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    Pay Full Remaining ({formatCurrency(repaymentLoan.remaining_balance)})
                  </button>
                </div>
                <input
                  type="number"
                  required
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-black text-base"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-900 dark:text-white mb-1">Note (Optional)</label>
                <input
                  type="text"
                  value={repayNote}
                  onChange={(e) => setRepayNote(e.target.value)}
                  placeholder="e.g. Paid via MTN MoMo, partial cash installment"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-colors cursor-pointer mt-2"
              >
                Confirm Repayment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add New Loan Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl glass-panel p-6 border border-black/20 dark:border-white/20 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <h3 className="font-black text-base text-gray-950 dark:text-white">Record New Loan</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLoan} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-900 dark:text-white mb-1">Loan Direction</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewLoanType('lent')}
                    className={`py-2 px-3 rounded-xl font-black border transition-all cursor-pointer ${
                      newLoanType === 'lent'
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    I Lent Money (Asset)
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewLoanType('borrowed')}
                    className={`py-2 px-3 rounded-xl font-black border transition-all cursor-pointer ${
                      newLoanType === 'borrowed'
                        ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    I Borrowed (Liability)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-900 dark:text-white mb-1">
                  {newLoanType === 'lent' ? 'Lent To (Person / Entity)' : 'Borrowed From (Lender / Friend)'} *
                </label>
                <input
                  type="text"
                  required
                  value={newCounterparty}
                  onChange={(e) => setNewCounterparty(e.target.value)}
                  placeholder="e.g. John Mukasa, Uncle Patrick, Sarah"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-900 dark:text-white mb-1">Principal Amount (UGX) *</label>
                <input
                  type="number"
                  required
                  value={newPrincipal}
                  onChange={(e) => setNewPrincipal(e.target.value)}
                  placeholder="250,000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-black"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-900 dark:text-white mb-1">Due Date (Optional)</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-900 dark:text-white mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Emergency loan, school fees installment"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-md transition-colors cursor-pointer mt-2"
              >
                Save Loan Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
