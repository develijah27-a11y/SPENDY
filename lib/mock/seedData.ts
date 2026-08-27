import { Account, Category, Transaction, Transfer, Budget, SavingsGoal, Debt, Loan, FinancialGoal, RecurringTransaction } from '@/types';
import { getCurrentMonthKey } from '../formatters';

const currentMonth = getCurrentMonthKey();
const today = new Date().toISOString();

// ==========================================================================
// 1. STANDARD FINANCIAL CATEGORIES (UGANDA TAXONOMY)
// ==========================================================================
export const SEED_CATEGORIES: Category[] = [
  // Expense Categories
  { id: 'cat-food', name: 'Food & Dining', type: 'expense', icon: 'Utensils', color: '#F59E0B', is_default: true, created_at: today },
  { id: 'cat-transport', name: 'Transport (Boda & Taxi)', type: 'expense', icon: 'Bus', color: '#3B82F6', is_default: true, created_at: today },
  { id: 'cat-housing', name: 'Housing & Rent', type: 'expense', icon: 'Home', color: '#10B981', is_default: true, created_at: today },
  { id: 'cat-utilities', name: 'Utilities (Yaka & NWSC)', type: 'expense', icon: 'Zap', color: '#EAB308', is_default: true, created_at: today },
  { id: 'cat-airtime', name: 'Airtime & Data', type: 'expense', icon: 'Wifi', color: '#8B5CF6', is_default: true, created_at: today },
  { id: 'cat-shopping', name: 'Shopping & Groceries', type: 'expense', icon: 'ShoppingBag', color: '#14B8A6', is_default: true, created_at: today },
  { id: 'cat-education', name: 'Education & Tuition', type: 'expense', icon: 'GraduationCap', color: '#6366F1', is_default: true, created_at: today },
  { id: 'cat-health', name: 'Healthcare & Medical', type: 'expense', icon: 'HeartPulse', color: '#EF4444', is_default: true, created_at: today },
  { id: 'cat-entertainment', name: 'Entertainment & Leisure', type: 'expense', icon: 'Film', color: '#A855F7', is_default: true, created_at: today },
  { id: 'cat-business-exp', name: 'Business Expense', type: 'expense', icon: 'Briefcase', color: '#06B6D4', is_default: true, created_at: today },
  { id: 'cat-other-exp', name: 'Other Expense', type: 'expense', icon: 'MoreHorizontal', color: '#64748B', is_default: true, created_at: today },

  // Income Categories
  { id: 'cat-salary', name: 'Salary & Wages', type: 'income', icon: 'Banknote', color: '#10B981', is_default: true, created_at: today },
  { id: 'cat-business-inc', name: 'Business Profit', type: 'income', icon: 'TrendingUp', color: '#059669', is_default: true, created_at: today },
  { id: 'cat-farming', name: 'Farming & Agriculture', type: 'income', icon: 'Sprout', color: '#84CC16', is_default: true, created_at: today },
  { id: 'cat-freelance', name: 'Freelance & Gig', type: 'income', icon: 'Zap', color: '#F59E0B', is_default: true, created_at: today },
  { id: 'cat-gift', name: 'Gifts & Support', type: 'income', icon: 'Gift', color: '#EC4899', is_default: true, created_at: today },
  { id: 'cat-investment', name: 'Investment Returns', type: 'income', icon: 'PieChart', color: '#8B5CF6', is_default: true, created_at: today },
  { id: 'cat-other-inc', name: 'Other Income', type: 'income', icon: 'PlusCircle', color: '#64748B', is_default: true, created_at: today },
];

