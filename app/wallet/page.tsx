'use client';

import React, { useState } from 'react';
import { useSpendy } from '@/lib/store/spendyStore';
import { formatUGX, formatDate } from '@/lib/formatters';
import {
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
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
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Wallet className="w-6 h-6 text-purple-400" />
            <span>Spendy Digital Wallet</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Internal ledger, instant merchant checkout simulator & digital receipts
          </p>
        </div>

        <button
          onClick={() => setShowTopUp(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Top Up Wallet</span>
        </button>
      </div>

      {/* Wallet Balance Hero Card */}
      <div className="rounded-3xl p-6 bg-gradient-to-tr from-purple-950/60 via-slate-900 to-indigo-950/40 border border-purple-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-widest text-purple-300">
            Available Wallet Balance
          </span>
          <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            {walletAccount?.account_number || 'SP-001'}
          </span>
        </div>

        <h2 className="text-4xl font-black text-white mt-3 tracking-tight">
          {formatUGX(walletAccount?.balance || 0)}
        </h2>

        <p className="text-xs text-purple-200/80 mt-1">
          Ready for contactless merchant payments & immediate ledger auto-recording.
        </p>

        <div className="flex flex-wrap gap-2.5 mt-5 pt-4 border-t border-purple-500/20">
          <button
            onClick={() => setShowTopUp(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium border border-white/10 cursor-pointer"
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add Money</span>
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 text-gray-300 text-xs border border-white/5">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>Protected Ledger</span>
          </div>
        </div>
      </div>

      {/* Top Up Modal */}
      {showTopUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl glass-panel p-6 border border-white/20 shadow-2xl">
            <h3 className="font-bold text-base text-white mb-4">Top Up Spendy Wallet</h3>
            <form onSubmit={handleTopUp} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-300 mb-1">Source Account</label>
                <select
                  value={topUpSource}
                  onChange={(e) => setTopUpSource(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-900 border border-white/15 text-white"
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
                <label className="block font-semibold text-gray-300 mb-1">Amount to Add (UGX)</label>
                <input
                  type="number"
                  required
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-bold text-base"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTopUp(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white font-bold"
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
        <div className="rounded-3xl glass-panel p-6 border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <Store className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="font-bold text-sm text-white">Merchant Payment Prototype</h3>
              <p className="text-[11px] text-gray-400">Simulate paying a store, cafe or boda</p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleMerchantPay} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-gray-300 mb-1">Merchant / Store Name</label>
              <input
                type="text"
                required
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                placeholder="e.g. Cafe Kampala"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white"
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
                <label className="block font-semibold text-gray-300 mb-1">Amount (UGX)</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="35,000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-300 mb-1">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-white/15 text-white"
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
                <label className="block font-semibold text-gray-300 mb-1">Bill Reference</label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Table 4 / Ref"
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-300 mb-1 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-purple-400" /> Wallet PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="1234"
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-center tracking-widest"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-300 mb-1">Note (Optional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Dinner with team"
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-white"
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
            >
              {isProcessing ? 'Processing via Gateway...' : 'Confirm & Pay Merchant'}
            </button>
          </form>
        </div>

        {/* Digital Wallet Activity & Receipts */}
        <div className="rounded-3xl glass-panel p-6 border border-white/10 shadow-xl flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <ReceiptText className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="font-bold text-sm text-white">Wallet Activity & Receipts</h3>
                <p className="text-[11px] text-gray-400">All payments made with auto-generated receipts</p>
              </div>
            </div>
          </div>

          <div className="flex-1 mt-3 space-y-2.5 overflow-y-auto max-h-[380px] pr-1">
            {walletTransactions.length === 0 ? (
              <p className="text-xs text-gray-400 py-8 text-center">No wallet activity yet.</p>
            ) : (
              walletTransactions.map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-xs text-white truncate">
                        {t.merchant_name || t.category?.name || 'Wallet Payment'}
                      </p>
                      {t.receipt_number && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {t.receipt_number}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {formatDate(t.transaction_date)} • {t.note || 'Paid'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold font-mono text-red-400">
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
                        className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-gray-200 text-[10px] font-semibold transition-colors cursor-pointer"
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
