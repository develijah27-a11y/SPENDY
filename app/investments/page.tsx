'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSpendy } from '@/lib/store/spendyStore';
import {
  PersonalInvestment,
  AssetClass,
  ASSET_CLASS_METADATA,
  calculateInvestmentMetrics,
} from '@/lib/engines/investmentEngine';
import { formatUGX, formatCurrency } from '@/lib/formatters';
import { generateUUID } from '@/lib/utils';
import {
  TrendingUp,
  Plus,
  ShieldCheck,
  Landmark,
  Scale,
  Home,
  Lock,
  Wheat,
  Coins,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit3,
  Sparkles,
  PieChart,
  RefreshCw,
} from 'lucide-react';

const INVESTMENTS_STORAGE_KEY = 'spendy_investments_vault_v1';

export default function InvestmentsPage() {
  const { addTransaction, accounts } = useSpendy();

  const [investments, setInvestments] = useState<PersonalInvestment[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // Top-up modal state
  const [topupAsset, setTopupAsset] = useState<PersonalInvestment | null>(null);
  const [topupAmount, setTopupAmount] = useState<string>('100000');

  // Revaluation modal state
  const [revalueAsset, setRevalueAsset] = useState<PersonalInvestment | null>(null);
  const [newValuation, setNewValuation] = useState<string>('');

  // Form State
  const [name, setName] = useState('');
  const [assetClass, setAssetClass] = useState<AssetClass>('unit_trust');
  const [institution, setInstitution] = useState('UAP Old Mutual');
  const [principalAmount, setPrincipalAmount] = useState<number>(500000);
  const [currentValuation, setCurrentValuation] = useState<number>(500000);
  const [expectedReturnPct, setExpectedReturnPct] = useState<number>(11.5);
  const [monthlyTopup, setMonthlyTopup] = useState<number>(0);
  const [startDate, setStartDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [maturityDate, setMaturityDate] = useState<string>('');
  const [notes, setNotes] = useState('');

  // Load from local storage (clean zero dummy data default)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(INVESTMENTS_STORAGE_KEY);
      if (saved) {
        setInvestments(JSON.parse(saved));
      } else {
        setInvestments([]);
      }
    } catch {
      setInvestments([]);
    }
  }, []);

  const persistInvestments = (updated: PersonalInvestment[]) => {
    setInvestments(updated);
    try {
      localStorage.setItem(INVESTMENTS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const metrics = useMemo(() => calculateInvestmentMetrics(investments), [investments]);

  const handleAddInvestment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newAsset: PersonalInvestment = {
      id: generateUUID(),
      name: name.trim(),
      asset_class: assetClass,
      institution: institution.trim() || 'Direct',
      principal_amount: Math.max(0, principalAmount),
      current_valuation: Math.max(0, currentValuation || principalAmount),
      expected_annual_return_pct: Math.max(0, expectedReturnPct),
      monthly_topup: Math.max(0, monthlyTopup),
      start_date: startDate || new Date().toISOString().slice(0, 10),
      maturity_date: maturityDate || undefined,
      notes: notes.trim() || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updated = [newAsset, ...investments];
    persistInvestments(updated);
    setShowAddModal(false);

    // Reset
    setName('');
    setNotes('');
    setSuccessToast(`Added ${newAsset.name} to your investment portfolio!`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleDelete = (id: string) => {
    const updated = investments.filter((inv) => inv.id !== id);
    persistInvestments(updated);
  };

  // Top-up Handler
  const handleExecuteTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topupAsset) return;
    const numAmt = parseFloat(topupAmount.replace(/,/g, ''));
    if (isNaN(numAmt) || numAmt <= 0) return;

    // Log transaction in Spendy
    await addTransaction({
      type: 'expense',
      amount: numAmt,
      category_id: 'cat-investment',
      description: `Investment Top-up: ${topupAsset.name}`,
      account_id: accounts[0]?.id,
      payment_method: 'Mobile Money',
      merchant_name: topupAsset.institution,
      transaction_date: new Date().toISOString(),
    });

    const updated = investments.map((inv) => {
      if (inv.id === topupAsset.id) {
        return {
          ...inv,
          principal_amount: inv.principal_amount + numAmt,
          current_valuation: inv.current_valuation + numAmt,
          updated_at: new Date().toISOString(),
        };
      }
      return inv;
    });

    persistInvestments(updated);
    setTopupAsset(null);
    setSuccessToast(`Logged top-up of ${formatUGX(numAmt)} to ${topupAsset.name}!`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  // Revaluation Handler
  const handleExecuteRevaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revalueAsset) return;
    const numAmt = parseFloat(newValuation.replace(/,/g, ''));
    if (isNaN(numAmt) || numAmt < 0) return;

    const updated = investments.map((inv) => {
      if (inv.id === revalueAsset.id) {
        return {
          ...inv,
          current_valuation: numAmt,
          updated_at: new Date().toISOString(),
        };
      }
      return inv;
    });

    persistInvestments(updated);
    setRevalueAsset(null);
    setSuccessToast(`Updated valuation of ${revalueAsset.name} to ${formatUGX(numAmt)}!`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const renderAssetClassIcon = (cls: AssetClass) => {
    switch (cls) {
      case 'unit_trust':
        return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
      case 'treasury_bill':
        return <Landmark className="w-4 h-4 text-blue-500" />;
      case 'bond':
        return <Scale className="w-4 h-4 text-indigo-500" />;
      case 'real_estate':
        return <Home className="w-4 h-4 text-amber-500" />;
      case 'fixed_deposit':
        return <Lock className="w-4 h-4 text-teal-500" />;
      case 'stocks':
        return <TrendingUp className="w-4 h-4 text-cyan-500" />;
      case 'agri_pool':
        return <Wheat className="w-4 h-4 text-lime-500" />;
      default:
        return <Coins className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              Personal Investments
            </h1>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              Track Unit Trusts, Treasury Bills, Government Bonds, Real Estate, and Equity portfolios.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 active:scale-98 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Investment</span>
        </button>
      </div>

      {successToast && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center gap-2 animate-in fade-in zoom-in-95">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* 2. Portfolio Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Portfolio Value */}
        <div className="p-4.5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Portfolio Valuation</span>
            <Coins className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl font-black text-slate-950 dark:text-white font-mono tabular-nums">
            {formatUGX(metrics.totalPortfolioValuation)}
          </p>
          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            Across {metrics.activeAssetCount} recorded {metrics.activeAssetCount === 1 ? 'asset' : 'assets'}
          </p>
        </div>

        {/* Total Principal Invested */}
        <div className="p-4.5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Principal Invested</span>
            <Landmark className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl font-black text-slate-950 dark:text-white font-mono tabular-nums">
            {formatUGX(metrics.totalPrincipalInvested)}
          </p>
          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            Initial capital deployed
          </p>
        </div>

        {/* Net Unrealized Gains */}
        <div className="p-4.5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Net Capital Growth</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          </div>
          <p
            className={`text-xl font-black font-mono tabular-nums ${
              metrics.netUnrealizedGains >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {metrics.netUnrealizedGains >= 0 ? '+' : ''}
            {formatUGX(metrics.netUnrealizedGains)}
          </p>
          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            {metrics.overallRoiPercent >= 0 ? '+' : ''}
            {metrics.overallRoiPercent.toFixed(1)}% total capital return
          </p>
        </div>

        {/* Projected Annual Earnings */}
        <div className="p-4.5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Annual Yield Run-Rate</span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
            +{formatUGX(metrics.projectedAnnualEarnings)}/yr
          </p>
          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            ~{metrics.totalPortfolioValuation > 0 ? ((metrics.projectedAnnualEarnings / metrics.totalPortfolioValuation) * 100).toFixed(1) : '0'}% weighted return
          </p>
        </div>
      </div>

      {/* 3. Assets List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Your Investment Holdings ({investments.length})
          </h2>
          {investments.length > 0 && (
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Monthly additions: {formatUGX(metrics.totalMonthlyAdditions)}/mo
            </span>
          )}
        </div>

        {investments.length === 0 ? (
          /* Institutional Empty State — Zero Dummy Data */
          <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 text-center space-y-6 shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
              <TrendingUp className="w-8 h-8" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-lg font-black text-slate-950 dark:text-white">
                No Personal Investments Recorded
              </h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                Track your wealth growth across Uganda’s high-yield asset classes — from Unit Trusts and Bank of Uganda Treasury Bills to land plots and fixed deposits.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 space-y-1">
                <span className="text-[11px] font-bold text-slate-900 dark:text-white block flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Unit Trusts / MMFs
                </span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">UAP Old Mutual, Sanlam, ICEA Lion (~11-13% annual compound yields).</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 space-y-1">
                <span className="text-[11px] font-bold text-slate-900 dark:text-white block flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-blue-500" />
                  Treasury Bills &amp; Bonds
                </span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Bank of Uganda sovereign paper (91-day, 182-day, 364-day, 2-15yr bonds).</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 space-y-1">
                <span className="text-[11px] font-bold text-slate-900 dark:text-white block flex items-center gap-1.5">
                  <Home className="w-4 h-4 text-amber-500" />
                  Land &amp; Real Estate
                </span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Residential, commercial, and agricultural property valuations.</p>
              </div>
            </div>

            <div>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-98 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Record Your First Investment</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {investments.map((inv) => {
              const gain = inv.current_valuation - inv.principal_amount;
              const gainPct = inv.principal_amount > 0 ? (gain / inv.principal_amount) * 100 : 0;
              const annualGain = inv.current_valuation * (inv.expected_annual_return_pct / 100);

              return (
                <div
                  key={inv.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                          {renderAssetClassIcon(inv.asset_class)}
                          <span>{ASSET_CLASS_METADATA[inv.asset_class]?.label || inv.asset_class}</span>
                        </span>
                        {inv.expected_annual_return_pct > 0 && (
                          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                            ★ {inv.expected_annual_return_pct}% p.a.
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-black text-slate-950 dark:text-white mt-1.5">
                        {inv.name}
                      </h3>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {inv.institution} {inv.maturity_date ? `• Matures: ${inv.maturity_date}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setRevalueAsset(inv);
                          setNewValuation(inv.current_valuation.toString());
                        }}
                        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer"
                        title="Update Current Valuation"
                        aria-label="Update Valuation"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(inv.id)}
                        className="p-2 rounded-xl hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                        title="Delete Investment"
                        aria-label="Delete Investment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {inv.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {inv.notes}
                    </p>
                  )}

                  {/* Valuation Breakdown Grid */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 text-xs font-mono">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 font-sans block">Principal</span>
                      <span className="font-black text-slate-950 dark:text-white tabular-nums">
                        {formatUGX(inv.principal_amount)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 font-sans block">Valuation</span>
                      <span className="font-black text-slate-950 dark:text-white tabular-nums">
                        {formatUGX(inv.current_valuation)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 font-sans block">Net Growth</span>
                      <span
                        className={`font-black tabular-nums ${
                          gain >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {gain >= 0 ? '+' : ''}
                        {formatUGX(gain)}
                      </span>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="pt-1 flex items-center justify-between gap-3">
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 font-mono">
                      Est. Yield: <strong className="text-emerald-600 dark:text-emerald-400 font-sans">+{formatUGX(annualGain)}/yr</strong>
                    </div>

                    <button
                      onClick={() => {
                        setTopupAsset(inv);
                        setTopupAmount('100000');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs shadow-2xs transition-all active:scale-98 cursor-pointer flex items-center gap-1.5 border border-slate-700/60"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Top Up</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Add Investment */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-slate-950 dark:text-white">
                  Add Personal Investment Asset
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-950 dark:hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddInvestment} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Asset / Investment Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. UAP Old Mutual Umbrella Fund, Mukono Land Plot"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Asset Class
                  </label>
                  <select
                    value={assetClass}
                    onChange={(e) => setAssetClass(e.target.value as AssetClass)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="unit_trust">Unit Trust / MMF</option>
                    <option value="treasury_bill">Treasury Bills (BOU)</option>
                    <option value="bond">Government Bonds</option>
                    <option value="real_estate">Land &amp; Real Estate</option>
                    <option value="fixed_deposit">Fixed Deposit</option>
                    <option value="stocks">Stocks &amp; Equities</option>
                    <option value="agri_pool">Agribusiness Pool</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Institution / Provider
                  </label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. UAP Old Mutual, Bank of Uganda, ICEA Lion"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Principal Invested (UGX)
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={principalAmount}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setPrincipalAmount(v);
                      if (!currentValuation || currentValuation === principalAmount) {
                        setCurrentValuation(v);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Current Valuation (UGX)
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={currentValuation}
                    onChange={(e) => setCurrentValuation(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Expected Return (%)
                  </label>
                  <input
                    type="number"
                    step={0.1}
                    min={0}
                    value={expectedReturnPct}
                    onChange={(e) => setExpectedReturnPct(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Monthly Top-up
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={monthlyTopup}
                    onChange={(e) => setMonthlyTopup(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Maturity Date
                  </label>
                  <input
                    type="date"
                    value={maturityDate}
                    onChange={(e) => setMaturityDate(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notes / Investment Thesis
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Semi-annual dividend payouts, 50ft x 100ft titled land"
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
                  Save Investment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Top Up */}
      {topupAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-black text-slate-950 dark:text-white">
              Top Up {topupAsset.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This will add to the asset's valuation and record an investment transaction in your ledger.
            </p>

            <form onSubmit={handleExecuteTopup} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Top-up Amount (UGX)
                </label>
                <input
                  type="number"
                  min={1000}
                  step={1000}
                  required
                  autoFocus
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setTopupAsset(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm cursor-pointer"
                >
                  Confirm Top-up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Revalue Asset */}
      {revalueAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-black text-slate-950 dark:text-white">
              Update Valuation: {revalueAsset.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Update the current mark-to-market valuation based on latest fund statement or market price.
            </p>

            <form onSubmit={handleExecuteRevaluation} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  New Current Valuation (UGX)
                </label>
                <input
                  type="number"
                  min={0}
                  step={100}
                  required
                  autoFocus
                  value={newValuation}
                  onChange={(e) => setNewValuation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setRevalueAsset(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm cursor-pointer"
                >
                  Save Valuation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
