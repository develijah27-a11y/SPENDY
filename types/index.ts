export type AccountType = 'cash' | 'mtn_momo' | 'airtel_money' | 'bank' | 'spendy_wallet' | 'other';

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  account_number?: string;
  balance: number;
  currency: string;
  color: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export type CategoryType = 'expense' | 'income';

export interface Category {
  id: string;
  user_id?: string | null;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  is_default?: boolean;
  created_at?: string;
}

export type TransactionType = 'expense' | 'income' | 'saving' | 'transfer';

export interface Transaction {
  id: string;
  user_id: string;
  account_id?: string;
  category_id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  description?: string;
  note?: string;
  merchant_name?: string;
  receipt_number?: string;
  payment_method?: string;
  transaction_date: string;
  is_recurring?: boolean;
  created_at: string;
  updated_at: string;
  account?: Account;
  category?: Category;
}

export type LoanType = 'lent' | 'borrowed';
export type LoanStatus = 'pending' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';

export interface LoanRepayment {
  id: string;
  loan_id: string;
  amount: number;
  payment_date: string;
  account_id?: string;
  note?: string;
  created_at: string;
}

export interface Loan {
  id: string;
  user_id: string;
  loan_type: LoanType; // 'lent' (Money Lent out to others) | 'borrowed' (Money Borrowed from others)
  counterparty: string; // Person or institution
  principal_amount: number;
  amount_paid: number;
  remaining_balance: number;
  status: LoanStatus;
  due_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  repayments: LoanRepayment[];
}

export type DebtType = 'i_owe' | 'owed_to_me';
export type DebtStatus = 'active' | 'paid' | 'overdue';

export interface Debt {
  id: string;
  user_id: string;
  type: DebtType;
  counterparty: string;
  total_amount: number;
  remaining_amount: number;
  due_date?: string;
  note?: string;
  status: DebtStatus;
  created_at: string;
  updated_at: string;
  payments?: DebtPayment[];
}

export interface DebtPayment {
  id: string;
  user_id: string;
  debt_id: string;
  account_id?: string;
  amount: number;
  payment_date: string;
  note?: string;
  created_at: string;
}

export type PeriodFilter = 'today' | 'this_week' | 'this_month' | 'last_month' | 'this_year' | 'all_time';

export interface DashboardMetrics {
  currentBalance: number;
  todaySpending: number;
  totalSpending: number;
  todayIncome: number;
  totalIncome: number;
  moneyLent: number;
  moneyBorrowed: number;
  netPeriodSavings: number;
  transactionCount: number;
}

export interface Transfer {
  id: string;
  user_id: string;
  from_account_id: string;
  to_account_id: string;
  amount: number;
  transfer_date: string;
  note?: string;
  created_at: string;
  from_account?: Account;
  to_account?: Account;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id?: string | null; // null = overall total monthly budget
  month: string; // YYYY-MM
  planned_amount: number;
  created_at: string;
  updated_at: string;
  category?: Category;
  spent_amount?: number;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  purpose?: string;
  target_amount: number;
  current_amount: number;
  deadline?: string;
  color: string;
  status: 'active' | 'completed' | 'paused';
  created_at: string;
  updated_at: string;
}

export interface FinancialGoal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  status: 'in_progress' | 'achieved' | 'abandoned';
  created_at: string;
  updated_at: string;
}

export interface RecurringTransaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string;
  type: TransactionType;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  next_run_date: string;
  note?: string;
  is_active: boolean;
  created_at: string;
  account?: Account;
  category?: Category;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone_number?: string;
  avatar_url?: string;
  default_currency: string;
  starting_balance?: number;
  safe_spend_emergency_buffer: number;
}

export interface SafeToSpendDetails {
  totalAvailableBalance: number;
  upcomingRecurring: number;
  remainingBudgetCommitments: number;
  pendingDebtsOwed: number;
  emergencyBuffer: number;
  totalCommitments: number;
  safeToSpendMonth: number;
  safeToSpendDaily: number;
  daysRemainingInMonth: number;
  status: 'safe' | 'caution' | 'danger';
}

export interface FinancialHealthBreakdown {
  overallScore: number; // 0 - 100
  savingsRateScore: number; // 0 - 25
  budgetAdherenceScore: number; // 0 - 30
  debtBurdenScore: number; // 0 - 20
  goalProgressScore: number; // 0 - 15
  stabilityScore: number; // 0 - 10
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  feedback: string[];
}

export interface FinancialSummary {
  periodMonth: string;
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  netSavings: number;
  savingsRatePercentage: number;
  topSpendingCategories: Array<{ category: string; amount: number; percentage: number }>;
  budgetStatus: {
    totalBudget: number;
    totalSpent: number;
    percentage: number;
    isOverBudget: boolean;
  };
  savingsGoals: Array<{ name: string; target: number; current: number; percentage: number }>;
  debtsOwed: number;
  debtsReceivable: number;
  safeToSpendDaily: number;
}

export interface MerchantPaymentRequest {
  merchantId: string;
  merchantName: string;
  amount: number;
  categoryId: string;
  accountId: string;
  reference: string;
  note?: string;
}

export interface PaymentReceipt {
  receiptNumber: string;
  merchantName: string;
  amount: number;
  currency: string;
  date: string;
  paymentMethod: string;
  category: string;
  reference: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
}
