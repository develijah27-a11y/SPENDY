'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Account,
  Budget,
  Category,
  Debt,
  DebtPayment,
  FinancialGoal,
  FinancialHealthBreakdown,
  FinancialSummary,
  Loan,
  LoanRepayment,
  LoanType,
  LoanStatus,
  MerchantPaymentRequest,
  PaymentReceipt,
  PeriodFilter,
  DashboardMetrics,
  RecurringTransaction,
  SafeToSpendDetails,
  SavingsGoal,
  Transaction,
  Transfer,
  UserProfile,
} from '@/types';
import {
  SEED_ACCOUNTS,
  SEED_BUDGETS,
  SEED_CATEGORIES,
  SEED_DEBTS,
  SEED_LOANS,
  SEED_FINANCIAL_GOALS,
  SEED_RECURRING,
  SEED_SAVINGS_GOALS,
  SEED_TRANSACTIONS,
  SEED_TRANSFERS,
  DEMO_ACCOUNTS,
  DEMO_BUDGETS,
  DEMO_DEBTS,
  DEMO_LOANS,
  DEMO_FINANCIAL_GOALS,
  DEMO_RECURRING,
  DEMO_SAVINGS_GOALS,
  DEMO_TRANSACTIONS,
  DEMO_TRANSFERS,
} from '../mock/seedData';
import {
  calculateDashboardMetrics,
  calculateFinancialHealth,
  calculateSafeToSpend,
  generateDeterministicInsights,
} from '../engines/financeEngine';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { formatCurrency, getCurrentMonthKey } from '../formatters';
import { defaultPaymentProvider } from '../payments/providers/MockPaymentProvider';
import { generateUUID } from '../utils';

interface SpendyContextType {
  user: UserProfile;
  setUser: (u: UserProfile) => void;
  startingBalance: number;
  setStartingBalance: (amount: number) => void;

  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  loans: Loan[];
  transfers: Transfer[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  debts: Debt[];
  financialGoals: FinancialGoal[];
  recurringTransactions: RecurringTransaction[];
  notifications: Array<{ id: string; title: string; message: string; type: string; is_read: boolean; created_at: string }>;

  // Time Period Filtering
  periodFilter: PeriodFilter;
  setPeriodFilter: (period: PeriodFilter) => void;

  // Computed Metrics (Single Source of Truth)
  dashboardMetrics: DashboardMetrics;
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  netSavings: number;
  safeToSpend: SafeToSpendDetails;
  financialHealth: FinancialHealthBreakdown;
  insights: Array<{ title: string; description: string; type: 'success' | 'warning' | 'info' }>;

  // Modals & UI States
  quickAddOpen: boolean;
  quickAddInitialTab: 'expense' | 'income' | 'loan' | 'pay' | 'transfer';
  openQuickAdd: (tab?: 'expense' | 'income' | 'loan' | 'pay' | 'transfer') => void;
  closeQuickAdd: () => void;
  activeReceipt: PaymentReceipt | null;
  openReceipt: (receipt: PaymentReceipt) => void;
  closeReceipt: () => void;

  // Transaction CRUD Actions
  addTransaction: (tx: {
    type: 'expense' | 'income';
    amount: number;
    category_id: string;
    description?: string;
    note?: string;
    account_id?: string;
    payment_method?: string;
    merchant_name?: string;
    receipt_number?: string;
    transaction_date?: string;
  }) => void;
  editTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Loan Management Actions (Money Lent / Borrowed)
  addLoan: (loan: {
    loan_type: LoanType;
    counterparty: string;
    principal_amount: number;
    due_date?: string;
    notes?: string;
  }) => void;
  recordLoanRepayment: (loanId: string, amount: number, note?: string) => void;
  deleteLoan: (id: string) => void;

  // Debt Actions (Legacy Compatibility)
  addDebt: (debt: Omit<Debt, 'id' | 'user_id' | 'status' | 'created_at' | 'updated_at'>) => void;
  recordDebtPayment: (debtId: string, amount: number, accountId?: string, note?: string) => void;
  deleteDebt: (id: string) => void;

  // Financial Goals Actions
  addFinancialGoal: (goal: Omit<FinancialGoal, 'id' | 'user_id' | 'status' | 'created_at' | 'updated_at'>) => void;
  updateFinancialGoal: (id: string, updates: Partial<FinancialGoal>) => void;
  deleteFinancialGoal: (id: string) => void;

  // Recurring Actions
  addRecurring: (tx: Omit<RecurringTransaction, 'id' | 'user_id' | 'is_active' | 'created_at'>) => void;
  toggleRecurring: (id: string) => void;
  deleteRecurring: (id: string) => void;

  // Category Actions
  addCategory: (category: Omit<Category, 'id' | 'created_at'>) => void;

  // Legacy Accounts & Transfers
  addAccount: (account: Omit<Account, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  updateAccount: (id: string, account: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  createTransfer: (transfer: { from_account_id: string; to_account_id: string; amount: number; note?: string }) => void;

  // Budgets & Savings
  setBudget: (budget: { category_id?: string | null; planned_amount: number; month?: string }) => void;
  deleteBudget: (id: string) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'user_id' | 'current_amount' | 'status' | 'created_at' | 'updated_at'>) => void;
  contributeToGoal: (goalId: string, amount: number, accountId?: string) => void;
  deleteSavingsGoal: (id: string) => void;
  // Authentication & User Session
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (data: { email: string; password: string; fullName: string; phone?: string; startingBalance?: number }) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string; message?: string }>;
  quickLoginDemo: (userType?: 'mukasa' | 'namubiru' | 'new_user') => void;

  // Payments & Export
  processMerchantPayment: (req: MerchantPaymentRequest) => Promise<PaymentReceipt>;
  exportDataCSV: () => void;
  resetToDemoData: () => void;
  clearAllData: () => void;
}

const SpendyContext = createContext<SpendyContextType | null>(null);

const STORAGE_KEY = 'spendy_uganda_v7_clean_prod';

export function SpendyProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(false);

