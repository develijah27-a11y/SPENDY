'use client';

import React, { useState, useEffect } from 'react';
import { useSpendy } from '@/lib/store/spendyStore';
import { formatUGX } from '@/lib/formatters';
import {
  X,
  PlusCircle,
  MinusCircle,
  ArrowRightLeft,
  Store,
  Check,
  AlertCircle,
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
    createTransfer,
    processMerchantPayment,
  } = useSpendy();

  const [activeTab, setActiveTab] = useState<'expense' | 'income' | 'transfer' | 'pay'>('expense');

  // Form states
  const [amount, setAmount] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [note, setNote] = useState<string>('');

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

  // When switching tabs, adjust default category
  const handleTabChange = (tab: 'expense' | 'income' | 'transfer' | 'pay') => {
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

  const popularMerchants = [
    { name: 'Cafe Kampala', categoryId: 'cat-food' },
    { name: 'SafeBoda Ride', categoryId: 'cat-transport' },
    { name: 'Umeme Yaka Tokens', categoryId: 'cat-utilities' },
    { name: 'Quick Supermarket', categoryId: 'cat-shopping' },
    { name: 'MTN Freedom Data', categoryId: 'cat-data' },
    { name: 'Shell Lugogo Station', categoryId: 'cat-transport' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const parsedAmount = parseFloat(amount.replace(/,/g, ''));

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg('Please enter a valid amount greater than 0 UGX.');
      return;
    }

    if (activeTab === 'expense' || activeTab === 'income') {
      if (!accountId) {
        setErrorMsg('Please select an account.');
        return;
      }
      if (!categoryId) {
        setErrorMsg('Please select a category.');
        return;
      }

      addTransaction({
        account_id: accountId,
        category_id: categoryId,
        type: activeTab,
        amount: parsedAmount,
        note: note.trim() || undefined,
      });
      closeQuickAdd();
    } else if (activeTab === 'transfer') {
      if (!accountId || !toAccountId) {
        setErrorMsg('Please select both source and destination accounts.');
        return;
      }
      if (accountId === toAccountId) {
        setErrorMsg('Cannot transfer to the same account.');
        return;
      }

      createTransfer({
        from_account_id: accountId,
        to_account_id: toAccountId,
        amount: parsedAmount,
        note: note.trim() || 'Internal Account Transfer',
      });
      closeQuickAdd();
    } else if (activeTab === 'pay') {
      if (!accountId) {
        setErrorMsg('Please select an account or wallet to pay from.');
        return;
      }
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
          accountId,
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
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 className="text-lg font-bold text-white">Record Transaction</h3>
          <button
            onClick={closeQuickAdd}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-black/40 rounded-2xl my-4 border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => handleTabChange('expense')}
            className={`py-2 rounded-xl font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'expense' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <MinusCircle className="w-3.5 h-3.5" />
            <span>Expense</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('income')}
            className={`py-2 rounded-xl font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'income' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Income</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('transfer')}
            className={`py-2 rounded-xl font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'transfer' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Transfer</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('pay')}
            className={`py-2 rounded-xl font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'pay' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Pay</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount input */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Amount (UGX) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">UGX</span>
              <input
                type="number"
                step="100"
                min="100"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 35,000"
                className="w-full pl-14 pr-4 py-3 rounded-2xl bg-white/5 border border-white/15 text-white font-bold text-lg focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickAmounts.map((q) => (
                <button
                  type="button"
                  key={q}
                  onClick={() => setAmount(q.toString())}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] font-medium border border-white/10 transition-colors"
                >
                  +{formatUGX(q)}
                </button>
              ))}
            </div>
          </div>

          {/* Account Selection */}
          {activeTab !== 'transfer' ? (
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                {activeTab === 'income' ? 'Receive Into Account' : 'Pay From Account'} <span className="text-red-400">*</span>
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-900 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({formatUGX(acc.balance)})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">From Account</label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl bg-gray-900 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">To Account</label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl bg-gray-900 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Pay Specific Fields */}
          {activeTab === 'pay' && (
            <div className="space-y-3 p-3 rounded-2xl bg-purple-950/20 border border-purple-500/20">
              <div>
                <label className="block text-xs font-semibold text-purple-300 mb-1.5">Merchant / Business</label>
                <input
                  type="text"
                  required
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  placeholder="e.g. Cafe Kampala or Shell Bugolobi"
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-500"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {popularMerchants.map((m) => (
                    <button
                      type="button"
                      key={m.name}
                      onClick={() => {
                        setMerchantName(m.name);
                        setCategoryId(m.categoryId);
                      }}
                      className="px-2 py-0.5 rounded-md bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 text-[10px] border border-purple-500/30"
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Payment Reference</label>
                  <input
                    type="text"
                    value={merchantReference}
                    onChange={(e) => setMerchantReference(e.target.value)}
                    placeholder="e.g. Bill #42"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-purple-400" /> PIN Verification
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="4-digit PIN"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs font-mono text-center tracking-widest"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Category Selection (for Expense, Income, Pay) */}
          {activeTab !== 'transfer' && (
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-900 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Note / Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Note (Optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Boda to work, Yaka tokens, lunch"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
          >
            {isProcessing ? (
              <span>Authorizing Payment...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>
                  {activeTab === 'expense' && 'Save Expense'}
                  {activeTab === 'income' && 'Record Income'}
                  {activeTab === 'transfer' && 'Execute Transfer'}
                  {activeTab === 'pay' && 'Confirm & Pay Merchant'}
                </span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
