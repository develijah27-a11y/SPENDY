import { 
  Account, 
  Budget, 
  Debt, 
  FinancialHealthBreakdown, 
  FinancialSummary, 
  RecurringTransaction, 
  SafeToSpendDetails, 
  SavingsGoal, 
  Transaction 
} from '@/types';
import { formatUGX, getCurrentMonthKey } from '../formatters';

/**
 * Calculates the realistic Safe-to-Spend balance for the current month and day.
 */
export function calculateSafeToSpend(
  accounts: Account[],
  budgets: Budget[],
  transactions: Transaction[],
  recurringTransactions: RecurringTransaction[],
  debts: Debt[],
  emergencyBuffer: number = 50000,
  targetMonthKey: string = getCurrentMonthKey()
): SafeToSpendDetails {
  // 1. Total available liquid balance
  const totalAvailableBalance = accounts
    .filter((acc) => !acc.is_archived)
    .reduce((sum, acc) => sum + (acc.balance || 0), 0);

  // 2. Filter transactions for this month
  const thisMonthExpenses = transactions.filter((t) => {
    return t.type === 'expense' && t.transaction_date.startsWith(targetMonthKey);
  });
  const totalSpentThisMonth = thisMonthExpenses.reduce((sum, t) => sum + t.amount, 0);

  // 3. Remaining budget commitments
  const totalBudget = budgets
    .filter((b) => b.month === targetMonthKey && !b.category_id)
    .reduce((sum, b) => sum + b.planned_amount, 0);

  const remainingBudgetCommitments = Math.max(0, totalBudget - totalSpentThisMonth);

  // 4. Upcoming recurring expenses for the rest of this month
  const now = new Date();
  const currentDay = now.getDate();
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemainingInMonth = Math.max(1, lastDayOfMonth - currentDay + 1);

  const upcomingRecurring = recurringTransactions
    .filter((r) => r.is_active && r.type === 'expense')
    .reduce((sum, r) => {
      // Calculate how many times it triggers in remaining days
      if (r.frequency === 'daily') {
        return sum + (r.amount * daysRemainingInMonth);
      }
      if (r.frequency === 'weekly') {
        const remainingWeeks = Math.ceil(daysRemainingInMonth / 7);
        return sum + (r.amount * remainingWeeks);
      }
      // Monthly: check if next run is before end of month
      const nextRun = new Date(r.next_run_date);
      if (nextRun.getMonth() === now.getMonth() && nextRun.getDate() >= currentDay) {
        return sum + r.amount;
      }
      return sum;
    }, 0);

  // 5. Pending debts I owe
  const pendingDebtsOwed = debts
    .filter((d) => d.type === 'i_owe' && (d.status === 'active' || d.status === 'overdue'))
    .reduce((sum, d) => sum + d.remaining_amount, 0);

  // 6. Total commitments
  const totalCommitments = upcomingRecurring + remainingBudgetCommitments + (pendingDebtsOwed * 0.5) + emergencyBuffer;

  // 7. Safe to spend amounts
  const safeToSpendMonth = Math.max(0, totalAvailableBalance - totalCommitments);
  const safeToSpendDaily = Math.round(safeToSpendMonth / daysRemainingInMonth);

  let status: 'safe' | 'caution' | 'danger' = 'safe';
  if (safeToSpendDaily <= 0) {
    status = 'danger';
  } else if (safeToSpendDaily < 15000) {
    status = 'caution';
  }

  return {
    totalAvailableBalance,
    upcomingRecurring,
    remainingBudgetCommitments,
    pendingDebtsOwed,
    emergencyBuffer,
    totalCommitments,
    safeToSpendMonth,
    safeToSpendDaily,
    daysRemainingInMonth,
    status,
  };
}

/**
 * Calculates a comprehensive 0-100 Financial Health Score.
 */
