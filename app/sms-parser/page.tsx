'use client';

import React, { useState, useMemo } from 'react';
import { useSpendy } from '@/lib/store/spendyStore';
import { parseMobileMoneySms, SAMPLE_MOBILE_MONEY_SMS, ParsedSmsResult } from '@/lib/engines/smsParserEngine';
import { formatUGX } from '@/lib/formatters';
import {
  MessageSquare,
  Sparkles,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Wallet,
  Tag,
  Copy,
} from 'lucide-react';

export default function SmsParserPage() {
  const { categories, accounts, addTransaction } = useSpendy();

  const [rawText, setRawText] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [customDescription, setCustomDescription] = useState('');

  // Live parsed result
  const parsedResult: ParsedSmsResult = useMemo(() => {
    if (!rawText.trim()) {
      return {
        success: false,
        type: 'expense',
        amount: 0,
        counterparty: '',
        provider: 'MTN MoMo',
        suggestedCategoryId: 'cat-other-exp',
        rawText: '',
        confidence: 'low',
      };
    }
    return parseMobileMoneySms(rawText);
  }, [rawText]);

  // Keep selected category in sync with AI prediction when new text is pasted
  React.useEffect(() => {
    if (parsedResult.success) {
      setSelectedCategoryId(parsedResult.suggestedCategoryId);
      setCustomDescription(parsedResult.counterparty);
      setIsSaved(false);
    }
  }, [parsedResult]);

  const handleSelectSample = (sample: { title: string; text: string }) => {
    setRawText(sample.text);
    setIsSaved(false);
  };

  const handleSaveTransaction = async () => {
    if (!parsedResult.success || parsedResult.amount <= 0) return;

    await addTransaction({
      type: parsedResult.type,
      amount: parsedResult.amount,
      category_id: selectedCategoryId || parsedResult.suggestedCategoryId || categories[0]?.id || 'cat-other-exp',
      description: customDescription || parsedResult.counterparty,
      account_id: selectedAccountId || accounts[0]?.id,
      payment_method: parsedResult.provider,
      merchant_name: parsedResult.counterparty,
      receipt_number: parsedResult.transactionId,
      transaction_date: new Date().toISOString(),
    });

    setIsSaved(true);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white tracking-tight">
              Mobile Money SMS Auto-Parser
            </h1>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              Paste MTN MoMo or Airtel confirmation texts to record transactions instantly without manual math.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Input on Left, Extracted Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input Box & Sample Presets */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0E1628] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="sms-textarea" className="text-xs font-bold text-gray-950 dark:text-white flex items-center gap-1.5">
                <Copy className="w-3.5 h-3.5 text-emerald-500" />
                <span>Paste SMS Confirmation Text</span>
              </label>
              {rawText && (
                <button
                  onClick={() => {
                    setRawText('');
                    setIsSaved(false);
                  }}
                  className="text-[11px] font-bold text-red-500 hover:text-red-400 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            <textarea
              id="sms-textarea"
              rows={5}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="e.g. Y'ello. You have sent UGX 25,000 to David Mukasa (256772123456) on 2026-09-06 14:22. Fee: UGX 1,000. New balance: UGX 142,500. Trans ID: 10982341."
              className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-gray-950 dark:text-white font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Or Try One-Tap Sample SMS:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SAMPLE_MOBILE_MONEY_SMS.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSample(sample)}
                  className="p-3 rounded-2xl bg-white dark:bg-[#0E1628] hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/30 text-left transition-all cursor-pointer active:scale-98 group"
                >
                  <p className="text-xs font-bold text-gray-950 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    {sample.title}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-mono">
                    {sample.text}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Extracted Smart Summary */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0E1628] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>Extracted Record</span>
              </span>

              {parsedResult.success && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  {parsedResult.provider}
                </span>
              )}
            </div>

            {parsedResult.success ? (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                {/* Amount & Direction Card */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                  parsedResult.type === 'income'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                      parsedResult.type === 'income' ? 'bg-emerald-500/20 text-emerald-600' : 'bg-rose-500/20 text-rose-600'
                    }`}>
                      {parsedResult.type === 'income' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider opacity-80">
                        {parsedResult.type === 'income' ? 'Cash In / Received' : 'Payment / Sent'}
                      </p>
                      <p className="text-lg font-black text-gray-950 dark:text-white">
                        {formatUGX(parsedResult.amount)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form fields for confirming details */}
                <div className="space-y-3 text-xs">
                  {/* Counterparty / Narrative */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Counterparty / Note
                    </label>
                    <input
                      type="text"
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-gray-950 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Category Assignment */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Category (Predicted)
                    </label>
                    <select
                      value={selectedCategoryId}
                      onChange={(e) => setSelectedCategoryId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-gray-950 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      {categories
                        .filter((c) => c.type === parsedResult.type)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Account Destination */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Wallet / Account
                    </label>
                    <select
                      value={selectedAccountId}
                      onChange={(e) => setSelectedAccountId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-gray-950 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.currency})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Optional Reference Info */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-[11px] space-y-1 font-mono text-slate-600 dark:text-slate-400">
                    {parsedResult.transactionId && (
                      <div className="flex justify-between">
                        <span>Ref ID:</span>
                        <span className="font-bold text-gray-950 dark:text-white">{parsedResult.transactionId}</span>
                      </div>
                    )}
                    {parsedResult.fee !== undefined && (
                      <div className="flex justify-between">
                        <span>Network Fee:</span>
                        <span>{formatUGX(parsedResult.fee)}</span>
                      </div>
                    )}
                    {parsedResult.newBalance !== undefined && (
                      <div className="flex justify-between">
                        <span>Reported Balance:</span>
                        <span>{formatUGX(parsedResult.newBalance)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Confirm & Save Button */}
                {isSaved ? (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-black text-xs text-center flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Recorded in Spendy activity!</span>
                  </div>
                ) : (
                  <button
                    onClick={handleSaveTransaction}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md shadow-emerald-600/20 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Confirm &amp; Log Transaction</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 space-y-2 text-slate-400">
                <AlertCircle className="w-8 h-8 mx-auto stroke-[1.5] text-slate-400" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  No Mobile Money text detected yet.
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Paste your MTN or Airtel SMS on the left to see auto-extraction.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
