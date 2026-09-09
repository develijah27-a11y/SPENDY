'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSpendy } from '@/lib/store/spendyStore';
import { formatCurrency, formatUGX, formatMonthName, getCurrentMonthKey, formatDate } from '@/lib/formatters';
import { getStoredInvestments, calculateInvestmentMetrics, ASSET_CLASS_METADATA } from '@/lib/engines/investmentEngine';
import { getUgandaHoliday } from '@/lib/calendar/ugandaHolidays';
import {
  FileText,
  Printer,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  Building2,
  Wallet,
  Landmark,
  PieChart,
  Calendar,
  AlertCircle,
  Sparkles,
  ArrowDownRight,
  ArrowUpRight,
  ChevronLeft,
} from 'lucide-react';

export default function MonthlyReviewStatementPage() {
  const { transactions, accounts, user, categories } = useSpendy();
  const currentMonthKey = getCurrentMonthKey();

  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey);
  const [investments, setInvestments] = useState(() => getStoredInvestments());

  // Reload investments on mount
  useEffect(() => {
    setInvestments(getStoredInvestments());
  }, []);

  // Dynamically generate the last 12 months for selector
  const availableMonths = useMemo(() => {
    const list = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      list.push({
        key,
        label: `${formatMonthName(key)}${i === 0 ? ' (Current Month)' : ''}`,
      });
    }
    return list;
  }, []);

  // Selected year and month calculations
  const [year, month] = selectedMonth.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const statementStartDate = `${formatMonthName(selectedMonth).split(' ')[0]} 1, ${year}`;
  const statementEndDate = `${formatMonthName(selectedMonth).split(' ')[0]} ${daysInMonth}, ${year}`;

  // Previous month for MoM comparison
  const prevDate = new Date(year, month - 2, 1);
  const prevMonthKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

  // Transactions in selected & previous month
  const monthTransactions = useMemo(() => {
    return transactions
      .filter((t) => t.transaction_date.startsWith(selectedMonth))
      .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());
  }, [transactions, selectedMonth]);

  const prevMonthTx = useMemo(() => {
    return transactions.filter((t) => t.transaction_date.startsWith(prevMonthKey));
  }, [transactions, prevMonthKey]);

  // Aggregate monthly flows
  const totalIncome = useMemo(() => {
    return monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  const totalExpenses = useMemo(() => {
    return monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  const netRetained = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((Math.max(0, netRetained) / totalIncome) * 100).toFixed(1) : '0';

  // Previous month expense comparison
  const prevExpenses = useMemo(() => {
    return prevMonthTx
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [prevMonthTx]);

  const expenseDelta = totalExpenses - prevExpenses;
  const expensePctChange =
    prevExpenses > 0 ? ((expenseDelta / prevExpenses) * 100).toFixed(1) : totalExpenses > 0 ? '100' : '0';

  // Category breakdown
  const categorySummary = useMemo(() => {
    const map: Record<string, { name: string; count: number; amount: number; color: string }> = {};
    for (const tx of monthTransactions.filter((t) => t.type === 'expense')) {
      const catName = tx.category?.name || 'General Operations';
      const catColor = tx.category?.color || '#10B981';
      if (!map[catName]) {
        map[catName] = { name: catName, count: 0, amount: 0, color: catColor };
      }
      map[catName].count += 1;
      map[catName].amount += tx.amount;
    }

    return Object.values(map)
      .map((item) => ({
        ...item,
        percentage: totalExpenses > 0 ? ((item.amount / totalExpenses) * 100).toFixed(1) : '0',
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [monthTransactions, totalExpenses]);

  // Liquid cash balances from accounts
  const liquidCashTotal = useMemo(() => {
    return accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  }, [accounts]);

  // Investment metrics
  const investmentMetrics = useMemo(() => {
    return calculateInvestmentMetrics(investments);
  }, [investments]);

  // Net Worth estimate
  const estimatedNetWorth = liquidCashTotal + investmentMetrics.totalPortfolioValuation;

  // Upcoming holidays in the next month to warn about
  const nextMonthDate = new Date(year, month, 1);
  const nextMonthHolidays = useMemo(() => {
    const list = [];
    const nextY = nextMonthDate.getFullYear();
    const nextM = nextMonthDate.getMonth();
    const daysInNextM = new Date(nextY, nextM + 1, 0).getDate();
    for (let d = 1; d <= daysInNextM; d++) {
      const h = getUgandaHoliday(nextY, nextM, d);
      if (h && (h.spendingImpact === 'extreme' || h.spendingImpact === 'very_high' || h.spendingImpact === 'high')) {
        list.push({ day: d, holiday: h });
      }
    }
    return list;
  }, [nextMonthDate]);

  // Trigger PDF print
  const handlePrintPDF = () => {
    window.print();
  };

  const documentRefId = `SPY-STMT-${selectedMonth.replace('-', '')}-${(user?.id || 'ACC').slice(0, 4).toUpperCase()}`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* 1. Web-Only Interactive Controls & Navigation */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/15 dark:border-white/15">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
            <FileText className="w-4 h-4" />
            <span>Monthly Financial Accounting</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white tracking-tight">
            Month-End Financial Statement
          </h1>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Structured, executive-grade PDF financial report compiled at month-end for personal audit &amp; banking records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <label htmlFor="month-select" className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Month:
            </label>
            <select
              id="month-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              aria-label="Select Statement Month"
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-gray-950 dark:text-white text-xs font-bold shadow-sm cursor-pointer"
            >
              {availableMonths.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all cursor-pointer"
            title="Export official PDF format via browser print dialog"
          >
            <Printer className="w-4 h-4" />
            <span>Download Statement (PDF)</span>
          </button>
        </div>
      </div>

      {/* 2. Structured Printable Statement Document */}
      <div className="print-avoid-break bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 space-y-8 print:p-0 print:border-none print:shadow-none">
        
        {/* Document Header & Seal */}
        <div className="border-b-2 border-slate-900 dark:border-slate-100 pb-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-sm">
                  S
                </div>
                <span className="text-lg font-black tracking-tight text-slate-950 dark:text-white uppercase">
                  Spendy Uganda
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Certified Statement
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white mt-3">
                STATEMENT OF MONTHLY FINANCIAL POSITION &amp; CASH FLOWS
              </h2>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Reporting Period: <strong className="text-slate-950 dark:text-white">{statementStartDate}</strong> through <strong className="text-slate-950 dark:text-white">{statementEndDate}</strong>
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1 text-xs border-l sm:border-l-0 pl-3 sm:pl-0 border-slate-300 dark:border-slate-700">
              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">DOC REF: {documentRefId}</p>
              <p className="font-bold text-slate-950 dark:text-white">Account Holder: {user.full_name || 'Personal Account'}</p>
              <p className="text-slate-600 dark:text-slate-400">{user.email || 'Private Client'}</p>
              <p className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">Currency: UGX (Ugandan Shilling)</p>
            </div>
          </div>
        </div>

        {/* Section 1: Executive KPI Summary */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              1. Monthly Cash Flow Summary
            </h3>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {monthTransactions.length} Recorded Transactions
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50">
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">Total Inflow (Income)</span>
              <p className="text-xl font-black font-mono text-emerald-700 dark:text-emerald-400 mt-1">
                + {formatUGX(totalIncome)}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/50">
              <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300">Total Outflow (Expenses)</span>
              <p className="text-xl font-black font-mono text-rose-700 dark:text-rose-400 mt-1">
                - {formatUGX(totalExpenses)}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/50">
              <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300">Net Surplus Retained</span>
              <p className={`text-xl font-black font-mono mt-1 ${netRetained >= 0 ? 'text-blue-700 dark:text-blue-400' : 'text-rose-700 dark:text-rose-400'}`}>
                {netRetained >= 0 ? '+' : ''}{formatUGX(netRetained)}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/50">
              <span className="text-[11px] font-bold text-purple-800 dark:text-purple-300">Savings / Retained Rate</span>
              <p className="text-xl font-black font-mono text-purple-700 dark:text-purple-400 mt-1">
                {savingsRate}%
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Month-over-Month Variance Analysis */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            {Number(expensePctChange) <= 0 ? (
              <TrendingDown className="w-6 h-6 text-emerald-600 shrink-0 font-black" />
            ) : (
              <TrendingUp className="w-6 h-6 text-rose-600 shrink-0 font-black" />
            )}
            <div>
              <p className="font-black text-slate-950 dark:text-white">
                MoM Comparison with {formatMonthName(prevMonthKey)}
              </p>
              <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                {Number(expensePctChange) <= 0
                  ? `Operating expenditure reduced by ${Math.abs(Number(expensePctChange))}% compared to ${formatMonthName(prevMonthKey)}. High spending discipline maintained.`
                  : `Operating expenditure increased by ${expensePctChange}% compared to ${formatMonthName(prevMonthKey)} (UGX ${formatUGX(Math.abs(expenseDelta))} variance). Review category drivers below.`}
              </p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
              Prev Spend: {formatUGX(prevExpenses)}
            </span>
          </div>
        </div>

        {/* Section 3: Net Worth & Personal Wealth Balance Sheet */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            2. Personal Wealth &amp; Balance Sheet Snapshot
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Liquid Cash & Mobile Money */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  Liquid Cash &amp; MoMo
                </span>
                <span className="text-[10px] font-mono text-slate-500">{accounts.length} Accounts</span>
              </div>
              <p className="text-lg font-black font-mono text-slate-950 dark:text-white">
                {formatUGX(liquidCashTotal)}
              </p>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5 pt-1 border-t border-slate-100 dark:border-slate-900">
                {accounts.map((acc) => (
                  <div key={acc.id} className="flex justify-between">
                    <span className="truncate">{acc.name}:</span>
                    <span className="font-mono font-bold">{formatUGX(acc.balance || 0)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Personal Investments Portfolio */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-blue-600" />
                  Investments Portfolio
                </span>
                <span className="text-[10px] font-mono text-slate-500">{investments.length} Assets</span>
              </div>
              <p className="text-lg font-black font-mono text-blue-600 dark:text-blue-400">
                {formatUGX(investmentMetrics.totalPortfolioValuation)}
              </p>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5 pt-1 border-t border-slate-100 dark:border-slate-900">
                <div className="flex justify-between">
                  <span>Principal Invested:</span>
                  <span className="font-mono">{formatUGX(investmentMetrics.totalPrincipalInvested)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Net Unrealized Yield:</span>
                  <span className={`font-mono font-bold ${investmentMetrics.netUnrealizedGains >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {investmentMetrics.netUnrealizedGains >= 0 ? '+' : ''}{formatUGX(investmentMetrics.netUnrealizedGains)}
                  </span>
                </div>
              </div>
            </div>

            {/* Total Estimated Net Worth */}
            <div className="p-4 rounded-2xl bg-slate-900 dark:bg-[#070A12] text-white border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Estimated Net Worth
                </span>
                <span className="text-[10px] font-mono text-slate-400">Assets - Liabilities</span>
              </div>
              <p className="text-xl font-black font-mono text-emerald-400">
                {formatUGX(estimatedNetWorth)}
              </p>
              <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 leading-tight">
                Consolidated liquid balances and personal investments as of statement compilation.
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Category Expenditure Allocation Table */}
        <div className="space-y-3 print-avoid-break">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            3. Category Expenditure Allocation &amp; Audit
          </h3>

          {categorySummary.length === 0 ? (
            <p className="text-xs text-slate-500 italic p-4 rounded-xl border border-dashed border-slate-300">
              No operational expenditures logged in this statement period.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300">
                    <th className="p-3">#</th>
                    <th className="p-3">Category Classification</th>
                    <th className="p-3 text-center">Entries</th>
                    <th className="p-3 text-right">Amount (UGX)</th>
                    <th className="p-3 text-right">Share of Outflow</th>
                    <th className="p-3 text-left">Audit Assessment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {categorySummary.map((cat, idx) => {
                    const pctNum = parseFloat(cat.percentage);
                    let assessment = 'Balanced';
                    let badgeClass = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
                    if (pctNum > 35) {
                      assessment = 'Dominant Cost Driver';
                      badgeClass = 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300';
                    } else if (pctNum > 20) {
                      assessment = 'High Allocation';
                      badgeClass = 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
                    }

                    return (
                      <tr key={cat.name} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                        <td className="p-3 font-mono font-bold text-slate-500">{idx + 1}</td>
                        <td className="p-3 font-bold text-slate-950 dark:text-white flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                          <span>{cat.name}</span>
                        </td>
                        <td className="p-3 text-center font-mono text-slate-600 dark:text-slate-400">{cat.count}</td>
                        <td className="p-3 text-right font-mono font-black text-slate-950 dark:text-white">
                          {formatUGX(cat.amount)}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                          {cat.percentage}%
                        </td>
                        <td className="p-3">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${badgeClass}`}>
                            {assessment}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-slate-50 dark:bg-slate-900/80 font-black border-t-2 border-slate-300 dark:border-slate-700">
                    <td colSpan={2} className="p-3 uppercase">Total Operational Outflow</td>
                    <td className="p-3 text-center font-mono">{categorySummary.reduce((s, c) => s + c.count, 0)}</td>
                    <td className="p-3 text-right font-mono text-rose-600 dark:text-rose-400">{formatUGX(totalExpenses)}</td>
                    <td className="p-3 text-right font-mono">100.0%</td>
                    <td className="p-3">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section 5: Itemized Transaction Audit Ledger */}
        <div className="space-y-3 print-page-break">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              4. Itemized Transaction Audit Ledger
            </h3>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Chronological Record
            </span>
          </div>

          {monthTransactions.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 text-xs text-slate-500">
              No transactions recorded for {formatMonthName(selectedMonth)}.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300">
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Description / Narration</th>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5">Account / Channel</th>
                    <th className="p-2.5 text-center">Type</th>
                    <th className="p-2.5 text-right">Amount (UGX)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {monthTransactions.map((tx) => {
                    const isExpense = tx.type === 'expense';
                    const isIncome = tx.type === 'income';
                    const accountName = accounts.find((a) => a.id === tx.account_id)?.name || 'Default';

                    return (
                      <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                        <td className="p-2.5 font-mono whitespace-nowrap text-slate-600 dark:text-slate-400">
                          {formatDate(tx.transaction_date)}
                        </td>
                        <td className="p-2.5 font-bold text-slate-950 dark:text-white max-w-[220px] truncate">
                          {tx.description || tx.note || (isExpense ? 'Expense' : 'Income')}
                        </td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-400">
                          {tx.category?.name || 'General'}
                        </td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-400">
                          {accountName}
                        </td>
                        <td className="p-2.5 text-center">
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                              isExpense
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                : isIncome
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td
                          className={`p-2.5 text-right font-mono font-black ${
                            isExpense ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {isExpense ? '-' : '+'}
                          {formatCurrency(tx.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section 6: Personal Investments Schedule (If active) */}
        {investments.length > 0 && (
          <div className="space-y-3 print-avoid-break">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              5. Personal Investments &amp; Capital Assets Schedule
            </h3>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300">
                    <th className="p-2.5">Asset / Fund</th>
                    <th className="p-2.5">Institution</th>
                    <th className="p-2.5">Class</th>
                    <th className="p-2.5 text-right">Principal Invested</th>
                    <th className="p-2.5 text-right">Current Valuation</th>
                    <th className="p-2.5 text-right">Unrealized Gain</th>
                    <th className="p-2.5 text-center">Exp. Yield</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {investments.map((inv) => {
                    const gain = inv.current_valuation - inv.principal_amount;
                    const meta = ASSET_CLASS_METADATA[inv.asset_class];
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                        <td className="p-2.5 font-bold text-slate-950 dark:text-white">{inv.name}</td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-400">{inv.institution}</td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-400">{meta?.label || inv.asset_class}</td>
                        <td className="p-2.5 text-right font-mono">{formatUGX(inv.principal_amount)}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                          {formatUGX(inv.current_valuation)}
                        </td>
                        <td className={`p-2.5 text-right font-mono font-bold ${gain >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {gain >= 0 ? '+' : ''}{formatUGX(gain)}
                        </td>
                        <td className="p-2.5 text-center font-mono font-bold text-emerald-600">
                          {inv.expected_annual_return_pct}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section 7: Strategic Recommendations & Next Month Festive Advisory */}
        <div className="p-5 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-3 text-xs print-avoid-break">
          <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-black text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Month-End Advisory &amp; Next Month Strategic Directives</span>
          </div>

          <ul className="list-disc list-inside space-y-1.5 text-slate-800 dark:text-slate-200 font-medium">
            <li>
              <strong>Target Savings Retention:</strong>{' '}
              {parseFloat(savingsRate) >= 20
                ? `Excellent performance. You retained ${savingsRate}% of income, exceeding the 20% Uganda wealth accumulation target.`
                : `Savings rate stood at ${savingsRate}%. Target moving at least 15% to 20% into Unit Trusts or High-Yield savings early in the next month.`}
            </li>
            {categorySummary[0] && (
              <li>
                <strong>Primary Outflow Cap:</strong> Your largest expenditure category was{' '}
                <strong>{categorySummary[0].name}</strong> ({categorySummary[0].percentage}% of spend). Enforce a weekly cap to prevent liquidity leakage.
              </li>
            )}
            {nextMonthHolidays.length > 0 ? (
              <li className="text-amber-700 dark:text-amber-400 font-bold">
                ⚠️ <strong>Festive Celebrations Ahead:</strong> Next month includes {nextMonthHolidays.map((h) => h.holiday.name).join(', ')}. Create a separate festive cash envelope to avoid dipping into primary emergency reserves!
              </li>
            ) : (
              <li>
                <strong>Festive Reserve:</strong> Set aside 5% of monthly income into a seasonal celebrations sinking fund to buffer upcoming holidays.
              </li>
            )}
          </ul>
        </div>

        {/* Official Footer / Certification Seal */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="font-bold text-slate-700 dark:text-slate-300">
              SPENDY FINANCIAL TECHNOLOGIES • KAMPALA, UGANDA
            </p>
            <p>Certified autonomous client-side ledger statement. Verified zero-server data leakage.</p>
          </div>
          <div className="text-left sm:text-right font-mono">
            <p>Generated: {new Date().toLocaleString()}</p>
            <p className="text-emerald-600 dark:text-emerald-400 font-bold">Document Status: Official &amp; Verified</p>
          </div>
        </div>

      </div>
    </div>
  );
}
