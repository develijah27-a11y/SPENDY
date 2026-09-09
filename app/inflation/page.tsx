'use client';

import React, { useState, useMemo } from 'react';
import { useSpendy } from '@/lib/store/spendyStore';
import {
  calculateInflationDecay,
  compareAssetVehicles,
} from '@/lib/engines/inflationEngine';
import { formatUGX } from '@/lib/formatters';
import {
  TrendingDown,
  ShieldCheck,
  Zap,
  Landmark,
  Coins,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function InflationPage() {
  const { totalBalance } = useSpendy();

  const [principal, setPrincipal] = useState<number>(totalBalance > 100000 ? totalBalance : 5000000);
  const [inflationRate, setInflationRate] = useState<number>(5.5);
  const [horizonYears, setHorizonYears] = useState<number>(3);

  const scenario = useMemo(() => {
    return calculateInflationDecay(principal, inflationRate, horizonYears);
  }, [principal, inflationRate, horizonYears]);

  const vehicles = useMemo(() => {
    return compareAssetVehicles(principal, inflationRate);
  }, [principal, inflationRate]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white tracking-tight">
              Inflation &amp; Purchasing Power Hedger
            </h1>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              Simulate the real purchasing power loss on idle cash in Uganda and compare high-yield wealth shields.
            </p>
          </div>
        </div>
      </div>

      {/* Simulator Inputs & Idle Cash Erosion Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Controls */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-white dark:bg-[#0E1628] border border-slate-200 dark:border-slate-800 space-y-5">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Simulation Parameters
          </h2>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300">Capital / Savings Balance:</span>
              <span className="text-gray-950 dark:text-white font-mono">{formatUGX(principal)}</span>
            </div>
            <input
              type="range"
              min={500000}
              max={50000000}
              step={250000}
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300">Annual Inflation Rate (BoU CPI):</span>
              <span className="text-gray-950 dark:text-white font-mono">{inflationRate.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min={2.0}
              max={15.0}
              step={0.5}
              value={inflationRate}
              onChange={(e) => setInflationRate(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300">Time Horizon:</span>
              <span className="text-gray-950 dark:text-white font-mono">{horizonYears} Years</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 3, 5].map((y) => (
                <button
                  key={y}
                  onClick={() => setHorizonYears(y)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    horizonYears === y
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {y} {y === 1 ? 'Year' : 'Years'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Real Loss Alert Card */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-rose-950/15 border border-rose-500/25 space-y-4">
          <div className="flex items-center gap-2 text-rose-500 font-black text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Idle Cash Erosion Impact</span>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
              If left uninvested in cash or low-interest accounts for {horizonYears} years:
            </p>
            <p className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">
              -{formatUGX(scenario.purchasingPowerLoss)}
            </p>
            <p className="text-xs font-bold text-slate-500">
              Loss of ~{scenario.percentLoss}% in real purchasing power
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0E1628] border border-rose-500/20 text-xs space-y-1">
            <p className="font-bold text-gray-950 dark:text-white">
              What does this mean in Kampala?
            </p>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              In {horizonYears} years, goods that currently cost <strong>{formatUGX(scenario.purchasingPowerValue)}</strong> will require <strong>{formatUGX(principal)}</strong> to purchase.
            </p>
          </div>
        </div>
      </div>

      {/* Asset Comparison Table */}
      <div className="space-y-3">
        <h2 className="text-sm font-black text-gray-950 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span>Compare Wealth Protection Vehicles in Uganda</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((v, idx) => {
            const isPositive = v.realReturnRate > 0;
            const futureVal = horizonYears === 1 ? v.valueAfter1Year : horizonYears === 3 ? v.valueAfter3Years : v.valueAfter5Years;

            return (
              <div
                key={idx}
                className="p-5 rounded-3xl bg-white dark:bg-[#0E1628] border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-gray-950 dark:text-white">
                      {v.name}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      v.riskLevel === 'Low'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                    }`}>
                      {v.riskLevel} Risk
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block">Nominal Yield</span>
                      <span className="text-sm font-black text-gray-950 dark:text-white">
                        {v.nominalReturnRate.toFixed(1)}%/yr
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 block">Real Return</span>
                      <span className={`text-sm font-black ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {isPositive ? '+' : ''}{v.realReturnRate.toFixed(1)}%/yr
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 block">
                      Purchasing Power Value ({horizonYears}y):
                    </span>
                    <span className="text-base font-black text-gray-950 dark:text-white">
                      {formatUGX(futureVal)}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-2.5">
                  {v.recommendation}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
