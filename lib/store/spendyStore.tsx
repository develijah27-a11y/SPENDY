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
  MerchantPaymentRequest,
  PaymentReceipt,
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
  SEED_FINANCIAL_GOALS,
  SEED_RECURRING,
  SEED_SAVINGS_GOALS,
  SEED_TRANSACTIONS,
  SEED_TRANSFERS,
} from '../mock/seedData';
import {
  calculateFinancialHealth,
  calculateSafeToSpend,
  generateDeterministicInsights,
} from '../engines/financeEngine';
import { getCurrentMonthKey } from '../formatters';
import { defaultPaymentProvider } from '../payments/providers/MockPaymentProvider';
import { generateUUID } from '../utils';

interface SpendyContextType {
  user: UserProfile;
  setUser: (u: UserProfile) => void;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  transfers: Transfer[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  debts: Debt[];
  financialGoals: FinancialGoal[];
  recurringTransactions: RecurringTransaction[];
  notifications: Array<{ id: string; title: string; message: string; type: string; is_read: boolean; created_at: string }>;

  // Computed
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  netSavings: number;
  safeToSpend: SafeToSpendDetails;
  financialHealth: FinancialHealthBreakdown;
  insights: Array<{ title: string; description: string; type: 'success' | 'warning' | 'info' }>;

  // Modals & UI States
  quickAddOpen: boolean;
  quickAddInitialTab: 'expense' | 'income' | 'transfer' | 'pay';
  openQuickAdd: (tab?: 'expense' | 'income' | 'transfer' | 'pay') => void;
  closeQuickAdd: () => void;
  activeReceipt: PaymentReceipt | null;
  openReceipt: (receipt: PaymentReceipt) => void;
  closeReceipt: () => void;

  // Actions
  addAccount: (account: Omit<Account, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  updateAccount: (id: string, account: Partial<Account>) => void;
  deleteAccount: (id: string) => void;

  addCategory: (category: Omit<Category, 'id' | 'created_at'>) => void;

  addTransaction: (tx: {
    account_id: string;
    category_id: string;
    type: 'expense' | 'income';
    amount: number;
    note?: string;
    merchant_name?: string;
    receipt_number?: string;
    transaction_date?: string;
  }) => void;
  deleteTransaction: (id: string) => void;

  createTransfer: (transfer: {
    from_account_id: string;
    to_account_id: string;
    amount: number;
    note?: string;
  }) => void;

  setBudget: (budget: { category_id?: string | null; planned_amount: number; month?: string }) => void;
  deleteBudget: (id: string) => void;

  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'user_id' | 'current_amount' | 'status' | 'created_at' | 'updated_at'>) => void;
  contributeToGoal: (goalId: string, amount: number, accountId: string) => void;
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;

  addDebt: (debt: Omit<Debt, 'id' | 'user_id' | 'status' | 'created_at' | 'updated_at' | 'payments'>) => void;
  recordDebtPayment: (debtId: string, amount: number, accountId?: string, note?: string) => void;
  deleteDebt: (id: string) => void;

  addRecurring: (rec: Omit<RecurringTransaction, 'id' | 'user_id' | 'is_active' | 'created_at'>) => void;
  toggleRecurring: (id: string) => void;
  deleteRecurring: (id: string) => void;

  addFinancialGoal: (fg: Omit<FinancialGoal, 'id' | 'user_id' | 'status' | 'created_at' | 'updated_at'>) => void;
  updateFinancialGoal: (id: string, updates: Partial<FinancialGoal>) => void;
  deleteFinancialGoal: (id: string) => void;

  processMerchantPayment: (req: MerchantPaymentRequest) => Promise<PaymentReceipt>;
  resetToDemoData: () => void;
  clearAllData: () => void;
}

const SpendyContext = createContext<SpendyContextType | null>(null);

const STORAGE_KEY = 'spendy_uganda_data_v2';

export function SpendyProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);

  const [user, setUser] = useState<UserProfile>({
    id: 'user-uganda-1',
    email: 'david@spendy.ug',
    full_name: 'David Mukasa',
    phone_number: '0772 123 456',
    default_currency: 'UGX',
    safe_spend_emergency_buffer: 50000,
  });

  const [accounts, setAccounts] = useState<Account[]>(SEED_ACCOUNTS);
  const [categories, setCategories] = useState<Category[]>(SEED_CATEGORIES);
  const [transactions, setTransactions] = useState<Transaction[]>(SEED_TRANSACTIONS);
  const [transfers, setTransfers] = useState<Transfer[]>(SEED_TRANSFERS);
  const [budgets, setBudgets] = useState<Budget[]>(SEED_BUDGETS);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(SEED_SAVINGS_GOALS);
  const [debts, setDebts] = useState<Debt[]>(SEED_DEBTS);
  const [financialGoals, setFinancialGoals] = useState<FinancialGoal[]>(SEED_FINANCIAL_GOALS);
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>(SEED_RECURRING);
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; message: string; type: string; is_read: boolean; created_at: string }>>([
    {
      id: 'notif-1',
      title: 'Welcome to Spendy Uganda!',
      message: 'Your personal finance companion is fully active in UGX.',
      type: 'system',
      is_read: false,
      created_at: new Date().toISOString(),
    },
  ]);

  // Modal UI state
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddInitialTab, setQuickAddInitialTab] = useState<'expense' | 'income' | 'transfer' | 'pay'>('expense');
  const [activeReceipt, setActiveReceipt] = useState<PaymentReceipt | null>(null);

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.accounts) setAccounts(parsed.accounts);
        if (parsed.categories) setCategories(parsed.categories);
        if (parsed.transactions) setTransactions(parsed.transactions);
        if (parsed.transfers) setTransfers(parsed.transfers);
        if (parsed.budgets) setBudgets(parsed.budgets);
        if (parsed.savingsGoals) setSavingsGoals(parsed.savingsGoals);
        if (parsed.debts) setDebts(parsed.debts);
        if (parsed.financialGoals) setFinancialGoals(parsed.financialGoals);
        if (parsed.recurringTransactions) setRecurringTransactions(parsed.recurringTransactions);
        if (parsed.user) setUser(parsed.user);
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
          accounts,
          categories,
          transactions,
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
  }, [isLoaded, user, accounts, categories, transactions, transfers, budgets, savingsGoals, debts, financialGoals, recurringTransactions]);

  // Enriched transactions with Category & Account object mappings
  const enrichedTransactions = useMemo(() => {
    return transactions.map((tx) => {
      const account = accounts.find((a) => a.id === tx.account_id);
      const category = categories.find((c) => c.id === tx.category_id);
      return { ...tx, account, category };
    });
  }, [transactions, accounts, categories]);

  // Computed metrics
  const currentMonthKey = getCurrentMonthKey();

  const totalBalance = useMemo(() => {
    return accounts.filter((a) => !a.is_archived).reduce((sum, a) => sum + (a.balance || 0), 0);
  }, [accounts]);

  const { monthlyIncome, monthlyExpenses, netSavings } = useMemo(() => {
    const monthTx = transactions.filter((t) => t.transaction_date.startsWith(currentMonthKey));
    const income = monthTx.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = monthTx.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return {
      monthlyIncome: income,
      monthlyExpenses: expenses,
      netSavings: Math.max(0, income - expenses),
    };
  }, [transactions, currentMonthKey]);

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
  const openQuickAdd = (tab: 'expense' | 'income' | 'transfer' | 'pay' = 'expense') => {
    setQuickAddInitialTab(tab);
    setQuickAddOpen(true);
  };

  const closeQuickAdd = () => setQuickAddOpen(false);
  const openReceipt = (receipt: PaymentReceipt) => setActiveReceipt(receipt);
  const closeReceipt = () => setActiveReceipt(null);

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

  const addCategory = (data: Omit<Category, 'id' | 'created_at'>) => {
    const newCat: Category = {
      ...data,
      id: generateUUID(),
      created_at: new Date().toISOString(),
    };
    setCategories((prev) => [...prev, newCat]);
  };

  const addTransaction = (data: {
    account_id: string;
    category_id: string;
    type: 'expense' | 'income';
    amount: number;
    note?: string;
    merchant_name?: string;
    receipt_number?: string;
    transaction_date?: string;
  }) => {
    if (data.amount <= 0) return;

    const newTx: Transaction = {
      id: generateUUID(),
      user_id: user.id,
      account_id: data.account_id,
      category_id: data.category_id,
      type: data.type,
      amount: data.amount,
      currency: 'UGX',
      note: data.note,
      merchant_name: data.merchant_name,
      receipt_number: data.receipt_number,
      transaction_date: data.transaction_date || new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Immediately update account balance
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === data.account_id) {
          const delta = data.type === 'income' ? data.amount : -data.amount;
          return { ...acc, balance: acc.balance + delta, updated_at: new Date().toISOString() };
        }
        return acc;
      })
    );
  };

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

  const createTransfer = (data: {
    from_account_id: string;
    to_account_id: string;
    amount: number;
    note?: string;
  }) => {
    if (data.amount <= 0 || data.from_account_id === data.to_account_id) return;

    const newTransfer: Transfer = {
      id: generateUUID(),
      user_id: user.id,
      from_account_id: data.from_account_id,
      to_account_id: data.to_account_id,
      amount: data.amount,
      transfer_date: new Date().toISOString(),
      note: data.note,
      created_at: new Date().toISOString(),
    };

    setTransfers((prev) => [newTransfer, ...prev]);

    // Update both account balances
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === data.from_account_id) {
          return { ...acc, balance: acc.balance - data.amount, updated_at: new Date().toISOString() };
        }
        if (acc.id === data.to_account_id) {
          return { ...acc, balance: acc.balance + data.amount, updated_at: new Date().toISOString() };
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
        planned_amount: data.planned_amount,
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

  const contributeToGoal = (goalId: string, amount: number, accountId: string) => {
    if (amount <= 0) return;

    // Deduct from account
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === accountId ? { ...acc, balance: acc.balance - amount } : acc))
    );

    // Add to savings goal
    setSavingsGoals((prev) =>
      prev.map((goal) => {
        if (goal.id === goalId) {
          const newAmount = goal.current_amount + amount;
          const isCompleted = newAmount >= goal.target_amount;
          if (isCompleted) {
            try {
              confetti({
                particleCount: 120,
                spread: 80,
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

  const updateSavingsGoal = (id: string, updates: Partial<SavingsGoal>) => {
    setSavingsGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates, updated_at: new Date().toISOString() } : g))
    );
  };

  const deleteSavingsGoal = (id: string) => {
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const addDebt = (debt: Omit<Debt, 'id' | 'user_id' | 'status' | 'created_at' | 'updated_at' | 'payments'>) => {
    const newDebt: Debt = {
      ...debt,
      id: generateUUID(),
      user_id: user.id,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      payments: [],
    };
    setDebts((prev) => [...prev, newDebt]);
  };

  const recordDebtPayment = (debtId: string, amount: number, accountId?: string, note?: string) => {
    if (amount <= 0) return;

    if (accountId) {
      const debt = debts.find((d) => d.id === debtId);
      if (debt) {
        const isPayingDebtIOwe = debt.type === 'i_owe';
        setAccounts((prev) =>
          prev.map((acc) => {
            if (acc.id === accountId) {
              const delta = isPayingDebtIOwe ? -amount : amount;
              return { ...acc, balance: acc.balance + delta };
            }
            return acc;
          })
        );
      }
    }

    setDebts((prev) =>
      prev.map((d) => {
        if (d.id === debtId) {
          const newRemaining = Math.max(0, d.remaining_amount - amount);
          const payment: DebtPayment = {
            id: generateUUID(),
            user_id: user.id,
            debt_id: debtId,
            amount,
            account_id: accountId,
            payment_date: new Date().toISOString(),
            note,
            created_at: new Date().toISOString(),
          };
          return {
            ...d,
            remaining_amount: newRemaining,
            status: newRemaining === 0 ? 'paid' : d.status,
            payments: [payment, ...(d.payments || [])],
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

  const addRecurring = (rec: Omit<RecurringTransaction, 'id' | 'user_id' | 'is_active' | 'created_at'>) => {
    const newRec: RecurringTransaction = {
      ...rec,
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

  const addFinancialGoal = (fg: Omit<FinancialGoal, 'id' | 'user_id' | 'status' | 'created_at' | 'updated_at'>) => {
    const newGoal: FinancialGoal = {
      ...fg,
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
      note: req.note || `Merchant payment to ${req.merchantName} (${req.reference})`,
    });

    const receipt: PaymentReceipt = {
      receiptNumber: res.receiptNumber,
      merchantName: req.merchantName,
      amount: req.amount,
      currency: 'UGX',
      date: new Date().toISOString(),
      paymentMethod: accountObj?.name || 'Spendy Wallet',
      category: categoryObj?.name || 'General Expense',
      reference: req.reference,
      status: 'SUCCESS',
    };

    openReceipt(receipt);
    return receipt;
  };

  // Reset to sample Uganda dataset
  const resetToDemoData = () => {
    setAccounts(SEED_ACCOUNTS);
    setCategories(SEED_CATEGORIES);
    setTransactions(SEED_TRANSACTIONS);
    setTransfers(SEED_TRANSFERS);
    setBudgets(SEED_BUDGETS);
    setSavingsGoals(SEED_SAVINGS_GOALS);
    setDebts(SEED_DEBTS);
    setFinancialGoals(SEED_FINANCIAL_GOALS);
    setRecurringTransactions(SEED_RECURRING);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // safe
    }
  };

  // Clear all dummy data for a fresh real user start
  const clearAllData = () => {
    setAccounts([
      {
        id: generateUUID(),
        user_id: user.id,
        name: 'MTN Mobile Money',
        type: 'mtn_momo',
        balance: 0,
        currency: 'UGX',
        color: '#FBBF24',
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: generateUUID(),
        user_id: user.id,
        name: 'Physical Cash',
        type: 'cash',
        balance: 0,
        currency: 'UGX',
        color: '#10B981',
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);
    setTransactions([]);
    setTransfers([]);
    setBudgets([]);
    setSavingsGoals([]);
    setDebts([]);
    setFinancialGoals([]);
    setRecurringTransactions([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // safe
    }
  };

  return (
    <SpendyContext.Provider
      value={{
        user,
        setUser,
        accounts,
        categories,
        transactions: enrichedTransactions,
        transfers,
        budgets,
        savingsGoals,
        debts,
        financialGoals,
        recurringTransactions,
        notifications,
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
        addAccount,
        updateAccount,
        deleteAccount,
        addCategory,
        addTransaction,
        deleteTransaction,
        createTransfer,
        setBudget,
        deleteBudget,
        addSavingsGoal,
        contributeToGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        addDebt,
        recordDebtPayment,
        deleteDebt,
        addRecurring,
        toggleRecurring,
        deleteRecurring,
        addFinancialGoal,
        updateFinancialGoal,
        deleteFinancialGoal,
        processMerchantPayment,
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