// ==========================================================================
// 2. CLEAN STARTER ACCOUNTS FOR NEW USERS (0 UGX BALANCE)
// ==========================================================================
export const SEED_ACCOUNTS: Account[] = [
  {
    id: 'acc-momo',
    user_id: 'user-new',
    name: 'MTN Mobile Money',
    type: 'mtn_momo',
    account_number: 'MTN MoMo',
    balance: 0,
    currency: 'UGX',
    color: '#FBBF24',
    is_archived: false,
    created_at: today,
    updated_at: today,
  },
  {
    id: 'acc-airtel',
    user_id: 'user-new',
    name: 'Airtel Money',
    type: 'airtel_money',
    account_number: 'Airtel Money',
    balance: 0,
    currency: 'UGX',
    color: '#EF4444',
    is_archived: false,
    created_at: today,
    updated_at: today,
  },
  {
    id: 'acc-cash',
    user_id: 'user-new',
    name: 'Physical Cash',
    type: 'cash',
    balance: 0,
    currency: 'UGX',
    color: '#10B981',
    is_archived: false,
    created_at: today,
    updated_at: today,
  },
  {
    id: 'acc-bank',
    user_id: 'user-new',
    name: 'Bank Account',
    type: 'bank',
    account_number: 'Bank',
    balance: 0,
    currency: 'UGX',
    color: '#3B82F6',
    is_archived: false,
    created_at: today,
    updated_at: today,
  },
  {
    id: 'acc-spendy-wallet',
    user_id: 'user-new',
    name: 'Spendy Digital Wallet',
    type: 'spendy_wallet',
    account_number: 'SP-001',
    balance: 0,
    currency: 'UGX',
    color: '#8B5CF6',
    is_archived: false,
    created_at: today,
    updated_at: today,
  },
];

// ==========================================================================
// 3. CLEAN LEDGER (ZERO DUMMY DATA FOR NEW USERS)
// ==========================================================================
export const SEED_TRANSACTIONS: Transaction[] = [];
export const SEED_LOANS: Loan[] = [];
export const SEED_TRANSFERS: Transfer[] = [];
export const SEED_BUDGETS: Budget[] = [];
export const SEED_SAVINGS_GOALS: SavingsGoal[] = [];
export const SEED_DEBTS: Debt[] = [];
export const SEED_FINANCIAL_GOALS: FinancialGoal[] = [];
export const SEED_RECURRING: RecurringTransaction[] = [];

// ==========================================================================
// 4. SAMPLE DEMO DATASET (AVAILABLE ON-DEMAND VIA SETTINGS / DEMO LOGIN)
// ==========================================================================
export const DEMO_ACCOUNTS: Account[] = [
  {
    id: 'acc-momo',
    user_id: 'user-demo-1',
    name: 'MTN Mobile Money',
    type: 'mtn_momo',
    account_number: '0772 123 456',
    balance: 420000,
    currency: 'UGX',
    color: '#FBBF24',
    is_archived: false,
    created_at: today,
    updated_at: today,
  },
  {
    id: 'acc-cash',
    user_id: 'user-demo-1',
    name: 'Physical Cash',
    type: 'cash',
    balance: 145000,
    currency: 'UGX',
    color: '#10B981',
    is_archived: false,
    created_at: today,
    updated_at: today,
  },
  {
    id: 'acc-airtel',
    user_id: 'user-demo-1',
    name: 'Airtel Money',
    type: 'airtel_money',
    account_number: '0755 987 654',
    balance: 85000,
    currency: 'UGX',
    color: '#EF4444',
    is_archived: false,
    created_at: today,
    updated_at: today,
  },
  {
    id: 'acc-bank',
    user_id: 'user-demo-1',
    name: 'Bank Account',
    type: 'bank',
    account_number: '9030012345678',
    balance: 1250000,
    currency: 'UGX',
    color: '#3B82F6',
    is_archived: false,
    created_at: today,
    updated_at: today,
  },
  {
    id: 'acc-spendy-wallet',
    user_id: 'user-demo-1',
    name: 'Spendy Digital Wallet',
    type: 'spendy_wallet',
    account_number: 'SP-001',
    balance: 200000,
    currency: 'UGX',
    color: '#8B5CF6',
    is_archived: false,
    created_at: today,
    updated_at: today,
  },
];

