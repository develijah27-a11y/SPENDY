'use client';

import React, { useState, useEffect } from 'react';
import { useSpendy } from '@/lib/store/spendyStore';
import { formatCurrency, formatUGX } from '@/lib/formatters';
import { LoanType } from '@/types';
import {
  X,
  PlusCircle,
  MinusCircle,
  HandCoins,
  ArrowRightLeft,
  Store,
  Check,
  AlertCircle,
  Calendar,
  User,
  CreditCard,
  Lock,
} from 'lucide-react';

export function QuickAddModal() {
  const {
    quickAddOpen,
    quickAddInitialTab,
    closeQuickAdd,
    accounts,
    categories,
    addTransaction,
    addLoan,
    createTransfer,
    processMerchantPayment,
  } = useSpendy();

  const [activeTab, setActiveTab] = useState<'expense' | 'income' | 'loan' | 'pay'>('expense');

  // Form states
  const [amount, setAmount] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [note, setNote] = useState<string>('');

  // Loan states
  const [loanType, setLoanType] = useState<LoanType>('lent');
  const [counterparty, setCounterparty] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');

  // Transfer states
  const [toAccountId, setToAccountId] = useState<string>('');

  // Merchant pay states
  const [merchantName, setMerchantName] = useState<string>('Cafe Kampala');
  const [merchantReference, setMerchantReference] = useState<string>('');
  const [pin, setPin] = useState<string>('1234');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (quickAddOpen) {
      setActiveTab(quickAddInitialTab || 'expense');
      setAmount('');
      setNote('');
      setCounterparty('');
      setDueDate('');
      setErrorMsg('');
      if (accounts.length > 0) {
        setAccountId(accounts[0].id);
        if (accounts.length > 1) {
          setToAccountId(accounts[1].id);
        }
      }
      const defaultCat = categories.find((c) => c.type === (quickAddInitialTab === 'income' ? 'income' : 'expense'));
      if (defaultCat) setCategoryId(defaultCat.id);
    }
  }, [quickAddOpen, quickAddInitialTab, accounts, categories]);

  const handleTabChange = (tab: 'expense' | 'income' | 'loan' | 'pay') => {
    setActiveTab(tab);
    setErrorMsg('');
    if (tab === 'expense' || tab === 'pay') {
      const expCat = categories.find((c) => c.type === 'expense');
      if (expCat) setCategoryId(expCat.id);
    } else if (tab === 'income') {
      const incCat = categories.find((c) => c.type === 'income');
      if (incCat) setCategoryId(incCat.id);
    }
  };

  if (!quickAddOpen) return null;

  const quickAmounts = [5000, 10000, 20000, 50000, 100000, 200000];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const parsedAmount = Math.round(parseFloat(amount.replace(/,/g, '')));

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg('Please enter a valid amount greater than 0 UGX.');
      return;
    }

    if (activeTab === 'expense' || activeTab === 'income') {
      if (!categoryId) {
        setErrorMsg('Please select a category.');
        return;
      }

      addTransaction({
        account_id: accountId || accounts[0]?.id,
        category_id: categoryId,
        type: activeTab,
        amount: parsedAmount,
        description: note.trim() || undefined,
        note: note.trim() || undefined,
      });
      closeQuickAdd();
    } else if (activeTab === 'loan') {
      if (!counterparty.trim()) {
        setErrorMsg('Please enter the name of the person or entity.');
        return;
      }

      addLoan({
        loan_type: loanType,
        counterparty: counterparty.trim(),
        principal_amount: parsedAmount,
        due_date: dueDate || undefined,
        notes: note.trim() || undefined,
      });
      closeQuickAdd();
    } else if (activeTab === 'pay') {
      if (!merchantName.trim()) {
        setErrorMsg('Please enter the merchant name.');
        return;
      }

      try {
        setIsProcessing(true);
        await processMerchantPayment({
          merchantId: `m-${Date.now()}`,
          merchantName: merchantName.trim(),
          amount: parsedAmount,
          categoryId: categoryId || 'cat-food',
          accountId: accountId || accounts[0]?.id || 'acc-cash',
          reference: merchantReference || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
          note: note.trim(),
        });
        closeQuickAdd();
      } catch (err: unknown) {
        const error = err as Error;
        setErrorMsg(error.message || 'Payment processing failed.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const filteredCategories = categories.filter((c) =>
    activeTab === 'income' ? c.type === 'income' : c.type === 'expense'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl glass-panel border border-white/20 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Record Money Activity</h3>
          <button
            onClick={closeQuickAdd}
            className="p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-gray-700 dark:text-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-black/5 dark:bg-black/40 rounded-2xl my-4 border border-black/10 dark:border-white/10 text-xs">
          <button
            type="button"
            onClick={() => handleTabChange('expense')}
            className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'expense'
                ? 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <MinusCircle className="w-3.5 h-3.5" />
            <span>Expense</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('income')}
            className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'income'
                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Income</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('loan')}
            className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'loan'
                ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <HandCoins className="w-3.5 h-3.5" />
            <span>Loan</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('pay')}
            className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'pay'
                ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Merchant</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Primary Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Amount (UGX) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-500 dark:text-gray-400 text-sm">
                UGX
              </span>
              <input
                type="number"
                step="100"
                min="100"
                required
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="25,000"
                className="w-full pl-14 pr-4 py-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/15 text-gray-900 dark:text-white font-bold text-xl focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Quick Amount Pills */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickAmounts.map((q) => (
                <button
                  type="button"
                  key={q}
                  onClick={() => setAmount(q.toString())}
                  className="px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-[11px] font-medium border border-black/5 dark:border-white/10 transition-colors cursor-pointer"
                >
                  +{formatCurrency(q)}
                </button>
              ))}
            </div>
          </div>

          {/* LOAN SPECIFIC FIELDS */}
          {activeTab === 'loan' && (
            <div className="space-y-3 p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs">
              <div>
                <label className="block font-semibold text-gray-800 dark:text-gray-200 mb-1">
                  Loan Direction <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLoanType('lent')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer ${
                      loanType === 'lent'
                        ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                        : 'bg-black/5 dark:bg-white/5 text-gray-700 dark:text-gray-300 border-black/10 dark:border-white/10'
                    }`}
                  >
                    I Lent Money (Money Lent)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoanType('borrowed')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer ${
                      loanType === 'borrowed'
                        ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                        : 'bg-black/5 dark:bg-white/5 text-gray-700 dark:text-gray-300 border-black/10 dark:border-white/10'
                    }`}
                  >
                    I Borrowed (Money Borrowed)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-800 dark:text-gray-200 mb-1">
                  {loanType === 'lent' ? 'Lent To (Person / Entity)' : 'Borrowed From (Lender / Friend)'}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={counterparty}
                    onChange={(e) => setCounterparty(e.target.value)}
                    placeholder="e.g. John Ssebaggala, Sarah, Uncle Patrick"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-gray-900 border border-black/10 dark:border-white/15 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-800 dark:text-gray-200 mb-1">
                  Expected Repayment Date (Optional)
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-gray-900 border border-black/10 dark:border-white/15 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* CATEGORY PICKER (For Expense & Income) */}
          {(activeTab === 'expense' || activeTab === 'income') && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-black/5 dark:bg-gray-900 border border-black/10 dark:border-white/15 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* NOTE / DESCRIPTION */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Description / Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Lunch at Cafe, Yaka tokens, boda"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/15 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50 mt-2"
          >
            {isProcessing ? (
              <span>Processing...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>
                  {activeTab === 'expense' && 'Save Expense'}
                  {activeTab === 'income' && 'Record Income'}
                  {activeTab === 'loan' && (loanType === 'lent' ? 'Record Money Lent' : 'Record Money Borrowed')}
                  {activeTab === 'pay' && 'Confirm Merchant Payment'}
                </span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
