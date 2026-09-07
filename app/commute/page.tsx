'use client';

import React, { useState, useMemo } from 'react';
import { useSpendy } from '@/lib/store/spendyStore';
import {
  TransitMode,
  KAMPALA_ROUTE_PRESETS,
  calculateCommute,
  CommuteRoute,
} from '@/lib/engines/commuteEngine';
import { formatUGX } from '@/lib/formatters';
import {
  Navigation,
  CloudRain,
  Bike,
  Bus,
  Car,
  Footprints,
  Plus,
  CheckCircle2,
  TrendingDown,
  Sparkles,
} from 'lucide-react';

export default function CommutePage() {
  const { addTransaction, accounts } = useSpendy();

  const [selectedRouteId, setSelectedRouteId] = useState<string>(KAMPALA_ROUTE_PRESETS[0].id);
  const [selectedMode, setSelectedMode] = useState<TransitMode>('boda');
  const [workingDays, setWorkingDays] = useState<number>(22);
  const [rainyDays, setRainyDays] = useState<number>(5);
  const [rainMultiplier, setRainMultiplier] = useState<number>(1.5);
  const [successToast, setSuccessToast] = useState<string>('');

  const currentRoute: CommuteRoute = useMemo(() => {
    return KAMPALA_ROUTE_PRESETS.find((r) => r.id === selectedRouteId) || KAMPALA_ROUTE_PRESETS[0];
  }, [selectedRouteId]);

  const commuteCalc = useMemo(() => {
    return calculateCommute(currentRoute, selectedMode, workingDays, rainyDays, rainMultiplier);
  }, [currentRoute, selectedMode, workingDays, rainyDays, rainMultiplier]);

  const handleLogTransitExpense = async () => {
    const amount = commuteCalc.dailyCost;
    if (amount <= 0) return;

    await addTransaction({
      type: 'expense',
      amount,
      category_id: 'cat-transport',
      description: `Commute (${selectedMode.toUpperCase()}): ${currentRoute.name}`,
      account_id: accounts[0]?.id,
      payment_method: selectedMode === 'boda' ? 'MTN MoMo' : 'Cash',
      merchant_name: `Transit: ${currentRoute.name}`,
      transaction_date: new Date().toISOString(),
    });

    setSuccessToast(`Logged ${formatUGX(amount)} transit expense to Transport category!`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white tracking-tight">
              Daily Commute &amp; Boda Fuel Meter
            </h1>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              Model your daily Kampala transit burn rate, compare Boda vs Matatu savings, and log rides in 1 tap.
            </p>
          </div>
        </div>
      </div>

      {successToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center gap-2 animate-in fade-in zoom-in-95">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Route & Mode Controls */}
        <div className="lg:col-span-7 space-y-4">
          {/* Route Preset Selector */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0E1628] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <label className="text-xs font-bold text-gray-950 dark:text-white block">
              Select Your Regular Commute Route
            </label>
            <select
              value={selectedRouteId}
              onChange={(e) => setSelectedRouteId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              {KAMPALA_ROUTE_PRESETS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} (~{r.oneWayDistanceKm} km)
                </option>
              ))}
            </select>
          </div>

          {/* Mode Selector */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0E1628] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <label className="text-xs font-bold text-gray-950 dark:text-white block">
              Primary Transit Mode
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setSelectedMode('boda')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  selectedMode === 'boda'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400 font-black shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Bike className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs block">Boda-Boda</span>
                <span className="text-[10px] opacity-75 font-mono">Fast / Direct</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMode('matatu')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  selectedMode === 'matatu'
                    ? 'bg-blue-500/15 border-blue-500 text-blue-600 dark:text-blue-400 font-black shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Bus className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs block">Matatu Taxi</span>
                <span className="text-[10px] opacity-75 font-mono">Budget Pick</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMode('car_fuel')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  selectedMode === 'car_fuel'
                    ? 'bg-purple-500/15 border-purple-500 text-purple-600 dark:text-purple-400 font-black shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Car className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs block">Car / Fuel</span>
                <span className="text-[10px] opacity-75 font-mono">Comfort</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMode('walking')}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  selectedMode === 'walking'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-black shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Footprints className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs block">Walk / Cycle</span>
                <span className="text-[10px] opacity-75 font-mono">Free</span>
              </button>
            </div>
          </div>

          {/* Working Days & Rain Surge Sliders */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0E1628] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700 dark:text-slate-300">Office / Work Days per Month:</span>
                <span className="text-gray-950 dark:text-white font-mono">{workingDays} days</span>
              </div>
              <input
                type="range"
                min={5}
                max={30}
                value={workingDays}
                onChange={(e) => setWorkingDays(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <CloudRain className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Rainy / Traffic Surge Days:</span>
                </span>
                <span className="text-gray-950 dark:text-white font-mono">{rainyDays} days</span>
              </div>
              <input
                type="range"
                min={0}
                max={15}
                value={rainyDays}
                onChange={(e) => setRainyDays(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Burn Rate Output & Action Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0E1628] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Transit Burn Projection
            </span>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400">Daily Commute (Round Trip)</span>
                <span className="text-sm font-black text-gray-950 dark:text-white">{formatUGX(commuteCalc.dailyCost)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-amber-500/20">
                <span className="text-xs font-black text-amber-800 dark:text-amber-300">Monthly Projected Outflow</span>
                <span className="text-lg font-black text-amber-600 dark:text-amber-400">{formatUGX(commuteCalc.monthlyCost)}</span>
              </div>
            </div>

            {/* Alternative Savings Insight */}
            {commuteCalc.potentialSavingsWithAlternative.monthlySavings > 0 && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1 text-emerald-800 dark:text-emerald-300">
                <div className="flex items-center gap-1.5 font-black">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Savings Opportunity: +{formatUGX(commuteCalc.potentialSavingsWithAlternative.monthlySavings)}/mo</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                  {commuteCalc.potentialSavingsWithAlternative.tip}
                </p>
              </div>
            )}

            {/* Quick Log Button */}
            {commuteCalc.dailyCost > 0 && (
              <button
                onClick={handleLogTransitExpense}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-xs shadow-md shadow-amber-600/20 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Log Today&apos;s Commute ({formatUGX(commuteCalc.dailyCost)})</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