export const DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    user_id: 'user-demo-1',
    account_id: 'acc-bank',
    category_id: 'cat-salary',
    type: 'income',
    amount: 2200000,
    currency: 'UGX',
    description: 'Monthly salary credit - Kampala Tech Labs',
    note: 'Monthly salary credit - Kampala Tech Labs',
    transaction_date: `${currentMonth}-01T08:30:00Z`,
    created_at: `${currentMonth}-01T08:30:00Z`,
    updated_at: `${currentMonth}-01T08:30:00Z`,
  },
  {
    id: 'tx-2',
    user_id: 'user-demo-1',
    account_id: 'acc-momo',
    category_id: 'cat-freelance',
    type: 'income',
    amount: 350000,
    currency: 'UGX',
    description: 'Freelance graphic design for local store',
    note: 'Freelance graphic design for local store',
    transaction_date: `${currentMonth}-05T14:15:00Z`,
    created_at: `${currentMonth}-05T14:15:00Z`,
    updated_at: `${currentMonth}-05T14:15:00Z`,
  },
  {
    id: 'tx-3',
    user_id: 'user-demo-1',
    account_id: 'acc-bank',
    category_id: 'cat-housing',
    type: 'expense',
    amount: 450000,
    currency: 'UGX',
    description: 'House rent payment for Ntinda apartment',
    note: 'House rent payment for Ntinda apartment',
    transaction_date: `${currentMonth}-02T10:00:00Z`,
    created_at: `${currentMonth}-02T10:00:00Z`,
    updated_at: `${currentMonth}-02T10:00:00Z`,
  },
  {
    id: 'tx-4',
    user_id: 'user-demo-1',
    account_id: 'acc-momo',
    category_id: 'cat-utilities',
    type: 'expense',
    amount: 60000,
    currency: 'UGX',
    description: 'Umeme Yaka Electricity tokens',
    note: 'Umeme Yaka Electricity tokens',
    merchant_name: 'Umeme Ltd',
    receipt_number: 'REC-YAKA-8891',
    transaction_date: `${currentMonth}-04T12:20:00Z`,
    created_at: `${currentMonth}-04T12:20:00Z`,
    updated_at: `${currentMonth}-04T12:20:00Z`,
  },
  {
    id: 'tx-5',
    user_id: 'user-demo-1',
    account_id: 'acc-momo',
    category_id: 'cat-airtime',
    type: 'expense',
    amount: 50000,
    currency: 'UGX',
    description: 'MTN Freedom Data 40GB bundle',
    note: 'MTN Freedom Data 40GB bundle',
    transaction_date: `${currentMonth}-06T09:10:00Z`,
    created_at: `${currentMonth}-06T09:10:00Z`,
    updated_at: `${currentMonth}-06T09:10:00Z`,
  },
  {
    id: 'tx-6',
    user_id: 'user-demo-1',
    account_id: 'acc-cash',
    category_id: 'cat-food',
    type: 'expense',
    amount: 35000,
    currency: 'UGX',
    description: 'Lunch and groceries at Nakasero Market',
    note: 'Lunch and groceries at Nakasero Market',
    transaction_date: `${currentMonth}-08T19:45:00Z`,
    created_at: `${currentMonth}-08T19:45:00Z`,
    updated_at: `${currentMonth}-08T19:45:00Z`,
  },
  {
    id: 'tx-7',
    user_id: 'user-demo-1',
    account_id: 'acc-cash',
    category_id: 'cat-transport',
    type: 'expense',
    amount: 15000,
    currency: 'UGX',
    description: 'SafeBoda trips to town and back',
    note: 'SafeBoda trips to town and back',
    merchant_name: 'SafeBoda Ride',
    receipt_number: 'REC-BODA-1029',
    transaction_date: `${currentMonth}-10T17:30:00Z`,
    created_at: `${currentMonth}-10T17:30:00Z`,
    updated_at: `${currentMonth}-10T17:30:00Z`,
  },
];

