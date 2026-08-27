/**
 * Automated Verification of Spendy Financial Domain Engine
 * Adheres to Section 46, 47 & 60 of Master Production Specification.
 */

import {
  calculateDashboardMetrics,
  calculateSafeToSpend,
  calculateFinancialHealth,
  generateDeterministicInsights,
} from '../lib/engines/financeEngine.ts';

console.log('================================================================');
console.log('SPENDY FINANCIAL ENGINE DETERMINISTIC CALCULATION TEST SUITE');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] Test ${totalTests}: ${message}`);
    passedTests++;
  } else {
    console.error(`[FAIL] Test ${totalTests}: ${message}`);
  }
}

// 1. Test Starting Balance & Net Balance Derived from Real Transactions
const mockTransactions = [
  {
    id: 'tx-1',
    user_id: 'u-1',
    type: 'income',
    amount: 1500000, // 1.5M Salary
    currency: 'UGX',
    transaction_date: new Date().toISOString(),
    category_id: 'cat-salary',
  },
  {
    id: 'tx-2',
    user_id: 'u-1',
    type: 'expense',
    amount: 300000, // 300k Rent
    currency: 'UGX',
    transaction_date: new Date().toISOString(),
    category_id: 'cat-rent',
  },
  {
    id: 'tx-3',
    user_id: 'u-1',
    type: 'expense',
    amount: 100000, // 100k Food
    currency: 'UGX',
    transaction_date: new Date().toISOString(),
    category_id: 'cat-food',
  },
];

const metrics = calculateDashboardMetrics(mockTransactions, [], 'this_month', 500000); // 500k starting balance

// Expected Net Balance: 500,000 + 1,500,000 - 400,000 = 1,600,000
assert(
  metrics.currentBalance === 1600000,
  `Current Balance derives deterministically (Expected 1,600,000, got ${metrics.currentBalance})`
);

// Expected Total Income in period: 1,500,000
assert(
  metrics.totalIncome === 1500000,
  `Period Total Income accurately summed (Expected 1,500,000, got ${metrics.totalIncome})`
);

// Expected Total Spending in period: 400,000
assert(
  metrics.totalSpending === 400000,
  `Period Total Spending accurately summed (Expected 400,000, got ${metrics.totalSpending})`
);

// Expected Net Period Savings: 1,500,000 - 400,000 = 1,100,000
assert(
  metrics.netPeriodSavings === 1100000,
  `Net Period Savings strictly equals Income - Spending (Expected 1,100,000, got ${metrics.netPeriodSavings})`
);

console.log(`\nResults: ${passedTests}/${totalTests} Financial Engine Verification Tests Passed.`);
