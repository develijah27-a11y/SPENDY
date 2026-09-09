'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSpendy } from '@/lib/store/spendyStore';
import { SaccoGroup, calculateSaccoMetrics } from '@/lib/engines/saccoEngine';
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
  ShieldCheck,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
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
  const [sharesOwned, setSharesOwned] = useState(1);
  const [monthlyContribution, setMonthlyContribution] = useState(100000);
  const [dividendPercent, setDividendPercent] = useState(10);
  const [loanBorrowed, setLoanBorrowed] = useState(0);
  const [nextDueDate, setNextDueDate] = useState('');
  const [notes, setNotes] = useState('');

  // Load from local storage with auto-migration to purge legacy dummy data
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SACCO_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Permanently purge any hardcoded sample IDs
          const clean = parsed.filter(
            (s: SaccoGroup) => s.id !== 'sacco-1' && s.id !== 'sacco-2' && !s.name.includes('Wazalendo') && !s.name.includes('Kampala Young Tech')
          );
          setSaccos(clean);
          localStorage.setItem(SACCO_STORAGE_KEY, JSON.stringify(clean));
          return;
        }
      }
      setSaccos([]);
      localStorage.setItem(SACCO_STORAGE_KEY, JSON.stringify([]));
    } catch {
      setSaccos([]);
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
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              SACCO &amp; Chama Investment Clubs
            </h1>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              Institutional tracking for East African community savings pools, share equity, group loans, and dividend yields.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 active:scale-98 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add SACCO / Club</span>
        </button>
      </div>

      {successToast && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center gap-2 animate-in fade-in zoom-in-95">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Equity Value */}
        <div className="p-4.5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Share Equity</span>
            <Coins className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl font-black text-slate-950 dark:text-white font-mono tabular-nums">
            {formatUGX(metrics.totalEquityValue)}
          </p>
          <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
            Across {metrics.activeGroupCount} registered {metrics.activeGroupCount === 1 ? 'group' : 'groups'}
          </p>
        </div>

        {/* Monthly Pool Commitments */}
        <div className="p-4.5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Monthly Pool Outflow</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl font-black text-slate-950 dark:text-white font-mono tabular-nums">
            {formatUGX(metrics.totalMonthlyCommitment)}
          </p>
          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            Recurring monthly investment
          </p>
        </div>

        {/* Projected Annual Dividends */}
        <div className="p-4.5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Projected Dividends</span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
            +{formatUGX(metrics.projectedAnnualDividends)}/yr
          </p>
          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            Est. ~{metrics.totalEquityValue > 0 ? ((metrics.projectedAnnualDividends / metrics.totalEquityValue) * 100).toFixed(1) : 0}% annual return
          </p>
        </div>

        {/* Outstanding Group Loans */}
        <div className="p-4.5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Group Loans Borrowed</span>
            <Scale className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono tabular-nums">
            {formatUGX(metrics.totalLoansOutstanding)}
          </p>
          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            Active borrowed group capital
          </p>
        </div>
      </div>

      {/* SACCO Cards List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Your Registered Groups ({saccos.length})
          </h2>
          {saccos.length > 0 && (
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Auto-synced with monthly commitments
            </span>
          )}
        </div>

        {saccos.length === 0 ? (
          /* Institutional Empty State — Zero Dummy Data */
          <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 text-center space-y-6 shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
              <Users className="w-8 h-8" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-lg font-black text-slate-950 dark:text-white">
                No SACCOs or Investment Clubs Registered
              </h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                Connect your community savings groups, welfare funds, and investment pools to track your collective share value, monthly contributions, and year-end dividend returns in real time.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto text-left">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 space-y-1">
                <span className="text-[11px] font-bold text-slate-900 dark:text-white block">Share Equity</span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Monitor your share counts and total portfolio valuation.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 space-y-1">
                <span className="text-[11px] font-bold text-slate-900 dark:text-white block">1-Click Payouts</span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Log monthly rounds directly into your ledger in seconds.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 space-y-1">
                <span className="text-[11px] font-bold text-slate-900 dark:text-white block">Dividend Forecast</span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Project annual compound yields and community loans.</p>
              </div>
            </div>

            <div>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-98 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Register Your First Group</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {saccos.map((sacco) => {
              const equity = sacco.share_value * sacco.shares_owned;
              const projectedDiv = equity * (sacco.estimated_dividend_percent / 100);

              return (
                <div
                  key={sacco.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {sacco.type.replace('_', ' ')}
                        </span>
                        {sacco.estimated_dividend_percent > 0 && (
                          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                            ★ {sacco.estimated_dividend_percent}% Div.
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-black text-slate-950 dark:text-white mt-1">
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
                      className="p-2 rounded-xl hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                      title="Delete SACCO"
                      aria-label={`Delete ${sacco.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Financial Metrics breakdown */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 text-xs font-mono">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 font-sans block">Shares</span>
                      <span className="font-black text-slate-950 dark:text-white tabular-nums">
                        {sacco.shares_owned}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 font-sans block">Share Equity</span>
                      <span className="font-black text-slate-950 dark:text-white tabular-nums">
                        {formatUGX(equity)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 font-sans block">Est. Yield</span>
                      <span className="font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                        +{formatUGX(projectedDiv)}
                      </span>
                    </div>
                  </div>

                  {sacco.loan_borrowed > 0 && (
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs flex items-center justify-between text-rose-600 dark:text-rose-400 font-mono">
                      <span className="font-bold font-sans">Outstanding Loan:</span>
                      <span className="font-black tabular-nums">{formatUGX(sacco.loan_borrowed)}</span>
                    </div>
                  )}

                  {/* Action row */}
                  <div className="pt-1 flex items-center justify-between gap-3">
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 font-mono">
                      Monthly: <strong className="text-slate-950 dark:text-white font-sans">{formatUGX(sacco.monthly_contribution)}</strong>
                    </div>

                    <button
                      onClick={() => handleLogContribution(sacco)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs shadow-2xs transition-all active:scale-98 cursor-pointer flex items-center gap-1.5 border border-slate-700/60"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-400" />
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
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-slate-950 dark:text-white">
                  Register SACCO or Investment Club
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-950 dark:hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSacco} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Group / SACCO Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mukono Farmers & Traders SACCO"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Share Cost (UGX)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={shareValue}
                    onChange={(e) => setShareValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notes / Club Objectives
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Asset pooling, quarterly interest payouts"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-sm shadow-emerald-600/20 cursor-pointer"
                >
                  Register Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
