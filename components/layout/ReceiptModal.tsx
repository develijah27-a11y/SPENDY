'use client';

import React from 'react';
import { useSpendy } from '@/lib/store/spendyStore';
import { formatUGX, formatDate } from '@/lib/formatters';
import { CheckCircle2, Printer, X, ShieldCheck } from 'lucide-react';

export function ReceiptModal() {
  const { activeReceipt, closeReceipt } = useSpendy();

  if (!activeReceipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl glass-panel border border-black/20 dark:border-white/20 p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={closeReceipt}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-gray-950 dark:hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Receipt Header & Stamp */}
        <div className="text-center pb-5 border-b border-dashed border-slate-300 dark:border-white/20">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <span className="text-xs uppercase font-black tracking-widest px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
            Payment Verified
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-950 dark:text-white mt-3 font-mono">
            {formatUGX(activeReceipt.amount)}
          </h2>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">Paid to {activeReceipt.merchantName}</p>
        </div>

        {/* Receipt Details Table */}
        <div className="py-4 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700 dark:text-slate-300">Receipt No:</span>
            <span className="font-mono font-black text-gray-950 dark:text-white">{activeReceipt.receiptNumber}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700 dark:text-slate-300">Reference:</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{activeReceipt.reference}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700 dark:text-slate-300">Payment Account:</span>
            <span className="font-black text-gray-950 dark:text-white">{activeReceipt.paymentMethod}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700 dark:text-slate-300">Category:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{activeReceipt.category}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700 dark:text-slate-300">Date & Time:</span>
            <span className="font-semibold text-gray-950 dark:text-white">{formatDate(activeReceipt.date)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700 dark:text-slate-300">Status:</span>
            <span className="font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> VERIFIED
            </span>
          </div>
        </div>

        {/* Informative Note */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 text-center">
          This payment was automatically recorded in your transaction ledger and updated your monthly budget.
        </div>

        {/* Action Buttons */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-gray-950 dark:text-white font-bold text-xs border border-slate-300 dark:border-slate-700 transition-all cursor-pointer shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
          <button
            onClick={closeReceipt}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
}
