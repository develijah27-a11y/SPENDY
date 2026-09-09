'use client';

import React from 'react';
import Link from 'next/link';
import { useSpendy } from '@/lib/store/spendyStore';
import { ShieldCheck, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export function FinancialHealthWidget() {
  const { financialHealth, insights } = useSpendy();

  return (
    <div className="rounded-3xl bg-white dark:bg-[#0B0F19] border border-slate-200/90 dark:border-slate-800/90 p-5 sm:p-6 shadow-lg space-y-4">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-2xs">
            <ShieldCheck className="w-5 h-5 font-black" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-black text-sm text-slate-950 dark:text-white">Financial Health Score</h3>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Cashflow, budget, and debt assessment</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white font-mono">{financialHealth.overallScore}</span>
          <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            Grade {financialHealth.grade}
          </span>
        </div>
      </div>

      {/* 4 Score Telemetry Pillars */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800/70 text-center shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Savings Rate</span>
          <span className="text-sm font-black text-slate-950 dark:text-white font-mono mt-0.5 block">{financialHealth.savingsRateScore}/25</span>
        </div>
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800/70 text-center shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Budget Control</span>
          <span className="text-sm font-black text-slate-950 dark:text-white font-mono mt-0.5 block">{financialHealth.budgetAdherenceScore}/30</span>
        </div>
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800/70 text-center shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Debt Burden</span>
          <span className="text-sm font-black text-slate-950 dark:text-white font-mono mt-0.5 block">{financialHealth.debtBurdenScore}/20</span>
        </div>
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800/70 text-center shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Goal Progress</span>
          <span className="text-sm font-black text-slate-950 dark:text-white font-mono mt-0.5 block">{financialHealth.goalProgressScore}/15</span>
        </div>
      </div>

      {/* Feedback Bullets */}
      <div className="space-y-2 pt-1">
        {financialHealth.feedback.slice(0, 2).map((fb, idx) => (
          <div key={idx} className="flex items-start gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" aria-hidden="true" />
            <span>{fb}</span>
          </div>
        ))}
      </div>

      {/* Intelligence Highlight */}
      {insights.length > 0 && (
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" aria-hidden="true" />
            <p className="text-slate-800 dark:text-slate-200 font-bold truncate">{insights[0].description}</p>
          </div>
          <Link
            href="/insights"
            className="text-emerald-600 dark:text-emerald-400 hover:underline shrink-0 font-bold flex items-center gap-1"
          >
            <span>Review</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      )}
    </div>
  );
}
