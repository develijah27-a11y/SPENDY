'use client';

import React from 'react';
import Link from 'next/link';
import { useSpendy } from '@/lib/store/spendyStore';
import { ShieldCheck, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

export function FinancialHealthWidget() {
  const { financialHealth, insights } = useSpendy();

  return (
    <div className="rounded-3xl glass-panel p-5 sm:p-6 border border-white/10 shadow-xl space-y-4">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Financial Health Score</h3>
            <p className="text-[11px] text-gray-400">Rules-based financial wellness rating</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-white">{financialHealth.overallScore}</span>
          <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Grade {financialHealth.grade}
          </span>
        </div>
      </div>

      {/* Subscores Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
          <span className="text-[10px] text-gray-400 block">Savings Rate</span>
          <span className="text-xs font-bold text-emerald-400">{financialHealth.savingsRateScore}/25</span>
        </div>
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
          <span className="text-[10px] text-gray-400 block">Budget Control</span>
          <span className="text-xs font-bold text-emerald-400">{financialHealth.budgetAdherenceScore}/30</span>
        </div>
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
          <span className="text-[10px] text-gray-400 block">Debt Burden</span>
          <span className="text-xs font-bold text-emerald-400">{financialHealth.debtBurdenScore}/20</span>
        </div>
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
          <span className="text-[10px] text-gray-400 block">Goal Progress</span>
          <span className="text-xs font-bold text-emerald-400">{financialHealth.goalProgressScore}/15</span>
        </div>
      </div>

      {/* Deterministic Feedback bullets */}
      <div className="space-y-1.5 pt-1">
        {financialHealth.feedback.slice(0, 2).map((fb, idx) => (
          <div key={idx} className="flex items-start gap-2 text-xs text-gray-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
            <span>{fb}</span>
          </div>
        ))}
      </div>

      {/* Deterministic insight highlight */}
      {insights.length > 0 && (
        <div className="p-3 rounded-2xl bg-purple-950/20 border border-purple-500/20 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <p className="text-purple-200">{insights[0].description}</p>
          </div>
          <Link href="/insights" className="text-purple-300 hover:text-white shrink-0 font-semibold flex items-center">
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
