'use client';

import React, { useState, useEffect } from 'react';
import { useSpendy } from '@/lib/store/spendyStore';
import { formatCurrency } from '@/lib/formatters';
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

  const [activeTab, setActiveTab] = useState<'expense' | 'income' | 'loan' | 'pay' | 'transfer'>('expense');

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
        } else {
          setToAccountId(accounts[0].id);
        }
      }
      const defaultCat = categories.find((c) => c.type === (quickAddInitialTab === 'income' ? 'income' : 'expense'));
      if (defaultCat) setCategoryId(defaultCat.id);
    }
  }, [quickAddOpen, quickAddInitialTab, accounts, categories]);

  const handleTabChange = (tab: 'expense' | 'income' | 'loan' | 'pay' | 'transfer') => {
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
    } else if (activeTab === 'transfer') {
      if (!toAccountId || toAccountId === (accountId || accounts[0]?.id)) {
        setErrorMsg('Please choose a different destination account.');
        return;
      }

      createTransfer({
        from_account_id: accountId || accounts[0]?.id,
        to_account_id: toAccountId,
        amount: parsedAmount,
        note: note.trim() || undefined,
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
      <div className="w-full max-w-lg rounded-3xl glass-panel border border-black/20 dark:border-white/20 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
          <h3 className="text-lg font-black text-gray-950 dark:text-white">Record Money Activity</h3>
          <button
            onClick={closeQuickAdd}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-gray-950 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher - 5 Tabs */}
        <div className="grid grid-cols-5 gap-1 p-1 bg-slate-100 dark:bg-slate-900/90 rounded-2xl my-4 border border-slate-200 dark:border-slate-800 text-[11px]">
          <button
            type="button"
            onClick={() => handleTabChange('expense')}
            className={`py-2 px-1 rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'expense'
                ? 'bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30 shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:text-gray-950 dark:hover:text-white'
            }`}
          >
            <MinusCircle className="w-3.5 h-3.5" />
            <span>Expense</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('income')}
            className={`py-2 px-1 rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'income'
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:text-gray-950 dark:hover:text-white'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Income</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('loan')}
            className={`py-2 px-1 rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'loan'
                ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:text-gray-950 dark:hover:text-white'
            }`}
          >
            <HandCoins className="w-3.5 h-3.5" />
            <span>Loan</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('transfer')}
            className={`py-2 px-1 rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'transfer'
                ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30 shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:text-gray-950 dark:hover:text-white'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Transfer</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('pay')}
            className={`py-2 px-1 rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'pay'
                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:text-gray-950 dark:hover:text-white'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Pay</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Primary Amount Input */}
          <div>
            <label className="block text-xs font-bold text-gray-900 dark:text-white mb-1.5">
              Amount (UGX) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-emerald-600 dark:text-emerald-400 text-sm">
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
                className="w-full pl-14 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-black text-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors shadow-inner"
              />
            </div>

            {/* Quick Amount Pills */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickAmounts.map((q) => (
                <button
                  type="button"
                  key={q}
                  onClick={() => setAmount(q.toString())}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/20 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  +{formatCurrency(q)}
                </button>
              ))}
            </div>
          </div>

          {/* Account Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-900 dark:text-white mb-1.5">
                {activeTab === 'transfer' ? 'From Account' : 'Account'}
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({formatCurrency(acc.balance)})
                  </option>
                ))}
              </select>
            </div>

            {activeTab === 'transfer' && (
              <div>
                <label className="block text-xs font-bold text-gray-900 dark:text-white mb-1.5">
                  To Account
                </label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({formatCurrency(acc.balance)})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(activeTab === 'expense' || activeTab === 'income' || activeTab === 'pay') && (
              <div>
                <label className="block text-xs font-bold text-gray-900 dark:text-white mb-1.5">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {filteredCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* LOAN SPECIFIC FIELDS */}
          {activeTab === 'loan' && (
            <div className="space-y-3 p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-xs">
              <div>
                <label className="block font-bold text-gray-900 dark:text-white mb-1.5">
                  Loan Direction <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLoanType('lent')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer ${
                      loanType === 'lent'
                        ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
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
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    I Borrowed (Money Borrowed)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-900 dark:text-white mb-1">
                  {loanType === 'lent' ? 'Lent To (Person / Entity)' : 'Borrowed From (Lender / Friend)'}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={counterparty}
                    onChange={(e) => setCounterparty(e.target.value)}
                    placeholder="e.g. John Ssebaggala, Sarah, Uncle Patrick"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-900 dark:text-white mb-1">
                  Expected Repayment Date (Optional)
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* MERCHANT SPECIFIC FIELDS */}
          {activeTab === 'pay' && (
            <div className="space-y-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs">
              <div>
                <label className="block font-bold text-gray-900 dark:text-white mb-1">
                  Merchant / Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  placeholder="e.g. Cafe Javas, Total Fuel, Carrefour"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-900 dark:text-white mb-1">
                  Merchant Reference / Invoice #
                </label>
                <input
                  type="text"
                  value={merchantReference}
                  onChange={(e) => setMerchantReference(e.target.value)}
                  placeholder="e.g. INV-8821 or Table 4"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-medium"
                />
              </div>
            </div>
          )}

          {/* NOTE / DESCRIPTION */}
          <div>
            <label className="block text-xs font-bold text-gray-900 dark:text-white mb-1.5">
              Description / Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Lunch with team, Yaka tokens, Boda to town"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50 mt-2"
          >
            {isProcessing ? (
              <span>Processing Payment...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>
                  {activeTab === 'expense' && 'Save Expense'}
                  {activeTab === 'income' && 'Record Income'}
                  {activeTab === 'loan' && (loanType === 'lent' ? 'Record Money Lent' : 'Record Money Borrowed')}
                  {activeTab === 'transfer' && 'Execute Transfer'}
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
