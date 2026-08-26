'use client';

import React from 'react';
import { useSpendy } from '@/lib/store/spendyStore';
import { formatUGX, formatDate } from '@/lib/formatters';
import { CheckCircle2, Download, Printer, Share2, X, ShieldCheck } from 'lucide-react';

export function ReceiptModal() {
  const { activeReceipt, closeReceipt } = useSpendy();

  if (!activeReceipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl glass-panel border border-white/20 p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={closeReceipt}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Receipt Header & Stamp */}
        <div className="text-center pb-5 border-b border-dashed border-white/20">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="text-xs uppercase font-extrabold tracking-widest px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Payment Successful
          </span>
          <h2 className="text-3xl font-extrabold text-white mt-3">
            {formatUGX(activeReceipt.amount)}
          </h2>
          <p className="text-xs text-gray-400 mt-1">Paid to {activeReceipt.merchantName}</p>
        </div>

        {/* Receipt Details Table */}
        <div className="py-4 space-y-2.5 text-xs">
          <div className="flex items-center justify-between text-gray-300">
            <span className="text-gray-400">Receipt No:</span>
            <span className="font-mono font-bold text-white">{activeReceipt.receiptNumber}</span>
          </div>

          <div className="flex items-center justify-between text-gray-300">
            <span className="text-gray-400">Reference:</span>
            <span className="font-mono text-gray-200">{activeReceipt.reference}</span>
          </div>

          <div className="flex items-center justify-between text-gray-300">
            <span className="text-gray-400">Payment Account:</span>
            <span className="font-semibold text-white">{activeReceipt.paymentMethod}</span>
          </div>

          <div className="flex items-center justify-between text-gray-300">
            <span className="text-gray-400">Category:</span>
            <span className="font-medium text-emerald-400">{activeReceipt.category}</span>
          </div>

          <div className="flex items-center justify-between text-gray-300">
            <span className="text-gray-400">Date & Time:</span>
            <span>{formatDate(activeReceipt.date)}</span>
          </div>

          <div className="flex items-center justify-between text-gray-300">
            <span className="text-gray-400">Status:</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED
            </span>
          </div>
        </div>

        {/* Informative Note */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-[11px] text-gray-400 text-center">
          This payment was automatically recorded in your transaction ledger and updated your monthly budget.
        </div>

        {/* Action Buttons */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs border border-white/15 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>
          <button
            onClick={closeReceipt}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
}