export function calculateFinancialHealth(
  transactions: Transaction[],
  budgets: Budget[],
  debts: Debt[],
  savingsGoals: SavingsGoal[],
  monthKey: string = getCurrentMonthKey()
): FinancialHealthBreakdown {
  const monthTransactions = transactions.filter((t) => t.transaction_date.startsWith(monthKey));
  const income = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const expenses = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const feedback: string[] = [];

  // 1. Savings Rate Score (0 - 25 pts)
  let savingsRateScore = 0;
  const netSavings = Math.max(0, income - expenses);
  const savingsRate = income > 0 ? (netSavings / income) * 100 : 0;

  if (savingsRate >= 20) {
    savingsRateScore = 25;
    feedback.push(`Excellent savings rate (${savingsRate.toFixed(0)}%). You're saving more than 20% of your income!`);
  } else if (savingsRate >= 10) {
    savingsRateScore = 18;
    feedback.push(`Good savings rate (${savingsRate.toFixed(0)}%). Try targeting 20% for faster financial growth.`);
  } else if (savingsRate > 0) {
    savingsRateScore = 10;
    feedback.push(`Positive savings (${savingsRate.toFixed(0)}%), but building an emergency buffer is recommended.`);
  } else {
    savingsRateScore = 2;
    feedback.push('Expenses match or exceed income this month. Look for non-essential cuts.');
  }

  // 2. Budget Adherence Score (0 - 30 pts)
  let budgetAdherenceScore = 20; // default if no budget set
  const monthBudget = budgets.find((b) => b.month === monthKey && !b.category_id);
  if (monthBudget && monthBudget.planned_amount > 0) {
    const budgetUsage = (expenses / monthBudget.planned_amount) * 100;
    if (budgetUsage <= 80) {
      budgetAdherenceScore = 30;
      feedback.push(`Great budget discipline! You have used only ${budgetUsage.toFixed(0)}% of your planned budget.`);
    } else if (budgetUsage <= 100) {
      budgetAdherenceScore = 24;
      feedback.push(`Within budget (${budgetUsage.toFixed(0)}% used). Keep an eye on daily spending.`);
    } else if (budgetUsage <= 115) {
      budgetAdherenceScore = 12;
      feedback.push(`Budget exceeded by ${(budgetUsage - 100).toFixed(0)}%. Consider pausing discretionary spending.`);
    } else {
      budgetAdherenceScore = 5;
      feedback.push('Significant budget overrun this month. Review high spending categories.');
    }
  } else {
    feedback.push('Set a monthly budget to unlock your full budget adherence score.');
  }

  // 3. Debt Burden Score (0 - 20 pts)
  let debtBurdenScore = 20;
  const debtsIOwe = debts.filter((d) => d.type === 'i_owe');
  const overdueDebts = debtsIOwe.filter((d) => d.status === 'overdue');
  const totalDebtRemaining = debtsIOwe.reduce((sum, d) => sum + d.remaining_amount, 0);

  if (overdueDebts.length > 0) {
    debtBurdenScore = 5;
    feedback.push(`You have ${overdueDebts.length} overdue debt(s). Prioritize settling them.`);
  } else if (totalDebtRemaining === 0) {
    debtBurdenScore = 20;
    feedback.push('Debt free! You have zero outstanding debts.');
  } else if (income > 0 && (totalDebtRemaining / income) < 0.3) {
    debtBurdenScore = 16;
    feedback.push('Debt levels are manageable under 30% of monthly income.');
  } else {
    debtBurdenScore = 10;
    feedback.push('Debt load is noticeable relative to income. Focus on extra principal payments.');
  }

  // 4. Savings Goal Progress (0 - 15 pts)
  let goalProgressScore = 10;
  const activeGoals = savingsGoals.filter((g) => g.status === 'active');
  if (activeGoals.length > 0) {
    const avgProgress = activeGoals.reduce((sum, g) => sum + (g.current_amount / g.target_amount), 0) / activeGoals.length;
    goalProgressScore = Math.min(15, Math.round(avgProgress * 15) + 5);
    feedback.push(`Active savings goals are on track (${(avgProgress * 100).toFixed(0)}% average completion).`);
  } else {
    goalProgressScore = 5;
    feedback.push('Create a dedicated savings goal (e.g. Emergency Fund or Tuition) to boost this score.');
  }

  // 5. Stability Score (0 - 10 pts)
  const stabilityScore = 10;

  const overallScore = Math.min(100, Math.max(0, savingsRateScore + budgetAdherenceScore + debtBurdenScore + goalProgressScore + stabilityScore));

  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' = 'B';
  if (overallScore >= 90) grade = 'A+';
  else if (overallScore >= 80) grade = 'A';
  else if (overallScore >= 70) grade = 'B';
  else if (overallScore >= 55) grade = 'C';
  else if (overallScore >= 40) grade = 'D';
  else grade = 'F';

  return {
    overallScore,
    savingsRateScore,
    budgetAdherenceScore,
    debtBurdenScore,
    goalProgressScore,
    stabilityScore,
    grade,
    feedback,
  };
}

/**
 * Generates deterministic insights comparing current month and previous month spending.
 */
