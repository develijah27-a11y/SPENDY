'use client';

import React from 'react';
import { BalanceOverviewCard } from '@/components/dashboard/BalanceOverviewCard';
import { MonthlySummaryCard } from '@/components/dashboard/MonthlySummaryCard';
import { SafeToSpendCard } from '@/components/dashboard/SafeToSpendCard';
import { BudgetProgressWidget } from '@/components/dashboard/BudgetProgressWidget';
import { SavingsGoalWidget } from '@/components/dashboard/SavingsGoalWidget';
import { RecentTransactionsWidget } from '@/components/dashboard/RecentTransactionsWidget';
import { FinancialHealthWidget } from '@/components/dashboard/FinancialHealthWidget';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* 1. Main Balance Overview */}
      <BalanceOverviewCard />

      {/* 2. Monthly High-Level Numbers */}
      <MonthlySummaryCard />

      {/* 3. Safe-to-Spend Feature */}
      <SafeToSpendCard />

      {/* 4. Budgets & Savings Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BudgetProgressWidget />
        <SavingsGoalWidget />
      </div>

      {/* 5. Recent Transactions & Health Score Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTransactionsWidget />
        <FinancialHealthWidget />
      </div>
    </div>
  );
}
