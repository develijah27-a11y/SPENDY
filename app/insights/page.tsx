'use client';

import React, { useMemo } from 'react';
import { useSpendy } from '@/lib/store/spendyStore';
import { formatUGX, formatMonthName, getCurrentMonthKey } from '@/lib/formatters';
import {
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
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
  const { transactions, budgets, insights, financialHealth } = useSpendy();
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
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <LineChartIcon className="w-6 h-6 text-emerald-400" />
          <span>Spending Insights & Analytics</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Visual breakdowns, trend patterns, and automatic deterministic financial insights
        </p>
      </div>

      {/* Deterministic Rule-Based Insights Callouts */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Smart Deterministic Insights</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {insights.map((ins, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-3xl glass-panel border transition-all ${
                ins.type === 'warning'
                  ? 'border-amber-500/30 bg-amber-950/20'
                  : ins.type === 'success'
                  ? 'border-emerald-500/30 bg-emerald-950/20'
                  : 'border-blue-500/30 bg-blue-950/20'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                {ins.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                {ins.type === 'success' && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                {ins.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
                <span className="font-bold text-xs text-white">{ins.title}</span>
              </div>
              <p className="text-xs text-gray-300">{ins.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Donut */}
        <div className="rounded-3xl glass-panel p-6 border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="font-bold text-sm text-white">Expenses by Category</h3>
              <p className="text-[11px] text-gray-400">Current month distribution</p>
            </div>
            <span className="text-xs font-bold font-mono text-emerald-400">
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
                    backgroundColor: '#111827',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '16px',
                    fontSize: '12px',
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
                <div key={c.name} className="flex items-center justify-between text-xs p-2 rounded-xl bg-white/5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-gray-300 font-medium">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono text-white">{formatUGX(c.value)}</span>
                    <span className="text-gray-400 text-[11px]">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Income vs Expense Bar Chart */}
        <div className="rounded-3xl glass-panel p-6 border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="font-bold text-sm text-white">Income vs Expenses</h3>
              <p className="text-[11px] text-gray-400">Monthly cash flow comparison</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 20, right: 10, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={10}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                  formatter={(value: any) => [formatUGX(Number(value)), '']}
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '16px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Income" fill="#10B981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Expenses" fill="#EF4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-gray-300">
            <p className="font-semibold text-white mb-1">Savings Rate Trend</p>
            <p className="text-gray-400">
              Maintaining an income-to-expense ratio above 20% net savings drastically speeds up emergency cushion and capital acquisition.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