export function generateDeterministicInsights(
  transactions: Transaction[],
  budgets: Budget[],
  monthKey: string = getCurrentMonthKey()
): Array<{ title: string; description: string; type: 'success' | 'warning' | 'info' }> {
  const insights: Array<{ title: string; description: string; type: 'success' | 'warning' | 'info' }> = [];

  // Parse previous month key
  const [year, month] = monthKey.split('-').map(Number);
  const prevDate = new Date(year, month - 2, 1);
  const prevMonthKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

  const currentExpenses = transactions.filter((t) => t.type === 'expense' && t.transaction_date.startsWith(monthKey));
  const prevExpenses = transactions.filter((t) => t.type === 'expense' && t.transaction_date.startsWith(prevMonthKey));

  const totalCurrentSpent = currentExpenses.reduce((sum, t) => sum + t.amount, 0);
  const totalPrevSpent = prevExpenses.reduce((sum, t) => sum + t.amount, 0);

  // 1. Overall spending comparison
  if (totalPrevSpent > 0 && totalCurrentSpent > 0) {
    const diff = totalCurrentSpent - totalPrevSpent;
    const pct = Math.abs((diff / totalPrevSpent) * 100).toFixed(0);
    if (diff > 0) {
      insights.push({
        title: 'Spending Trend',
        description: `You have spent ${formatUGX(diff)} (+${pct}%) more this month compared to last month.`,
        type: 'warning',
      });
    } else {
      insights.push({
        title: 'Spending Savings',
        description: `Great job! You have spent ${formatUGX(Math.abs(diff))} (-${pct}%) less than last month.`,
        type: 'success',
      });
    }
  }

  // 2. Category top spender insight
  const categoryTotals: Record<string, { name: string; amount: number }> = {};
  currentExpenses.forEach((t) => {
    const catName = t.category?.name || 'General';
    if (!categoryTotals[catName]) categoryTotals[catName] = { name: catName, amount: 0 };
    categoryTotals[catName].amount += t.amount;
  });

  const sortedCats = Object.values(categoryTotals).sort((a, b) => b.amount - a.amount);
  if (sortedCats.length > 0) {
    const topCat = sortedCats[0];
    const topCatPct = totalCurrentSpent > 0 ? ((topCat.amount / totalCurrentSpent) * 100).toFixed(0) : '0';
    insights.push({
      title: 'Top Expense Category',
      description: `${topCat.name} is your highest expense, taking ${topCatPct}% (${formatUGX(topCat.amount)}) of your total spending.`,
      type: 'info',
    });
  }

  // 3. Budget utilization insight
  const currentBudget = budgets.find((b) => b.month === monthKey && !b.category_id);
  if (currentBudget && currentBudget.planned_amount > 0) {
    const usage = (totalCurrentSpent / currentBudget.planned_amount) * 100;
    if (usage >= 100) {
      insights.push({
        title: 'Budget Alert',
        description: `You have reached ${usage.toFixed(0)}% of your monthly budget limit (${formatUGX(currentBudget.planned_amount)}).`,
        type: 'warning',
      });
    } else if (usage >= 80) {
      insights.push({
        title: 'Budget Warning',
        description: `You have utilized ${usage.toFixed(0)}% of your monthly budget. Watch upcoming daily expenses.`,
        type: 'warning',
      });
    } else {
      insights.push({
        title: 'Budget Status',
        description: `You are well within budget at ${usage.toFixed(0)}% of planned spending. Remaining: ${formatUGX(currentBudget.planned_amount - totalCurrentSpent)}.`,
        type: 'success',
      });
    }
  }

  return insights;
}

/**
 * Builds the clean FinancialSummary payload for AI Advisor integration.
 */
export function buildFinancialSummary(
  accounts: Account[],
  transactions: Transaction[],
  budgets: Budget[],
  savingsGoals: SavingsGoal[],
  debts: Debt[],
  monthKey: string = getCurrentMonthKey()
): FinancialSummary {
  const monthTransactions = transactions.filter((t) => t.transaction_date.startsWith(monthKey));
  const income = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const expenses = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const netSavings = Math.max(0, income - expenses);
  const savingsRatePercentage = income > 0 ? (netSavings / income) * 100 : 0;

  // Category breakdown
  const catMap: Record<string, number> = {};
  monthTransactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const name = t.category?.name || 'Other';
      catMap[name] = (catMap[name] || 0) + t.amount;
    });

  const topSpendingCategories = Object.entries(catMap)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: expenses > 0 ? (amount / expenses) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const monthBudget = budgets.find((b) => b.month === monthKey && !b.category_id);
  const totalBudget = monthBudget ? monthBudget.planned_amount : 0;

  const debtsOwed = debts
    .filter((d) => d.type === 'i_owe' && d.status !== 'paid')
    .reduce((sum, d) => sum + d.remaining_amount, 0);
  const debtsReceivable = debts
    .filter((d) => d.type === 'owed_to_me' && d.status !== 'paid')
    .reduce((sum, d) => sum + d.remaining_amount, 0);

  const safeDetails = calculateSafeToSpend(accounts, budgets, transactions, [], debts, 50000, monthKey);

  return {
    periodMonth: monthKey,
    totalBalance,
    monthlyIncome: income,
    monthlyExpenses: expenses,
    netSavings,
    savingsRatePercentage,
    topSpendingCategories,
    budgetStatus: {
      totalBudget,
      totalSpent: expenses,
      percentage: totalBudget > 0 ? (expenses / totalBudget) * 100 : 0,
      isOverBudget: totalBudget > 0 ? expenses > totalBudget : false,
    },
    savingsGoals: savingsGoals.map((g) => ({
      name: g.name,
      target: g.target_amount,
      current: g.current_amount,
      percentage: g.target_amount > 0 ? (g.current_amount / g.target_amount) * 100 : 0,
    })),
    debtsOwed,
    debtsReceivable,
    safeToSpendDaily: safeDetails.safeToSpendDaily,
  };
}