export const DEMO_LOANS: Loan[] = [
  {
    id: 'loan-1',
    user_id: 'user-demo-1',
    loan_type: 'lent',
    counterparty: 'John Ssebaggala',
    principal_amount: 200000,
    amount_paid: 50000,
    remaining_balance: 150000,
    status: 'partially_paid',
    due_date: '2026-09-15',
    notes: 'Lent for boda spare parts repair',
    created_at: today,
    updated_at: today,
    repayments: [
      {
        id: 'rep-1',
        loan_id: 'loan-1',
        amount: 50000,
        payment_date: `${currentMonth}-10T14:00:00Z`,
        note: 'First installment cash',
        created_at: `${currentMonth}-10T14:00:00Z`,
      },
    ],
  },
  {
    id: 'loan-2',
    user_id: 'user-demo-1',
    loan_type: 'borrowed',
    counterparty: 'Sarah Namubiru',
    principal_amount: 500000,
    amount_paid: 200000,
    remaining_balance: 300000,
    status: 'partially_paid',
    due_date: '2026-09-30',
    notes: 'Borrowed for tuition semester fee',
    created_at: today,
    updated_at: today,
    repayments: [
      {
        id: 'rep-2',
        loan_id: 'loan-2',
        amount: 200000,
        payment_date: `${currentMonth}-05T10:00:00Z`,
        note: 'Repayment via MTN MoMo',
        created_at: `${currentMonth}-05T10:00:00Z`,
      },
    ],
  },
];

export const DEMO_TRANSFERS: Transfer[] = [
  {
    id: 'tr-1',
    user_id: 'user-demo-1',
    from_account_id: 'acc-momo',
    to_account_id: 'acc-cash',
    amount: 100000,
    transfer_date: `${currentMonth}-07T11:00:00Z`,
    note: 'Withdrew cash at MoMo agent',
    created_at: `${currentMonth}-07T11:00:00Z`,
  },
];

export const DEMO_BUDGETS: Budget[] = [
  {
    id: 'b-total',
    user_id: 'user-demo-1',
    category_id: null,
    month: currentMonth,
    planned_amount: 1400000,
    created_at: today,
    updated_at: today,
  },
  {
    id: 'b-food',
    user_id: 'user-demo-1',
    category_id: 'cat-food',
    month: currentMonth,
    planned_amount: 300000,
    created_at: today,
    updated_at: today,
  },
  {
    id: 'b-transport',
    user_id: 'user-demo-1',
    category_id: 'cat-transport',
    month: currentMonth,
    planned_amount: 180000,
    created_at: today,
    updated_at: today,
  },
];

export const DEMO_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: 'sg-laptop',
    user_id: 'user-demo-1',
    name: 'MacBook / Coding Laptop',
    purpose: 'Upgrade working laptop for side gigs',
    target_amount: 2500000,
    current_amount: 1800000,
    deadline: '2026-11-30',
    color: '#8B5CF6',
    status: 'active',
    created_at: today,
    updated_at: today,
  },
  {
    id: 'sg-emergency',
    user_id: 'user-demo-1',
    name: 'Emergency Buffer Fund',
    purpose: '3 Months living expenses safe buffer',
    target_amount: 1500000,
    current_amount: 950000,
    deadline: '2026-12-31',
    color: '#10B981',
    status: 'active',
    created_at: today,
    updated_at: today,
  },
];

export const DEMO_DEBTS: Debt[] = [
  {
    id: 'debt-1',
    user_id: 'user-demo-1',
    type: 'i_owe',
    counterparty: 'Uncle Patrick',
    total_amount: 200000,
    remaining_amount: 80000,
    due_date: '2026-09-15',
    note: 'Emergency family loan for repairs',
    status: 'active',
    created_at: today,
    updated_at: today,
    payments: [],
  },
];

export const DEMO_FINANCIAL_GOALS: FinancialGoal[] = [
  {
    id: 'fg-1',
    user_id: 'user-demo-1',
    title: 'Start Poultry / Agri-business in Mukono',
    description: 'Purchase land lease and 500 layers chicks',
    target_amount: 6000000,
    current_amount: 2400000,
    target_date: '2027-06-30',
    status: 'in_progress',
    created_at: today,
    updated_at: today,
  },
];

export const DEMO_RECURRING: RecurringTransaction[] = [
  {
    id: 'rec-rent',
    user_id: 'user-demo-1',
    account_id: 'acc-bank',
    category_id: 'cat-housing',
    type: 'expense',
    amount: 450000,
    frequency: 'monthly',
    next_run_date: '2026-09-01',
    note: 'Apartment rent',
    is_active: true,
    created_at: today,
  },
];
