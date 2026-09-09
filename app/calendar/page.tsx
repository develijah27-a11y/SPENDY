'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSpendy } from '@/lib/store/spendyStore';
import { formatCurrency, formatUGX, formatCompactUGX, formatDate } from '@/lib/formatters';
import { getUgandaHoliday, HolidayCelebration } from '@/lib/calendar/ugandaHolidays';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  ReceiptText,
  DollarSign,
  TrendingDown,
  TrendingUp,
  PartyPopper,
  Sparkles,
} from 'lucide-react';

export default function CalendarPage() {
  const { transactions, openQuickAdd } = useSpendy();

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<number>(() => new Date().getDate());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // First day of current month (0: Sunday, 1: Monday, etc.)
  const firstDayIndex = new Date(year, month, 1).getDay();
  // Number of days in current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(1);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(1);
  };

  // Holidays in the current month
  const monthHolidays = useMemo(() => {
    const list: { day: number; holiday: HolidayCelebration }[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const hol = getUgandaHoliday(year, month, day);
      if (hol) {
        list.push({ day, holiday: hol });
      }
    }
    return list;
  }, [year, month, daysInMonth]);

  // Selected Day Holiday/Celebration
  const selectedHoliday = useMemo(() => {
    return getUgandaHoliday(year, month, selectedDay);
  }, [year, month, selectedDay]);

  // Group transactions by day of the active month
  const transactionsByDay = useMemo(() => {
    const map: Record<number, { expenses: number; income: number; list: typeof transactions }> = {};

    for (let day = 1; day <= daysInMonth; day++) {
      map[day] = { expenses: 0, income: 0, list: [] };
    }

    for (const tx of transactions) {
      const d = new Date(tx.transaction_date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const dayNum = d.getDate();
        if (!map[dayNum]) {
          map[dayNum] = { expenses: 0, income: 0, list: [] };
        }
        if (tx.type === 'expense') {
          map[dayNum].expenses += tx.amount;
        } else if (tx.type === 'income') {
          map[dayNum].income += tx.amount;
        }
        map[dayNum].list.push(tx);
      }
    }

    return map;
  }, [transactions, year, month, daysInMonth]);

  // Selected Day Transactions
  const selectedDayData = transactionsByDay[selectedDay] || { expenses: 0, income: 0, list: [] };

  // Month Totals
  const monthExpenseTotal = Object.values(transactionsByDay).reduce((acc, d) => acc + d.expenses, 0);
  const monthIncomeTotal = Object.values(transactionsByDay).reduce((acc, d) => acc + d.income, 0);
  const monthNetFlow = monthIncomeTotal - monthExpenseTotal;

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/15 dark:border-white/15">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
            <CalendarIcon className="w-4 h-4" />
            <span>Activity Calendar & Celebrations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white tracking-tight">
            Financial Calendar
          </h1>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Track daily cash flows alongside Uganda public holidays & celebrations to anticipate spending surges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openQuickAdd('expense')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Month Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl glass-panel border border-black/15 dark:border-white/20 shadow-md">
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Total Income ({monthName})</span>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
            + {formatCurrency(monthIncomeTotal)}
          </p>
        </div>
        <div className="p-4 rounded-3xl glass-panel border border-black/15 dark:border-white/20 shadow-md">
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Total Spent ({monthName})</span>
          <p className="text-xl font-black text-red-600 dark:text-red-400 font-mono mt-1">
            - {formatCurrency(monthExpenseTotal)}
          </p>
        </div>
        <div className="p-4 rounded-3xl glass-panel border border-black/15 dark:border-white/20 shadow-md">
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Net Month Flow</span>
          <p className={`text-xl font-black font-mono mt-1 ${monthNetFlow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {monthNetFlow >= 0 ? '+' : ''}{formatCurrency(monthNetFlow)}
          </p>
        </div>
        <div className="p-4 rounded-3xl glass-panel border border-black/15 dark:border-white/20 shadow-md bg-amber-500/[0.04]">
          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1">
            <PartyPopper className="w-3.5 h-3.5" /> Celebrations & Feasts
          </span>
          <p className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1">
            {monthHolidays.length} {monthHolidays.length === 1 ? 'Event' : 'Events'}
          </p>
        </div>
      </div>

      {/* Main Calendar Grid & Day Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (2 cols) */}
        <div className="lg:col-span-2 rounded-3xl glass-panel p-5 sm:p-6 border border-black/15 dark:border-white/20 shadow-xl space-y-4">
          {/* Month Navigator */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
            <h2 className="text-lg font-black text-gray-950 dark:text-white">
              {monthName} {year}
            </h2>
            <div className="flex items-center gap-1.5">
              <button
                onClick={prevMonth}
                className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-gray-950 dark:text-white transition-colors cursor-pointer"
                aria-label="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setCurrentDate(new Date());
                  setSelectedDay(new Date().getDate());
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-500/30 transition-colors cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-gray-950 dark:text-white transition-colors cursor-pointer"
                aria-label="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-black text-slate-700 dark:text-slate-300 py-1">
            {daysOfWeek.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {/* Empty slots for start of month */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[52px] sm:min-h-[76px] rounded-xl sm:rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] opacity-30" />
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const data = transactionsByDay[day] || { expenses: 0, income: 0, list: [] };
              const isSelected = selectedDay === day;
              const isToday =
                new Date().getFullYear() === year &&
                new Date().getMonth() === month &&
                new Date().getDate() === day;
              const hol = getUgandaHoliday(year, month, day);

              const hasExpense = data.expenses > 0;
              const hasIncome = data.income > 0;

              return (
                <button
                  key={`day-${day}`}
                  onClick={() => setSelectedDay(day)}
                  className={`min-h-[56px] sm:min-h-[82px] p-1 sm:p-2 rounded-xl sm:rounded-2xl text-left transition-all relative flex flex-col justify-between border cursor-pointer touch-target ${
                    isSelected
                      ? 'bg-emerald-500/20 border-emerald-500 shadow-md ring-2 ring-emerald-500/40'
                      : isToday
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-gray-950 dark:text-white hover:bg-black/5 dark:hover:bg-white/10'
                      : hol
                      ? 'bg-amber-500/[0.04] border-amber-500/30 text-gray-950 dark:text-white hover:bg-amber-500/10'
                      : 'bg-black/[0.03] dark:bg-white/[0.03] border-black/10 dark:border-white/10 text-gray-950 dark:text-white hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-[11px] sm:text-xs font-black rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center ${
                        isToday
                          ? 'bg-emerald-600 text-white'
                          : isSelected
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-gray-950 dark:text-white'
                      }`}
                    >
                      {day}
                    </span>
                    {hol ? (
                      <span
                        className="text-[10px] sm:text-xs"
                        title={`${hol.name}: ${hol.spendingAdvice}`}
                      >
                        🎉
                      </span>
                    ) : (
                      data.list.length > 0 && (
                        <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-slate-400 font-mono">
                          {data.list.length}
                        </span>
                      )
                    )}
                  </div>

                  {/* Holiday celebration pill on desktop */}
                  {hol && (
                    <div className="hidden sm:block text-[8px] font-black text-amber-700 dark:text-amber-300 truncate leading-tight mt-0.5">
                      {hol.tag}
                    </div>
                  )}

                  {/* Day activity pills */}
                  <div className="space-y-0.5 mt-0.5 overflow-hidden w-full">
                    {hasIncome && (
                      <div className="text-[8px] sm:text-[10px] font-black text-emerald-600 dark:text-emerald-400 font-mono truncate leading-none">
                        +{formatCompactUGX(data.income)}
                      </div>
                    )}
                    {hasExpense && (
                      <div className="text-[8px] sm:text-[10px] font-black text-red-600 dark:text-red-400 font-mono truncate leading-none">
                        -{formatCompactUGX(data.expenses)}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Day Detail View (1 col) */}
        <div className="rounded-3xl glass-panel p-5 sm:p-6 border border-black/15 dark:border-white/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
            <div>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Day Breakdown
              </span>
              <h3 className="text-base font-black text-gray-950 dark:text-white">
                {monthName} {selectedDay}, {year}
              </h3>
            </div>
            <button
              onClick={() => openQuickAdd('expense')}
              className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/30 transition-colors cursor-pointer"
              title="Add transaction on this date"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Holiday / Celebration Warning & Spending Advice */}
          {selectedHoliday && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-rose-500/10 to-transparent border border-amber-500/30 dark:border-amber-400/25 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <PartyPopper className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-[10px] font-black text-amber-700 dark:text-amber-300 uppercase tracking-wider truncate">
                    {selectedHoliday.tag} • {selectedHoliday.category}
                  </span>
                </div>
                <span
                  className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                    selectedHoliday.spendingImpact === 'extreme'
                      ? 'bg-rose-500 text-white'
                      : selectedHoliday.spendingImpact === 'very_high'
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  {selectedHoliday.spendingImpact === 'extreme'
                    ? '🔥 Extreme Spending Surge'
                    : selectedHoliday.spendingImpact === 'very_high'
                    ? '⚡ High Spending Spike'
                    : 'Celebration Day'}
                </span>
              </div>
              <h4 className="text-sm font-black text-gray-950 dark:text-white leading-snug">
                {selectedHoliday.name}
              </h4>
              <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                💡 <strong className="text-gray-950 dark:text-white">Festive Budget Tip:</strong> {selectedHoliday.spendingAdvice}
              </p>
            </div>
          )}

          {/* Daily Totals */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="font-bold text-slate-700 dark:text-slate-300">Income</span>
              <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                +{formatCurrency(selectedDayData.income)}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20">
              <span className="font-bold text-slate-700 dark:text-slate-300">Expenses</span>
              <p className="text-sm font-black text-red-600 dark:text-red-400 font-mono mt-0.5">
                -{formatCurrency(selectedDayData.expenses)}
              </p>
            </div>
          </div>

          {/* Transaction List for Selected Day */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-black text-gray-950 dark:text-white">
              Transactions ({selectedDayData.list.length})
            </h4>

            {selectedDayData.list.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  No activity recorded on this day.
                </p>
                <button
                  onClick={() => openQuickAdd('expense')}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                >
                  Record Spending
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {selectedDayData.list.map((tx) => {
                  const isExpense = tx.type === 'expense';
                  return (
                    <div
                      key={tx.id}
                      className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                            isExpense
                              ? 'bg-red-500/20 text-red-600 dark:text-red-400'
                              : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {isExpense ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-gray-950 dark:text-white truncate">
                            {tx.description || tx.note || (isExpense ? 'Expense' : 'Income')}
                          </p>
                          <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                            {formatDate(tx.transaction_date)}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-black font-mono shrink-0 ${
                          isExpense ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {isExpense ? '-' : '+'}
                        {formatCurrency(tx.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
