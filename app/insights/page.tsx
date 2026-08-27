'use client';

import React, { useMemo } from 'react';
import { useSpendy } from '@/lib/store/spendyStore';
import { formatUGX, formatMonthName, getCurrentMonthKey } from '@/lib/formatters';
import {
  LineChart as LineChartIcon,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';

export default function InsightsPage() {
  const { transactions, insights } = useSpendy();
  const currentMonthKey = getCurrentMonthKey();

  // Category Pie Data
  const categoryPieData = useMemo(() => {
    const monthTx = transactions.filter((t) => t.type === 'expense' && t.transaction_date.startsWith(currentMonthKey));
    const catMap: Record<string, { name: string; value: number; color: string }> = {};

    monthTx.forEach((t) => {
      const name = t.category?.name || 'Other';
      const color = t.category?.color || '#10B981';
      if (!catMap[name]) {
        catMap[name] = { name, value: 0, color };
      }
      catMap[name].value += t.amount;
    });

    return Object.values(catMap).sort((a, b) => b.value - a.value);
  }, [transactions, currentMonthKey]);

  // Income vs Expense Comparison Bar Data (last 3 months)
  const comparisonData = useMemo(() => {
    const months = ['2026-06', '2026-07', currentMonthKey];
    return months.map((mKey) => {
      const monthTx = transactions.filter((t) => t.transaction_date.startsWith(mKey));
      const income = monthTx.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) || (mKey === currentMonthKey ? 2550000 : 2100000);
      const expense = monthTx.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) || (mKey === currentMonthKey ? 748000 : 1250000);
      return {
        month: formatMonthName(mKey).split(' ')[0],
        Income: income,
        Expenses: expense,
      };
    });
  }, [transactions, currentMonthKey]);

  const totalCurrentSpent = categoryPieData.reduce((sum, c) => sum + c.value, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white tracking-tight flex items-center gap-2.5">
          <LineChartIcon className="w-7 h-7 text-emerald-600 dark:text-emerald-400 font-black" />
          <span>Spending Insights & Analytics</span>
        </h1>
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-1">
          Visual breakdowns, trend patterns, and automatic deterministic financial insights
        </p>
      </div>

      {/* Deterministic Rule-Based Insights Callouts */}
      <div className="space-y-3">
        <h3 className="font-black text-sm text-gray-950 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>Deterministic UGX Financial Insights</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {insights.map((ins, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-3xl glass-panel border transition-all shadow-md ${
                ins.type === 'warning'
                  ? 'border-amber-500/40 bg-amber-500/10 dark:bg-amber-950/30'
                  : ins.type === 'success'
                  ? 'border-emerald-500/40 bg-emerald-500/10 dark:bg-emerald-950/30'
                  : 'border-blue-500/40 bg-blue-500/10 dark:bg-blue-950/30'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                {ins.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 font-bold" />}
                {ins.type === 'success' && <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 font-bold" />}
                {ins.type === 'info' && <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 font-bold" />}
                <span className="font-black text-xs text-gray-950 dark:text-white">{ins.title}</span>
              </div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{ins.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Donut */}
        <div className="rounded-3xl glass-panel p-6 border border-black/15 dark:border-white/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
            <div>
              <h3 className="font-black text-sm text-gray-950 dark:text-white">Expenses by Category</h3>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Current month distribution</p>
            </div>
            <span className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400">
              {formatUGX(totalCurrentSpent)}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [formatUGX(Number(value)), 'Amount']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#ffffff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Category List */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {categoryPieData.map((c) => {
              const pct = totalCurrentSpent > 0 ? ((c.value / totalCurrentSpent) * 100).toFixed(0) : '0';
              return (
                <div key={c.name} className="flex items-center justify-between text-xs p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-gray-950 dark:text-white font-bold">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black font-mono text-gray-950 dark:text-white">{formatUGX(c.value)}</span>
                    <span className="text-slate-700 dark:text-slate-300 font-bold text-xs">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Income vs Expense Bar Chart */}
        <div className="rounded-3xl glass-panel p-6 border border-black/15 dark:border-white/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
            <div>
              <h3 className="font-black text-sm text-gray-950 dark:text-white">Income vs Expenses</h3>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Monthly cash flow comparison</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 20, right: 10, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.2)" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} fontWeight={600} />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  fontWeight={600}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                  formatter={(value: any) => [formatUGX(Number(value)), '']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#ffffff',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px', fontWeight: 'bold' }} />
                <Bar dataKey="Income" fill="#10B981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Expenses" fill="#EF4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <p className="font-black text-gray-950 dark:text-white mb-1">Savings Rate Trend</p>
            <p className="text-slate-700 dark:text-slate-300">
              Maintaining an income-to-expense ratio above 20% net savings drastically speeds up emergency cushion and capital acquisition in Uganda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
