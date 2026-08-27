'use client';

import React from 'react';
import Link from 'next/link';
import { useSpendy } from '@/lib/store/spendyStore';
import { ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export function FinancialHealthWidget() {
  const { financialHealth, insights } = useSpendy();

  return (
    <div className="rounded-3xl glass-panel p-5 sm:p-6 border border-black/15 dark:border-white/20 shadow-xl space-y-4">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-sm">
            <ShieldCheck className="w-5 h-5 font-black" />
          </div>
          <div>
            <h3 className="font-black text-sm text-gray-950 dark:text-white">Financial Health Score</h3>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Deterministic Ugandan financial wellness rating</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-3xl font-black text-gray-950 dark:text-white font-mono">{financialHealth.overallScore}</span>
          <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 shadow-sm">
            Grade {financialHealth.grade}
          </span>
        </div>
      </div>

      {/* Subscores Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center shadow-sm">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Savings Rate</span>
          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">{financialHealth.savingsRateScore}/25</span>
        </div>
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center shadow-sm">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Budget Control</span>
          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">{financialHealth.budgetAdherenceScore}/30</span>
        </div>
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center shadow-sm">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Debt Burden</span>
          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">{financialHealth.debtBurdenScore}/20</span>
        </div>
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center shadow-sm">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Goal Progress</span>
          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">{financialHealth.goalProgressScore}/15</span>
        </div>
      </div>

      {/* Deterministic Feedback bullets */}
      <div className="space-y-2 pt-1">
        {financialHealth.feedback.slice(0, 2).map((fb, idx) => (
          <div key={idx} className="flex items-start gap-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
            <span>{fb}</span>
          </div>
        ))}
      </div>

      {/* Deterministic insight highlight */}
      {insights.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <p className="text-purple-950 dark:text-purple-200 font-bold">{insights[0].description}</p>
          </div>
          <Link href="/insights" className="text-purple-700 dark:text-purple-300 hover:underline shrink-0 font-black flex items-center gap-1">
            <span>View</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