  const [user, setUser] = useState<UserProfile>({
    id: 'user-new-1',
    email: '',
    full_name: 'New User',
    phone_number: '',
    default_currency: 'UGX',
    starting_balance: 0,
    safe_spend_emergency_buffer: 0,
  });

  const [startingBalance, setStartingBalanceState] = useState<number>(0);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('this_month');

  const [accounts, setAccounts] = useState<Account[]>(SEED_ACCOUNTS);
  const [categories, setCategories] = useState<Category[]>(SEED_CATEGORIES);
  const [transactions, setTransactions] = useState<Transaction[]>(SEED_TRANSACTIONS);
  const [loans, setLoans] = useState<Loan[]>(SEED_LOANS);
  const [transfers, setTransfers] = useState<Transfer[]>(SEED_TRANSFERS);
  const [budgets, setBudgets] = useState<Budget[]>(SEED_BUDGETS);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(SEED_SAVINGS_GOALS);
  const [debts, setDebts] = useState<Debt[]>(SEED_DEBTS);
  const [financialGoals, setFinancialGoals] = useState<FinancialGoal[]>(SEED_FINANCIAL_GOALS);
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>(SEED_RECURRING);
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; message: string; type: string; is_read: boolean; created_at: string }>>([
    {
      id: 'notif-1',
      title: 'Welcome to Spendy!',
      message: 'Your clean personal finance ledger is ready. Add transactions or set starting balances.',
      type: 'system',
      is_read: false,
      created_at: new Date().toISOString(),
    },
  ]);

  // Modal UI state
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddInitialTab, setQuickAddInitialTab] = useState<'expense' | 'income' | 'loan' | 'pay' | 'transfer'>('expense');
  const [activeReceipt, setActiveReceipt] = useState<PaymentReceipt | null>(null);

  // Sync Supabase Auth Session
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsAuthenticated(true);
        setUser((prev) => ({
          ...prev,
          id: session.user.id,
          email: session.user.email || prev.email,
          full_name: session.user.user_metadata?.full_name || prev.full_name,
          phone_number: session.user.user_metadata?.phone_number || prev.phone_number,
        }));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        setUser((prev) => ({
          ...prev,
          id: session.user.id,
          email: session.user.email || prev.email,
          full_name: session.user.user_metadata?.full_name || prev.full_name,
          phone_number: session.user.user_metadata?.phone_number || prev.phone_number,
        }));
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase]);

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.accounts) setAccounts(parsed.accounts);
        if (parsed.categories) setCategories(parsed.categories);
        if (parsed.transactions) setTransactions(parsed.transactions);
        if (parsed.loans) setLoans(parsed.loans);
        if (parsed.transfers) setTransfers(parsed.transfers);
        if (parsed.budgets) setBudgets(parsed.budgets);
        if (parsed.savingsGoals) setSavingsGoals(parsed.savingsGoals);
        if (parsed.debts) setDebts(parsed.debts);
        if (parsed.financialGoals) setFinancialGoals(parsed.financialGoals);
        if (parsed.recurringTransactions) setRecurringTransactions(parsed.recurringTransactions);
        if (parsed.user) setUser(parsed.user);
        if (parsed.startingBalance !== undefined) setStartingBalanceState(parsed.startingBalance);
      }
    } catch (e) {
      console.warn('Failed to load from storage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          user,
          startingBalance,
          accounts,
          categories,
          transactions,
          loans,
          transfers,
          budgets,
          savingsGoals,
          debts,
          financialGoals,
          recurringTransactions,
        })
      );
    } catch (e) {
      console.warn('Failed to persist to storage', e);
    }
  }, [isLoaded, user, startingBalance, accounts, categories, transactions, loans, transfers, budgets, savingsGoals, debts, financialGoals, recurringTransactions]);

  const setStartingBalance = (amount: number) => {
    const val = Math.max(0, Math.round(amount || 0));
    setStartingBalanceState(val);
    setUser((prev) => ({ ...prev, starting_balance: val }));
  };

  // Enriched transactions with Category & Account object mappings
  const enrichedTransactions = useMemo(() => {
    return transactions.map((tx) => {
      const account = accounts.find((a) => a.id === tx.account_id);
      const category = categories.find((c) => c.id === tx.category_id);
      return { ...tx, account, category };
    });
  }, [transactions, accounts, categories]);

  // Dashboard Metrics strictly computed
  const dashboardMetrics = useMemo(() => {
    return calculateDashboardMetrics(transactions, loans, periodFilter, startingBalance);
  }, [transactions, loans, periodFilter, startingBalance]);

  const currentMonthKey = getCurrentMonthKey();

  const totalBalance = dashboardMetrics.currentBalance;
  const monthlyIncome = dashboardMetrics.totalIncome;
  const monthlyExpenses = dashboardMetrics.totalSpending;
  const netSavings = dashboardMetrics.netPeriodSavings;

  const safeToSpend = useMemo(() => {
    return calculateSafeToSpend(
      accounts,
      budgets,
      transactions,
      recurringTransactions,
      debts,
      user.safe_spend_emergency_buffer || 50000,
      currentMonthKey
    );
  }, [accounts, budgets, transactions, recurringTransactions, debts, user.safe_spend_emergency_buffer, currentMonthKey]);

  const financialHealth = useMemo(() => {
    return calculateFinancialHealth(transactions, budgets, debts, savingsGoals, currentMonthKey);
  }, [transactions, budgets, debts, savingsGoals, currentMonthKey]);

  const insights = useMemo(() => {
    return generateDeterministicInsights(enrichedTransactions, budgets, currentMonthKey);
  }, [enrichedTransactions, budgets, currentMonthKey]);

  // Actions
  const openQuickAdd = (tab: 'expense' | 'income' | 'loan' | 'pay' | 'transfer' = 'expense') => {
    setQuickAddInitialTab(tab);
    setQuickAddOpen(true);
  };

  const closeQuickAdd = () => setQuickAddOpen(false);
  const openReceipt = (receipt: PaymentReceipt) => setActiveReceipt(receipt);
  const closeReceipt = () => setActiveReceipt(null);

  // Add Transaction
  const addTransaction = (data: {
    type: 'expense' | 'income';
    amount: number;
    category_id: string;
    description?: string;
    note?: string;
    account_id?: string;
    payment_method?: string;
    merchant_name?: string;
    receipt_number?: string;
    transaction_date?: string;
  }) => {
    const rawAmt = Math.round(data.amount);
    if (rawAmt <= 0) return;

    const defaultAccId = data.account_id || accounts[0]?.id || 'acc-cash';
    const desc = data.description || data.note || (data.type === 'expense' ? 'Expense' : 'Income');

    const newTx: Transaction = {
      id: generateUUID(),
      user_id: user.id,
      account_id: defaultAccId,
      category_id: data.category_id,
      type: data.type,
      amount: rawAmt,
      currency: 'UGX',
      description: desc,
      note: desc,
      payment_method: data.payment_method || 'Cash / Mobile Money',
      merchant_name: data.merchant_name,
      receipt_number: data.receipt_number,
      transaction_date: data.transaction_date || new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Update corresponding account balance if present
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === defaultAccId) {
          const delta = data.type === 'income' ? rawAmt : -rawAmt;
          return { ...acc, balance: acc.balance + delta, updated_at: new Date().toISOString() };
        }
        return acc;
      })
    );
  };

  // Edit Transaction
  const editTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updatedAmount = updates.amount !== undefined ? Math.round(updates.amount) : t.amount;
          return {
            ...t,
            ...updates,
            amount: updatedAmount,
            updated_at: new Date().toISOString(),
          };
        }
        return t;
      })
    );
  };

  // Delete Transaction
  const deleteTransaction = (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;

    // Revert account balance
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === tx.account_id) {
          const delta = tx.type === 'income' ? -tx.amount : tx.amount;
          return { ...acc, balance: acc.balance + delta, updated_at: new Date().toISOString() };
        }
        return acc;
      })
    );

    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Loan Management
  const addLoan = (data: {
    loan_type: LoanType;
    counterparty: string;
    principal_amount: number;
    due_date?: string;
    notes?: string;
  }) => {
    const principal = Math.round(data.principal_amount);
    if (principal <= 0 || !data.counterparty.trim()) return;

    const newLoan: Loan = {
      id: generateUUID(),
      user_id: user.id,
      loan_type: data.loan_type,
      counterparty: data.counterparty.trim(),
      principal_amount: principal,
      amount_paid: 0,
      remaining_balance: principal,
      status: 'pending',
      due_date: data.due_date,
      notes: data.notes?.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      repayments: [],
    };

    setLoans((prev) => [newLoan, ...prev]);
  };

  const recordLoanRepayment = (loanId: string, amount: number, note?: string) => {
    const amt = Math.round(amount);
    if (amt <= 0) return;

    setLoans((prev) =>
      prev.map((loan) => {
        if (loan.id === loanId) {
          const newPaid = loan.amount_paid + amt;
          const newRemaining = Math.max(0, loan.principal_amount - newPaid);
          const newStatus: LoanStatus = newRemaining === 0 ? 'paid' : 'partially_paid';

          const repayment: LoanRepayment = {
            id: generateUUID(),
            loan_id: loanId,
            amount: amt,
            payment_date: new Date().toISOString(),
            note: note?.trim() || 'Repayment installment',
            created_at: new Date().toISOString(),
          };

          return {
            ...loan,
            amount_paid: newPaid,
            remaining_balance: newRemaining,
            status: newStatus,
            repayments: [repayment, ...(loan.repayments || [])],
            updated_at: new Date().toISOString(),
          };
        }
        return loan;
      })
    );
  };

  const deleteLoan = (id: string) => {
    setLoans((prev) => prev.filter((l) => l.id !== id));
  };

  // Categories
  const addCategory = (data: Omit<Category, 'id' | 'created_at'>) => {
    const newCat: Category = {
      ...data,
      id: generateUUID(),
      created_at: new Date().toISOString(),
    };
    setCategories((prev) => [...prev, newCat]);
  };

  // Legacy Accounts & Transfers
  const addAccount = (data: Omit<Account, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const newAcc: Account = {
      ...data,
      id: generateUUID(),
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setAccounts((prev) => [...prev, newAcc]);
  };

  const updateAccount = (id: string, updates: Partial<Account>) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, ...updates, updated_at: new Date().toISOString() } : acc))
    );
  };

  const deleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((acc) => acc.id !== id));
  };

  const createTransfer = (data: { from_account_id: string; to_account_id: string; amount: number; note?: string }) => {
    const amt = Math.round(data.amount);
    if (amt <= 0 || data.from_account_id === data.to_account_id) return;

    const newTransfer: Transfer = {
      id: generateUUID(),
      user_id: user.id,
      from_account_id: data.from_account_id,
      to_account_id: data.to_account_id,
      amount: amt,
      transfer_date: new Date().toISOString(),
      note: data.note,
      created_at: new Date().toISOString(),
    };

    setTransfers((prev) => [newTransfer, ...prev]);

    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === data.from_account_id) {
          return { ...acc, balance: acc.balance - amt, updated_at: new Date().toISOString() };
        }
        if (acc.id === data.to_account_id) {
          return { ...acc, balance: acc.balance + amt, updated_at: new Date().toISOString() };
        }
        return acc;
      })
    );
  };

  const setBudget = (data: { category_id?: string | null; planned_amount: number; month?: string }) => {
    const month = data.month || currentMonthKey;
    setBudgets((prev) => {
      const filtered = prev.filter(
        (b) => !(b.month === month && (b.category_id || null) === (data.category_id || null))
      );
      const newBudget: Budget = {
        id: generateUUID(),
        user_id: user.id,
        category_id: data.category_id || null,
        month,
        planned_amount: Math.round(data.planned_amount),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return [...filtered, newBudget];
    });
  };

  const deleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  const addSavingsGoal = (goal: Omit<SavingsGoal, 'id' | 'user_id' | 'current_amount' | 'status' | 'created_at' | 'updated_at'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: generateUUID(),
      user_id: user.id,
      current_amount: 0,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setSavingsGoals((prev) => [...prev, newGoal]);
  };

  const contributeToGoal = (goalId: string, amount: number, accountId?: string) => {
    const amt = Math.round(amount);
    if (amt <= 0) return;

    if (accountId) {
      setAccounts((prev) =>
        prev.map((acc) => (acc.id === accountId ? { ...acc, balance: acc.balance - amt } : acc))
      );
    }

    setSavingsGoals((prev) =>
      prev.map((goal) => {
        if (goal.id === goalId) {
          const newAmount = goal.current_amount + amt;
          const isCompleted = newAmount >= goal.target_amount;
          if (isCompleted) {
            try {
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#10B981', '#FBBF24', '#3B82F6', '#8B5CF6'],
              });
            } catch {
              // safe fallback
            }
          }
          return {
            ...goal,
            current_amount: newAmount,
            status: isCompleted ? 'completed' : 'active',
            updated_at: new Date().toISOString(),
          };
        }
        return goal;
      })
    );
  };

  const deleteSavingsGoal = (id: string) => {
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const processMerchantPayment = async (req: MerchantPaymentRequest): Promise<PaymentReceipt> => {
    const res = await defaultPaymentProvider.processPayment({
      merchantId: req.merchantId,
      merchantName: req.merchantName,
      amount: req.amount,
      currency: 'UGX',
      categoryId: req.categoryId,
      payerAccountId: req.accountId,
      reference: req.reference,
      description: req.note,
    });

    if (!res.success) {
      throw new Error(res.message);
    }

    const categoryObj = categories.find((c) => c.id === req.categoryId);
    const accountObj = accounts.find((a) => a.id === req.accountId);

    addTransaction({
      account_id: req.accountId,
      category_id: req.categoryId,
      type: 'expense',
      amount: req.amount,
      merchant_name: req.merchantName,
      receipt_number: res.receiptNumber,
      description: req.note || `Merchant payment to ${req.merchantName}`,
      note: req.note || `Merchant payment to ${req.merchantName}`,
    });

    const receipt: PaymentReceipt = {
      receiptNumber: res.receiptNumber,
      merchantName: req.merchantName,
      amount: req.amount,
      currency: 'UGX',
      date: new Date().toISOString(),
      paymentMethod: accountObj?.name || 'Spendi Wallet',
      category: categoryObj?.name || 'General Expense',
      reference: req.reference,
      status: 'SUCCESS',
    };

    openReceipt(receipt);
    return receipt;
  };

  // One-click CSV export of entire financial ledger
  const exportDataCSV = () => {
    const headers = ['Record Type', 'Date', 'Type / Direction', 'Amount (UGX)', 'Category / Counterparty', 'Note / Description', 'Status'];
    const txRows = transactions.map((t) => [
      'TRANSACTION',
      t.transaction_date,
      t.type.toUpperCase(),
      t.amount,
      `"${t.category?.name || 'General'}"`,
      `"${(t.description || t.note || '').replace(/"/g, '""')}"`,
      'COMPLETED',
    ]);

    const loanRows = loans.map((l) => [
      'LOAN',
      l.created_at,
      l.loan_type === 'lent' ? 'LENT_OUT' : 'BORROWED',
      l.principal_amount,
      `"${l.counterparty}"`,
      `"Remaining: ${formatCurrency(l.remaining_balance)}. Notes: ${(l.notes || '').replace(/"/g, '""')}"`,
      l.status.toUpperCase(),
    ]);

    const allRows = [headers.join(','), ...txRows.map((r) => r.join(',')), ...loanRows.map((r) => r.join(','))];
    const csvContent = 'data:text/csv;charset=utf-8,' + allRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Spendi_Financial_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Debt Actions (Legacy Compatibility)
  const addDebt = (debtData: Omit<Debt, 'id' | 'user_id' | 'status' | 'created_at' | 'updated_at'>) => {
    const rawAmt = Math.round(debtData.total_amount);
    const newDebt: Debt = {
      id: generateUUID(),
      user_id: user.id,
      type: debtData.type,
      counterparty: debtData.counterparty,
      total_amount: rawAmt,
      remaining_amount: debtData.remaining_amount !== undefined ? Math.round(debtData.remaining_amount) : rawAmt,
      due_date: debtData.due_date,
      note: debtData.note,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      payments: [],
    };
    setDebts((prev) => [newDebt, ...prev]);
  };

  const recordDebtPayment = (debtId: string, amount: number, accountId?: string, note?: string) => {
    const amt = Math.round(amount);
    if (amt <= 0) return;

    if (accountId) {
      const debt = debts.find((d) => d.id === debtId);
      if (debt) {
        const isExpense = debt.type === 'i_owe';
        setAccounts((prev) =>
          prev.map((acc) => {
            if (acc.id === accountId) {
              return { ...acc, balance: acc.balance + (isExpense ? -amt : amt), updated_at: new Date().toISOString() };
            }
            return acc;
          })
        );
      }
    }

    setDebts((prev) =>
      prev.map((d) => {
        if (d.id === debtId) {
          const newRemaining = Math.max(0, d.remaining_amount - amt);
          const payment: DebtPayment = {
            id: generateUUID(),
            user_id: user.id,
            debt_id: debtId,
            account_id: accountId,
            amount: amt,
            payment_date: new Date().toISOString(),
            note,
            created_at: new Date().toISOString(),
          };
          return {
            ...d,
            remaining_amount: newRemaining,
            status: newRemaining === 0 ? 'paid' : 'active',
            payments: [...(d.payments || []), payment],
            updated_at: new Date().toISOString(),
          };
        }
        return d;
      })
    );
  };

  const deleteDebt = (id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
  };

  // Financial Goals Actions
  const addFinancialGoal = (goal: Omit<FinancialGoal, 'id' | 'user_id' | 'status' | 'created_at' | 'updated_at'>) => {
    const newGoal: FinancialGoal = {
      ...goal,
      id: generateUUID(),
      user_id: user.id,
      status: 'in_progress',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setFinancialGoals((prev) => [...prev, newGoal]);
  };

  const updateFinancialGoal = (id: string, updates: Partial<FinancialGoal>) => {
    setFinancialGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates, updated_at: new Date().toISOString() } : g))
    );
  };

  const deleteFinancialGoal = (id: string) => {
    setFinancialGoals((prev) => prev.filter((g) => g.id !== id));
  };

  // Recurring Actions
  const addRecurring = (tx: Omit<RecurringTransaction, 'id' | 'user_id' | 'is_active' | 'created_at'>) => {
    const newRec: RecurringTransaction = {
      ...tx,
      id: generateUUID(),
      user_id: user.id,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    setRecurringTransactions((prev) => [...prev, newRec]);
  };

  const toggleRecurring = (id: string) => {
    setRecurringTransactions((prev) =>
      prev.map((r) => (r.id === id ? { ...r, is_active: !r.is_active } : r))
    );
  };

  const deleteRecurring = (id: string) => {
    setRecurringTransactions((prev) => prev.filter((r) => r.id !== id));
  };

  // Reset to sample Uganda dataset
  const resetToDemoData = () => {
    setAccounts(DEMO_ACCOUNTS);
    setCategories(SEED_CATEGORIES);
    setTransactions(DEMO_TRANSACTIONS);
    setLoans(DEMO_LOANS);
    setTransfers(DEMO_TRANSFERS);
    setBudgets(DEMO_BUDGETS);
    setSavingsGoals(DEMO_SAVINGS_GOALS);
    setDebts(DEMO_DEBTS);
    setFinancialGoals(DEMO_FINANCIAL_GOALS);
    setRecurringTransactions(DEMO_RECURRING);
    setStartingBalanceState(0);
    setUser({
      id: 'user-uganda-1',
      email: 'david.mukasa@spendy.ug',
      full_name: 'David Mukasa',
      phone_number: '0772 123 456',
      default_currency: 'UGX',
      starting_balance: 0,
      safe_spend_emergency_buffer: 50000,
    });
    setIsAuthenticated(true);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // safe
    }
  };

  // Clear all dummy data for a fresh real user start
  const clearAllData = () => {
    setStartingBalanceState(0);
    setAccounts(SEED_ACCOUNTS);
    setTransactions([]);
    setLoans([]);
    setTransfers([]);
    setBudgets([]);
    setSavingsGoals([]);
    setDebts([]);
    setFinancialGoals([]);
    setRecurringTransactions([]);
    setUser({
      id: 'user-new',
      email: '',
      full_name: 'New User',
      phone_number: '',
      default_currency: 'UGX',
      starting_balance: 0,
      safe_spend_emergency_buffer: 0,
    });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // safe
    }
  };

  // Authentication Handlers
  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    setIsLoadingAuth(true);
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          // If offline / local fallback
          if (email.trim().includes('@')) {
            const name = email.split('@')[0];
            const cleanName = name.charAt(0).toUpperCase() + name.slice(1);
            setUser((prev) => ({
              ...prev,
              id: `user-${Date.now()}`,
              email: email.trim(),
              full_name: cleanName,
            }));
            setIsAuthenticated(true);
            return {};
          }
          return { error: error.message };
        }

        if (data?.user) {
          setUser((prev) => ({
            ...prev,
            id: data.user.id,
            email: data.user.email || email.trim(),
            full_name: data.user.user_metadata?.full_name || prev.full_name,
            phone_number: data.user.user_metadata?.phone_number || prev.phone_number,
          }));
          setIsAuthenticated(true);
          return {};
        }
      } else {
        // Mock offline fallback
        const name = email.split('@')[0] || 'User';
        setUser((prev) => ({
          ...prev,
          id: `user-${Date.now()}`,
          email: email.trim(),
          full_name: name.charAt(0).toUpperCase() + name.slice(1),
        }));
        setIsAuthenticated(true);
        return {};
      }
      return {};
    } catch (e: unknown) {
      const err = e as Error;
      return { error: err.message || 'Authentication failed' };
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const signUp = async (data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    startingBalance?: number;
  }): Promise<{ error?: string }> => {
    setIsLoadingAuth(true);
    try {
      if (isSupabaseConfigured()) {
        const { data: authData, error } = await supabase.auth.signUp({
          email: data.email.trim(),
          password: data.password,
          options: {
            data: {
              full_name: data.fullName.trim(),
              phone_number: data.phone?.trim() || '',
              default_currency: 'UGX',
            },
          },
        });

        if (error) {
          clearAllData();
          if (data.startingBalance && data.startingBalance > 0) {
            setStartingBalance(data.startingBalance);
          }
          setUser({
            id: `user-${Date.now()}`,
            email: data.email.trim(),
            full_name: data.fullName.trim(),
            phone_number: data.phone?.trim(),
            default_currency: 'UGX',
            starting_balance: data.startingBalance || 0,
            safe_spend_emergency_buffer: 50000,
          });
          setIsAuthenticated(true);
          return {};
        }

        if (authData?.user) {
          clearAllData();
          if (data.startingBalance && data.startingBalance > 0) {
            setStartingBalance(data.startingBalance);
          }
          setUser({
            id: authData.user.id,
            email: data.email.trim(),
            full_name: data.fullName.trim(),
            phone_number: data.phone?.trim(),
            default_currency: 'UGX',
            starting_balance: data.startingBalance || 0,
            safe_spend_emergency_buffer: 50000,
          });
          setIsAuthenticated(true);
          return {};
        }
      } else {
        clearAllData();
        if (data.startingBalance && data.startingBalance > 0) {
          setStartingBalance(data.startingBalance);
        }
        setUser({
          id: `user-${Date.now()}`,
          email: data.email.trim(),
          full_name: data.fullName.trim(),
          phone_number: data.phone?.trim(),
          default_currency: 'UGX',
          starting_balance: data.startingBalance || 0,
          safe_spend_emergency_buffer: 50000,
        });
        setIsAuthenticated(true);
        return {};
      }
      return {};
    } catch (e: unknown) {
      const err = e as Error;
      return { error: err.message || 'Registration failed' };
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const signOut = async () => {
    setIsLoadingAuth(true);
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn('Sign out error', e);
    } finally {
      setIsAuthenticated(false);
      clearAllData();
      setUser({
        id: 'guest',
        email: '',
        full_name: 'Guest User',
        default_currency: 'UGX',
        starting_balance: 0,
        safe_spend_emergency_buffer: 0,
      });
      setIsLoadingAuth(false);
    }
  };

  const resetPassword = async (email: string): Promise<{ error?: string; message?: string }> => {
    setIsLoadingAuth(true);
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
        if (error) return { error: error.message };
        return { message: `Password reset link sent to ${email.trim()}` };
      }
      return { message: `Password reset simulation: Instructions sent to ${email.trim()}` };
    } catch (e: unknown) {
      const err = e as Error;
      return { error: err.message || 'Password reset request failed' };
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const quickLoginDemo = (userType: 'mukasa' | 'namubiru' | 'new_user' = 'new_user') => {
    if (userType === 'mukasa') {
      resetToDemoData();
      setUser({
        id: 'user-uganda-1',
        email: 'david.mukasa@spendy.ug',
        full_name: 'David Mukasa',
        phone_number: '0772 123 456',
        default_currency: 'UGX',
        starting_balance: 0,
        safe_spend_emergency_buffer: 50000,
      });
      setIsAuthenticated(true);
    } else if (userType === 'namubiru') {
      resetToDemoData();
      setAccounts(DEMO_ACCOUNTS.map(a => a.id === 'acc-1' ? {...a, balance: 100000} : a));
      setUser({
        id: 'user-uganda-2',
        email: 'sarah.namubiru@spendy.ug',
        full_name: 'Sarah Namubiru',
        phone_number: '0701 987 654',
        default_currency: 'UGX',
        starting_balance: 100000,
        safe_spend_emergency_buffer: 80000,
      });
      setIsAuthenticated(true);
    } else {
      clearAllData();
      setUser({
        id: `user-${Date.now()}`,
        email: 'newuser@spendy.ug',
        full_name: 'New Spendy User',
        default_currency: 'UGX',
        starting_balance: 0,
        safe_spend_emergency_buffer: 0,
      });
      setIsAuthenticated(true);
    }
  };

  return (
    <SpendyContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        isLoadingAuth,
        signIn,
        signUp,
        signOut,
        resetPassword,
        quickLoginDemo,
        startingBalance,
        setStartingBalance,
        accounts,
        categories,
        transactions: enrichedTransactions,
        loans,
        transfers,
        budgets,
        savingsGoals,
        debts,
        financialGoals,
        recurringTransactions,
        notifications,
        periodFilter,
        setPeriodFilter,
        dashboardMetrics,
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        netSavings,
        safeToSpend,
        financialHealth,
        insights,
        quickAddOpen,
        quickAddInitialTab,
        openQuickAdd,
        closeQuickAdd,
        activeReceipt,
        openReceipt,
        closeReceipt,
        addTransaction,
        editTransaction,
        deleteTransaction,
        addLoan,
        recordLoanRepayment,
        deleteLoan,
        addDebt,
        recordDebtPayment,
        deleteDebt,
        addFinancialGoal,
        updateFinancialGoal,
        deleteFinancialGoal,
        addRecurring,
        toggleRecurring,
        deleteRecurring,
        addCategory,
        addAccount,
        updateAccount,
        deleteAccount,
        createTransfer,
        setBudget,
        deleteBudget,
        addSavingsGoal,
        contributeToGoal,
        deleteSavingsGoal,
        processMerchantPayment,
        exportDataCSV,
        resetToDemoData,
        clearAllData,
      }}
    >
      {children}
    </SpendyContext.Provider>
  );
}

export function useSpendy() {
  const context = useContext(SpendyContext);
  if (!context) {
    throw new Error('useSpendy must be used within a SpendyProvider');
  }
  return context;
}
