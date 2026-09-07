'use client';

import React, { useState, useMemo } from 'react';
import { useSpendy } from '@/lib/store/spendyStore';
import { formatUGX } from '@/lib/formatters';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  TrendingDown,
  Sliders,
  DollarSign,
  AlertCircle,
  Clock,
  Wallet,
} from 'lucide-react';

export default function RunwayPage() {
  const { totalBalance, monthlyExpenses, transactions, accounts } = useSpendy();

  // Average daily burn rate based on actual expenses or fallback
  const baseMonthlyBurn = useMemo(() => {
    if (monthlyExpenses > 0) return monthlyExpenses;
    const pastExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return pastExpenses > 0 ? Math.round(pastExpenses / 2) : 1000000;
  }, [monthlyExpenses, transactions]);

  // What-if sliders
  const [expenseReductionPercent, setExpenseReductionPercent] = useState<number>(0);
  const [emergencyOneTimeCost, setEmergencyOneTimeCost] = useState<number>(0);

  // Adjusted Calculations
  const adjustedMonthlyBurn = useMemo(() => {
    const reduced = baseMonthlyBurn * (1 - expenseReductionPercent / 100);
    return Math.max(50000, Math.round(reduced));
  }, [baseMonthlyBurn, expenseReductionPercent]);

  const adjustedLiquidBalance = useMemo(() => {
    return Math.max(0, totalBalance - emergencyOneTimeCost);
  }, [totalBalance, emergencyOneTimeCost]);

  const dailyBurn = Math.round(adjustedMonthlyBurn / 30);
  const runwayDays = dailyBurn > 0 ? Math.floor(adjustedLiquidBalance / dailyBurn) : 0;
  const runwayMonths = (runwayDays / 30).toFixed(1);

  // Status Tier
  const tier = useMemo(() => {
    if (runwayDays < 30) {
      return {
        label: 'Critical Runway',
        color: 'text-rose-600 dark:text-rose-400',
        bgColor: 'bg-rose-500/15 border-rose-500/30',
        badge: 'Emergency Action Needed',
        advice: 'Your liquid funds cover less than 1 month. Immediately freeze all non-essential expenses and protect emergency cash.',
      };
    }
    if (runwayDays < 60) {
      return {
        label: 'Vulnerable',
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-500/15 border-amber-500/30',
        badge: '1–2 Months Runway',
        advice: 'You have breathing room, but any unexpected shock could deplete your cash. Aim to build towards a 90-day buffer.',
      };
    }
    if (runwayDays < 120) {
      return {
        label: 'Stable & Resilient',
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-500/15 border-blue-500/30',
        badge: '2–4 Months Runway',
        advice: 'Solid financial security! You could comfortably navigate an unexpected job transition or health gap.',
      };
    }
    return {
      label: 'Financial Fortress',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/15 border-emerald-500/30',
      badge: '4+ Months Fortress',
      advice: 'Outstanding resilience! Your family is shielded against macro-economic volatility and unforeseen emergencies.',
    };
  }, [runwayDays]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-700 text-white flex items-center justify-center shadow-md">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white tracking-tight">
              Survival Runway Simulator
            </h1>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              How many days could you survive if your income stopped tomorrow? Test what-if emergency scenarios.
            </p>
          </div>
        </div>
      </div>

      {/* Hero Runway Gauge Card */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm space-y-4 ${tier.bgColor}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
            {tier.badge}
          </span>
          <span className={`text-xs font-bold ${tier.color}`}>
            {tier.label}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-baseline pt-2">
          <div>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
              Survival Runway
            </p>
            <p className={`text-4xl sm:text-5xl font-black tracking-tight ${tier.color}`}>
              {runwayDays} <span className="text-xl font-bold">Days</span>
            </p>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              (~{runwayMonths} Months of zero-income survival)
            </p>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
              Available Liquid Reserves
            </p>
            <p className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white">
              {formatUGX(adjustedLiquidBalance)}
            </p>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Across {accounts.length} active wallets &amp; accounts
            </p>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
              Daily Burn Rate
            </p>
            <p className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white">
              {formatUGX(dailyBurn)}
              <span className="text-xs text-slate-500 font-normal"> /day</span>
            </p>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Based on {formatUGX(adjustedMonthlyBurn)}/month spend
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed pt-2 border-t border-black/10 dark:border-white/10">
          💡 <strong>Coach Tip:</strong> {tier.advice}
        </p>
      </div>

      {/* Interactive What-If Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-[#0E1628] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-500" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Interactive Stress-Test Scenarios
            </h2>
          </div>

          {/* Scenario 1: Expense Cut Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300">
                What if I cut non-essential spending?
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono font-black">
                -{expenseReductionPercent}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={60}
              step={5}
              value={expenseReductionPercent}
              onChange={(e) => setExpenseReductionPercent(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <p className="text-[11px] text-slate-500">
              New monthly spend: <strong>{formatUGX(adjustedMonthlyBurn)}</strong> (saves {formatUGX(baseMonthlyBurn - adjustedMonthlyBurn)}/mo)
            </p>
          </div>

          {/* Scenario 2: Emergency Expense Shock Slider */}
          <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300">
                What if an unexpected shock occurs? (Medical, repairs)
              </span>
              <span className="text-rose-600 dark:text-rose-400 font-mono font-black">
                -{formatUGX(emergencyOneTimeCost)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={2000000}
              step={50000}
              value={emergencyOneTimeCost}
              onChange={(e) => setEmergencyOneTimeCost(Number(e.target.value))}
              className="w-full accent-rose-500"
            />
            <p className="text-[11px] text-slate-500">
              Simulates a sudden cash withdrawal from your emergency reserves.
            </p>
          </div>
        </div>

        {/* Liquid Assets Breakdown */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-[#0E1628] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-emerald-500" />
            <span>Liquid Reserves by Wallet</span>
          </h2>

          <div className="space-y-2">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: acc.color || '#10B981' }}
                  />
                  <span className="font-bold text-gray-950 dark:text-white">
                    {acc.name}
                  </span>
                </div>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {formatUGX(acc.balance)}
                </span>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
            Only liquid cash, mobile money, and unrestricted bank deposits are counted toward your survival runway. Illiquid property or fixed loans are excluded.
          </p>
        </div>
      </div>
    </div>
  );
}
