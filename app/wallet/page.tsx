'use client';

import React, { useState } from 'react';
import { useSpendy } from '@/lib/store/spendyStore';
import { formatUGX, formatDate } from '@/lib/formatters';
import {
  Wallet,
  ArrowDownLeft,
  Store,
  CheckCircle2,
  ShieldCheck,
  ReceiptText,
  Lock,
  Plus,
  AlertCircle,
} from 'lucide-react';

export function WalletPage() {
  const {
    accounts,
    transactions,
    processMerchantPayment,
    createTransfer,
    openReceipt,
    categories,
  } = useSpendy();

  // Find Spendy Wallet account
  const walletAccount = accounts.find((a) => a.type === 'spendy_wallet') || accounts[0];

  // Merchant pay states
  const [merchantName, setMerchantName] = useState('Cafe Kampala');
  const [amount, setAmount] = useState('35000');
  const [categoryId, setCategoryId] = useState('cat-food');
  const [reference, setReference] = useState('BILL-2026');
  const [note, setNote] = useState('Dinner with friends');
  const [pin, setPin] = useState('1234');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Top Up Modal State
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpSource, setTopUpSource] = useState(
    accounts.find((a) => a.id !== walletAccount?.id)?.id || ''
  );
  const [topUpAmount, setTopUpAmount] = useState('100000');

  // Filter transactions performed with wallet or having receipt
  const walletTransactions = transactions.filter(
    (t) => t.account_id === walletAccount?.id || Boolean(t.receipt_number)
  );

  const popularMerchants = [
    { name: 'Cafe Kampala', categoryId: 'cat-food', catName: 'Food & Dining' },
    { name: 'SafeBoda Ride', categoryId: 'cat-transport', catName: 'Transport' },
    { name: 'Umeme Yaka Tokens', categoryId: 'cat-utilities', catName: 'Utilities' },
    { name: 'Quick Supermarket', categoryId: 'cat-shopping', catName: 'Shopping' },
    { name: 'Jumia Uganda Order', categoryId: 'cat-shopping', catName: 'Shopping' },
    { name: 'Shell Bugolobi Station', categoryId: 'cat-transport', catName: 'Transport' },
  ];

  const handleMerchantPay = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    const parsedAmount = parseFloat(amount.replace(/,/g, ''));

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg('Please enter a valid payment amount.');
      return;
    }

    if (walletAccount && walletAccount.balance < parsedAmount) {
      setErrorMsg(`Insufficient wallet balance (${formatUGX(walletAccount.balance)}). Please top up first.`);
      return;
    }

    try {
      setIsProcessing(true);
      const receipt = await processMerchantPayment({
        merchantId: `m-${Date.now()}`,
        merchantName: merchantName.trim(),
        amount: parsedAmount,
        categoryId,
        accountId: walletAccount.id,
        reference: reference || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
        note: note.trim(),
      });
      setSuccessMsg(`Paid ${formatUGX(parsedAmount)} to ${merchantName}. Receipt #${receipt.receiptNumber}`);
      setAmount('');
      setNote('');
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Payment failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(topUpAmount);
    if (!isNaN(amt) && amt > 0 && topUpSource && walletAccount) {
      createTransfer({
        from_account_id: topUpSource,
        to_account_id: walletAccount.id,
        amount: amt,
        note: 'Top up Spendy Digital Wallet',
      });
      setShowTopUp(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white tracking-tight flex items-center gap-2.5">
            <Wallet className="w-7 h-7 text-purple-600 dark:text-purple-400 font-black" />
            <span>Spendy Digital Wallet</span>
          </h1>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-1">
            Internal ledger, instant merchant checkout simulator & digital receipts
          </p>
        </div>

        <button
          onClick={() => setShowTopUp(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Top Up Wallet</span>
        </button>
      </div>

      {/* Wallet Balance Hero Card (One Primary Metric) */}
      <div className="rounded-2xl p-6 sm:p-7 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Available Wallet Balance
          </span>
          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {walletAccount?.account_number || 'SP-001'}
          </span>
        </div>

        <h2 className="text-4xl sm:text-5xl font-black text-slate-950 dark:text-white mt-3 tracking-tight font-mono tabular-nums">
          {formatUGX(walletAccount?.balance || 0)}
        </h2>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
          Ready for instant merchant payments & immediate ledger auto-recording.
        </p>

        <div className="flex flex-wrap gap-2.5 mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setShowTopUp(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
          >
            <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
            <span>Add Money</span>
          </button>
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 text-xs font-medium border border-slate-200/80 dark:border-slate-800/80">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Protected Ledger</span>
          </div>
        </div>
      </div>

      {/* Top Up Modal */}
      {showTopUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl glass-panel p-6 border border-black/20 dark:border-white/20 shadow-2xl">
            <h3 className="font-black text-base text-gray-950 dark:text-white mb-4">Top Up Spendy Wallet</h3>
            <form onSubmit={handleTopUp} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-900 dark:text-white mb-1">Source Account</label>
                <select
                  value={topUpSource}
                  onChange={(e) => setTopUpSource(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-bold"
                >
                  {accounts
                    .filter((a) => a.id !== walletAccount?.id)
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({formatUGX(a.balance)})
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-gray-900 dark:text-white mb-1">Amount to Add (UGX)</label>
                <input
                  type="number"
                  required
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white font-black text-base"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTopUp(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  Confirm Top Up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid: Merchant Payment Simulator & History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Merchant Payment Simulator */}
        <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800">
            <Store className="w-5 h-5 text-emerald-600 dark:text-emerald-400 font-bold" />
            <div>
              <h3 className="font-bold text-sm text-slate-950 dark:text-white">Merchant Payment Prototype</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Simulate paying a store, cafe or boda</p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleMerchantPay} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-900 dark:text-white mb-1">Merchant / Store Name</label>
              <input
                type="text"
                required
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                placeholder="e.g. Cafe Kampala"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-950 dark:text-white font-semibold"
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
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-900 dark:text-white mb-1">Amount (UGX)</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="35,000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-950 dark:text-white font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-900 dark:text-white mb-1">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-950 dark:text-white font-semibold"
                >
                  {categories
                    .filter((c) => c.type === 'expense')
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-900 dark:text-white mb-1">Bill Reference</label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Table 4 / Ref"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-950 dark:text-white font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-500" /> Wallet PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="1234"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-950 dark:text-white font-mono text-center tracking-widest font-black"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-900 dark:text-white mb-1">Note (Optional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Dinner with team"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-950 dark:text-white font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
            >
              {isProcessing ? 'Processing via Gateway...' : 'Confirm & Pay Merchant'}
            </button>
          </form>
        </div>

        {/* Digital Wallet Activity & Receipts */}
        <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <ReceiptText className="w-5 h-5 text-emerald-600 dark:text-emerald-400 font-black" />
              <div>
                <h3 className="font-black text-sm text-gray-950 dark:text-white">Wallet Activity & Receipts</h3>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">All payments made with auto-generated receipts</p>
              </div>
            </div>
          </div>

          <div className="flex-1 mt-3 space-y-2.5 overflow-y-auto max-h-[380px] pr-1">
            {walletTransactions.length === 0 ? (
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 py-8 text-center">No wallet activity yet.</p>
            ) : (
              walletTransactions.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 transition-colors shadow-sm"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-black text-xs text-gray-950 dark:text-white truncate">
                        {t.merchant_name || t.category?.name || 'Wallet Payment'}
                      </p>
                      {t.receipt_number && (
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                          {t.receipt_number}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                      {formatDate(t.transaction_date)} • {t.note || 'Paid'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs sm:text-sm font-black font-mono text-red-600 dark:text-red-400">
                      - {formatUGX(t.amount)}
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
                            paymentMethod: 'Spendy Wallet',
                            category: t.category?.name || 'Expense',
                            reference: t.note || 'REF-1234',
                            status: 'SUCCESS',
                          })
                        }
                        className="px-2.5 py-1 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-gray-950 dark:text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Receipt
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WalletPage;
