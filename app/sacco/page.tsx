'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSpendy } from '@/lib/store/spendyStore';
import { SaccoGroup, calculateSaccoMetrics, DEFAULT_SAMPLE_SACCOS } from '@/lib/engines/saccoEngine';
import { formatUGX } from '@/lib/formatters';
import { generateUUID } from '@/lib/utils';
import {
  Users,
  Plus,
  TrendingUp,
  Coins,
  Scale,
  Calendar,
  Trash2,
  CheckCircle2,
  PiggyBank,
  AlertCircle,
} from 'lucide-react';

const SACCO_STORAGE_KEY = 'spendy_sacco_vault_v1';

export default function SaccoPage() {
  const { addTransaction, accounts } = useSpendy();

  const [saccos, setSaccos] = useState<SaccoGroup[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<'sacco' | 'chama' | 'investment_club' | 'family_pool'>('sacco');
  const [shareValue, setShareValue] = useState(50000);
  const [sharesOwned, setSharesOwned] = useState(10);
  const [monthlyContribution, setMonthlyContribution] = useState(100000);
  const [dividendPercent, setDividendPercent] = useState(12);
  const [loanBorrowed, setLoanBorrowed] = useState(0);
  const [nextDueDate, setNextDueDate] = useState('');
  const [notes, setNotes] = useState('');

  // Load from local storage or default
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SACCO_STORAGE_KEY);
      if (saved) {
        setSaccos(JSON.parse(saved));
      } else {
        setSaccos(DEFAULT_SAMPLE_SACCOS);
        localStorage.setItem(SACCO_STORAGE_KEY, JSON.stringify(DEFAULT_SAMPLE_SACCOS));
      }
    } catch {
      setSaccos(DEFAULT_SAMPLE_SACCOS);
    }
  }, []);

  // Save changes
  const persistSaccos = (updated: SaccoGroup[]) => {
    setSaccos(updated);
    try {
      localStorage.setItem(SACCO_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const metrics = useMemo(() => calculateSaccoMetrics(saccos), [saccos]);

  const handleAddSacco = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newGroup: SaccoGroup = {
      id: generateUUID(),
      name: name.trim(),
      type,
      share_value: Math.max(0, shareValue),
      shares_owned: Math.max(0, sharesOwned),
      monthly_contribution: Math.max(0, monthlyContribution),
      estimated_dividend_percent: Math.max(0, dividendPercent),
      loan_borrowed: Math.max(0, loanBorrowed),
      loan_interest_percent: 5,
      next_due_date: nextDueDate || undefined,
      notes: notes.trim() || undefined,
      created_at: new Date().toISOString(),
    };

    const updated = [newGroup, ...saccos];
    persistSaccos(updated);
    setShowAddModal(false);

    // Reset form
    setName('');
    setNotes('');
    setSuccessToast(`Added ${newGroup.name} to your portfolio!`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleDeleteSacco = (id: string) => {
    const updated = saccos.filter((s) => s.id !== id);
    persistSaccos(updated);
  };

  // 1-Click Contribution
  const handleLogContribution = async (sacco: SaccoGroup) => {
    if (sacco.monthly_contribution <= 0) return;

    // Log to Spendy transactions
    await addTransaction({
      type: 'expense',
      amount: sacco.monthly_contribution,
      category_id: 'cat-investment',
      description: `SACCO Contribution: ${sacco.name}`,
      account_id: accounts[0]?.id,
      payment_method: 'Mobile Money',
      merchant_name: sacco.name,
      transaction_date: new Date().toISOString(),
    });

    // Increment share count if applicable
    const addedShares = sacco.share_value > 0 ? Math.floor(sacco.monthly_contribution / sacco.share_value) : 1;
    const updated = saccos.map((s) => (s.id === sacco.id ? { ...s, shares_owned: s.shares_owned + addedShares } : s));
    persistSaccos(updated);

    setSuccessToast(`Logged ${formatUGX(sacco.monthly_contribution)} to ${sacco.name} & added ${addedShares} shares!`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white tracking-tight">
              SACCO &amp; Chama Investment Clubs
            </h1>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              Track your collective savings pools, member shares, group loans, and annual dividend earnings.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 active:scale-98 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add SACCO / Club</span>
        </button>
      </div>

      {successToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center gap-2 animate-in fade-in zoom-in-95">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Equity Value */}
        <div className="p-4 rounded-3xl bg-white dark:bg-[#0E1628] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Share Equity
          </span>
          <p className="text-xl font-black text-gray-950 dark:text-white">
            {formatUGX(metrics.totalEquityValue)}
          </p>
          <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
            Across {metrics.activeGroupCount} active groups
          </p>
        </div>

        {/* Monthly Pool Commitments */}
        <div className="p-4 rounded-3xl bg-white dark:bg-[#0E1628] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Monthly Pool Outflow
          </span>
          <p className="text-xl font-black text-gray-950 dark:text-white">
            {formatUGX(metrics.totalMonthlyCommitment)}
          </p>
          <p className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">
            Required monthly investment
          </p>
        </div>

        {/* Projected Annual Dividends */}
        <div className="p-4 rounded-3xl bg-white dark:bg-[#0E1628] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Projected Dividends
          </span>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
            +{formatUGX(metrics.projectedAnnualDividends)}/yr
          </p>
          <p className="text-[10px] font-semibold text-slate-500">
            Est. ~{metrics.totalEquityValue > 0 ? ((metrics.projectedAnnualDividends / metrics.totalEquityValue) * 100).toFixed(1) : 0}% average yield
          </p>
        </div>

        {/* Outstanding Group Loans */}
        <div className="p-4 rounded-3xl bg-white dark:bg-[#0E1628] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Group Loans Borrowed
          </span>
          <p className="text-xl font-black text-rose-600 dark:text-rose-400">
            {formatUGX(metrics.totalLoansOutstanding)}
          </p>
          <p className="text-[10px] font-semibold text-slate-500">
            Active borrowed capital
          </p>
        </div>
      </div>

      {/* SACCO Cards List */}
      <div className="space-y-4">
        <h2 className="text-sm font-black text-gray-950 dark:text-white uppercase tracking-wider">
          Your Savings Clubs &amp; SACCOs ({saccos.length})
        </h2>

        {saccos.length === 0 ? (
          <div className="p-10 rounded-3xl bg-white dark:bg-[#0E1628] border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <PiggyBank className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-gray-950 dark:text-white">No SACCOs registered yet.</p>
            <p className="text-xs text-slate-500">Tap Add SACCO above to begin tracking your community savings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {saccos.map((sacco) => {
              const equity = sacco.share_value * sacco.shares_owned;
              const projectedDiv = equity * (sacco.estimated_dividend_percent / 100);

              return (
                <div
                  key={sacco.id}
                  className="p-5 rounded-3xl bg-white dark:bg-[#0E1628] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-purple-500/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                          {sacco.type.replace('_', ' ')}
                        </span>
                        {sacco.estimated_dividend_percent > 0 && (
                          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                            ★ {sacco.estimated_dividend_percent}% Div.
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-black text-gray-950 dark:text-white mt-1">
                        {sacco.name}
                      </h3>
                      {sacco.notes && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                          {sacco.notes}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteSacco(sacco.id)}
                      className="p-1.5 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                      title="Delete SACCO"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Financial Metrics breakdown */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block">Total Shares</span>
                      <span className="font-black text-gray-950 dark:text-white">
                        {sacco.shares_owned} shares
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block">Share Equity</span>
                      <span className="font-black text-gray-950 dark:text-white">
                        {formatUGX(equity)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block">Annual Div.</span>
                      <span className="font-black text-emerald-600 dark:text-emerald-400">
                        +{formatUGX(projectedDiv)}
                      </span>
                    </div>
                  </div>

                  {sacco.loan_borrowed > 0 && (
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs flex items-center justify-between text-rose-600 dark:text-rose-400">
                      <span className="font-bold">Outstanding Loan:</span>
                      <span className="font-black">{formatUGX(sacco.loan_borrowed)}</span>
                    </div>
                  )}

                  {/* Action row */}
                  <div className="pt-1 flex items-center justify-between gap-3">
                    <div className="text-[11px] font-semibold text-slate-500">
                      Monthly: <strong className="text-gray-950 dark:text-white">{formatUGX(sacco.monthly_contribution)}</strong>
                    </div>

                    <button
                      onClick={() => handleLogContribution(sacco)}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-xs transition-all active:scale-98 cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Log Contribution</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0E1628] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black text-gray-950 dark:text-white">
                Add SACCO or Investment Club
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSacco} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Group / SACCO Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kampala Teachers & Welfare SACCO"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-gray-950 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Group Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-gray-950 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="sacco">SACCO</option>
                    <option value="investment_club">Investment Club</option>
                    <option value="chama">Chama Pool</option>
                    <option value="family_pool">Family Welfare Fund</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Monthly Contribution (UGX)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-gray-950 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Share Cost (UGX)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={shareValue}
                    onChange={(e) => setShareValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-gray-950 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Shares Owned
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={sharesOwned}
                    onChange={(e) => setSharesOwned(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-gray-950 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Est. Div %
                  </label>
                  <input
                    type="number"
                    step={0.5}
                    min={0}
                    value={dividendPercent}
                    onChange={(e) => setDividendPercent(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-gray-950 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notes / Club Goals
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Land acquisition in Gayaza, payouts in December"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-gray-950 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="pt-2 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black shadow-md shadow-purple-600/30 cursor-pointer"
                >
                  Save Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
